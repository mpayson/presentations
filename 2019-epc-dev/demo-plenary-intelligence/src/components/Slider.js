import React from 'react';
import Slider from 'calcite-react/Slider';

function MySlider({value, active, disabled, title, defaultTitle, minMax,
  leftLabel, rightLabel, onClick, onSlide}) {
    
  const slider = active ? (
    <div>
    <div style={{float: 'left', width: '75px', marginTop: '5px'}}>{leftLabel}</div>
      <Slider
        style={{display: 'inline-block', width: 'calc(100% - 160px)'}}
        min={minMax[0]}
        max={minMax[1]}
        value={value}
        onChange={onSlide}
      />
    <div style={{float: 'right', width: '75px', marginTop:'5px'}}>{rightLabel}</div>
    </div>
  )
  : null;
  return slider;
}

// 106 255 0 --  darker version (pull V down)

export default MySlider