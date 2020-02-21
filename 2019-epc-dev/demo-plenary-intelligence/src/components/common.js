const getMonthFromTime = (time) => {
  switch(time) {
    case 0:
      return "Sep 2018"
    case 1:
      return "Oct 2018"
    case 2:
      return "Nov 2018"
    case 3:
      return "Dec 2018"
    case 4:
      return "Jan 2019"
    default:
      return "Jan 2019"
  }
}

const sumStops = [
  {"value":25,"color":[214,193,215,255],"label":"\u003c 25"},
  {"value":20,"color":[215,181,216,255],"label":null},
  {"value":15,"color":[223,101,176,255],"label":"15"},
  {"value":10,"color":[221,28,119,200],"label":null},
  {"value":5,"color":[152,0,67,200],"label":"\u003e 5"}
]

const getTimeOpcStops = (v, gap) => {
  let steps = [];
  if(v - gap >= 0) {
    steps.push({
      opacity: 0.0,
      value: v - gap,
      // label: timeStrFromQuarter(v - gap)
    })
  }
  steps.push({
    opacity: 1,
    value: v,
    // label: timeStrFromQuarter(v)
  })
  if(v + gap <= 12){
    steps.push({
      opacity: 0.0,
      value: v + gap,
      // label: timeStrFromQuarter(v + gap)
    })
  }
  return {
    type: 'opacity',
    field: 'time',
    stops: steps,
    legendOptions: {showLegend: false}
  }
}

const getBlockCountRenderer = (time=12) => {
  const defaultRenderer = {
    type: "simple",
    symbol: {type: "simple-fill", outline: {width: 0.1, color: [255,255,255,0.2]}, size: 4, color: 'rgba(255,255,255,0)'},
    visualVariables: [{
      type: "color",
      field: "count_",
      stops: sumStops,
      legendOptions: {title: "Visit Counts"}
    }],
  }
  if(!time) return defaultRenderer;
  const opcVV = getTimeOpcStops(time, 1);
  defaultRenderer.visualVariables.push(opcVV);
  return defaultRenderer;
}

const getBlockDenseRenderer = (mapView, selected=null) => {
  return {
    type: "dot-density",
    referenceDotValue: 35,
    outline: null,
    referenceScale: mapView.scale,
    legendOptions: {
      unit: "visits"
    },
    attributes: [{
      valueExpression: '100 * IIf($feature.TLIFENAME == "Next Wave", $feature.count_, 0)',
      label: "Next Wave",
      color: (selected && selected !== "Next Wave") ? [227, 69, 143, 0.2] : [227, 69, 143, 1] //dark pink
    }, {
      valueExpression: '100 * IIf($feature.TLIFENAME == "Upscale Avenues", $feature.count_, 0)',
      label: "Upscale Avenues",
      color: (selected && selected !== "Upscale Avenues") ? [192, 76, 253, 0.2] : [192, 76, 253, 1] // dark purple
      // color: "#5E2BFF" // dark blue
    }, {
      valueExpression: '100 * IIf($feature.TLIFENAME == "Ethnic Enclaves", $feature.count_, 0)',
      label: "Ethnic Enclaves",
      color: (selected && selected !== "Ethnic Enclaves") ? [239, 131, 84, 0.2] : [239, 131, 84, 1]
    }, {
      valueExpression: '100 * IIf(IndexOf(["Upscale Avenues", "Ethnic Enclaves", "Next Wave"], $feature.TLIFENAME) < 0, $feature.count_, 0)',
      label: "Other",
      color: (selected && selected !== "Other") ? [94, 43, 255, 0.2] : [94, 43, 255, 1]
    }]
  }
}

const getTimeFilter = (time=12) => {
  return {
    where: `time = ${Math.round(time)}`
  }
}

const getBlockHlFilter = (highlight=null) => {
  const where = highlight
    ? `safegraph_place_id = 'sum' OR safegraph_place_id = '${highlight}'`
    : `safegraph_place_id = 'sum'`;
  return {
    where
  }
}

const getBlockTimeHlFilter = (highlight, time) => {
  const where = `${getTimeFilter(time).where} AND (${getBlockHlFilter(highlight).where})`
  return {
    where: where
  }
}

const getBlockHlEffect = (highlight=null) => {

  if(!highlight) return null;

  return {
    filter: {
      where: `safegraph_place_id = '${highlight}'`
    },
    insideEffect: "contrast(1.5)",
    outsideEffect: "grayscale(0.5) opacity(60%) contrast(30%)"
  }
}

const hideFilter = {
  where: `safegraph_place_id = 'note here'`
}

export{getMonthFromTime, getBlockCountRenderer, getBlockDenseRenderer,
getTimeFilter, getBlockHlFilter, getBlockHlEffect, getBlockTimeHlFilter, hideFilter}