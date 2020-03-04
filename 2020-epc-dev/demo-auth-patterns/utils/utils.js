
// looks for a token in the incoming request
function getJWTForRequest(req){
  let token;
  if (req && req.query && req.query.token) token = req.query.token;
  if (req && req.headers && req.headers.authorization) token = req.headers['authorization'];
  return token;
}

// a modified authorize function from arcgis-rest-js to support passing in custom state
// https://github.com/Esri/arcgis-rest-js/blob/25778e3e6b16d73cc22a79a7b9bc1c97f4f90ac4/packages/arcgis-rest-auth/src/UserSession.ts#L450
function authorizeWithState(options, response){
  const { portal, clientId, duration, redirectUri, state } = {
    ...{ portal: "https://arcgis.com/sharing/rest", duration: 20160 },
    ...options
  };

  response.writeHead(301, {
    Location: `${portal}/oauth2/authorize?client_id=${clientId}&duration=${duration}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${encodeURIComponent(state)}`
  });

  response.end();
}

module.exports = {
  authorizeWithState,
  getJWTForRequest
}