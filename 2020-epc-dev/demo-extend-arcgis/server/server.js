// global configs for arcgis-rest-js
require("isomorphic-form-data");
const fetch = require("node-fetch");
const { setDefaultRequestOptions } = require("@esri/arcgis-rest-request");
setDefaultRequestOptions({ fetch });
// express imports
const path = require("path");
const express = require ("express");
const app = express();
app.use(express.json());

// load and setup config variables from .env file
require('dotenv').config();
const { PORT } = process.env;

// for now force ignoring warning functions because of terraformer
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
app.use(express.static(path.join(__dirname, '..', 'web-client', 'build')));

app.listen(PORT, _ => console.log(`Extend ArcGIS Demo server listening on http://localhost:${PORT}`));