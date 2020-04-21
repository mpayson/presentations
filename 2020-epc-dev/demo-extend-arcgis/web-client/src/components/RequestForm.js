import React, { useState } from 'react';
import styled from 'styled-components';
import Form, {
  FormControl,
  FormControlLabel,
} from 'calcite-react/Form';
import { arrayToObjectByKey } from '../utils/utils';
import { DEFAULT_SKETCH_LAYER_ID } from '../services/MapService';
import Select from 'calcite-react/Select';
import { MenuItem } from 'calcite-react/Menu';
import Button from 'calcite-react/Button';
import ButtonGroup from 'calcite-react/Button/ButtonGroup';

const MinFormControl = styled(FormControl)`
  margin-bottom: 20px;
  width: 100%;
`
const sketchLayerId = DEFAULT_SKETCH_LAYER_ID;

// a stateful form with questions that notifies the parent on important changes
// right now uses hardcoded logic to render the two known questions
// in the future this could entirely define the UI based on the config
// which is a pass through defined by the API Service
function RequestForm({layers, questionConfig, onUpdate, onSubmit, onClear, loaded}){
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedLayer, setSelectedLayer] = useState();

  const configByQuestion = arrayToObjectByKey(questionConfig, 'question');
  const { category, layer } = configByQuestion;

  // update the parent in case need to add sketch widget to UI
  function onLayerSelected(value){
    onUpdate({
      question: 'layer',
      type: 'layer',
      value,
      isSketch: value === sketchLayerId,
      ...layer
    });
    setSelectedLayer(value);
  }

  // clear out state within the form and notify the parent
  function onClearClick(){
    onLayerSelected(null);
    setSelectedCategory(null);
    onClear();
  }

  // pass back the defined form values a long with the config
  function onSubmitClick(){
    onSubmit([{
      value: selectedLayer,
      ...layer
    }, {
      value: selectedCategory,
      ...category
    }])
  }

  const items = category.options.map(c => 
    <MenuItem key={c.category} value={c.category}>{c.category} ({c.count})</MenuItem>
  )
  // use map layers passed in as prop for layer
  const lyrItems = layers.map(l => 
    <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>
  )
  lyrItems.unshift(
    <MenuItem key={sketchLayerId} value={sketchLayerId}><b style={{color: '#005e95'}}>Sketch geometries on map</b></MenuItem>
  )

  return (
    <Form>
      <MinFormControl>
        <FormControlLabel>Certainty category</FormControlLabel>
        <Select
          fullWidth
          onChange={setSelectedCategory}
          selectedValue={selectedCategory}
          disabled={!items}>
          {items}
        </Select>
      </MinFormControl>
      <MinFormControl>
        <FormControlLabel>Area or points of interest</FormControlLabel>
        <Select
          fullWidth
          placeholder="Sketch or select layer..."
          onChange={onLayerSelected}
          selectedValue={selectedLayer}
          disabled={!loaded}>
          {lyrItems}
        </Select>
      </MinFormControl>
      <ButtonGroup>
        <Button half small
          onClick={onSubmitClick}
          disabled={!selectedLayer || !selectedCategory}>Enrich</Button>
        <Button half red small
          disabled={!selectedLayer && !selectedCategory && layers.length < 1}
          style={{marginLeft:'5px', marginRight: '5px'}}
          onClick={onClearClick}>Clear</Button>
      </ButtonGroup>
    </Form>
  )

}

export default RequestForm;