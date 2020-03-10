const { queryFeatures } = require("@esri/arcgis-rest-feature-layer");
const { query } = require("winnow");

const DATA_URL = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/6';
const TTL = 60 * 60 * 1000 // one hour

let _cache = {
  geojson: null,
  _expiration: new Date(),
  _pending: null
};

// get geojson data from feature service and cache it locally
async function getGeoJSON(){
  if(_cache._expiration > new Date() && _cache.geojson) {
    return _cache.geojson
  };
  
  if(!_cache._pending){
    _cache._pending = queryFeatures({
      url: DATA_URL,
      where: "1=1",
      returnGeometry: true,
      f: 'geojson'
    }).catch(er => console.log(er));
  }
  const geojson = await _cache._pending;

  _cache = {
    geojson,
    _expiration: new Date() + TTL,
    _pending: null
  }
  return _cache.geojson;
}

// get category options, in this case severity
const field = 'Certainty'
// const field = 'Severity'
async function getOptions(){
  const geojson = await getGeoJSON();
  const options = {
    groupBy: field,
    aggregates: [{
      type: 'count',
      field: field,
      name: 'count'
    }]
  }
  counts = query(geojson, options);
  return {
    categories: counts.map(c => ({category: c[field], count: c.count}))
  };
}

const outFields = [
  // 'Event', 'Severity', 'Summary', 'Link', 'Urgency',
  // 'Certainty', 'Category', 'Updated', 'Start', 'End_'
  'Event', 'Severity', 'Summary', 'Link', 'Urgency', 'Certainty'
]
const outFieldSet = new Set(outFields);
// TODO handle spatial references
// TODO should guard against unsafe queries unless Winnow handles
async function enrich(featureSet, category){
  const geojson = await getGeoJSON();

  const {features, ...rest} = featureSet;
  let fieldInfo; // TODO move to separate init query and handle user fields
  const where = `${field} = '${category}'`;
  const outFeatures = features.map(f => {
    f.geometry.spatialReference = featureSet.spatialReference;
    const options = {geometry: f.geometry, where, fields: outFields};
    const qRes = query(geojson, options);
    if(!qRes || qRes.features.length < 1) return null;
    fieldInfo = qRes.metadata.fields.filter(f => outFieldSet.has(f.name));
    return {
      attributes: {
      ...qRes.features[0].properties,
      ...f.attributes
      },
      geometry: {
        ...f.geometry,
        type: featureSet.geometryType
      }
    }
  })
  .filter(f => 
    f !== null
  );

  const cleanedFieldInfo = fieldInfo.map(f => ({
    name: f.name,
    type: f.type.toLowerCase()
  }))
  return {
    ...rest,
    features: outFeatures,
    fields: cleanedFieldInfo
  }
}

module.exports = {
  getGeoJSON,
  getOptions,
  enrich
}