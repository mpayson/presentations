/****************************************************
   * AUTHORIZATION MIDDLEWARE
   * Checks that a user is authenticated to protect routes
****************************************************/
const jwt = require('jsonwebtoken');
const { getJWTForRequest } = require('../utils/utils');
const { SESSION_SECRET } = process.env; 

function _errResponse(res){
  return res.status(401).json({
    status: 401,
    name: 'Not authorized',
    message: "Not authorized, user isn't logged in or doesn't have access to protected resource"
  });
}

// middleware to check if request from user has valid JWT
// if valid, attaches user to request and continues
// if not valid, responds with an error
function isAuthorizedJWT(req, res, next){
  let user;
  let token = getJWTForRequest(req);
  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    user = decoded.sub;
  } catch (er){
    return _errResponse(res);
  }
  if(user) {
    req.user = user;
    return next();
  }
  _errResponse(res);
}

module.exports = {
  isAuthorizedJWT
}