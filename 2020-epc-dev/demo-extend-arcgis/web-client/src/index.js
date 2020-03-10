import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import { AppTheme } from './config/ui';
import {preloadAllModules} from './services/MapService';
import { getExistingSession } from './services/AuthService';

// greedily fetch all the modules since this is map-centric app
preloadAllModules();

// check if there's an existing session
const session = getExistingSession();

ReactDOM.render(
  <CalciteThemeProvider theme={AppTheme}>
    <App previousSession={session}/>
  </CalciteThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
