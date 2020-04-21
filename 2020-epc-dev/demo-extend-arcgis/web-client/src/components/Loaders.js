import React from 'react';
import styled, {keyframes} from 'styled-components';
import CalciteLoader from 'calcite-react/Loader';

// Loader class is defined in `index.css` 
// since it is also used in the root HTML
const Loader = _ => (
  <div className="loader"><CalciteLoader/></div>
)

const Slider = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  overflow-x: hidden;
  z-index: 1000;
`;

const Line = styled.div`
  position: absolute;
  opacity: 0.4;
  background: #bcdaed;
  width: 150%;
  height: 5px;
`;

const Increase = keyframes`
  from {
    left: -5%;
    width: 5%;
  }
  to {
    left: 130%;
    width: 100%;
  }
`

const Decrease = keyframes`
  from {
    left: -80%;
    width: 80%;
  }
  to { 
    left: 110%; 
    width: 10%;
  }
`

const SubLine = styled.div`
  position: absolute;
  background: #56a5d8;
  height: 5px;
`;

const IncreaseLine = styled(SubLine)`
  animation: ${Increase} 4s infinite;
`
const DecreaseLine = styled(SubLine)`
  animation: ${Decrease} 4s 1s infinite;
`

const LoaderBar = () => (
  <Slider>
    <Line/>
    <IncreaseLine/>
    <DecreaseLine/>
  </Slider>
)



export {
  Loader,
  LoaderBar
};