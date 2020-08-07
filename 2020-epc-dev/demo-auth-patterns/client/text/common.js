const SWITCH_MAP = {
  title: 'Switch the map',
  codeText: `# ArcGIS JS API classes
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
  `
}

const QUERY_PORTAL = {
  title: 'Register a session and query portal for maps owned by user',
  codeText: `# ArcGIS JS API classes
const portal = new Portal({
  url: agsCredential.server,
  authMode: 'anonymous'
});
esriId.registerToken(agsCredential);
await portal.load();

const qParams = new PortalQueryParams({
  query: \`owner:"\${state.ags.userId}" AND type:"Web Map"\`,
  sortField: 'modified',
  sortOrder: 'desc',
  num: 20
});
let qRes = await portal.queryItems(qParams);
`
}