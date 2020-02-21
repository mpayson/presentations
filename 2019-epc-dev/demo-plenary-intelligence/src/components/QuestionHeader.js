import React from 'react';
import Button from 'calcite-react/Button';
import './question.css'
import styled, { css } from 'styled-components';

const ExtendedButton = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  margin: 0.5rem;
  font-size: 1.69949rem;
  line-height: 2.325rem;
`;



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