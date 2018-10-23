// @flow

// ----- Imports ----- //

import React from 'react';
import AnimatedDots from 'components/spinners/animatedDots';

// ---- Types ----- //

type PropTypes = {|
  message: string[],
|};


// ----- Component ----- //


export default function ProgressMessage(props: PropTypes) {
  return (
    <div className="component-progress-message">
      <div className="component-progress-message__dialog">
        {props.message.map(message =>
          <div className="component-progress-message__message">{message}</div>)}
        <AnimatedDots />
      </div>
      <div className="component-progress-message__background" />
    </div>
  );
}
