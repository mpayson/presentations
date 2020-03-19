import styled from 'styled-components';
import Panel from 'calcite-react/Panel';

const H3ntm = styled.h3`
  margin-top: 0px;
`;

const Pntm = styled.p`
  margin-top: 0px;
`

const CenteredContainer = styled(Panel)`
  width: 40%;
  margin: 7rem auto;
  background: red;
  box-shadow: ${props => props.theme.boxShadow};
  background: ${props => props.theme.palette.white};
`

const MapDiv = styled.div`
  width: 100%;
  height: calc(100% - 3.95rem);
`

const MapMask = styled(MapDiv)`
  background: white;
  z-index: 1000;
`

const SidePaneContainer = styled(Panel)`
  position: absolute;
  left: 15px;
  top: 5rem;
  width: 15rem;
  height: calc(100vh - 9rem);
  box-shadow: ${props => props.theme.boxShadow};
  background: ${props => props.theme.palette.white};
`

export {
  H3ntm,
  Pntm,
  CenteredContainer,
  MapDiv,
  MapMask,
  SidePaneContainer
}