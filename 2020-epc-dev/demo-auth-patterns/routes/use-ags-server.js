/****************************************************
   * SERVER BASED OAUTH 2.0
   * This uses arcgis-rest-js for convenience, but can also use other libraries or REST, more:
   * https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/
****************************************************/

// right now, this actually has the same implementation as the
// 'trust' pattern since the trust implementation doesn't have 
// any interaction with a custom identity store
const trustRouter = require('./trust-ags-server');
module.exports = trustRouter({});