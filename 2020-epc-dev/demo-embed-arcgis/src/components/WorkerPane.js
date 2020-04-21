import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  H3ntm,
  SidePaneContainer
} from './Common';
import {
  colorsByPriority
} from '../config/constants';
import List, {
  ListItem,
  ListItemTitle,
  ListItemSubtitle
} from 'calcite-react/List';
import ExclIcon from 'calcite-ui-icons-react/ExclamationMarkTriangleIcon';
import Button from 'calcite-react/Button';
import { generateRoute, graphicsIntoGraphicsLayer } from '../services/MapService';

const RouteButton = styled(Button)`
  position: absolute;
  left: 15px;
  bottom: 15px;
  width: 15rem;
`

function WorkerPane({lyr, view, canRoute=true}){

  const [reqs, setReqs] = useState([]);

  useEffect(_ => {
    if(!lyr) return;
    async function loadRequests(){
      const results = await lyr.queryFeatures();
      if(results && results.features && results.features.length > 1){
        setReqs(results.features)
      }
    }
    loadRequests();
    return function cleanUp(){
      setReqs([]);
    }
  }, [lyr]);

  async function onRouteClick(){
    const results = await generateRoute(reqs, {findBestSequence: true});
    if(!results || !results.routeResults || results.routeResults.length < 1) return;
    const route = results.routeResults[0].route;
    route.symbol = {type: 'simple-line', color: '#AA35F6', width: '2px', style: 'short-dash'};
    const graphicsLyr = graphicsIntoGraphicsLayer([route]);
    view.map.add(graphicsLyr, 0);
  }

  const reqItems = reqs.map(r => {
    const attrs = r.attributes;
    const priority = attrs['maintpriority'];
    const icon = <ExclIcon color={colorsByPriority[priority]} filled/>;
    return (
      <ListItem key={attrs[lyr.objectIdField]} leftNode={icon}>
        <ListItemTitle>{attrs['site_name']}</ListItemTitle>
        <ListItemSubtitle>{attrs['address']}</ListItemSubtitle>
      </ListItem>
    )
  });


  return (
    <SidePaneContainer>
      <H3ntm>Outstanding requests ({reqItems.length})</H3ntm>
      <List>
        {reqItems}
      </List>
      {canRoute &&
        <RouteButton
          extraLarge
          onClick={onRouteClick}
          disabled={reqs.length < 1}>
            Optimize a route
        </RouteButton>
      }
    </SidePaneContainer>
  )
}

export default WorkerPane;