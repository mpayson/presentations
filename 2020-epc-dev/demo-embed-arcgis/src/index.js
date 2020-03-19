import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Routes from './Routes';
import * as serviceWorker from './serviceWorker';
import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import {preloadAllModules} from './services/MapService';

// greedily fetch all the modules since this is map-centric app
preloadAllModules();

ReactDOM.render(
  <CalciteThemeProvider>
    <Routes />
  </CalciteThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
