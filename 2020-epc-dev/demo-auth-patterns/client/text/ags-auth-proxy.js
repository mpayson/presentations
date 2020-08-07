const CREATE_TASK = {
  title: 'Create route task with proxy URL',
  codeText: `
const routeTask = new RouteTask({
  url: "https://utility.arcgis.com/usrsvcs/appservices/vIJFA5sW8T6sRDt4/rest/services/World/Route/NAServer/Route_World/solve"
});
  `
}

const GENERATE_ROUTE = {
  title: 'Generate a route',
  codeText: `
const routeParams = new RouteParameters({
  stops: new FeatureSet({
    features: [startGraphic, stopGraphic]
  })
});

data = await routeTask.solve(routeParams);
const routeResult = data.routeResults[0].route;
routeResult.symbol = {
  type: "simple-line",
  color: [0, 0, 255, 0.5],
  width: 5
};
view.graphics.add(routeResult);
  `
}