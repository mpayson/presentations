// following this: https://github.com/Esri/esri-loader#using-classes-synchronously

import {loadModules} from 'esri-loader';
import options from '../config/esri-loader-options';
import { UserSession } from '@esri/arcgis-rest-auth';
import { SearchQueryBuilder, searchItems } from '@esri/arcgis-rest-portal';

let _pModules;

// mapping
let _Map, _WebMap, _MapView, _Layer, _GraphicsLayer, _FeatureLayer, _FeatureSet;
// platform
let _esriId, _PortalItem, _restSession;
// widgets
let _Sketch, _Search, _LayerList, _Expand;
// utils
let _webMercatorUtils;

export function preloadAllModules(){
  _pModules = loadModules([
    // mapping
    'esri/Map',
    'esri/WebMap',
    'esri/views/MapView',
    'esri/layers/Layer',
    'esri/layers/GraphicsLayer',
    "esri/layers/FeatureLayer",
    'esri/tasks/support/FeatureSet',
    // platform
    'esri/identity/IdentityManager',
    'esri/portal/PortalItem',
    // widgets
    "esri/widgets/Sketch",
    'esri/widgets/Search',
    "esri/widgets/LayerList",
    'esri/widgets/Expand',
    // utils
    "esri/geometry/support/webMercatorUtils"
  ], options)
  .then(([
    Map,
    WebMap,
    MapView,
    Layer,
    GraphicsLayer,
    FeatureLayer,
    FeatureSet,
    esriId,
    PortalItem,
    Sketch,
    Search,
    LayerList,
    Expand,
    webMercatorUtils
  ]) => {
    _Map = Map;
    _WebMap = WebMap;
    _MapView = MapView;
    _Layer = Layer;
    _GraphicsLayer = GraphicsLayer;
    _FeatureLayer = FeatureLayer;
    _FeatureSet = FeatureSet;
    _esriId = esriId;
    _PortalItem = PortalItem;
    _Sketch = Sketch;
    _Search = Search;
    _LayerList = LayerList;
    _Expand = Expand;
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

export function layerFromJson(esriJson, oidField, layerOptions){
  _moduleCheck(_FeatureLayer, "You must register an authenticated session before creating layers");
  const options = {
    source: esriJson,
    objectIdField: oidField,
    ...layerOptions
  }
  return new _FeatureLayer(options);
}

export function layerFromFeatureSet(fsJson, layerOptions){
  _moduleCheck(_FeatureSet, "Register an authenticated session before creating feature sets");
  const fs = _FeatureSet.fromJSON(fsJson);
  const oidField = fs.fields.find(f => f.type === 'esriFieldTypeOID');
  const t = new layerFromJson(fs.features, oidField, {
    geometryType: fs.geometryType,
    spatialReference: fs.spatialReference,
    fields: fs.fields,
    ...layerOptions
  });
  return t;
}

export async function layerFromItemJson(itemJson){
  _moduleCheck(_Layer, "You must register an authenticated session before loading the layer");
  const portalItem = await portalItemFromJson(itemJson);
  if(portalItem.isLayer){
    return _Layer.fromPortalItem({portalItem});
  }
  throw new Error(`Unsupported portal item type (${portalItem.type}) for this app, expected a layer`);
}

export function mapFromOptions(mapOptions){
  _moduleCheck(_Map, "You must register an authenticated session before instantiating the map");
  return new _Map(mapOptions);
}

export async function portalItemFromJson(itemJson){
  _moduleCheck(_PortalItem, "You must register an authenticated session before loading a portal item");
  const portalItem = _PortalItem.fromJSON(itemJson);
  await portalItem.load();
  return portalItem;
}

export async function mapFromItemJson(itemJson){
  _moduleCheck(_WebMap, "You must register an authenticated session before instantiating the map");
  const portalItem = await portalItemFromJson(itemJson);
  return new _WebMap({portalItem});
}

// register session with the JS API and clone the session for rest-js
// all MapService calls will then make authenticated requests
// (this is how the JS API works)
export async function registerSession(session){
  _restSession = UserSession.deserialize(session.serialize());
  await _loadAllModules();
  _esriId.registerToken(session.toCredential());
}

export function destroySession(){
  _moduleCheck(_esriId, "You must register an authenticated session before destroying a session");
  _restSession = null;
  _esriId.destroyCredentials();
}

// for now assume only one sketch layer ID, make sure accessible to all methods
export const DEFAULT_SKETCH_LAYER_ID = "sketch-lyr-id";

export function addSketch(view, container, sketchOptions, layerOptions){
  _moduleCheck(_Sketch, "You must register an authenticated session before sketching");
  const layer = new _GraphicsLayer({id: DEFAULT_SKETCH_LAYER_ID, ...layerOptions});
  view.map.add(layer);
  const sketch = new _Sketch({
    layer,
    view,
    container,
    availableCreateTools: ["point", "polyline", "polygon", "rectangle", "circle"],
    layout: "vertical",
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

function addExpandWidget(view, widget, iconClass){
  _moduleCheck(_Expand, "You must register an authenticated session before adding widgets");
  return new _Expand({
    view,
    content: widget,
    expandIconClass: iconClass
  })
}

export function addSearchWidget(view, position, index, withExpand=false){
  _moduleCheck(_Search, "You must register an authenticated session before adding widgets");
  const search = new _Search({view});
  const widget = withExpand
    ? addExpandWidget(view, search, 'esri-icon-search')
    : search;
  const options = index || index === 0 ? {position, index} : position;
  view.ui.add(widget, options);
  return search;
}

export function addLayerListWidget(view, position, options){
  _moduleCheck(_LayerList, "You must register an authenticated session before adding legends");
  const expand = options ? options.expand : null;
  const lyrList = new _LayerList({
    view,
    listItemCreatedFunction: function(event) {
      const item = event.item;
      if (item.layer.type !== "group") {
        item.panel = {
          content: "legend",
          open: item.layer.visible
        };
      }
    },
    ...options
  });
  const widget = expand
    ? addExpandWidget(view, lyrList, expand.iconClass)
    : lyrList;
  view.ui.add(widget, position);
}

export function featuresIntoFeatureSet(featureArray){
  _moduleCheck(_FeatureSet, "You must register a session before creating feature sets in safety app");
  const fs = new _FeatureSet();
  fs.features = featureArray;
  return fs;
}

// creates an Esri JSON representation of layer data (a "feature set")
export async function featureLayerToFeatureSet(layer, queryOptions){
  return await layer.queryFeatures({
    where: "1=1",
    outFields: ['*'],
    returnGeometry: true,
    outSpatialReference: { wkid: 4326 }, // WGS84
    ...queryOptions
  });
}

// creates an Esri JSON representation of graphic features (a "feature set")
// for now forces the data into WGS84 since most common (used for GeoJSON etc)
// also imposes a restriction that the graphics can only have one geometry type
export function graphicsToFeatureSet(graphicsCollection){
  const graphics = graphicsCollection.clone();

  const geometryTypeSet = new Set();
  graphics.forEach((g, i) => {
    // validate spatial reference
    if(g.geometry.spatialReference.isWebMercator){
      g.geometry = webMercatorToGeographic(g.geometry);
    } else if (!g.geometry.spatialReference.isWGS84){
      throw new Error('Unsupported spatial reference for graphics into feature set');
    }
    // assign object ID based on array index, easiset for now
    g.attributes = {'objectid': i};
    // ensure only one geometry type
    geometryTypeSet.add(g.geometry.type);
    if(geometryTypeSet.size > 1){
      throw new Error('Graphics into feature set only supports one geometry type');
    }
  });

  const featureSet = featuresIntoFeatureSet(graphics.items);
  featureSet.spatialReference = {wkid: "4326"};

  if(graphics.length < 1) return featureSet;
  featureSet.geometryType = graphics.items[0].geometry.type;
  return featureSet;
}

// get feature set JSON (aka Esri JSON) from a given layer
export async function layerToFeatureSetJSON(layer){
  let featureSet;
  if(layer.type === 'feature'){
    featureSet = await featureLayerToFeatureSet(layer);
  } else if (layer.type === 'graphics'){
    featureSet = graphicsToFeatureSet(layer.graphics);
  } else {
    throw new Error('Layer must either be a feature layer or graphics layer to convert to feature set');
  }
  return featureSet.toJSON();
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