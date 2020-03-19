// following this: https://github.com/Esri/esri-loader#using-classes-synchronously

import {loadModules} from 'esri-loader';
import options from '../config/esri-loader-options';
import { ROUTE_SERVICE_URL } from '../config/environment';

let _pModules;
// mapping
let _Map, _MapView;
// layers
let _GeoJSONLayer, _GraphicsLayer, _FeatureLayer;
// widgets
let _Legend, _Expand, _Editor;
// services
let _routeService, _RouteParameters, _FeatureSet, _SpatialReference;
// platform
let _esriId;

export function preloadAllModules(){
  _pModules = loadModules([
    // mapping
    'esri/Map',
    'esri/views/MapView',
    //layers
    'esri/layers/GeoJSONLayer',
    'esri/layers/GraphicsLayer',
    'esri/layers/FeatureLayer',
    // widgets
    'esri/widgets/Legend',
    'esri/widgets/Expand',
    'esri/widgets/Editor',
    // services
    'esri/tasks/RouteTask',
    'esri/tasks/support/RouteParameters',
    'esri/tasks/support/FeatureSet',
    'esri/geometry/SpatialReference',
    // platform
    'esri/identity/IdentityManager',
  ], options)
  .then(([
    Map,
    MapView,
    GeoJSONLayer,
    GraphicsLayer,
    FeatureLayer,
    Legend,
    Expand,
    Editor,
    RouteTask,
    RouteParameters,
    FeatureSet,
    SpatialReference,
    esriId
  ]) => {
    _Map = Map;
    _MapView = MapView;
    _GeoJSONLayer = GeoJSONLayer;
    _GraphicsLayer = GraphicsLayer;
    _FeatureLayer = FeatureLayer;
    _Legend = Legend;
    _Expand = Expand;
    _Editor = Editor;
    _routeService = new RouteTask({
      url: ROUTE_SERVICE_URL
    });
    _RouteParameters = RouteParameters;
    _FeatureSet = FeatureSet;
    _SpatialReference = SpatialReference;
    _esriId = esriId;
  });
  return _pModules;
}

function _loadAllModules(){
  return _pModules ? _pModules : preloadAllModules();
}

export async function registerSession(session){
  await _loadAllModules();
  _esriId.registerToken(session.toCredential());
}

export function destroySession(){
  _moduleCheck(_esriId, "You must register an authenticated session before destroying a session");
  _esriId.destroyCredentials();
}

export async function loadMap(mapOptions, viewOptions){
  await _loadAllModules();
  const map = new _Map(mapOptions);
  const view = new _MapView({
    map,
    ...viewOptions
  });
  return view;
}

export function getGeoJSONLayer(url, options){
  _moduleCheck(_GeoJSONLayer, 'Load map before geojson layer');
  return new _GeoJSONLayer({
    url,
    ...options
  })
}

export function getLayerFromUrl(url, options){
  _moduleCheck(_FeatureLayer, "Load map before feature layer");
  return new _FeatureLayer({
    url,
    ...options
  });
}

export function featuresIntoFeatureSet(featureArray){
  _moduleCheck(_FeatureSet, "Load map before feature set");
  const fs = new _FeatureSet();
  fs.features = featureArray;
  return fs;
}

export function graphicsIntoGraphicsLayer(graphics, options){
  _moduleCheck(_GraphicsLayer, 'Load map before layer');
  return new _GraphicsLayer({
    graphics,
    ...options
  })
}

export function generateRoute(stops, options){
  _moduleCheck(_RouteParameters, "Load map before generating route");
  const stopFeatureSet = featuresIntoFeatureSet(stops);
  const routeParams = new _RouteParameters({
    stops: stopFeatureSet,
    outSpatialReference: _SpatialReference.WebMercator, // hardcode for now
    ...options
  });
  return _routeService.solve(routeParams);
}

function addExpandWidget(view, widget, iconClass, expanded=true){
  _moduleCheck(_Expand, "Load map before adding widget");
  return new _Expand({
    view,
    content: widget,
    expandIconClass: iconClass,
    expanded
  })
}

export function addLegendWidget(view, position, options, withExpand=true){
  _moduleCheck(_Legend, "Load map before adding legend");
  const legend = new _Legend({
    view,
    ...options
  });
  const widget = withExpand
    ? addExpandWidget(view, legend, 'esri-icon-layer-list')
    : legend;
  view.ui.add(widget, position);
  return legend;
}

export function addEditWidget(view, position, options, withExpand=true){
  _moduleCheck(_Editor, "Load a map before adding edit widget");
  const edit = new _Editor({
    view,
    ...options
  });
  const widget = withExpand
    ? addExpandWidget(view, edit, 'esri-icon-edit', true)
    : edit;
  view.ui.add(widget, position);
  return widget;
}

function _moduleCheck(module, errorMsg){
  if(!module) throw new Error(errorMsg);
}