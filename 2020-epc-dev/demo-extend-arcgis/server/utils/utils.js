const { cleanUrl } = require('@esri/arcgis-rest-request');

// looks for a token in the incoming request
function getJWTForRequest(req){
  let token;
  if (req && req.query && req.query.token) token = req.query.token;
  if (req && req.headers && req.headers.authorization) token = req.headers['authorization'];
  return token;
}

// extracted from arcgis-rest
// https://github.com/Esri/arcgis-rest-js/blob/master/packages/arcgis-rest-auth/src/UserSession.ts#L809
function getServerRootUrl(url) {
  const [root] = cleanUrl(url).split(
    /\/rest(\/admin)?\/services(?:\/|#|\?|$)/
  );
  const [match, protocol, domainAndPath] = root.match(/(https?:\/\/)(.+)/);
  const [domain, ...path] = domainAndPath.split("/");

  // only the domain is lowercased becasue in some cases an org id might be
  // in the path which cannot be lowercased.
  return `${protocol}${domain.toLowerCase()}/${path.join("/")}`;
}

module.exports = {
  getJWTForRequest,
  getServerRootUrl
}