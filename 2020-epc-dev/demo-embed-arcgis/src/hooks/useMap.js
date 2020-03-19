// copied with love from: https://github.com/tomwayson/esri-loader-hooks/blob/master/src/hooks/view.ts
// but with imported / hardcoded map options for this specific app
import { useRef, useEffect, useState } from 'react';
import {
  loadMap, addLegendWidget
} from '../services/MapService';
import {
  mapOptions,
  viewOptions
} from '../config/constants';



function destroyView(view){
  if(!view) return;
  view = view.container = null;
}

function useMap(){

  const elRef = useRef(null);
  const [ view, setView ] = useState(null);

  useEffect(_ => {
    let _view;
    let cancelled = false;
    async function load(){
      _view = await loadMap(mapOptions, viewOptions);
      if(cancelled) return;
      addLegendWidget(_view, 'top-right', null, true);
      _view.ui.move('zoom', 'top-right');
      _view.container = elRef.current;
      setView(_view);
    }
    load();
    return function cleanUp(){
      cancelled = true;
      destroyView(_view);
    }
  }, []);

  return [elRef, view];
}

export default useMap;