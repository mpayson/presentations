import React, { useEffect, useState } from 'react';
import WorkerPane from '../components/WorkerPane';
import useMap from '../hooks/useMap';
import { getLayerFromUrl} from '../services/MapService';
import { statusRenderer, needsMaintDefExp, statusPopupTemplate } from '../config/constants';
import Button from 'calcite-react/Button/Button';
import { MapDiv, CenteredContainer, MapMask } from '../components/Common';
import AppNav from '../components/AppNav';
import { signOut, signIn, getExistingSession, registerSession } from '../services/AuthService';
import styled from 'styled-components';

const Container = styled(CenteredContainer)`
  text-align: center;
`

// in production, would likely have multiple layers so workers only see those relevant to them
// and would need to query for the layer for the user. or, if limited concern about giving 
// all workers access to the same layer and instead limiting what they see, could set definition
// expression to only fetch features relevant to the worker
const lyrUrl = 'https://services8.arcgis.com/uGiBf7iLew733Wn6/arcgis/rest/services/WORKER_Cambridge_Public_School_Maintenance_Requests/FeatureServer/0';
const initSession = getExistingSession();

function WorkerApp(){
  const [session, setSession] = useState(initSession);
  const [ref, view] = useMap();
  const [lyr, setLayer] = useState(null);

  useEffect(_ => {
    if(!session || !view) return;
    registerSession(session); // make sure session is registered in case stored locally
    const lyr = getLayerFromUrl(lyrUrl, {
      renderer: statusRenderer,
      definitionExpression: needsMaintDefExp,
      popupTemplate: statusPopupTemplate,
      title: 'Maintenance requests'
    });
    view.map.layers.add(lyr);
    setLayer(lyr);
    return function cleanUp(){
      console.log('cleanup called')
      if(lyr) {
        view.map.layers.remove(lyr);
      }
      if(session){
        console.log('Signing out')
        signOut();
      }
    }
  }, [session, view]);

  async function onLogin(){
    const session = await signIn();
    setSession(session);
  }

  async function onLogout(){
    setSession(null);
    signOut();
  }

  return (
    <>
      <AppNav titleSuffix="Worker" session={session} onLogout={onLogout}/>
      {!session && 
        <MapMask>
          <Container>
            <h2>Worker app!</h2>
            <p>Route to maintenance request assignments</p>
            <Button half onClick={onLogin}>Log in</Button><br/><br/>
            User Name: embed_worker<br/>
            Password: Esri1234!
          </Container>
        </MapMask>
      }
      <MapDiv ref={ref}/>
      {!!session && 
        <WorkerPane lyr={lyr} view={view}/>
      }
    </>
  )
}

export default WorkerApp;