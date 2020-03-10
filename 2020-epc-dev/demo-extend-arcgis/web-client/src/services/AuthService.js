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
import env from '../config/environment';
import { exchangeSessionForAPIToken } from "./APIService";

const SESSION_ID = "_my_awesome_demo_";

// check if there's an existing session
export function getExistingSession(){
  const serializedSession = localStorage.getItem(SESSION_ID);
  if(serializedSession !== null && serializedSession !== "undefined"){

    // need both arcgis and api session info, will have same expires
    let {agsSession, apiSession} = JSON.parse(serializedSession);
    agsSession.tokenExpires = new Date(agsSession.tokenExpires);

    // register with JS API and return session infos, else return null
    if(agsSession.tokenExpires > new Date()){
      const agsSessionClass = new UserSession(agsSession);
      registerSession(agsSessionClass);
      return {
        agsSession: agsSessionClass,
        apiSession
      }
    } else {
      localStorage.removeItem(SESSION_ID);
    }
  }
  return undefined;
}

export async function signIn(){
  const {clientId} = env;

  const agsSession = await UserSession.beginOAuth2({
    clientId,
    popup: true,
    redirectUri: `${window.location.origin}/redirect.html`
  });

  const [apiSession, _] = await Promise.all([
    exchangeSessionForAPIToken(agsSession),
    registerSession(agsSession)
  ]);

  saveSession({agsSession, apiSession});
  return { agsSession, apiSession};
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

export function signOut(){
  deleteSession();
  destroySession();
}

function saveSession({agsSession, apiSession}){
  localStorage.setItem(SESSION_ID, JSON.stringify({
    agsSession: agsSession.toJSON(),
    apiSession
  }))
}


function deleteSession(){
  localStorage.removeItem(SESSION_ID);
}