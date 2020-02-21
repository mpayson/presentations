import React from 'react';

const style = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  textAlign: 'center',
  zIndex: 5000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function Loader () {

  return (
    <div style={style}>
      Loading...
    </div>
  )
};

export default Loader