import React, {PureComponent} from 'react';
import styled from 'styled-components';
import Panel from 'calcite-react/Panel';
import Select from 'calcite-react/Select';
import Form, {
  FormControl,
  FormControlLabel,
} from 'calcite-react/Form'
import { MenuItem } from 'calcite-react/Menu';
import { getOptions, enrich } from '../services/APIService';
import Button from 'calcite-react/Button';
import {
  addSketch,
  layerFromId,
  webmapFromId,
  mapFromOptions,
  featuresIntoFeatureSet,
  webMercatorToGeographic,
  layerFromFeatureSet} from '../services/MapService';
import AddItemPanel from './AddItemPanel';
import ButtonGroup from 'calcite-react/Button/ButtonGroup';
import { MapTheme, ResultConfig } from '../config/ui';

const SidePanel = styled(Panel)`
  position: absolute;
  left: 15px;
  top: 5rem;
  width: 15rem;
  height: calc(100vh - 9rem);
  box-shadow: ${props => props.theme.boxShadow};
  background: ${props => props.theme.palette.white};
`
const SketchContainer = styled.div`
  position: absolute;
  left: calc(15px + 18rem);
  top: 18px;
  box-shadow: ${props => props.theme.boxShadow};
  background: ${props => props.theme.palette.white};
`

const MinFormControl = styled(FormControl)`
  margin-bottom: 20px;
  width: 100%;
`

class APIForm extends PureComponent{

  state = {
    selectedCategory: null,
    selectedLayer: null,
    categories: [],
    layers: []
  }

  constructor(props){
    super(props);
    this.sketchRef = React.createRef();
  }

  onClear = () => {
    this.sketch.cancel();
    this.sketch.layer.removeAll();
    this.setState({
      selectedCategory: null,
      selectedLayer: null,
      layers: []
    });
    if(this.props.view && this.props.view.map.layers.length > 1){
      this.props.view.map = mapFromOptions(MapTheme.mapOptions)
    }
  }

  onEnrich = async () => {
    let featureSet;
    if(this.state.selectedLayer === 'sketch-lyr-id'){
      // needed if using view grpahics since collection not layer
      const lyrGraphics = this.sketch.layer.graphics;
      const graphics = lyrGraphics.clone();
      graphics.forEach((g,i) => {
        g.geometry = webMercatorToGeographic(g.geometry);
        g.attributes = {'objectid': i};
      });
      featureSet = featuresIntoFeatureSet(graphics.items);
      featureSet.spatialReference = {wkid: "4326"};
      // todo add better validation here, currently a bug if no graphics items
      featureSet.geometryType = lyrGraphics.items[0].geometry.type;
    } else {
      const lyr = this.props.view.map.layers.find(l => l.id === this.state.selectedLayer);
      const qRes = await lyr.queryFeatures({
        where: "1=1",
        outFields: [lyr.objectIdField],
        returnGeometry:true,
        outSpatialReference: { wkid: 4326 }
      });
      featureSet = qRes;
    }

    let res;
    try{
      res = await enrich(featureSet, this.state.selectedCategory, this.props.apiToken);
    } catch(e){
      console.log(e)
    }
    this.onEnrichResults(res);
  }

  onEnrichResults = results => {
    // todo some error handling
    if(!results) return;
    let oidField = 'objectid';

    if(this.state.selectedLayer !== 'sketch-lyr-id'){
      const lyr = this.props.view.map.layers.find(l => l.id === this.state.selectedLayer);
      oidField = lyr.objectIdField;
    }

    this.resultLayer = layerFromFeatureSet(results, oidField, {
      title: ResultConfig.title,
      popupTemplate: ResultConfig.popupTemplate
    });
    const geoType = this.resultLayer.geometryType;
    if(geoType === 'polyline'){
      this.resultLayer.renderer = ResultConfig.lineRenderer;
    } else if (geoType === 'polygon'){
      this.resultLayer.renderer = ResultConfig.polygonRenderer;
    } else {
      this.resultLayer.renderer = ResultConfig.pointRenderer;
    }

    this.props.view.map.layers.forEach(l => l.visible = false);
    this.props.view.map.add(this.resultLayer);
  }

  componentDidMount(){
    if(this.props.apiToken) this.getCategoryOptions();
  }

  componentDidUpdate(prevProps){
    if(this.state.categories.length < 1 && this.props.apiToken && !prevProps.apiToken){
      this.getCategoryOptions();
    }
    if(!this.sketch && this.props.view && !prevProps.view){
      this.sketch = addSketch(this.props.view, this.sketchRef.current);
      if(this.state.selectedLayer !== 'sketch-lyr-id') this.props.view.ui.remove(this.sketch);
    }
  }

  getCategoryOptions = async _ => {
    const { categories } = await getOptions(this.props.apiToken);
    this.setState({categories})
  }

  onSelectChange = value => {
    this.setState({selectedCategory: value});
  }

  onLyrSelectChange = value => {
    this.setState({selectedLayer: value});
  }

  onItemSelected = async item => {
    const view = this.props.view;
    if(item.type === "Feature Service"){
      const lyr = layerFromId(item.id);
      view.map.add(lyr, view.map.layers.length);
      await lyr.when();
      view.goTo(lyr.fullExtent);
    } else if(item.type === "Web Map"){
      view.map = webmapFromId(item.id);
      await view.map.when();
      view.map.add(this.sketch.layer, view.map.layers.length);
      view.viewpoint = view.map.initialViewProperties.viewpoint;
    }
    const selectableLayers = view.map.layers.items.filter(l =>
      l.type === 'feature'
    )
    this.setState({
      layers: selectableLayers
    });
  }

  render(){

    const items = this.state.categories
      ? this.state.categories.map(c => 
        <MenuItem key={c.category} value={c.category}>{c.category} ({c.count})</MenuItem>
      )
      : null;


    const lyrItems = this.state.layers.map(l => {
      console.log(l);
      return <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>
    });
    lyrItems.unshift(
      <MenuItem key="sketch-lyr-id" value="sketch-lyr-id"><b style={{color: '#005e95'}}>Sketch geometries on map</b></MenuItem>,
    );

    if(this.sketch && this.state.selectedLayer === 'sketch-lyr-id'){
      this.props.view.ui.add(this.sketch, 'manual');
      this.sketch.layer.visible = true;
    } else if(this.sketch){
      this.props.view.ui.remove(this.sketch);
      this.sketch.layer.visible = false;
    }
  

    return(
      <>
        <SketchContainer ref={this.sketchRef}/>
        <SidePanel>
          <h3 className="no-top-margin">Form</h3>
          <Form>
            <MinFormControl>
              <FormControlLabel>Certainty category</FormControlLabel>
              <Select
                fullWidth
                onChange={this.onSelectChange}
                selectedValue={this.state.selectedCategory}>
                {items}
              </Select>
            </MinFormControl>
            <MinFormControl>
              <FormControlLabel>Area or points of interest</FormControlLabel>
              <Select
                fullWidth
                placeholder="Sketch or select layer..."
                onChange={this.onLyrSelectChange}
                selectedValue={this.state.selectedLayer}>
                {lyrItems}
              </Select>
            </MinFormControl>
            <ButtonGroup>
              <Button half small
                onClick={this.onEnrich}
                disabled={!this.state.selectedLayer || !this.state.selectedCategory}>Enrich</Button>
              <Button half red small
                disabled={!this.state.selectedLayer && !this.state.selectedCategory && this.state.layers.length < 1}
                style={{marginLeft:'5px', marginRight: '5px'}}
                onClick={this.onClear}>Clear</Button>
            </ButtonGroup>
          </Form>
          <AddItemPanel loaded={!!this.props.apiToken} onItemSelected={this.onItemSelected}/>
        </SidePanel>
      </>
    )
  }
}

export default APIForm;