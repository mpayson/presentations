import React, {PureComponent} from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ContextPane from './components/ContextPane';
import LbsApp from './apps/LbsApp';
import UserRequestApp from './apps/UserRequestApp';
import UserDispatchApp from './apps/UserDispatchApp';
import UserWorkerApp from './apps/UserWorkerApp';
import RealTimeRequestApp from './apps/RealTimeRequestApp';

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

class App extends PureComponent {

  render(){
    return(
      <Router>
        <AppDiv>
          <Route path="/lbs" component={LbsApp}/>
          <Route path="/user/request" component={UserRequestApp}/>
          <Route path="/user/dispatch" component={UserDispatchApp}/>
          <Route path="/user/worker" component={UserWorkerApp}/>
          <Route path="/realtime/request" component={RealTimeRequestApp}/>
          <Route path="/realtime/worker" component={UserWorkerApp}/>
        </AppDiv>
        <ContextDiv>
          <ContextPane/>
        </ContextDiv>
      </Router>
    )
  }

}

export default App;