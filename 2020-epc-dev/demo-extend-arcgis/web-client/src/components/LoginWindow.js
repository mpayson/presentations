import React from 'react';
import styled from 'styled-components';
import Panel from 'calcite-react/Panel';
import Button from 'calcite-react/Button';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 3.5rem;
  left: 0;
  background: ${props => props.theme.palette.offWhite};
`;

const CenterPanel = styled(Panel)`
  width: 350px;
  height: 350px;

  position: absolute;
  top: 10vh;
  left: calc(50% - 190px);

  padding: 0px 15px 15px 15px;
  box-shadow: ${props => props.theme.boxShadow};
  background: ${props => props.theme.palette.white};
`

const AboutText = () => (
  <h1 style={{textAlign: "center"}}>Hello! Please sign in</h1>
)

const LoginWindow = ({onClick}) => (
  <Container>
    <CenterPanel>
      <AboutText/>
      <div style={{textAlign: "center", marginTop: "2rem"}}>
        <Button half clear large onClick={onClick}>
          Log In
        </Button>
      </div>
    </CenterPanel>
  </Container>
)



export default LoginWindow;