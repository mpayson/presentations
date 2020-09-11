// import "@esri/calcite-components/dist/calcite.js";
// import { defineCustomElements } from '@esri/calcite-components/dist/custom-elements';
import { UserSession } from '@esri/arcgis-rest-auth';
import { getPortal } from '@esri/arcgis-rest-portal';
import { createSolution } from '@esri/solution-creator';
import { deploySolution } from '@esri/solution-deployer';

// defineCustomElements();

const CLIENT_ID = 'wqxf4JBvtmeyB18v';
const SESSION_ID = 'solutionjs_demo';
let state = {};

function getRootPortal(portal){
  return `${portal.urlKey}.${portal.customBaseUrl}`;
}

/****************************************************
  * Auth logic
****************************************************/

// handle oauth callback if there's a state parameter in the URL
// note this is normally a standalone script on another HTML page
// but I wanted to keep the demos to one HTML page
// get client id from url hash
const match = window.location.href.match(/&state=([^&]+)/);
if(match){
  UserSession.completeOAuth2({
    clientId: CLIENT_ID,
    popup: true
  });
}

// handle on login click, redirect here since handle login per above
// use a popup so can track what is happening
async function logIn(){
  return UserSession.beginOAuth2({
    clientId: CLIENT_ID,
    redirectUri: `${window.location.href}`,
    popup: true
  });
}

// configure things on log in
const adminEl = document.querySelector("#admin-account");
const userEl = document.querySelector("#user-account");
async function onLogIn(step, session){
  const portal = await getPortal(null, {
    authentication: session,
    portal: session.portal
  });
  state[step] = {session, portal};
  if(step === 'admin'){
    adminEl.innerHTML = `<b>Admin account:</b>&nbsp;<span class="normal">${session.username} (${getRootPortal(portal)})</span>`;
  } else {
    userEl.innerHTML = `<b>User account:</b>&nbsp;<span class="normal">${session.username} (${getRootPortal(portal)})</span>`;
  }
  localStorage.setItem(`${SESSION_ID}_${step}`, JSON.stringify(session.toJSON()))
}

function handleExistingSession(step){
  const serializedSession = localStorage.getItem(`${SESSION_ID}_${step}`);
  if(serializedSession){
    let jsonSession = JSON.parse(serializedSession);
    jsonSession.tokenExpires = new Date(jsonSession.tokenExpires);
    if(jsonSession.tokenExpires > new Date()){
      const session = new UserSession(jsonSession);
      onLogIn(step, session);
    } else {
      localStorage.removeItem(`${SESSION_ID}_${step}`);
    }
  }
}
handleExistingSession('admin');
handleExistingSession('user');

// log the user in when they select admin account
document.querySelector("#admin-login").onclick = async function(){
  const session = await logIn();
  onLogIn('admin', session);
}

// log the user in when they select user account
document.querySelector("#user-login").onclick = async function(){
  const session = await logIn();
  onLogIn('user', session);
}

document.querySelector("#log-out").onclick = async function(){
  localStorage.removeItem(`${SESSION_ID}_admin`);
  localStorage.removeItem(`${SESSION_ID}_user`);
  window.location.reload();
}

/****************************************************
  * UI logic
****************************************************/

// update the progress element
const progressEls = {
  admin: document.querySelector("#admin-progress"),
  user: document.querySelector("#user-progress")
}
const resultEls = {
  admin: document.querySelector("#admin-result"),
  user: document.querySelector("#user-result")
}


function setProgress(step, percentProgress){
  const progressEl = progressEls[step];
  const resultEl = resultEls[step];
  progressEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
  progressEl.value = percentProgress / 100;
  progressEl.text = `${percentProgress}%`;
}
function onResult(step, resultUrl){
  const progressEl = progressEls[step];
  const resultEl = resultEls[step];
  progressEl.classList.add('hidden');
  resultEl.classList.remove('hidden');
  resultEl.onclick = function(){
    if(!resultUrl) return;
    navigator.clipboard.writeText(resultUrl).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
}

/****************************************************
  * Solution templating and deployment logic
****************************************************/
const groupEl = document.querySelector("#group-id");
const templateEl = document.querySelector("#template-id");
const adminMessageEl = document.querySelector("#admin-er-message");
document.querySelector("#create").onclick = async function(){
  adminMessageEl.active = false;
  let result;
  try {
    result = await createSolution(groupEl.value, state.admin.session, {
      progressCallback: progress => setProgress('admin', progress)
    });
  } catch(err){
    adminMessageEl.active = true;
    adminMessageEl.status = "invalid";
    adminMessageEl.innerText = err.originalMessage || "Something went wrong - is this a valid item that the admin can access?";
    return;
  }
  const resultUrl = `https://${getRootPortal(state.admin.portal)}/home/item.html?id=${result}`;
  onResult('admin', resultUrl);
  templateEl.value = result;
}

const userMessageEl = document.querySelector("#user-er-message");
document.querySelector("#deploy").onclick = async function(){
  userMessageEl.active = false;
  let result;
  try {
    result = await deploySolution(templateEl.value, state.user.session, {
      progressCallback: progress => setProgress('user', progress),
      // storageAuthentication: state.admin.session
    });
  } catch(err){
    userMessageEl.active = true;
    userMessageEl.status = "invalid";
    userMessageEl.innerText = err.originalMessage;
    return;
  }
  const resultUrl = `https://${getRootPortal(state.user.portal)}/home/item.html?id=${result}`;
  onResult('user', resultUrl);
}