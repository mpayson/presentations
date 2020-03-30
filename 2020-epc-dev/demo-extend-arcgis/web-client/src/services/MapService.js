// following this: https://github.com/Esri/esri-loader#using-classes-synchronously

import {loadModules} from 'esri-loader';
import options from '../config/esri-loader-options';
import { UserSession } from '@esri/arcgis-rest-auth';
import { SearchQueryBuilder, searchItems } from '@esri/arcgis-rest-portal';

let _pModules;

// mapping
let _Map, _WebMap, _MapView, _GraphicsLayer, _FeatureLayer, _FeatureSet;
// platform
let _esriId, _restSession;
// widgets
let _Sketch, _Legend;
// utils
let _webMercatorUtils;

export function preloadAllModules(){
  _pModules = loadModules([
    // mapping
    'esri/Map',
    'esri/WebMap',
    'esri/views/MapView',
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    'esri/tasks/support/FeatureSet',
    // platform
    'esri/identity/IdentityManager',
    // widgets
    "esri/widgets/Sketch",
    'esri/widgets/Legend',
    // utils
    "esri/geometry/support/webMercatorUtils"
  ], options)
  .then(([
    Map,
    WebMap,
    MapView,
    GraphicsLayer,
    FeatureLayer,
    FeatureSet,
    esriId,
    Sketch,
    Legend,
    webMercatorUtils
  ]) => {
    _Map = Map;
    _WebMap = WebMap;
    _MapView = MapView;
    _GraphicsLayer = GraphicsLayer;
    _FeatureLayer = FeatureLayer;
    _FeatureSet = FeatureSet;
    _esriId = esriId;
    _Sketch = Sketch;
    _Legend = Legend;
    _webMercatorUtils = webMercatorUtils;
  });
  return _pModules;
}

function _loadAllModules(){
  return _pModules ? _pModules : preloadAllModules();
}

export async function loadMap(container, {mapOptions, viewOptions}){
  await _loadAllModules();
  const map = new _Map(mapOptions);
  const view = new _MapView({
    map,
    container,
    ...viewOptions
  });
  view.ui.move('zoom', 'top-right');
  return view;
}

export function layerFromId(itemId, layerOptions){
  _moduleCheck(_FeatureLayer, "You must register an authenticated session before creating layers");
  return new _FeatureLayer({
    portalItem: {id: itemId},
    ...layerOptions
  });
}

export function layerFromJson(esriJson, oidField, layerOptions){
  _moduleCheck(_FeatureLayer, "You must register an authenticated session before creating layers");
  const options = {
    source: esriJson,
    objectIdField: oidField,
    ...layerOptions
  }
  return new _FeatureLayer(options);
}

export function layerFromFeatureSet(fsJson, oidField, layerOptions){
  _moduleCheck(_FeatureSet, "Register an authenticated session before creating feature sets");
  const fs = _FeatureSet.fromJSON(fsJson);
  const t = new layerFromJson(fs.features, oidField, {
    geometryType: fs.geometryType,
    spatialReference: fs.spatialReference,
    fields: fs.fields,
    ...layerOptions
  });
  console.log('LAYER', t);
  console.log("FEATURE SET", fs);
  return t;
}

export function webmapFromId(itemId, mapOptions){
  _moduleCheck(_WebMap, "You must register an authenticated session before instantiating the map");
  const map = new _WebMap({
    portalItem: {
      id: itemId
    },
    ...mapOptions
  });
  return map;
}

export function mapFromOptions(mapOptions){
  _moduleCheck(_WebMap, "You must register an authenticated session before instantiating the map");
  return new _Map(mapOptions);
}
// clone session into mapservice functions
// and clone reference to session for consistent
// behavior with javascript API
export async function registerSession(session){

  // this is a bit of a hack, but session may not get registered before
  // other calls because of load modules, TODO figure this out
  _restSession = UserSession.deserialize(session.serialize());
  await _loadAllModules();
  _esriId.registerToken(session.toCredential());
}

export function destroySession(){
  _moduleCheck(_esriId, "You must register an authenticated session before destroying a session");
  _restSession = null;
  _esriId.destroyCredentials();
}

export function addSketch(view, container, sketchOptions, layerOptions){
  _moduleCheck(_Sketch, "You must register an authenticated session before sketching");
  const layer = new _GraphicsLayer({...layerOptions});
  view.map.add(layer);
  const sketch = new _Sketch({
    layer,
    view,
    container,
    availableCreateTools: ["point", "polyline", "polygon", "rectangle", "circle"],
    layout: "vertical",
    creationMode: "update",
    ...sketchOptions
  });
  view.ui.add(sketch, 'manual');
  return sketch;
}

export async function searchPortal(searchString){
  _moduleCheck(_restSession, "You must register an authenicated session before querying the portal");
  let query = new SearchQueryBuilder()
    .match(_restSession.username)
    .in("owner")
    .and()
    // .match('epc2020')
    // .in('tags')
    // .and()
    .startGroup()
      .match("Web Map")
      .in("type")
      .or()
      .match("Feature Service")
      .in("type")
    .endGroup();
  if(searchString){
    query
      .and()
      .match(searchString)
      .in("title")
      .boost(3)
  }

  const response = await searchItems({
    q: query,
    authentication: _restSession,
    num: 20,
    sortField: 'modified',
    sortOrder: 'desc'
  });
  return response.results;

}

export function addLegendWidget(view, position, options){
  _moduleCheck(_Legend, "You must register an authenticated session before adding legends");
  const legend = new _Legend({
    view,
    ...options
  });
  view.ui.add(legend, position);
}

// for now force into geographic since needed on the server
export function featuresIntoFeatureSet(featureArray){
  _moduleCheck(_FeatureSet, "You must register a session before creating feature sets in safety app");
  const fs = new _FeatureSet();
  fs.features = featureArray;
  return fs;
}

export function webMercatorToGeographic(geometry){
  _moduleCheck(_webMercatorUtils, "You must register a session before projecting");
  return _webMercatorUtils.webMercatorToGeographic(geometry);
}

export function geographicToWebMercator(geometry){
  _moduleCheck(_webMercatorUtils, "You must register a session before projecting");
  return _webMercatorUtils.geographicToWebMercator(geometry);
}


function _moduleCheck(module, errorMsg){
  if(!module) throw new Error(errorMsg);
}