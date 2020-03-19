import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from 'calcite-react/Button/Button';
import { MapDiv, MapMask, CenteredContainer } from '../components/Common';
import useMap from '../hooks/useMap';
import { signIn, signOut, getExistingSession, registerSession } from '../services/AuthService';
import { getLayerFromUrl, addEditWidget } from '../services/MapService';
import { assigneeRenderer, needsMaintDefExp, statusPopupTemplate } from '../config/constants';
import AppNav from '../components/AppNav';

const Container = styled(CenteredContainer)`
  text-align: center;
`

// in production, may have multiple layers depending on if there are multiple projects
// or if dispatchers should only have access to a subset of projects
const lyrUrl = 'https://services.arcgis.com/q7zPNeKmTWeh7Aor/arcgis/rest/services/Cambridge_Public_School_Locations/FeatureServer/0';

const initSession = getExistingSession();


// TODO add more ways to start editing with list and popup action
function UserDispatchApp(){
  const [session, setSession] = useState(initSession);
  const [lyr, setLayer] = useState(null);
  const [editExpand, setEditExpand] = useState(null);
  const [ref, view] = useMap();

  // add layer to map
  useEffect(_ => {
    if(!session || !view) return;
    registerSession(session); // make sure session is registered in case stored locally

    const editExpandWidget = addEditWidget(view, 'bottom-right', {
      allowedWorkflows: ['update']
    });
    setEditExpand(editExpandWidget);

    const lyr = getLayerFromUrl(lyrUrl, {
      renderer: assigneeRenderer,
      definitionExpression: needsMaintDefExp,
      popupTemplate: statusPopupTemplate,
      title: 'Maintenance requests'
    });
    view.map.layers.add(lyr);
    setLayer(lyr);

    return function cleanUp(){
      if(lyr) {
        view.map.layers.remove(lyr)
      }
      if(session){
        signOut();
      };
      if(editExpandWidget){
        view.ui.remove(editExpandWidget);
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
      <AppNav titleSuffix="Dispatch" session={session} onLogout={onLogout}/>
      {!session && 
        <MapMask>
          <Container>
            <h2>Dispatch app!</h2>
            <p>Assign maintenance requests to workers</p>
            <Button half onClick={onLogin}>Log in</Button>
          </Container>
        </MapMask>
      }
      <MapDiv ref={ref}/>
    </>
  )
}

export default UserDispatchApp;