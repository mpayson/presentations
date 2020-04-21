import React, {useState} from 'react';
import RequestForm from '../components/RequestForm';
import { applyEdits } from '@esri/arcgis-rest-feature-layer';

const editUrl = 'https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/PUBLIC_Cambridge_Public_School_Maintenance_Requests/FeatureServer/0';

function UserRequestApp(){

  const [success, setSuccess] = useState(false);

  async function onSubmit(feature){
    const results = await applyEdits({
      url: editUrl,
      adds: [feature]
    });
    if(!results) return; // todo error handling
    setSuccess(true);
  }

  return(
    <RequestForm onSubmit={onSubmit} success={success}/>
  )
}

export default UserRequestApp;