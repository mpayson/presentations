import React, {PureComponent} from 'react';
import MapView from 'esri/views/MapView';
import LayerList from "esri/widgets/LayerList";
import Search from "esri/widgets/Search";
import FeatureLayer from "esri/layers/FeatureLayer";
import RouteTask from "esri/tasks/RouteTask";
import RouteParameters from "esri/tasks/support/RouteParameters";
import FeatureSet from "esri/tasks/support/FeatureSet";
import Locator from "esri/tasks/Locator";

class MapComponent extends PureComponent {

  constructor(props){
    super(props);
    this.viewRef = React.createRef();
    this.btnRef = React.createRef();
    this.routeToUSPS = this.routeToUSPS.bind(this);
    this.view = null;
  }

  componentDidMount(){
    this.view = new MapView({
      map: this.props.map,
      container: this.viewRef.current,
      center: [-118.40877, 34.00401],
      zoom: 9,
      constraints: {
        snapToZoom: false
      },
      highlightOptions: {
        color: "#ffffff",
        fillOpacity: 0.17
      }
    })
    this.view.when(() => {
      this.props.onLoad(this.view)
    }) 

    this.view.ui.move('zoom', 'top-right')

    this.view.popup.actions = [{
        title: "Get route",
        id: "route",
        className: "esri-icon-polyline"
    }];
    this.view.popup.dockOptions = {
      buttonEnabled: false
    }
    this.view.popup.on('trigger-action', this.routeToUSPS);
    this.addSearchWidget();

    var layerList = new LayerList({
      view: this.view,
    }); 
  }

  addSearchWidget(){
    this.searchWidget = new Search({
      view: this.view,
      popupEnabled: false,
      includeDefaultSources: false,
      sources: [
        {
          locator: new Locator({ url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer" }),
          singleLineFieldName: "SingleLine",
          outFields: ["Addr_type"],
          localSearchOptions: {
            minScale: 300000,
            distance: 50000
          },
          placeholder: "Find address or place",
          resultSymbol: {
            type: "text",
            color: [255, 255, 255],
            text: '\ue61d',
            font: {
              size: 20,
              family: 'calcite-web-icons'
            }
          }
        }
      ]
    });

    this.searchWidget.goToOverride = function(view, goToParams) {
      goToParams.target.zoom = 10;
      return view.goTo(goToParams.target, goToParams.options);
    };

    this.searchWidget.on('select-result', this.props.onSelectSearch);

    this.view.ui.add(this.searchWidget, {
      position: "top-right",
      index: 0
    });
  }

  routeToUSPS(evt){
    // console.log(evt.target.features[0]);
    // return;
    this.props.onGetRoute();

    const routeTask = new RouteTask({
      url: "https://utility.arcgis.com/usrsvcs/appservices/fE52CVgQJMKQ6c89/rest/services/World/Route/NAServer/Route_World/solve"
    });

    const start = this.searchWidget.resultGraphic;
    const end = evt.target.features[0];

    const routeParams = new RouteParameters({
      stops: new FeatureSet(),
    });

    routeParams.stops.features.push(start);
    routeParams.stops.features.push(end);

    routeTask.solve(routeParams).then(data => {
      let route = data.routeResults[0].route;
      route.symbol = {
        type: "simple-line",
        width: 3,
        color: [255, 255, 255]
      };
      this.view.graphics.add(route);
      this.view.popup.close();
    });


  }

  render(){

    return(
      <div style={{width: "100%", height: "100%"}}>
        <div style={{width: "100%", height: "100%", backgroundColor: "#373938"}} ref={this.viewRef}/>
      </div>
    )
  }

}

export default MapComponent;