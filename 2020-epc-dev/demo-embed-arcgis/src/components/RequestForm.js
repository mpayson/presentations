import React, { useState, useEffect } from 'react';
import Panel from 'calcite-react/Panel';
import styled from 'styled-components';
import Form, {
  FormControl,
  FormControlLabel
} from 'calcite-react/Form';
import Select from 'calcite-react/Select';
import { MenuItem } from 'calcite-react/Menu';
import Button from 'calcite-react/Button';
import { queryFeatures } from '@esri/arcgis-rest-feature-layer';
import { H3ntm, CenteredContainer } from '../components/Common';

const Hr = styled.hr`
  margin: 2rem 0rem 2rem 0rem;
`

const optionsUrl = 'https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/Cambridge_Public_School_Maintenance_Locations/FeatureServer/0';

function RequestForm({onSubmit, success, spatialReference='102100'}){

  const [ features, setFeatures ] = useState([]);
  const [ priority, setPriority ] = useState(null);
  const [ school, setSchool ] = useState(null);

  useEffect(_ => {
    async function getFeatures(){
      const res = await queryFeatures({url: optionsUrl, outSR: spatialReference});
      if(!res || !res.features || res.features.length < 1) return; // TODO error handling
      setFeatures(res.features);
    }
    getFeatures();
  }, []);

  function onSubmitClick(){
    const newFeature = features.find(f => f.attributes['site_name'] === school);
    newFeature.attributes['maintpriority'] = priority;
    onSubmit(newFeature);
  }

  const schoolOptions = features.map(f => {
    const name = f.attributes['site_name'];
    return <MenuItem value={name} key={name}>{name}</MenuItem>
  });

  const buttonEl = success
    ? <H3ntm style={{color: '#5a9359'}}>Success!</H3ntm>
    : <Button onClick={onSubmitClick} disabled={!priority || !school}>Submit</Button>;

  return (
    <CenteredContainer>
      <h2>Maintenance request form</h2>
      <Hr/>
      <Form>
        <FormControl>
          <FormControlLabel>School</FormControlLabel>
          <Select selectedValue={school} onChange={setSchool} fullWidth filterable>
            {schoolOptions}
          </Select>
        </FormControl>
        <FormControl>
          <FormControlLabel>Priority</FormControlLabel>
          <Select selectedValue={priority} onChange={setPriority} fullWidth>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        {buttonEl}
      </Form>
    </CenteredContainer>
  )
}

export default RequestForm;