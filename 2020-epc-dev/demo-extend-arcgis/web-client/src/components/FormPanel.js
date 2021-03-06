import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Panel from 'calcite-react/Panel';
import Button from 'calcite-react/Button';
import SaveIcon from 'calcite-ui-icons-react/SaveIcon';
import LaunchIcon from 'calcite-ui-icons-react/LaunchIcon';
import RequestForm from './RequestForm';
import ItemBrowser from './ItemBrowser';
import {
  getSkeletonQuestionConfig,
  getQuestionConfig,
  submitRequest
} from '../services/APIService';
import { 
  addSketch,
  mapFromItemJson,
  mapFromOptions,
  layerFromItemJson,
  layerToFeatureSetJSON,
  layerFromFeatureSet,
  createSolutionScaffold,
  layerFromId
} from '../services/MapService';
import { MapTheme, ResultConfig } from '../config/ui';
import env from '../config/environment';
const { solutionTemplateId } = env;

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

// TODO put this in a better place at some point
const SaveButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
`

const defaultConfig = getSkeletonQuestionConfig();

// This defines the side form panel and houses the map logic for the form (for now)
function FormPanel({view, apiToken, session}){
  const sketchRef = useRef(null);
  const sketchElRef = useRef(null);
  const [questionConfig, setQuestionConfig] = useState(defaultConfig);
  const [layers, setLayers] = useState([]);
  const [resultLayer, setResultLayer] = useState(null);
  const [solutionStatus, setSolutionStatus] = useState(null);
  const [solutionResult, setSolutionResult] = useState(null);

  // when the apiToken gets defined, get question config
  useEffect(_ => {
    if(!apiToken) return;
    async function getConfig(){
      const qC = await getQuestionConfig(apiToken);
      setQuestionConfig(qC);
    }
    getConfig();
  }, [apiToken]);

  // when view gets defined, declare the sketch widget
  useEffect(_ => {
    if(!view || !sketchElRef.current) return;
    sketchRef.current = addSketch(view, sketchElRef.current, null, {title: "Sketches"});
    view.ui.remove(sketchRef.current);
    sketchRef.current.layer.visible = false;
    
    // on dismount remove the sketch widget
    return function (){
      if(sketchRef.current) {
        view.ui.remove(sketchRef.current);
      }
    }
  }, [view, sketchElRef])

  // when a user selects an item, either replace the map or add layer to map
  // then set the resulting layers as state so they can be passed to the form
  async function onItemSelected(item){
    let sketch = sketchRef.current;
    if(item.type === 'Web Map'){
      view.map = await mapFromItemJson(item);
      await view.map.when();
      if(sketch) view.map.add(sketch.layer, view.map.layers.length);
      view.viewpoint = view.map.initialViewProperties.viewpoint;
    } else {
      const layer = await layerFromItemJson(item);
      view.map.add(layer, 0);
      await layer.when();
      view.goTo(layer.fullExtent);
    }
    // can only accept data from feature layers with vector data
    const newLayers = view.map.layers.items.filter(l => 
      l.type === 'feature'
    );
    setLayers(newLayers);
  }

  // when the form updates, check if it's a layer selection and whether
  // the sketch widget should be visible. in the future, could use this
  // function for fetching dynamic configs from the server based on current value
  function onFormUpdate(update){
    if(update.type !== 'layer') return;
    let sketch = sketchRef.current;
    if(sketch && update.isSketch){
      view.ui.add(sketch, 'manual');
      sketch.layer.visible = true;
    } else if(sketch){
      view.ui.remove(sketch);
      sketch.layer.visible = false;
    }
  }

  // when the form is cleared, reset the map
  function onFormClear(){
    let sketchLyr;
    let sketch = sketchRef.current;
    if(sketch) {
      sketch.cancel();
      sketch.layer.removeAll();
      sketchLyr = sketch.layer;
    }
    if(view && view.map.layers.length > 1){
      view.map = mapFromOptions(MapTheme.mapOptions);
      if(sketchLyr) view.map.add(sketch.layer);
    }
    setLayers([]);
    setResultLayer(null);
    setSolutionStatus(null);
    setSolutionResult(null);
  }

  // on form submit, translate the layers from their ID to 
  // a feature set containing the actual data, then pass to API
  // TODO the server could accept a URL and query directly
  async function onFormSubmit(qValues){
    const enrichRequestPromises = qValues.map(async q => {
      if(q.type !== 'layer') return q;
      const layer = view.map.layers.find(l => 
        l.id === q.value
      );
      const featureJson = await layerToFeatureSetJSON(layer);
      return {...q, value: featureJson};
    });
    const enrichRequest = await Promise.all(enrichRequestPromises);

    let results;
    try {
      results = await submitRequest(enrichRequest, apiToken);
    } catch(e){
      console.log(e);
    }
    onEnrichResults(results);
  }

  // update the UI when enrichment is complete
  function onEnrichResults(results){
    if(!results) return;
    const { title, popupTemplate, rendererByGeometryType } = ResultConfig;
    const lyr = layerFromFeatureSet(results, {title, popupTemplate});
    const renderer = rendererByGeometryType[lyr.geometryType];
    lyr.renderer = renderer;
    view.map.add(lyr);
    setResultLayer(lyr);
  }
  
  // deploy the solution template as scaffolding and save the result layer data
  // into the deployed layer
  async function onSaveResults(){
    const { solutionInfo, itemInfo } = await createSolutionScaffold(solutionTemplateId, {
      progressCallback: setSolutionStatus
    });
    if(!solutionInfo.templates || solutionInfo.templates.length < 1){
      return;
    }
    const lyrInfo = solutionInfo.templates.find(t => 
      t.type === 'Feature Service'  
    );
    const lyr = layerFromId(lyrInfo.itemId);
    const edits = await resultLayer.queryFeatures({where: "1=1", returnGeometry: true});
    try {
      await lyr.applyEdits({addFeatures: edits.features});
      setSolutionResult(itemInfo);
      setSolutionStatus(null);
    } catch(e){
      console.log(e);
    }
  }

  let saveButton;
  if(solutionResult){
  saveButton = <SaveButton icon={<LaunchIcon size={14}/>} iconPosition="before" green target="_blank" href={solutionResult.url}>Check it out!</SaveButton>
  } else if(resultLayer && resultLayer.geometryType === 'point'){ // only have point solution template for now
    const isExecuting = solutionStatus !== null;
    saveButton = <SaveButton onClick={onSaveResults} icon={<SaveIcon size={14}/>} iconPosition="before" clear small disabled={isExecuting}>
      {isExecuting ? `Creating... ${solutionStatus.toFixed(0)}%` : 'Save'}
    </SaveButton>
  }

  return(
    <>
      <SketchContainer ref={sketchElRef}/>
      <SidePanel>
        <h3 className="no-top-margin">Form</h3>
        {saveButton}
        <RequestForm
          layers={layers}
          questionConfig={questionConfig}
          onUpdate={onFormUpdate}
          onSubmit={onFormSubmit}
          onClear={onFormClear}
          loaded={!!view}
          />
        <ItemBrowser
          loaded={!!apiToken}
          onItemSelected={onItemSelected}
          />
      </SidePanel>
    </>
  )

}

export default FormPanel;