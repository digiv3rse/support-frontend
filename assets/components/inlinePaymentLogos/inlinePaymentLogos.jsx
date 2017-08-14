// @flow

// ----- Imports ----- //

import React from 'react';
import Svg from 'components/svg/svg';

// ----- Component ----- //

export default function InlinePaymentLogos() {

  return (
    <div className={'component-inline-payment-logos'}>
      <Svg svgName="visa-logo" />
      <Svg svgName="mastercard-logo" />
      <Svg svgName="paypal-logo" />
      <Svg svgName="amex-logo" />
    </div>
  );
}
