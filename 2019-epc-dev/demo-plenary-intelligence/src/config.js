

const loaderOptions = {
  url: "https://js.arcgis.com/4.11/",
  css: "https://js.arcgis.com/4.11/esri/themes/dark/main.css"
}

const poiRenderer = {
  type: "simple",
  symbol: {
    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
    style: "diamond",
    // color: [0, 171, 189],
    // color: "#8AC927",
    // color: "#B0DB43",
    color: "40F99B",
    // color: "#8AC926" ,
    // color: [106,255,0],
    // color: [0, 162, 180],
    size: "17px",  // pixels
    outline: {  // autocasts as new SimpleLineSymbol()
      // color: [ 0, 0, 0 ],
      // color: [0,128,79],
      color: "#004D30",
      width: 1.5 // points
    }
  },
  visualVariables: [{
    type: "size",
    field: "raw_visit_counts",
    legendOptions: {title: "Visit Counts"},
    minSize: 4,
    maxSize: 30,
    minDataValue: 2000,
    maxDataValue: 8000
  }]

}

const highlightOptions = {
  color: "#ffffff",
  fillOpacity: 0.17
}



export {loaderOptions, poiRenderer, highlightOptions}