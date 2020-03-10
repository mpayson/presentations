// https://calcite-react.netlify.com/customizing
// for custom themeing if using Calcite as the UI library

import {
  CalciteTheme
} from 'calcite-react/CalciteThemeProvider';

const AppTheme = {
  ...CalciteTheme,
  palette: {
    ...CalciteTheme.palette,
    blue: '#1E5D8C'
  }
};

const MapTheme = {
  mapOptions: {basemap: 'gray-vector'},
  viewOptions: {center: [-118.23722, 34.04568], zoom: 8}
}

function getSymbolType(geometryType){
  switch(geometryType){
    case "polyline":
      return 'simple-line';
    case "polygon":
      return 'simple-fill';
    default:
      return 'simple-marker';
  }
}

function getRenderer(geometryType){
  const type = getSymbolType(geometryType);
  return {
    type: 'unique-value',
    field: 'Severity',
    default: {type},
    uniqueValueInfos: [{
      value: 'Severe',
      symbol: {
        type,
        color: '#d9351a'
      }
    }, {
      value: 'Moderate',
      symbol: {
        type,
        color: '#ffc730'
      }
    }, {
      value: 'Minor',
      symbol: {
        type,
        color: '#144d59'
      }
    }, {
      value: 'Unknown',
      symbol: {
        type,
        color: '#aaaaaa'
      }
    }]
  }
}

const ResultConfig = {
  title: 'Results',
  pointRenderer: getRenderer('point'),
  lineRenderer: getRenderer('polyline'),
  polygonRenderer: getRenderer('polygon'),
  popupTemplate: {
    title: "{Event}",
    content: "{Severity} event with {Certainty} certainty"
  }
}

export { AppTheme, MapTheme, ResultConfig };

