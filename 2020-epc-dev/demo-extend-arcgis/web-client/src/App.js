import React, {PureComponent} from 'react';
import {Loader, LoaderBar} from './components/Loaders';
import styled from 'styled-components';
import Form from './components/FormPanel';
import LoginWindow from './components/LoginWindow';
import { signIn, signOut } from './services/AuthService';
import { MapTheme } from './config/ui';
import {loadMap, addSearchWidget, registerSession, addLayerListWidget, mapFromOptions} from './services/MapService';
import AppNav from './components/AppNav';

const AppContainer = styled.div`
  width: 100vw;
  height: calc(100vh - 4rem);
  display: flex;
  justifyContent: center;
`

const MapContainer = styled.div`
  width: 100%;
  maxHeight: 100%;
  flexGrow: 1;
`;

// TODO, refactor to functions & hooks!
class App extends PureComponent {

  state = {
    loaded: false,
    isMapUpdating: false
  }

  constructor(props){
    super(props);
    this.mapViewRef = React.createRef();
    if(props.previousSession){
      this.state.session = props.previousSession.agsSession;
      this.state.apiToken = props.previousSession.apiSession;
    }
  }

  async componentDidMount(){
    // if an existing session, make sure it's registered with the API
    if(this.props.previousSession){
      await registerSession(this.state.session);
    }
    // load the map
    this.view = await loadMap(this.mapViewRef.current, MapTheme);
    addLayerListWidget(this.view, 'bottom-right');
    addSearchWidget(this.view, 'top-right', 0, true);
    this.view.when(this._onMapLoad);
  }

  onMapUpdateChange = (newValue) => {
    this.setState({isMapUpdating: newValue});
  }

  _onMapLoad = () => {
    this.setState({loaded: true});
    this.viewUpdateHandler = this.view.watch("updating", this.onMapUpdateChange);
  }

  _onSigninClick = async () => {
    const {agsSession, apiSession} = await signIn();
    this.setState({
      session: agsSession,
      apiToken: apiSession
    })
  }

  _onSignoutClick = async _ => {
    this.view.map = mapFromOptions(MapTheme.mapOptions);
    this.setState({
      session: null,
      apiToken: null
    });
    signOut();
  }

  render(){

    return( 
      <>
        <AppNav
          title={'Extend ArcGIS Demo'}
          session={this.state.session}
          onLogout={this._onSignoutClick}/>
        <AppContainer>
          {(this.state.isMapUpdating && !!this.state.session) && <LoaderBar/>}
          <MapContainer ref={this.mapViewRef}/>
          <Form apiToken={this.state.apiToken} session={this.state.session} view={this.view}/>
          {(!this.state.loaded && this.state.session) && <Loader/>}
          {!this.state.session && <LoginWindow onClick={this._onSigninClick}/>}
        </AppContainer>
      </>
    )
  }

}

export default App;