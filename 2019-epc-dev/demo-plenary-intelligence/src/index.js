import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import { defaults } from 'react-chartjs-2';
import { loadCss } from 'esri-loader';
import './index.css';

loadCss("https://jsdev.arcgis.com/4.12/esri/themes/dark/main.css");


defaults.global.defaultFontColor = '#ffffff';
defaults.global.legend = false;
defaults.global.tooltips.enabled = false;
defaults.global.events = ['click', 'touchstart', 'touchend'];
// defaults.global.legend.fontColor = '#ffffff';

ReactDOM.render(
  <CalciteThemeProvider>
    <App/>
  </CalciteThemeProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
