const CHECK_SESSION = {
  title: 'Check for an existing session',
  codeText: `
/* note, tokens in local storage can be vulnerable */
const serializedSession = localStorage.getItem(SESSION_ID);
if(serializedSession !== null && serializedSession !== "undefined"){
  let parsed = JSON.parse(serializedSession);
  parsed.expires = new Date(parsed.expires);
  if(parsed.expires > new Date()){
    state = {ags: parsed};
    onAuthenticated();
  } else {
    localStorage.removeItem(SESSION_ID);
  }
}
  `
}

const START_OAUTH = {
  title: 'Start browser-based OAuth 2.0 process',
  codeText: `
const session = await arcgisRest.UserSession.beginOAuth2({
  clientId: CLIENT_ID,
  redirectUri: '${window.location.href}',
  popup: true
});
  `
}

const COMPLETE_OAUTH = {
  title: 'Completed OAuth 2.0 process',
  codeText: `
const credential = session.toCredential();
localStorage.setItem(SESSION_ID, JSON.stringify(credential));
state = {ags: credential};
  `
}

const LOG_OUT = {
  title: 'Log the user out',
  codeText: `
localStorage.removeItem(SESSION_ID);
state = {};
  `
}

const GET_USER = {
  title: 'Get user info!',
  codeText: `
const userSession = new arcgisRest.UserSession.fromCredential(state.ags);
const userInfo = await UserSession.getUser();
console.log(userInfo);
  `
}