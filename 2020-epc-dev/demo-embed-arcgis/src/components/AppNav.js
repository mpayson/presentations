import React, { useState, useEffect } from 'react';
import { getUser, getUserPortal } from '../services/AuthService';
import TopNav, {
  TopNavBrand,
  TopNavTitle,
  TopNavActionsList,
  TopNavList,
} from 'calcite-react/TopNav';
import DefaultLogo from '../resources/lbs-logo.svg';
import ArcgisAccount from 'calcite-react/ArcgisAccount';

function AppNav({titleSuffix, logo, session, onLogout}){

  const [userInfo, setUserInfo] = useState(null);

  const navLogo = logo || DefaultLogo;

  useEffect(_ => {
    if(!session) return;
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
      <TopNavTitle>Embed ArcGIS Demo - {titleSuffix}</TopNavTitle>
      <TopNavList/>
      {!!userInfo && 
        <TopNavActionsList style={{ padding: 0 }}>
          <ArcgisAccount
            user={userInfo.user}
            portal={userInfo.portal}
            onRequestSignOut={onLogout}
            hideSwitchAccount={true}>
          </ArcgisAccount>
        </TopNavActionsList>
      }
    </TopNav>
  )

}

export default AppNav;