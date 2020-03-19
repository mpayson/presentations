/****************************************************
   * CUSTOM USERNAME & PASSWORD AUTH
   * Sample APIs to show a custom authentication implementation
   * and how to connect that implementation to ArcGIS
****************************************************/
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthorizedJWT } = require("../middleware/is-authorized");
const { UserSession } = require("@esri/arcgis-rest-auth");
const { authorizeWithState, getJWTForRequest } = require("../utils/utils")

// load and setup config variables from .env file
const { CLIENT_ID, CONNECT_REDIRECT_URI, SESSION_SECRET } = process.env;
const TOKEN_EXPIRATION_MINUTES = 60;

// Expects a userstore method to validate credentials
// and join ArcGIS session data
module.exports = function (userStore){

  const { validateCredentials, getAGSSessionForUser, joinAGSSession } = userStore;

  // authenticate a user with simple username and password, return JWT
  router.post("/authenticate", async function (req, res) {
    const {username, password} = req.body;
    const valid = await validateCredentials(username, password);
    if(!valid) {
      return res.status(401).json({
        status: 401,
        name: 'Invalid credentials',
        message: 'Invalid credentials, either the username or password is incorrect'
      });
    }
  
    const expires = Date.now() + (TOKEN_EXPIRATION_MINUTES * 60 * 1000);
    const token = jwt.sign({
      exp: Math.floor(expires / 1000),
      sub: username
    }, SESSION_SECRET);

    return res.status(200).json({
      token,
      expires,
      user: username,
    });

  });

  // protected oauth to allow a signed-in user to link their ArcGIS account
  // pass the user's token as state so the resulting session can be registered
  router.get("/ags-authorize", isAuthorizedJWT, function(req, res){
    let token = getJWTForRequest(req); // since authorized it has a token
    authorizeWithState({
      clientId: CLIENT_ID,
      redirectUri: CONNECT_REDIRECT_URI,
      state: token
    }, res);
  });

  // handle oauth redirect and join the resulting session to the 
  // users account based on the jwt
  router.get("/ags-redirect", async function(req, res){
    let username;
    try {
      const token = req.query.state;
      const decoded = jwt.verify(token, SESSION_SECRET);
      username = decoded.sub;
    } catch(er) {
      return res.status(403).json({
        status: 403,
        name: 'Invalid user',
        message: 'Invalid user, supplied user token is not valid'
      })
    }
    const userSession = await UserSession.exchangeAuthorizationCode({
      clientId: CLIENT_ID,
      redirectUri: CONNECT_REDIRECT_URI
    }, req.query.code);
    joinAGSSession(username, userSession);
    return res.redirect('/connect-ags-unpw.html');
  })

  // forward ArcGIS session information to the browser & refresh if needed
  // eg to register the credential with the JS API
  router.get("/ags-credential", isAuthorizedJWT, async function(req, res){
    const username = req.user;
    let userSession = await getAGSSessionForUser(username);
    if(!userSession){
      return res.json({
        credential: null
      });
    }
    return res.json({credential: userSession.toCredential()});
  });

  router.post("/ags-disconnect", isAuthorizedJWT, async function(req, res){
    const username = req.user;
    joinAGSSession(username, null);
    return res.json({
      message: 'success!'
    })
  })

  return router;

}