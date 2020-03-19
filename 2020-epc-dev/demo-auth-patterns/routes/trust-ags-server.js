/****************************************************
   * SERVER BASED OAUTH 2.0
   * This uses arcgis-rest-js for convenience, but can also use other libraries or REST, more:
   * https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/
****************************************************/
const express = require('express');
const router = express.Router();

const { isAuthorizedSession } = require("../middleware/is-authorized");
const { UserSession } = require("@esri/arcgis-rest-auth");

// get the required config variables
const { CLIENT_ID, REDIRECT_URI } = process.env;
const TOKEN_EXPIRATION_MS = 2592000000;

module.exports = function(userStore){

  // not currently used, but could be used to interact with user store
  // eg to validate that user should access the app before setting a session
  // or to get additional information from the store about the user
  const { getUserForAGSUser } = userStore;

  // initiate user authorization, redirects user to ArcGIS to log in
  router.get("/authorize", function(req, res) {
    UserSession.authorize({
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI
    }, res);
  });

  // exchange code for the tokens, check if user exists, and store in session
  router.get("/redirect", async function(req, res) {
    const userSession = await UserSession.exchangeAuthorizationCode({
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI
    }, req.query.code);

    // validate that the user exists, could add additional validation
    const user = await getUserForAGSUser(userSession.username, userSession.portal);
    
    // if user exists, create authorized session
    if(user && user.username){
      // store the session
      req.session.user = userSession.username;
      req.session.agsSession = userSession.serialize();
      return res.redirect('/trust-ags-server.html');
    }

    // if user does not exist, return error
    return res.status(403).json({
      status: 403,
      message: 'ArcGIS user does not have access to service'
    });

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
      res.cookie("extend-arcgis-demo", { maxAge: TOKEN_EXPIRATION_MS });
      return res.json({"message": "success!"});
    });
  });

  return router;
}