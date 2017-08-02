// @flow

// ----- Imports ----- //

import React from 'react';

import StripePopUpButton from 'components/stripePopUpButton/stripePopUpButton';
import PayPalExpressButton from 'components/payPalExpressButton/payPalExpressButton';
import ErrorMessage from 'components/errorMessage/errorMessage';


// ----- Types ----- //

type PropTypes = {
  email: string,
  hide: boolean,
  error: ?string,
  payPalButtonExists: boolean,
  stripeCallback: Function,
  payPalCallback: Function,
};


// ----- Component ----- //

export default function PaymentMethods(props: PropTypes) {

  let errorMessage = '';
  let stripeButton = <StripePopUpButton email={props.email} callback={props.stripeCallback} />;
  let payPalButton = '';

  if (props.payPalButtonExists) {
    payPalButton = <PayPalExpressButton callback={props.payPalCallback} />;
  }

  if (props.hide) {
    errorMessage = <ErrorMessage message={'Please fill in all the fields above.'} />;
    stripeButton = '';
    payPalButton = '';
  } else if (props.error != null) {
    errorMessage = <ErrorMessage message={props.error} />;
  }

  return (
    <section className="payment-methods">
      {errorMessage}
      {stripeButton}
      {payPalButton}
    </section>
  );
}
