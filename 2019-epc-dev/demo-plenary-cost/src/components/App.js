import React, {Component} from 'react';
import Map from 'esri/Map';
import MapComponent from './MapComponent';
import Loader from './Loader';
import QuestionHeader from './QuestionHeader';
import { CalciteH1, CalciteH6 } from 'calcite-react/Elements';
import FeatureLayer from "esri/layers/FeatureLayer";
import styled, { css } from 'styled-components';
import ListView from './ListView';
import { whenFalseOnce } from 'esri/core/watchUtils';
import '../css/question.css'

const SmH1 = styled(CalciteH1)`
  font-size: 1.9994rem;
  line-height: 2.325rem;
  margin: 0.5rem 0.5rem 0rem 0.5rem;
  font-weight: bold;
  color: #616161;
`;

const BigH1 = styled(CalciteH1)`
  font-size: 2.40307rem;
  line-height: 3.1rem;
  margin: 0.5rem 0.5rem 0rem 0.5rem;
  font-weight: bold;
`;

const Comph4 = styled(CalciteH6)`
  margin: 0.5rem 0.5rem 0rem 0.5rem
`;

const SmH4 = styled(CalciteH6)`
  margin: 0.5rem 0.5rem 0rem 0.5rem
  color: #616161;
`;

const views = [{
  'title': 'Search for an area',
  'cost': '$0',
  'sub': 'Unstored geocode - 1M transactions'
}, {
  'title': 'Host retail locations',
  'cost': '$0.004',
  'sub': "1 GB of hosted features - $24/mo",
  'unit': '/mo'
}, {
  'title': 'Create a route',
  'cost': '$0.0005',
  'sub': 'Routing service - 0.005 credits'
}, {
  'title': 'Scale to 10,000 visitors',
  'cost': '$5.00',
  'sub': 'One route per visitor',
  'unit': '/mo'
}, { 
  'title': 'Generate revenue',
  'cost': '$125',
  'sub': 'Unlimited apps',
  'unit': '/mo',
  'shrink': true
}]

class App extends Component{

  _initMap(){
    this.map = new Map({
      basemap: 'dark-gray-vector'
    });
  }

  constructor(props){
    super(props);
    this._initMap();
    this.onViewLoad = this.onViewLoad.bind(this);
    this.onListItemClick = this.onListItemClick.bind(this);
    this.onSelectSearch = this.onSelectSearch.bind(this);
    this.onGetRoute = this.onGetRoute.bind(this);
    this.onLoadStores = this.onLoadStores.bind(this);
    this.onListHover = this.onListHover.bind(this);
    this.onListUnhover = this.onListUnhover.bind(this);
    this.onListClick = this.onListClick.bind(this);
    this.state = {
      loaded: false,
      active: [false, false, false, false, false],
      features: null
    }
  }

  onViewLoad (view){
    this.mapView = view;
    this.setState({
      loaded: true
    })
  }

  onListItemClick(qKey){

    const next = views.map( (v,i) => 
      i === qKey ? !this.state.active[i] : this.state.active[i]
    )
    this.setState({
      active: next
    })
  }

  onListHover(id){
    if(this.highlight) this.highlight.remove();
    if(!this.lyrView) return;
    if(!id) return;
    this.highlight = this.lyrView.highlight(id);
  }
  onListUnhover(id){
    if(this.highlight) this.highlight.remove();
  }
  onListClick(id){
    console.log("HERE")
    this.lyrView.queryFeatures({where: `OBJECTID = ${id}`, returnGeometry: true})
      .then(res => {
        if(!res || !res.features.length) return;
        this.mapView.popup.open({
          features: res.features,
          location: res.features[0].geometry
        });
      })
      .catch(er => console.log(er));
  }

  onSelectSearch(evt){
    this.onListItemClick(0);
  }
  onGetRoute(evt){
    // console.log('here')
    this.onListItemClick(2);
  }
  onLoadStores(evt){
    this.onListItemClick(1);
    this.lyr = new FeatureLayer({
      url: "https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/a07272/FeatureServer",
      outFields: ["location_name", "city", "OBJECTID"],
      definitionExpression: "time = 4",
      renderer: {
        type: "simple",
        symbol: {
          type: "text",
          color: [0, 255, 255],
          text: '\ue61d',
          font: {
            size: 20,
            family: 'calcite-web-icons'
          }
        }
      },
      popupTemplate: {
        title: '{location_name}',
        content: '{street_address}'
      }
    });
    this.map.add(this.lyr);
    this.mapView.whenLayerView(this.lyr)
      .then(lV => {
        this.lyrView = lV;
        return whenFalseOnce(this.lyrView, 'updating');
      })
      .then(_ => (
        this.lyrView.queryFeatures({where: "1=1"})
      ))
      .then(res => {
        if(res && res.features && res.features.length){
          this.setState({features: res.features})
        }
      }).catch(er => console.log(er));

    

  }

  render(){
    if(!this.state.loaded){
      return (
        <>
          <MapComponent
            map={this.map}
            onLoad={this.onViewLoad}
            active={this.state.active}
          />
          <Loader/>
        </>
      )
    }

    const questionComponents = views.map( (v, i) => {
      const key = v.title;
      const isActive = this.state.active[i];

      const liContent = (
        <QuestionHeader
          key={key}
          title={v.title}
          onClick={_=>this.onListItemClick(i)}
          active={isActive}
          index={i}
        />
      )
      if(!isActive) return liContent;
      
      const header = v.shrink
        ? <SmH1>{v.cost}<span className="min-text">{v.unit}</span></SmH1>
        : <BigH1>{v.cost}<span className="min-text">{v.unit}</span></BigH1>

      const sub = v.shrink
        ? <SmH4>{v.sub}</SmH4>
        : <Comph4>{v.sub}</Comph4>

      return (
        <div key={key} className="question-content">
          {liContent}
          <div style={{height: "5rem", textAlign: "center"}}>
            {header}
            {sub}
          </div>
        </div>
      )
    })

    return(
      <>
        <div style={{width: "75%", height: "100%"}}>
          <MapComponent
            map={this.map}
            onLoad={this.onViewLoad}
            active={this.state.active}
            onSelectSearch={this.onSelectSearch}
            onGetRoute={this.onGetRoute}
          />
        </div>
        <div style={{width: "25%", background: "rgba(0, 171, 189, 0.6)", overflowY: 'scroll'}}>
          {questionComponents}
        </div>
        <div style={{position: "absolute", top: "5rem", left: "1rem", width: "20%", height: 'calc(100vh - 10rem)'}}>
          <ListView
            onLoadStores={this.onLoadStores}
            data={this.state.features}
            onHover={this.onListHover}
            onUnhover={this.onListUnhover}
            onClick={this.onListClick}/>
        </div>
      </>
    )
  }

}

export default App
