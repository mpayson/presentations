import "./config";

import React from 'react';
import ReactDOM from "react-dom";
import App from './components/App';
import { defaults } from 'react-chartjs-2';

defaults.global.animation = false;
defaults.global.defaultFontColor = '#ffffff';
defaults.global.legend = false;
defaults.global.tooltips.enabled = false;
// defaults.global.events = ['click', 'touchstart', 'touchend']
// defaults.global.legend.fontColor = '#ffffff';

import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';

ReactDOM.render(
  <CalciteThemeProvider>
    <App/>
  </CalciteThemeProvider>,
  document.getElementById("root")
);
