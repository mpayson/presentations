/****************************************************
   * ArcGIS Client Auth
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
const { SESSION_SECRET } = process.env;

module.exports = function(userStore){

  const { getUserForAGSUser } = userStore;

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

    // validate that the user exists, could add additional validation
    const user = await getUserForAGSUser(userId, server);

    // if the user exists, return access token
    if(user && user.username){
      // create and return the JWT
      const jwtToken = jwt.sign({
        exp: Math.floor(session.tokenExpires / 1000), // sync expirations
        sub: user.username
      }, SESSION_SECRET);

      return res.json({
        token: jwtToken,
        user: user.username,
        expires: session.tokenExpires
      })
    }

    // if user does not exist, return error
    return res.status(403).json({
      status: 403,
      message: 'ArcGIS user does not have access to service'
    });

  })

  // return user information, for now just the username
  router.get("/self", isAuthorizedJWT, function(req, res){
    res.json({
      user: req.user // middleware adds user to request
    })
  })

  return router;
}