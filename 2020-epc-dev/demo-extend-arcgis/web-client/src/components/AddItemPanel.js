import React, {useState, useEffect} from 'react';
import Search from 'calcite-react/Search';
import { searchPortal } from '../services/MapService';
import FeatureLayerIcon from 'calcite-ui-icons-react/FeatureLayerIcon';
import MapIcon from 'calcite-ui-icons-react/LayerMapIcon';
import UnknownLayer from 'calcite-ui-icons-react/LayerBrokenIcon';
import List, {
  ListItem,
  ListItemTitle,
  ListItemSubtitle
} from 'calcite-react/List';


function AGSListItem({item, onItemSelected}){

  function onClick(){
    onItemSelected(item);
  }

  let icon;
  switch (item.type){
    case "Web Map":
      icon = <MapIcon></MapIcon>;
      break;
    case "Feature Service":
      icon = <FeatureLayerIcon></FeatureLayerIcon>;
      break;
    default:
      icon = <UnknownLayer></UnknownLayer>;
      break;
  }
  return (
    <ListItem key={item.id} leftNode={icon} onClick={onClick}>
      <ListItemTitle>{item.title}</ListItemTitle>
      <ListItemSubtitle>{`Modified: ${(new Date(item.modified)).toLocaleDateString()}`}</ListItemSubtitle>
    </ListItem>
  )

}

function AddItemPanel({loaded, onItemSelected}){
  const [queryString, setQueryString] = useState('');
  const [items, setItems] = useState([]);

  useEffect(_ => {
    if(!loaded) return;
    const timeoutRef = setTimeout(async _ => {
      const items = await searchPortal(queryString);
      setItems(items);
    }, 500);
    return () => clearTimeout(timeoutRef);
  }, [queryString, loaded]);

  const itemViews = items.map(i =>
    <AGSListItem item={i} key={i.id} onItemSelected={onItemSelected}/>
  );

  // const itemViews = items.map(AGSListItem);
  return (
    <>
      <h3 className="no-bottom-margin">Add to map</h3>
      <Search
        minimal
        fullWidth
        onRequestClear={_ => setQueryString('')}
        onUserAction={value => setQueryString(value)}
        inputValue={queryString}/>
      <List style={{overflowY: 'scroll', height: 'calc(100vh - 29rem)'}}>
        {itemViews}
      </List>
    </>
  )
}

export default AddItemPanel;