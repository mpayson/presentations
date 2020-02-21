import React, {Component} from 'react';
import MapComponent from './MapComponent';
import QuestionHeader from './QuestionHeader';
import LiveAreas from './steps/LiveAreas';
import Demographic from './steps/Demographic';
import './question.css';

const initState = [true, false, false];

class App extends Component{

  constructor(props){
    super(props);
    this.onViewLoad = this.onViewLoad.bind(this);
    this.onListItemClick = this.onListItemClick.bind(this);
    this._onExploreClick = this._onExploreClick.bind(this);
    this._onTimeSlide = this._onTimeSlide.bind(this);
    this._onPoiChange = this._onPoiChange.bind(this);
    this.state = {
      loaded: false,
      active: [false, false, false],
      explore: true,
      selPoi: null,
      selText: null,
      time: 16
    }
  }

  onViewLoad (map, view, blockLyr, blockLyrView){
    this.mapView = view;
    this.blockLyr = blockLyr;
    this.blockLyrView = blockLyrView;
    this.setState({
      loaded: true,
      active: initState
    })
  }

  onListItemClick(qKey){

    const next = this.state.active.map( (v,i) => 
      i === qKey ? !v : v
    )

    this.setState({
      active: next
    })
  }

  _onExploreClick(){
    this.setState({
      explore: !this.state.explore
    })
  }

  _onTimeSlide(val){
    let fV = parseFloat(val.target.value);
    this.setState({
      time: fV
    })
  }

  _onPoiChange(poi, text){
    this.setState({selPoi: poi, selText: text})
  }


  getQuestionHeader(v, i){
    const isActive = this.state.active[i];
    return (<QuestionHeader
      title={v}
      onClick={_=>this.onListItemClick(i)} // not good pattern
      active={isActive}
      index={i}
    />)
  }

  getStepOne(){
    let header = this.getQuestionHeader('SafeGraph Patterns', 0);
    if(!this.state.active[0]){
      return header;
    }
    return (
      <>
        {header}
        <div className="question-content">
          <LiveAreas
            active={this.state.explore}
            onClick={this._onExploreClick}
            value={this.state.time}
            onSlide={this._onTimeSlide}
            text={this.state.selText}/>
        </div>
      </>
    )
  }

  getStepTwo(){
    let header = this.getQuestionHeader('With Tapestry Segments', 1);
    if(!this.state.active[1]){
      return header;
    }
    return (
      <>
        {header}
        <div className="question-content">
          <Demographic
            lyr={this.blockLyr}
            lyrView={this.blockLyrView}
            mapView={this.mapView}
            time={this.state.time / 4}
            poi={this.state.selPoi}
          />
        </div>
      </>
    )
  }

  render(){
    return(
      <div>
        <MapComponent
          map={this.map}
          onLoad={this.onViewLoad}
          active={this.state.active}
          explore={this.state.explore}
          time={this.state.time / 4}
          poi={this.state.selPoi}
          onPoiChange={this._onPoiChange}
        />
        <div style={{position: "absolute", top: 15, left: 15, width: "30%", maxHeight: 'calc(100vh - 20px)', overflowY: 'scroll'}}>
          <div style={{}}>
            {this.getStepOne()}
            {this.getStepTwo()}
          </div>
        </div>
      </div>
    )
  }

}

export default App
