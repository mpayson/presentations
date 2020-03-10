import React, {PureComponent} from 'react';
import Loader from './components/Loader';
import styled from 'styled-components';
import Logo from './resources/logo.svg';
import TopNav, {
  TopNavBrand,
  TopNavTitle,
  TopNavActionsList,
  TopNavList,
} from 'calcite-react/TopNav';
import Form from './components/FormPanel';
import ArcgisAccount, { ArcgisAccountMenuItem } from 'calcite-react/ArcgisAccount'
import LoginWindow from './components/LoginWindow';
import { signIn, getUser, getUserPortal } from './services/AuthService';
import { MapTheme } from './config/ui';
import {loadMap, addLegendWidget} from './services/MapService';

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

class App extends PureComponent {

  state = {
    loaded: false
  }

  constructor(props){
    super(props);
    this.mapViewRef = React.createRef();
    this.state.session = props.previousSession;
    if(this.state.session) this._onSession(this.state.session);
  }

  _onMapLoad = () => {
    this.setState({loaded: true});
  }

  _onSigninClick = async () => {
    const {agsSession, apiSession} = await signIn();
    this._onSession({agsSession, apiSession});
  }

  _onSession = async ({agsSession, apiSession}) => {
    const [user, portal] = await Promise.all([
      getUser(agsSession), getUserPortal(agsSession)
    ]);
    console.log(user, portal);
    this.setState({
      session: agsSession,
      apiToken: apiSession,
      user,
      portal
    });
  }

  async componentDidMount(){
    this.view = await loadMap(this.mapViewRef.current, MapTheme);
    addLegendWidget(this.view, 'bottom-right');
    this.view.when(this._onMapLoad);
  }

  render(){
    return( 
      <>
        <TopNav>
          <TopNavBrand src={Logo}/>
          <TopNavTitle>Extend ArcGIS Demo - Web</TopNavTitle>
          <TopNavList/>
          {this.state.user &&
            <TopNavActionsList style={{ padding: 0 }}>
              <ArcgisAccount
                user={this.state.user}
                portal={this.state.portal}
                onRequestSignOut={() => console.log('sign out clicked')}
                hideSwitchAccount={true}>
                <ArcgisAccountMenuItem>
                  Check out Github
                </ArcgisAccountMenuItem>
                <ArcgisAccountMenuItem>
                  Watch the presentation
                </ArcgisAccountMenuItem>
                <ArcgisAccountMenuItem>
                  List on Marketplace
                </ArcgisAccountMenuItem>
              </ArcgisAccount>
            </TopNavActionsList>
          }
        </TopNav>
        <AppContainer>
          <MapContainer ref={this.mapViewRef}/>
          <Form apiToken={this.state.apiToken} view={this.view}/>
          {(!this.state.loaded && this.state.session) && <Loader/>}
          {!this.state.session && <LoginWindow onClick={this._onSigninClick}/>}
        </AppContainer>
      </>
    )
  }

}

export default App;