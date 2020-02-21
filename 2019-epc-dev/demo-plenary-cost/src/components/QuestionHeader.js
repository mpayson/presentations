import React from 'react';
import Button from 'calcite-react/Button';
import styled, { css } from 'styled-components';

const ExtendedButton = styled(Button)`
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 50%;
  margin: 0.5rem;
  font-size: 1rem;
  line-height: 1.55rem;
`;

import '../css/question.css'

function QuestionHeader({title, index, onClick, active}){
  
  const className = active ? 'question-panel-active' : 'question-panel';
  return(
    <div key={title} style={{color: 'white'}} className={className}>
      <ExtendedButton
        white={active}
        clearWhite={!active}
        extraSmall
        onClick={onClick}>
        {index + 1}
      </ExtendedButton>
      {title}
    </div>
  )

}
export default QuestionHeader;