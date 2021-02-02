// Common JS functions, for these simple cases just run everything as globals


/****************************************************
   * UI Utils
****************************************************/

// set an alert in the dom
function displayAlert(title, message, alertId="#alert"){
  const alertEl = document.querySelector(alertId);
  alertEl.querySelector("#title").textContent = title;
  alertEl.querySelector("#message").textContent = message;
  alertEl.active = true;
}

// DOM util for creating element with attributes
function createElementWithAttrs(element, attributes){
  const el = document.createElement(element);
  Object.entries(attributes).forEach(([k,v]) => {
    el.setAttribute(k, v);
  });
  return el;
}

// create a card UI for a given item
function createCardForItem(item, onClick){
  const container = createElementWithAttrs('div', {style: 'margin-bottom: 5px'});
  const card = document.createElement('calcite-card');
  const title = createElementWithAttrs('h3', {slot: "title"});
  title.innerText = item.title;
  const subtitle = createElementWithAttrs('span', {slot: "subtitle"});
  subtitle.innerText = item.snippet;
  const footer = createElementWithAttrs('span', {slot: "footer-leading"});
  footer.innerText = `Modified: ${item.modified.toLocaleDateString()}`;
  const addBtn = createElementWithAttrs('calcite-button', {
    'scale': 'xs',
    'slot': 'footer-trailing',
    'icon-start': 'plus'
  });
  addBtn.onclick = _ => onClick(item.id);
  
  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(footer);
  card.appendChild(addBtn);
  container.appendChild(card);

  return container;
}

/****************************************************
   * Logging utils
****************************************************/

function addToLog({title, codeText}){
  const panel = document.querySelector('#side-panel');
  const header = createElementWithAttrs('div', {class: "h-margin-sm"});
  const codeContainer = createElementWithAttrs('div', {class: 'js-code'});
  const pre = document.createElement('pre');
  const code = createElementWithAttrs('code', {class: 'javascript'});

  header.innerText = title;
  codeContainer.appendChild(pre);
  pre.appendChild(code);
  code.innerText = codeText.trim();
  panel.appendChild(header);
  panel.appendChild(codeContainer);
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
}

function results(name, data){
  return function (strs, ...vars){
    out = strs[0] + vars.map((v,i) => v + strs[i+1]).join('');
    return `
${out}
console.log(${name});
/*${JSON.stringify(data, null, 2)}*/
`;
  }
}


function appendRequestStep(title, url, addlParams, response){
  const codeText = results('data', response)`
const response = await fetch("${url}", ${JSON.stringify(addlParams, null, 2)});
const data = await response.json();
`
  addToLog({title, codeText});
}


/****************************************************
   * Network utils
****************************************************/

// minimal utility to clean unwanted characters
function cleanUrl(url) {
  url = url.trim();
  if (url[url.length - 1] === "/") {
    url = url.slice(0, -1);
  }
  return url;
}

// generic handler for unknown errors
// in this simple use case just directly update the UI on error
function genericErrorHandler(error, alertId="#alert"){
  console.log(error);
  const name = error.name ? error.name : 'Uh-oh';
  const message = error.message ? error.message : 'Something went wrong, please retry';
  displayAlert(name, message, alertId);
}

// Make a request and handle errors
async function request(url, params, token, displayTitle){
  const addlParams = params ? params : {};
  if(addlParams.headers && token){
    addlParams.headers['authorization'] = token;
  } else if(token){
    addlParams.headers = {authorization: token};
  }
  const response = await fetch(url, {...addlParams})
  const data = await response.json();
  if(displayTitle){
    appendRequestStep(displayTitle, url, addlParams, data);
  }
  if(!response.ok){
    const error = Error(data.message);
    error.name = data.name;
    error.status = data.status;
    throw error;
  }
  return data;
}

// post data
async function post(url, data, token=null, displayTitle=null){
  const params = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  }
  if(data) params.body = JSON.stringify(data);
  return await request(url, params, token, displayTitle);
}

// get url
async function get(url, token=null, displayTitle=null){
  return await request(url, null, token, displayTitle);
}

/****************************************************
   * Mapping functions
****************************************************/

// load the map / ArcGIS logic and return interfaces for interacting with it
async function loadAGS(){
  return new Promise((resolve, reject) => {
    require([
      "esri/Map",
      "esri/WebMap",
      "esri/views/MapView",
      "esri/identity/IdentityManager",
      "esri/portal/Portal",
      "esri/portal/PortalQueryParams",
      "esri/widgets/Legend",
      "esri/widgets/Bookmarks",
      "esri/widgets/Expand",
      "esri/widgets/Legend",
      "esri/widgets/Search"
    ], function(Map, WebMap, MapView, esriId, Portal, PortalQueryParams, Legend, Bookmarks, Expand, Legend, Search) {
      

      /************************************
         *  Build the UI
      ************************************/
      const map = new Map({
        basemap: "satellite"
      });
      const view = new MapView({
        container: "map-view",
        map: map,
        zoom: 4,
        center: [15, 65]
      });
      view.ui.move("zoom", "bottom-right");
      const bookmarks = new Bookmarks({
        view,
        editingEnabled: true
      });
      const bkExpand = new Expand({
        view,
        content: bookmarks,
      });
      view.ui.add(bkExpand, "bottom-right");
      const legend = new Legend({view});
      const search = new Search({
        view
      });
      view.ui.add(search, 'top-right');
      const lgExpand = new Expand({
        view,
        content: legend
      })
      view.ui.add(lgExpand, 'top-right');

      /************************************
         *  Define ArcGIS interfaces
      ************************************/

      // load webmap when it's selected
      async function onSelectMap(id){
        const webmap = new WebMap({
          portalItem: {id}
        });
        try{
          view.map = webmap;
          await webmap.when();
        } catch(e){
          genericErrorHandler(e);
        }
        view.viewpoint = webmap.initialViewProperties.viewpoint;

        addToLog(SWITCH_MAP);
      }

      // set up ArcGIS by registering the token and building
      // the UI with available items
      async function setupAGS(agsCredential, itemContainerEl){
        const portal = new Portal({
          url: agsCredential.server,
          authMode: 'anonymous'
        });
        esriId.registerToken(agsCredential);
        try{
          await portal.load();
        } catch(e){
          genericErrorHandler(e);
        }
        const qParams = new PortalQueryParams({
          query: `owner:"${agsCredential.userId}" AND type:"Web Map"`,
          sortField: 'modified',
          sortOrder: 'desc',
          num: 20
        });
        let qRes;
        try {
          qRes = await portal.queryItems(qParams);
        } catch(e){
          genericErrorHandler(e);
        }
        itemContainerEl.innerHTML = null;
        qRes.results.forEach(r => {
          const el = createCardForItem(r, onSelectMap);
          itemContainerEl.appendChild(el);
        });

        const log = {
          ...QUERY_PORTAL,
          codeText: results('qRes.results.length', qRes.results.length)`${QUERY_PORTAL.codeText}`
        }
        addToLog(log)
      }

      // destroy ArcGIS by deleting the token and
      // clearing the UI
      function destroyAGS(itemContainerEl){

        view.map = null;
        view.map = map;

        esriId.destroyCredentials();

        itemContainerEl.innerHTML = null;
        const container = createElementWithAttrs('div', {
          style: "padding: 5px; background: var(--calcite-ui-background); text-align: center;"
        });
        itemContainerEl.appendChild(container);
        const text = createElementWithAttrs('h2', {class: 'muted-text'});
        text.innerText = "Connect an ArcGIS account to view items";
        container.appendChild(text);
      }

      resolve({
        setupAGS,
        destroyAGS,
        esriId
      })

    })
  })
}