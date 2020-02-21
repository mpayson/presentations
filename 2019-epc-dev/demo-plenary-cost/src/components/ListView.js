import React, {Component} from 'react';
import styled, { css } from 'styled-components';
import OrganizationIcon from 'calcite-ui-icons-react/OrganizationIcon';
import Button from 'calcite-react/Button';

import List, {
  ListHeader,
  ListItem,
  ListItemTitle,
  ListItemSubtitle
} from 'calcite-react/List';

const fieldMap = {
  title: "location_name",
  sub: "city",
  key: "OBJECTID"
}

// #239x3
const ListItemDark = styled(ListItem)`
  color: #ffffff;
  background-color: transparent;
  border-top: 1px solid rgba(104,104,104);
`;
const ListItemSubtitleDark = styled(ListItemSubtitle)`
  color: #9e9e9e;
`;

const ListItemHolder = styled(ListItem)`
  color: rgba(104,104,104);
  background-color: transparent;
  border-top: 1px solid rgba(104,104,104);
  &:hover {
    color: rgba(104,104,104);
    background-color: transparent;
    border-top: 1px solid rgba(104,104,104);
  }
`;
const ListDark = styled(List)`
  background-color: rgba(36,36,36,0.9);
  border: None;
`
const ListHeaderDark = styled(ListHeader)`
  background-color: transparent;
  color: #ffffff;
  font-weight: bold;
  &:hover {
    background-color: transparent;
    color: #ffffff;
    font-weight: bold;
  }
`;

const DarkButton = styled(Button)`
  border: None;
`;

class ListView extends Component{

  constructor(props){
    super(props)

  }

  render(){
    let features = this.props.data;
    console.log(features);

    let iC;
    if(!features || !features.length){
      iC = [1,2,3,4,5,6,7,8].map(i => 
        <ListItemHolder key={i} leftNode={<OrganizationIcon/>}>
          <div style={{width: "5rem", height: "1.2rem", marginBottom: "0.25rem", background: "rgba(104,104,104,0.4)"}}></div>
          <div style={{width: "8rem", height: "0.9rem", background: "rgba(104,104,104, 0.4)"}}></div>
        </ListItemHolder>
      )
    } else {
      iC = features.map((f, idx) => 
        <ListItemDark
          onMouseOver={_ => this.props.onHover(f.attributes[fieldMap.key])}
          onMouseLeave={this.props.onUnhover}
          onClick={_ => this.props.onClick(f.attributes[fieldMap.key])}
          key={f.attributes[fieldMap.key]}
          leftNode={<OrganizationIcon/>}>
          <ListItemTitle>{f.attributes[fieldMap.title]}</ListItemTitle>
          <ListItemSubtitleDark>{f.attributes[fieldMap.sub]}</ListItemSubtitleDark>
        </ListItemDark>
      )
    }

    return (
      <ListDark style={{height: "100%"}}>
        <ListHeaderDark>
          <DarkButton
            small
            clearWhite
            onClick={this.props.onLoadStores}>Explore Nearby</DarkButton>
        </ListHeaderDark>
        <div style={{height: "100%", overflowY: 'scroll'}}>
          {iC}
        </div>
      </ListDark>
    )

  }

}
export default ListView