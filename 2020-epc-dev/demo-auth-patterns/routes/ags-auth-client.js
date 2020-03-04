/****************************************************
   * ArcGIS TOKEN AUTH
   * Sample APIs to show a pattern for validating
   * access from an existing ArcGIS token
****************************************************/
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { request } = require("@esri/arcgis-rest-request");
const { UserSession } = require("@esri/arcgis-rest-auth");
const { isAuthorizedJWT } = require("../middleware/is-authorized");

// load and setup config variables from .env file
require('dotenv').config();
const { SESSION_SECRET } = process.env;

module.exports = function(userStore){

  // not currently used, but could be used to interact with user store
  // eg to validate that user should access the app before setting a session
  // or to get additional information from the store about the user
  const { getUserForAGSUser, joinAGSSession } = userStore;

  // exchanges an ArcGIS credential for a custom API JWT
  router.post("/authenticate", async function(req, res){
    // the body should be an object with:
    // expires, server, ssl, token, userId
    const { expires, server, ssl, token, userId } = req.body;
    const session = UserSession.fromCredential({
      expires, server, ssl, token, userId
    });

    // check that the token is valid and
    // user is who they say they are
    const selfUrl = `${session.portal}/community/self`;
    let selfResults;
    try {
      selfResults = await request(selfUrl, {
        httpMethod: "GET",
        authentication: session,
        rawResponse: false
      });
      if(selfResults.username !== userId) {
        throw new Error("UserID doesn't correspond to token")
      }
    } catch(er){
      return res.status(401).json({
        status: 401,
        message: 'Invalid ArcGIS credentials'
      });
    }

    // could add additional validation here or
    // fetch user info from store to encode in the token

    // create and return the JWT
    const jwtToken = jwt.sign({
      exp: Math.floor(session.tokenExpires / 1000), // sync expirations
      sub: userId
    }, SESSION_SECRET);

    return res.json({
      token: jwtToken,
      user: userId,
      expires: session.tokenExpires
    })

  })

  // return user information, for now just the username
  router.get("/self", isAuthorizedJWT, function(req, res){
    res.json({
      user: req.user // middleware adds user to request
    })
  })

  return router;
}