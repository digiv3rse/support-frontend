// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';
import { appropriateErrorMessage, type ErrorReason } from 'helpers/errorReasons';
import { classNameWithModifiers } from 'helpers/utilities';
import SvgExclamationAlternate from '../svgs/exclamationAlternate';
import { type Option } from 'helpers/types/option';

import './generalErrorMessage.scss';


// ---- Types ----- //

type PropTypes = {|
  errorReason: Option<ErrorReason> | string,
  errorHeading: string,
  svg: Node,
  classModifiers: Array<?string>
|};


// ----- Component ----- //

export default function GeneralErrorMessage(props: PropTypes) {

  if (props.errorReason) {

    return (
      <div role="status" aria-live="assertive" className={classNameWithModifiers('component-general-error-message', props.classModifiers)}>
        {props.svg}<span className="component-general-error-message__error-heading">{props.errorHeading}</span>
        <span className="component-general-error-message__small-print">{appropriateErrorMessage(props.errorReason)}</span>
      </div>
    );

  }

  return null;

}


// ----- Default Props ----- //

GeneralErrorMessage.defaultProps = {
  errorHeading: 'Payment Attempt Failed',
  svg: <SvgExclamationAlternate />,
  classModifiers: [],
};
