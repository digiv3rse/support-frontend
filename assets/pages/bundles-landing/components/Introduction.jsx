// @flow

// ----- Imports ----- //

import React from 'react';

type PropTypes = {
  showContributeOrSubscribe: boolean
}

// ----- Component ----- //

export default function Introduction(props: PropTypes) {
  return (
    <section className="introduction-text">
      <div className="introduction-text__content gu-content-margin">
        <h1 className="introduction-text__heading">help us deliver the</h1>
        <p>independent journalism the world&nbsp;needs</p>
        <h1 className="introduction-text__heading">support the Guardian</h1>
        {props.showContributeOrSubscribe
          ? <p>contribute or subscribe</p>
          : null
        }
      </div>
    </section>
  );

}
