const CHECK_SESSION = {
  title: 'Check for an existing session',
  codeText: `
/* note, tokens in local storage can be vulnerable */
const prevSession = localStorage.getItem(SESSION_ID);
if(prevSession !== null && prevSession !== "undefined"){
  state.session = JSON.parse(prevSession);
  state.session.expires = new Date(state.session.expires);
  if(state.session.expires <= new Date()){
    state.session = null;
    localStorage.removeItem(SESSION_ID);
  } else {
    onAuthenticated(state.session);
  }
}
  `
}