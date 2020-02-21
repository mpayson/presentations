import React, {PureComponent} from 'react';
import { loadModules } from 'esri-loader';
import { loaderOptions, poiRenderer, highlightOptions } from '../config';
import { getBlockCountRenderer, getTimeFilter, getBlockDenseRenderer,
        getBlockHlFilter, getBlockHlEffect, getBlockTimeHlFilter,
      } from './common'

class MapComponent extends PureComponent {

  constructor(props){
    super(props);
    this.viewRef = React.createRef();
    this.view = null;
    this._onViewLoaded = this._onViewLoaded.bind(this);
    this._handleMapPointer = this._handleMapPointer.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this.state = {
      selPoi: null
    }
  }

  _initMap(){
    loadModules(['esri/Map', 'esri/views/MapView',
                'esri/layers/FeatureLayer', 'esri/widgets/Legend'], loaderOptions)
      .then(([Map, MapView, FeatureLayer, Legend]) => {
        this.map = new Map({
          basemap: 'dark-gray-vector'
        })

        this.view = new MapView({
          map: this.map,
          container: this.viewRef.current,
          // center: [-118.34619, 33.95831],
          center: [-118.26970988458462, 33.93696960332196],
          zoom: 9.75,
          constraints: {
            snapToZoom: false
          },
          highlightOptions: highlightOptions
        })
        this.view.ui.move('zoom', 'top-right')
        this.view.popup.actions = [];

        this.blockLyr = new FeatureLayer({
          url: "https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/sg_ca_top_block_long_enriched_simp/FeatureServer",
          renderer: getBlockCountRenderer(),
          outFields: ["safegraph_place_id", "count_", "time"]
        });

        this.poiLyr = new FeatureLayer({
          url: "https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/a07272/FeatureServer",
          outFields: ["safegraph_place_id", "raw_visit_counts", "time", "location_name"],
          renderer: poiRenderer
        })
        this.map.addMany([this.blockLyr, this.poiLyr]);
        
        const legend = new Legend({
          view: this.view,
          layerInfos: [{
            layer: this.blockLyr,
            title: "Census Blocks"
          }, {
            layer: this.poiLyr,
            title: "Stores"
          }],
          style: {
            layout: "stack"
          }
        })
        this.view.ui.add(legend, 'bottom-right');

        const vP = this.view.when()
          .then(_ => {
            this.blockDenseLyr = new FeatureLayer({
              url: "https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/sg_ca_top_block_long_enriched_simp/FeatureServer",
              renderer: getBlockDenseRenderer(this.view),
              outFields: ["safegraph_place_id", "count_", "time", "TLIFENAME"]
            });
            this.map.add(this.blockDenseLyr, 0);
            legend.layerInfos.push({
              layer: this.blockDenseLyr,
              title: "Census Blocks"
            })
            console.log(JSON.stringify(this.poiLyr.renderer.toJSON()));
            console.log(JSON.stringify(this.blockLyr.renderer.toJSON()));
            return this.view.whenLayerView(this.blockDenseLyr);
          })
          .catch(er => console.log(er));

        const bP = this.view.whenLayerView(this.blockLyr);
        const pP = this.view.whenLayerView(this.poiLyr);
        Promise.all([bP, pP, vP]).then(this._onViewLoaded);
      
      })
      .catch(er => console.log(er));
  }

  _handleEvt(evt){
    if(this.hitTestPromise){
      this.hitTestPromise.cancel();
    }
    this.hitTestPromise = this.view.hitTest(evt)
      .then(hit => {
        this.hitTestPromise = null;
        let res = hit.results.filter(r => r.graphic.layer === this.poiLyr);
        if(res.length){
          return(res[0].graphic);
        } else if(this.state.selPoi){
          return null;
        }
      })
    return this.hitTestPromise;
  }

  _handleClick(evt){
    if(!this.props.active[0] || this.props.explore) return;
    evt.stopPropagation();
    this._handleEvt(evt, false).then(poi => {
      if(this.highlight) this.highlight.remove();
      if(poi){
        this.props.onPoiChange(poi.attributes['safegraph_place_id'], poi.attributes['location_name']);
        this.highlight = this.poiLV.highlight(poi);
      } else {
        this.props.onPoiChange(null);
      }
    })
  }

  _handleMapPointer(evt){
    if(!this.props.active[0] || !this.props.explore) return;
    this._handleEvt(evt, false).then(poi => {
      if(this.highlight) this.highlight.remove();
      if(poi){
        this.props.onPoiChange(poi.attributes['safegraph_place_id'], poi.attributes['location_name']);
        this.highlight = this.poiLV.highlight(poi);
      } else {
        this.props.onPoiChange(null);
      }
    })
  }

  _setFilters(poi=null, time=null){
    if(this.props.active[1]){
      
      this.blockDenseLyr.visible = true;
      this.blockLyr.visible = false;
      this.denseLV.filter = getBlockTimeHlFilter(poi, time);
    } else {

      this.blockDenseLyr.visible = false;
      this.blockLyr.visible = true;

      this.lyrView.filter = getBlockHlFilter(poi, time);
      this.blockLyr.renderer = getBlockCountRenderer(time);
      this.lyrView.effect = getBlockHlEffect(poi);
      
    }
    this.poiLV.filter = getTimeFilter(time);
  }

  _onViewLoaded([lV, poiLV, denseLV]){
    this.props.onLoad(this.map, this.view, this.blockDenseLyr, denseLV);
    this.lyrView = lV;
    this.poiLV = poiLV;
    this.denseLV = denseLV;
    
    this._setFilters(this.props.poi, this.props.time);

    this.view.on("pointer-move", this._handleMapPointer);
    this.view.on("click", this._handleClick);

  }

  componentDidMount(){
    this._initMap();
  }

  // doesn't update to dot-density when switched
  render(){
    if(this.lyrView){
      this._setFilters(this.props.poi, this.props.time);

    }

    return(
      <div style={{width: "100vw", height: "100vh", backgroundColor: "#373938"}} ref={this.viewRef}/>
    )
  }

}

export default MapComponent;