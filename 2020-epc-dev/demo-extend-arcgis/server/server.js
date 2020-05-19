// global configs for arcgis-rest-js
require("isomorphic-form-data");
const fetch = require("node-fetch");
const { setDefaultRequestOptions } = require("@esri/arcgis-rest-request");
setDefaultRequestOptions({ fetch });
// express imports
const path = require("path");
const express = require ("express");
// const helmet = require('helmet');
const app = express();
app.use(express.json());
// app.use(helmet());

// load and setup config variables from .env file
require('dotenv').config();
const { PORT, NODE_ENV } = process.env;

// for now force ignoring warning functions because of terraformer
// this is probably dangerous for other reasons, but it's a demo!
console.warn = function(){};

// set up authorization routes
const agsTokenRoutes = require ('./routes/auth');
const validateAccess = agsSession => true; // give every arcgis user access
app.use('/auth', agsTokenRoutes({validateAccess}));

// set up enrichment routes
const dataStore = require('./models/data');
const enrichRoutes = require('./routes/enrich');
app.use('/enrich', enrichRoutes(dataStore));

// load the datastore and pre-emptively fetch data
const { hydrateCache } = dataStore;
hydrateCache();

// web-client is outside the server directory so it's easier to compare with GP tool client
// run `npm run predeploy` to build and copy the web client so it can be served in prod
if(NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, 'client')));
}

app.listen(PORT, _ => console.log(`Extend ArcGIS Demo server listening on http://localhost:${PORT}`));