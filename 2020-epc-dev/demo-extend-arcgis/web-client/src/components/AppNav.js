import React, { useState, useEffect } from 'react';
import { getUser, getUserPortal } from '../services/AuthService';
import TopNav, {
  TopNavBrand,
  TopNavTitle,
  TopNavActionsList,
  TopNavList,
} from 'calcite-react/TopNav';
import DefaultLogo from '../resources/logo.svg';
import ArcgisAccount, { ArcgisAccountMenuItem } from 'calcite-react/ArcgisAccount'

function AppNav({title, logo, session, onLogout}){

  const [userInfo, setUserInfo] = useState(null);

  const navLogo = logo || DefaultLogo;

  useEffect(_ => {
    // if session isn't define, the user also shouldn't be defined
    if(!session) {
      setUserInfo(null);
      return;
    };
    // when session is defined, fetch and set the user info
    async function getUserInfo(){
      const [user, portal] = await Promise.all([
        getUser(session), getUserPortal(session)
      ]);
      setUserInfo({user, portal});
    }
    getUserInfo();
  }, [session]);

  return(
    <TopNav>
      <TopNavBrand src={navLogo}/>
      <TopNavTitle>{title}</TopNavTitle>
      <TopNavList/>
      {!!userInfo && 
        <TopNavActionsList style={{ padding: 0 }}>
          <ArcgisAccount
            user={userInfo.user}
            portal={userInfo.portal}
            onRequestSignOut={onLogout}
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
  )

}

export default AppNav;