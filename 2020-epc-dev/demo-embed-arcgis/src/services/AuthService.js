import {
  UserSession
} from "@esri/arcgis-rest-auth";
import {
  getPortal
} from "@esri/arcgis-rest-portal";
import {
  registerSession,
  destroySession
} from './MapService';
import { appConfig } from '../config/environment';

export async function signIn(){
  const {clientId} = appConfig;

  const session = await UserSession.beginOAuth2({
    clientId,
    portal: 'https://epndemo.maps.arcgis.com/sharing/rest',
    popup: true,
    redirectUri: `${window.location.origin}/redirect.html`
  });
  saveSession(session);
  await registerSession(session);
  return session;
}

export function getUser(session){
  return session.getUser();
}
export function getUserPortal(session){
  return getPortal(null, { 
    authentication: session,
    portal: session.portal
  });
}

export {registerSession};

export function signOut(){
  deleteSession();
  destroySession();
}

const SESSION_ID = 'my_verycool_key';

export function getExistingSession(){
  const serializedSession = localStorage.getItem(SESSION_ID);
  if(serializedSession !== null && serializedSession !== "undefined"){
    let parsed = JSON.parse(serializedSession);
    parsed.tokenExpires = new Date(parsed.tokenExpires);
    if(parsed.tokenExpires > new Date()){
      let session = new UserSession(parsed);
      return session;
    } else {
      localStorage.removeItem(SESSION_ID);
    }
  }
  return undefined;
}

function saveSession(session){
  localStorage.setItem(SESSION_ID, session.serialize());
}


function deleteSession(){
  localStorage.removeItem(SESSION_ID);
}