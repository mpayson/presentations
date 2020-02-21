import React from 'react';
import { CalciteH4, CalciteH3 } from 'calcite-react/Elements';
import {getMonthFromTime} from '../common';
import styled, { css } from 'styled-components';
import Button from 'calcite-react/Button';
import Slider from '../Slider';
import PinIcon from 'calcite-ui-icons-react/PinIcon';


const InfText = styled(CalciteH4)`
  color: white;
  float: left;
  width: calc(50% - 1rem);
  margin: 0;
  padding: 0.5rem;
`
const H = styled(CalciteH3)`
  color: white;
  margin: 0;
  padding: 0.25rem 0rem 0rem 0.5rem;
`
const ExpBtn = styled(Button)`
  border: None;
  width: 7rem;
  margin-left: calc(50% - 7rem);
  padding-right: 0;
`

const LiveAreas = ({active, onClick, value, onSlide, text}) => (
  

  <div style={{textAlign: "center"}}>
    <div style={{textAlign: "left", width: "100%"}}>
      <H style={{fontWeight: 'bold'}}>{text ? text : 'All'}</H>
      <InfText>{`${getMonthFromTime(Math.round(value/4))}`}</InfText>
      <ExpBtn
        clearWhite
        large
        icon={<PinIcon filled={active}/>}
        onClick={onClick}>
        Explore
      </ExpBtn>
    </div>
    <Slider
      value={value}
      active
      minMax={[1,16]}
      defaultTitle={'All day'}
      leftLabel={"Sep 2018"}
      rightLabel={"Jan 2019"}
      onSlide={onSlide}
    />
  </div>
)
export default LiveAreas;