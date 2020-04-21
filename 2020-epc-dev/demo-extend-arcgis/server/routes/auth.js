/****************************************************
   * ArcGIS TOKEN AUTH
   * Sample APIs to show a pattern for validating
   * access from an existing ArcGIS token
   * NOTE there are more secure auth approaches,
   * please evaluate this in the context of security posture
****************************************************/
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { request, cleanUrl } = require("@esri/arcgis-rest-request");
const { UserSession } = require("@esri/arcgis-rest-auth");
const { isAuthorizedJWT } = require("../middleware/is-authorized");

// load and setup config variables from .env file
require('dotenv').config();
const { SESSION_SECRET } = process.env;

module.exports = function({validateAccess}){

  // exchanges an ArcGIS credential for a custom API JWT
  router.post("/authorize", async function(req, res){
    // the body should be an object with:
    // expires, server, ssl, token, userId
    const { expires, ssl, token, userId } = req.body;
    const server = cleanUrl(req.body.server);
    
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

    // validate that the user should have access
    if(!validateAccess(session)){
      return res.status(403).json({
        status: 403,
        message: 'ArcGIS User does not have access'
      });
    }

    // create and return the JWT
    const jwtToken = jwt.sign({
      exp: Math.floor(session.tokenExpires / 1000), // sync expirations
      sub: userId
    }, SESSION_SECRET);

    return res.json({
      token: jwtToken,
      user: userId
    })

  })

  // return user information, for now just the username
  router.get("/self", isAuthorizedJWT, function(req, res){
    res.json({
      username: req.user // middleware adds user to request
    })
  })

  return router;
}