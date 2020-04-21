export function destroyMapView(view){
  if(!view) return;
  view = view.container = null;
}

export function arrayToObjectByKey(array, key){
  return array.reduce((acc, c) => {
    acc[c[key]] = c;
    return acc;
  }, {});
}