// @flow

// ----- Imports ----- //

import React from 'react';

import SvgLock from 'components/svgs/lock';

import { classNameWithModifiers } from 'helpers/utilities';


// ----- Props ----- //

type PropTypes = {
  modifierClasses: Array<?string>,
};


// ----- Component ----- //

export default function Secure(props: PropTypes) {


  return (
    <div className={classNameWithModifiers('component-secure', props.modifierClasses)}>
      <SvgLock />
      <span className="component-secure__text">Secure</span>
    </div>
  );

}


// ----- Default Props ----- //

/* eslint-disable react/default-props-match-prop-types */
Secure.defaultProps = {
  modifierClasses: [],
};
/* eslint-enable react/default-props-match-prop-types */
