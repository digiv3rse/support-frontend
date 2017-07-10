// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';

import StripePopUpButton from 'components/stripePopUpButton/stripePopUpButton';
import postCheckout from '../helpers/ajax';


// ----- Types ----- //

type PropTypes = {
  email: string,
  firstName: string,
  lastName: string,
  error: ?string,
};


// ----- Component ----- //

function PaymentMethods(props: PropTypes) {

  let content = 'Please fill in all the fields above.';

  if (props.firstName !== '' && props.lastName !== '' && props.error === null) {
    content = <StripePopUpButton email={props.email} callback={postCheckout} />;
  }

  if (props.error !== null) {
    content = 'There was an error processing your payment. Please try again later.';
  }

  return (
    <section className="payment-methods">
      {content}
    </section>
  );

}


// ----- Map State/Props ----- //

function mapStateToProps(state) {

  return {
    email: state.user.email,
    firstName: state.user.firstName,
    lastName: state.user.lastName,
    error: state.monthlyContrib.error,
  };

}


// ----- Exports ----- //

export default connect(mapStateToProps)(PaymentMethods);
