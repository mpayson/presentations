/****************************************************
   * SERVER BASED OAUTH 2.0
   * This uses arcgis-rest-js for convenience, but can also use other libraries or REST, more:
   * https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/
****************************************************/
const express = require('express');
const router = express.Router();
const { authorizeWithState, getRestUrlForPortal } = require("../utils/utils");

const { isAuthorizedSession } = require("../middleware/is-authorized");
const { UserSession } = require("@esri/arcgis-rest-auth");

// get the required config variables
const { CLIENT_ID, REDIRECT_URI } = process.env;

// make TTLs short for demo purposes
const COOKIE_EXPIRATION_MS = 7200000; // 2 hours
const AGS_REFRESH_TOKEN_EXPIRATION_SECONDS = 300; // 5 minutes

const ClientByPortal = {
  'https://partners-dev.bd.esri.com/portal': 'G388ztzGeaEhh8j4'
}

module.exports = function(userStore){

  // not currently used, but could be used to interact with user store
  // eg to validate that user should access the app before setting a session
  // or to get additional information from the store about the user
  const { getUserForAGSUser } = userStore;

  // initiate user authorization, redirects user to ArcGIS to log in
  router.get("/authorize", function(req, res) {
    const portal = req.query.portal ||  "https://www.arcgis.com";
    const clientRedirect = req.query.redirect || "/trust-ags-server.html";
    const clientId = ClientByPortal[portal] || CLIENT_ID;
    const state = encodeURIComponent(JSON.stringify({portal, clientRedirect}));

    authorizeWithState({
      clientId,
      redirectUri: REDIRECT_URI,
      duration: AGS_REFRESH_TOKEN_EXPIRATION_SECONDS / 60,
      portal: getRestUrlForPortal(portal),
      state
    }, res);

  });

  // exchange code for the tokens, check if user exists, and store in session
  router.get("/redirect", async function(req, res) {
    
    const { portal, clientRedirect } = JSON.parse(decodeURIComponent(req.query.state));
    const clientId = ClientByPortal[portal] || CLIENT_ID;

    const userSession = await UserSession.exchangeAuthorizationCode({
      clientId,
      redirectUri: REDIRECT_URI,
      refreshTokenTTL: AGS_REFRESH_TOKEN_EXPIRATION_SECONDS,
      portal: getRestUrlForPortal(portal)
    }, req.query.code);

    // For demo, the user isn't validated in this system, just in ArcGIS
    // but this could be implemented with something like
    //   const user = await getUserForAGSUser(userSession.username, userSession.portal);
    //   validateUser(user);

    req.session.user = userSession.username;
    req.session.agsSession = userSession.serialize();

    // redirect to the home html page
    return res.redirect(clientRedirect);

  });

  // return user information, for now just the username
  router.get("/self", isAuthorizedSession, function(req, res){
    res.json({
      user: req.user // middleware adds user to request
    })
  })

  // forward ArcGIS session information to the browser & refresh if needed
  // eg to register the credential with the JS API
  router.get("/ags-credential", isAuthorizedSession, async function(req, res){
    let userSession = UserSession.deserialize(req.session.agsSession);
    userSession = await userSession.refreshSession();
    req.session.agsSession = userSession.serialize();
    return res.json(userSession.toCredential());
  });

  // log the user out of the service
  router.post('/logout', isAuthorizedSession, function(req, res){
    req.session.destroy(function(err){
      res.cookie("extend-arcgis-demo", { maxAge: COOKIE_EXPIRATION_MS });
      return res.json({"message": "success!"});
    });
  });

  router.get('/validate-portal', function(req, res){
    const portal = req.query.portal;
    return res.json({"isValid": !!ClientByPortal[portal]});
  })

  return router;
}