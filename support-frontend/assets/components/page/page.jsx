// @flow

// ----- Imports ----- //
// $FlowIgnore - required for hooks
import React, { type Node, useEffect } from 'react';

import { classNameWithModifiers } from 'helpers/utilities/utilities';
import CsrBanner from 'components/csr/csrBanner';

// ----- Types ----- //

type PropTypes = {|
  id: ?string,
  header: Node,
  footer: Node | null,
  children: Node,
  classModifiers: Array<?string>,
  backgroundImageSrc: ?string,
|};


// ----- Component ----- //

export default function Page(props: PropTypes) {
  const backgroundImage = props.backgroundImageSrc ? (
    <div className="background-image-container">
      <img className="background-image" alt="landing page background illustration" src={props.backgroundImageSrc} />
    </div>
  ) : null;

  useEffect(() => {
    requestAnimationFrame(() => {
      if (window.location.hash) {
        const hashElement = document.getElementById(window.location.hash.substr(1));
        if (hashElement) { hashElement.scrollIntoView(); }
      }
    });
  }, []);

  return (
    <div id={props.id} className={classNameWithModifiers('gu-content', props.classModifiers)}>
      <CsrBanner />
      {props.header}
      <main
        role="main"
        className="gu-content__main"
      >
        {backgroundImage}
        {props.children}
      </main>
      {props.footer}
    </div>
  );

}


// ----- Default Props ----- //

Page.defaultProps = {
  id: null,
  footer: null,
  classModifiers: [],
  backgroundImageSrc: null,
};
