import React, {useState} from 'react';
import RequestForm from '../components/RequestForm';

const editUrl = 'https://partners-dev-ge.bd.esri.com:6143/geoevent/rest/receiver/epc-demo-embed-request';

function RealTimeRequestApp(){

  const [success, setSuccess] = useState(false);

  async function onSubmit(feature){
    console.log(feature);
    const rawResults = await fetch(editUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feature)
    });
    console.log(rawResults);
    if(!rawResults) return; // TODO error handling
    setSuccess(true);
  }

  return(
    <RequestForm onSubmit={onSubmit} success={success} spatialReference='4326'/>
  )
}

export default RealTimeRequestApp;