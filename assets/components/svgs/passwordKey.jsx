// @flow

import React from 'react';

// A padlock icon used to signify that checkouts are secure.
export default function SvgPasswordKey() {

  return (
    <svg className="svg-password-lock" xmlns="http://www.w3.org/2000/svg" width="38" height="42" viewBox="0 0 38 42">
      <path fill="#999" fillRule="nonzero" d="M19.59 14.519c-1.944-1.944-5.102-1.936-7.054.017-1.953 1.952-1.96 5.11-.017 7.054a4.972 4.972 0 0 0 5.062 1.205l1.025 1.025 1.764-.165-.165 1.764.64.64 1.764-.165-.165 1.764.64.64 2.887-.327.327-2.887-5.503-5.503a4.972 4.972 0 0 0-1.205-5.062zm-2.09 2.089a2.04 2.04 0 0 1-.006 2.886 2.04 2.04 0 0 1-2.886.007 2.04 2.04 0 0 1 .007-2.886 2.04 2.04 0 0 1 2.886-.007z" />
    </svg>
  );

}
