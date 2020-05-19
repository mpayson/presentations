// global configs for arcgis-rest-js
require("isomorphic-form-data");
const fetch = require("node-fetch");
const { setDefaultRequestOptions } = require("@esri/arcgis-rest-request");
setDefaultRequestOptions({ fetch });
// env variables
const isDev = process.env.NODE_ENV || 'dev'; // assume dev if NODE_ENV not set
if(isDev) require('dotenv').config(); // load dev variables, otherwise they'll be available

// express imports
const path = require("path");
const express = require ("express");
const helmet = require('helmet');
const cors = require('cors');
const session = require("express-session");
const SessionFileStore = require("session-file-store");
const app = express();
app.use(helmet());

// setup file storeage for user sessions
const FileStore = SessionFileStore(session);

// load and setup config variables from .env file

const { PORT, ENCRYPTION_KEY, SESSION_SECRET } = process.env;

// setup sessions, express will set a cookie on the client
// to keep track of a session id and rehydrate the
// correstponding session on the server.
app.use(
  session({
    name: 'extend-arcgis-demo',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 7200000 }, // 2 hours in milliseconds
    // store session data in a secure, encrypted file
    // sessions will be loaded from these files and decrypted
    // at the end of every request the state of `request.session`
    // will be saved back to disk.
    store: new FileStore({
      retries: 1,
      secret: ENCRYPTION_KEY
    })
  }),
  express.json()
)

// set up different authorization options
const memoryUserStore = require('./models/memory-userstore');
const trustAgsServerRouter = require('./routes/trust-ags-server');
const trustAgsClientRouter = require('./routes/trust-ags-client');
const connectRouter = require('./routes/connect-ags-unpw');
app.use('/trust-ags-server', trustAgsServerRouter(memoryUserStore));
app.use('/trust-ags-client', trustAgsClientRouter(memoryUserStore));
app.use('/connect', connectRouter(memoryUserStore));

// web-client is outside the server directory so it's easier to compare
app.use(cors(), express.static(path.join(__dirname, 'client')));

app.listen(PORT, _ => console.log(`Demo auth patterns server listening on http://localhost:${PORT}`));