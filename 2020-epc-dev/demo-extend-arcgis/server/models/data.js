const fetch = require("node-fetch");
const { query } = require("winnow");
const { fieldTypeToEsriType } = require('../utils/utils');

const DATA_URL = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/6/query?f=geojson&where=1%3D1&outFields=*&returnGeometry=true'
const TTL = 60 * 60 * 1000 // one hour

// in-memory cache for POC purposes
let _cache = {
  geojson: null,
  metadata: null,
  _expiration: new Date(),
  _pending: null
};

// get data from the service
async function fetchData(){
  const response = await fetch(DATA_URL);
  const geojson = await response.json();
  const queryResults = await query(geojson, {toEsri: true});
  return {geojson, metadata: queryResults.metadata};
}

// hydrate the cache with the data
async function hydrateCache(ttl=TTL){
  if(!_cache._pending){
    _cache._pending = fetchData();
  }
  let data;
  try {
    data = await _cache._pending;
  } catch(e){
    console.log(e);
    _cache._pending = null;
    return;
  }

  const { geojson, metadata } = data;
  _cache = {
    geojson,
    metadata,
    _expiration: new Date() + ttl,
    _pending: null
  }
  return _cache;
}

// get only the relevant objects from the cache
async function getCache(){
  let cache;
  if(!_cache.geojson || _cache._expiration < new Date()){
    cache = await hydrateCache();
  } else {
    cache = _cache;
  }
  const {geojson, metadata} = cache;
  return {geojson, metadata};
}

// get options for given field
async function getOptionsForField(field){
  const {geojson} = await getCache();
  const optionQuery = {
    groupBy: field,
    aggregates: [{
      type: 'count',
      field: field,
      name: 'count'
    }]
  }
  counts = query(geojson, optionQuery);
  const options = counts.map(c => ({category: c[field], count: c.count}));
  return options;
}

// fields to return from the enrichment process
const outFields = [
  'Event', 'Severity', 'Summary', 'Link', 'Urgency', 'Certainty'
]
const outFieldSet = new Set(outFields);

// Accepts a feature set and returns an enriched feature set with common ObjectID
// TODO guard against different spatial references, geometries, etc
// TODO guard against unsafe queries unless Winnow handles?
// TODO keep additional attributes passed back from the feature set
async function enrich(featureSet, where){
  const {geojson, metadata} = await getCache();

  const {features, fields, geometryType, spatialReference} = featureSet;
  let oidField = 'ObjectId';
  if(fields){
    oidFieldInfo = fields.find(f => f.type === 'esriFieldTypeOID');
    oidField = (oidFieldInfo && oidFieldInfo.name) ? oidFieldInfo.name : 'ObjectId';
  }

  let outFeatures = [];
  for(let i = 0; i < features.length; i++){
    const f = features[i];
    const queryOptions = {geometry: f.geometry, where, fields: outFields};
    const queryResults = query(geojson, queryOptions);
    if(!queryResults || queryResults.features.length < 1) continue;
    const attributes = {...queryResults.features[0].properties}; // only use the first result
    attributes[oidField] = f[oidField] ? f[oidField] : i; // default to index if no ObjectID
    const newFeature = {
      attributes,
      geometry: {...f.geometry}
    };
    outFeatures.push(newFeature);
  }

  const cleanedFieldInfo = metadata.fields
    .filter(f => outFieldSet.has(f.name))
    .map(f => ({
      name: f.name,
      type: fieldTypeToEsriType(f.type)
    }));
  cleanedFieldInfo.push({
    name: oidField,
    type: 'esriFieldTypeOID'
  });
    
  return {
    features: outFeatures,
    fields: cleanedFieldInfo,
    // these stay the same
    geometryType,
    spatialReference
  }
}

module.exports = {
  hydrateCache,
  getOptionsForField,
  enrich
}