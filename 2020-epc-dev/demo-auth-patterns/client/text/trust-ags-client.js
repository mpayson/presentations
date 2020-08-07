const CHECK_SESSION = {
  title: 'Check for an existing session',
  codeText: `
/* note, tokens in local storage can be vulnerable */
const serializedSession = localStorage.getItem(SESSION_ID);
if(serializedSession !== null && serializedSession !== "undefined"){
  let {session, ags} = JSON.parse(serializedSession);
  session.expires = new Date(session.expires);
  if(session.expires > new Date()){
    state = {session, ags};
    onAuthenticated();
  } else {
    localStorage.removeItem(SESSION_ID);
  }
}
  `
}


const LOG_OUT = {
  title: 'Log the user out',
  codeText: `
localStorage.removeItem(SESSION_ID);
state = {};
  `
}