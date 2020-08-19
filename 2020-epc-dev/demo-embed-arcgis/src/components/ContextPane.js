import React from 'react';
import styled from 'styled-components';
import {
  useLocation, useHistory
} from "react-router-dom";
import Button, { ButtonGroup } from 'calcite-react/Button';
import Card, {
  CardTitle,
  CardContent
} from 'calcite-react/Card';
import {Pntm} from '../components/Common';

var UserName = "";
var Password = "";
var UserNameAdv = "";
var PasswordAdv = "";

const H = styled.h2`
  font-weight: lighter;
  color: #ccc;
`

const ContextCard = styled(Card)`
  background: #004575;
  margin-bottom: 1rem;
`;

const ContextTitle = styled(CardTitle)`
  color: ${props => props.active ? 'white' : 'rgba(169,169,169,0.3)'};
`
const ContextP = styled(Pntm)`
  color: ${props => props.active ?  'white' : 'rgba(169,169,169,0.3)'};
  font-weight: ${props => props.active ?  'bold' : 'lighter'};
`
function DispatchLogin(){
  UserName = "User Name: embed_dispatch";
  Password = "Password: Esri1234!";
  UserNameAdv = "";
  PasswordAdv = ""
}

function WorkerLogin(){
  UserName = "User Name: embed_worker";
  Password = "Password: Esri1234!";
  UserNameAdv = "";
  PasswordAdv = ""
}

function WorkerLoginAdv(){
  UserNameAdv = "User Name: embed_worker";
  PasswordAdv = "Password: Esri1234!";
  UserName = "";
  Password = ""
}
function ClearLogin(){
  UserName = "";
  Password = "";
  UserNameAdv = "";
  PasswordAdv = ""
}

function ContextPane(){

  let location = useLocation();
  let history = useHistory();

  let path = location.pathname;
  let paths = path.split('/');
  const stage = paths.length > 1 ? paths[1] : null;

  let lbsActive = !!stage;
  let infrActive = stage === 'user' || stage === 'realtime';
  let advActive = stage === 'realtime';

  return (
    <>
      <H>Embedded components</H>
      <ContextCard bar={lbsActive ? 'white' : null}>
        <CardContent>
        <ContextTitle active={lbsActive}>Location services</ContextTitle>
          <ContextP active={lbsActive}>
            Basemaps<br/>
            Routing service<br/>
            ArcGIS API for JavaScript<br/>
          </ContextP>
          <Button clearWhite onClick={_ => {ClearLogin(); history.push('/lbs')}}>LBS app</Button>
        </CardContent>
      </ContextCard>
      <ContextCard bar={infrActive ? 'white' : null}>
        <CardContent>
        <ContextTitle active={infrActive}>Identity</ContextTitle>
          <ContextP active={infrActive}>
            Hosted feature services & views<br/>
            User Types<br/>
            {UserName}<br/>
            {Password}
          </ContextP>
          <ButtonGroup>
            <Button clearWhite={path !== '/user/request'} white={path === '/user/request'} fullWidth onClick={_ => {ClearLogin(); history.push('/user/request')}}>Form</Button>
            <Button clearWhite={path !== '/user/dispatch'} white={path === '/user/dispatch'} fullWidth onClick={_ => {DispatchLogin(); history.push('/user/dispatch')}}>Dispatch</Button>
            <Button clearWhite={path !== '/user/worker'} white={path === '/user/worker'} fullWidth onClick={_ => {WorkerLogin(); history.push('/user/worker')}}>Worker</Button>
          </ButtonGroup>
        </CardContent>
      </ContextCard>
      <ContextCard bar={advActive ? 'white' : null}>
        <CardContent>
        <ContextTitle active={advActive}>Advanced capabilities</ContextTitle>
          <ContextP active={advActive}>
            GeoEvent processors<br/>
            {UserNameAdv}<br/>
            {PasswordAdv}
          </ContextP>
          <ButtonGroup>
            <Button clearWhite={path !== '/realtime/request'} white={path === '/realtime/request'} fullWidth onClick={_ => {ClearLogin(); history.push('/realtime/request')}}>Form</Button>
            <Button clearWhite={path !== '/realtime/worker'} white={path === '/realtime/worker'} fullWidth onClick={_ => {WorkerLoginAdv(); history.push('/realtime/worker')}}>Worker</Button>
          </ButtonGroup>
        </CardContent>
      </ContextCard>
    </>
    
  )
}

export default ContextPane;