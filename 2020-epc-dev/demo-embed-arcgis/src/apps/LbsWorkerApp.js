import React, { useEffect, useState } from 'react';
import WorkerPane from '../components/WorkerPane';
import useMap from '../hooks/useMap';
import { getGeoJSONLayer } from '../services/MapService';
import { statusRenderer, needsMaintDefExp, statusPopupTemplate } from '../config/constants';
import { MapDiv } from '../components/Common';
import AppNav from '../components/AppNav';

const jsonUrl = '/Cambridge_Public_School_Maintenance_Locations.json';

function LbsWorkerApp(){

  const [ref, view] = useMap();
  const [lyr, setLayer] = useState(null);

  useEffect(_ => {
    if(!view) return;
    const lyr = getGeoJSONLayer(jsonUrl, {
      renderer: statusRenderer,
      definitionExpression: needsMaintDefExp,
      popupTemplate: statusPopupTemplate,
      title: 'Maintenance requests'
    });
    view.map.layers.add(lyr);
    setLayer(lyr);
    return function cleanUp(){
      if(!lyr) return;
      view.map.layers.remove(lyr);
    }
  }, [view])

  return (
    <>
      <AppNav titleSuffix="LBS"/>
      <MapDiv ref={ref}/>
      <WorkerPane lyr={lyr} view={view}/>
    </>
  )
}

export default LbsWorkerApp;