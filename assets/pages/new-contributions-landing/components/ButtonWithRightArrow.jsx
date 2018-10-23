// @flow

// ----- Imports ----- //

import React from 'react';
import SvgArrowRight from 'components/svgs/arrowRightStraight';

type PropTypes = {
  componentClassName: string,
  buttonClassName: string,
  type: string,
  accessibilityHintId: string,
  buttonCopy: string,
  onClick: () => void,
};
// ----- Render ----- //

function ButtonWithRightArrow(props: PropTypes) {

  return (
    <div className={props.componentClassName}>
      <button
        className={props.buttonClassName}
        type={props.type}
        aria-describedby={props.accessibilityHintId}
        onClick={props.onClick}
      >
        {props.buttonCopy}
        <p id={props.accessibilityHintId} className="accessibility-hint">{props.buttonCopy}</p>
        <SvgArrowRight />
      </button>
    </div>
  );
}

// ----- Default Props ----- //

ButtonWithRightArrow.defaultProps = {
  onClick: () => undefined,
};

export { ButtonWithRightArrow };
