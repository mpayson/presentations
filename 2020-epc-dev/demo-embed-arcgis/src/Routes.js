import React from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ContextPane from './components/ContextPane';
import LbsWorkerApp from './apps/LbsWorkerApp';
import UserRequestApp from './apps/UserRequestApp';
import DispatchApp from './apps/DispatchApp';
import WorkerApp from './apps/WorkerApp';
import RealTimeRequestApp from './apps/RealTimeRequestApp';
import { CenteredContainer } from './components/Common';

const AppDiv = styled.div`
  width: 75%;
  height: 100vh;
`

const ContextDiv = styled.div`
  width: 25%;
  height: 100vh;
  background: #052942;
  color: white;
  padding: 0rem 1rem;
`

const Home = () => (
  <CenteredContainer>
    <h1>Embed ArcGIS Demo</h1>
    <p>This demo has multiple applications that progressively add ArcGIS capabilities in the context of a (very simple) maintenance request workflow.</p>
    <p>When one of the apps is open, the right pane will highlight (unfade) the components used in that application.</p>
    <b><i>Select one of the apps to the right to get started!</i></b>
  </CenteredContainer>
)

const Routes = () => (
  <Router>
    <AppDiv>
      <Route path="/" exact component={Home}/>
      <Route path="/lbs" component={LbsWorkerApp}/>
      <Route path="/user/request" component={UserRequestApp}/>
      <Route path="/user/dispatch" component={DispatchApp}/>
      <Route path="/user/worker" component={WorkerApp}/>
      <Route path="/realtime/request" component={RealTimeRequestApp}/>
      <Route path="/realtime/worker" component={WorkerApp}/>
    </AppDiv>
    <ContextDiv>
      <ContextPane/>
    </ContextDiv>
  </Router>
)

export default Routes;