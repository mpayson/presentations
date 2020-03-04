/****************************************************
   * MEMORY USER STORE MODEL
   * This shows a few basic patterns for working with a custom "user store"
   * Note this is a POC, it's not secure and not ready for production
   * (passwords should be encrypted, users shouldn't be stored in memory, etc)
****************************************************/
const { UserSession } = require("@esri/arcgis-rest-auth");

// An in-memory user store, please don't follow this approach in production
let userStore = [{
  // username: "mpayson@esri.com",
  // password: "notsecure",
  username: "mpayson@esri.com",
  password: "a"
}]

// Validates a username and password from the user store
async function validateCredentials(username, password){
  const user = userStore.find(user => 
    user.username === username
  );
  if(!user || user.password !== password){
    return false;
  }
  return true;
}

// Gets the user associated with an ArcGIS username and portal URL (will be unique)
// Use this to ensure that the ArcGIS user who logged in is a registered user
async function getUserForAGSUser(arcgisUsername, arcgisPortalURL){
  const user = userStore.find(user => 
    user.arcgis
    && user.arcgis.username === arcgisUsername
    && user.arcgis.portal === arcgisPortalURL
  );
  if(!user) return undefined;

  // deep copy and cautiously don't send password around
  const resultUser = {
    ...user,
    arcgis: {...user.arcgis}
  };
  delete resultUser.password;

  return resultUser;
}

// Get session information from user
// expects username returns arcgis-rest-js user session
function getAGSSessionForUser(username){
  const user = userStore.find(user => 
    user.username === username
  );
  if(!user || !user.arcgis) return null;
  return new UserSession(user.arcgis);
}

// Joins an arcgis session to the user store
// Expects a username and arcgis-rest-js user session
function joinAGSSession(username, arcgisSession){
  const userIndex = userStore.findIndex(user => 
    user.username === username
  );
  if(userIndex < 0) throw new Error("User not found when joining ArcGIS session");
  const user = userStore[userIndex];
  if(arcgisSession) user.arcgis = arcgisSession.toJSON();
  else delete user.arcgis;
}

module.exports = {
  validateCredentials,
  getUserForAGSUser,
  getAGSSessionForUser,
  joinAGSSession
}

