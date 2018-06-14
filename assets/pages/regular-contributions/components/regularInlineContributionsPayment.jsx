// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import StripeInlineForm from 'components/stripeInlineForm/stripeInlineForm';
import PayPalExpressButton from 'components/paymentButtons/payPalExpressButton/payPalExpressButton';
import DirectDebitPopUpButton from 'components/paymentButtons/directDebitPopUpButton/directDebitPopUpButton';
import ErrorMessage from 'components/errorMessage/errorMessage';
import ProgressMessage from 'components/progressMessage/progressMessage';
import { emptyInputField } from 'helpers/utilities';
import type { Status } from 'helpers/switch';
import { routes } from 'helpers/routes';
import { stripeInlineFormActionsFor } from 'components/stripeInlineForm/stripeInlineFormActions';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import type { Currency } from 'helpers/internationalisation/currency';
import type { Node } from 'react';
import type { Contrib } from 'helpers/contributions';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { Participations } from 'helpers/abTests/abtest';
import type { Csrf as CsrfState } from 'helpers/csrf/csrfReducer';
import { setPayPalHasLoaded } from '../regularContributionsActions';
import { postCheckout } from '../helpers/ajax';


// ----- Types ----- //

export type PaymentStatus = 'NotStarted' | 'Pending' | 'PollingTimedOut' | 'Failed' | 'Success';

type PropTypes = {
  dispatch: Function,
  email: string,
  hide: boolean,
  error: ?string,
  isTestUser: boolean,
  isPostDeploymentTestUser: boolean,
  contributionType: Contrib,
  paymentStatus: PaymentStatus,
  currency: Currency,
  amount: number,
  csrf: CsrfState,
  country: IsoCountry,
  abParticipations: Participations,
  referrerAcquisitionData: ReferrerAcquisitionData,
  payPalHasLoaded: boolean,
  directDebitSwitchStatus: Status,
  stripeSwitchStatus: Status,
  payPalSwitchStatus: Status,
  isStripeLoaded: boolean,
  stripeIsLoaded: () => mixed,
};


// ----- Functions ----- //

// Shows a message about the status of the form or the payment.
function getStatusMessage(
  paymentStatus: PaymentStatus,
  hide: boolean,
  error: ?string,
): Node {

  if (paymentStatus === 'Pending') {
    return <ProgressMessage message={['Processing transaction', 'Please wait']} />;
  } else if (hide) {
    return <ErrorMessage message="Please fill in all the fields above." />;
  }

  return <ErrorMessage message={error} />;

}

// ----- Component ----- //

/*
 * WARNING: we are using the React context here to be able to pass the getState function
 * to the postCheckout function. PostCheckout requires this function to access to the
 * most recent user.
 * More information here:https://reactjs.org/docs/context.html
 * You should not use context for other purposes. Please use redux.
 */
function RegularContributionsPayment(props: PropTypes, context) {
  let directDebitButton = null;

  if (props.country === 'GB') {
    directDebitButton = (
      <DirectDebitPopUpButton
        callback={postCheckout(
          props.abParticipations,
          props.amount,
          props.csrf,
          props.currency,
          props.contributionType,
          props.dispatch,
          'DirectDebit',
          props.referrerAcquisitionData,
          context.store.getState,
        )}
        switchStatus={props.directDebitSwitchStatus}
      />);
  }

  let stripeInlineForm = (<StripeInlineForm
    callback={postCheckout(
      props.abParticipations,
      props.amount,
      props.csrf,
      props.currency,
      props.contributionType,
      props.dispatch,
      'Stripe',
      props.referrerAcquisitionData,
      context.store.getState,
    )}
    email={props.email}
    dispatch={props.dispatch}
    stripeIsLoaded={props.stripeIsLoaded}
    isStripeLoaded={props.isStripeLoaded}
    currency={props.currency}
    isTestUser={props.isTestUser}
    isPostDeploymentTestUser={props.isPostDeploymentTestUser}
    switchStatus={props.stripeSwitchStatus}
  />);

  let payPalButton = (<PayPalExpressButton
    amount={props.amount}
    currency={props.currency}
    csrf={props.csrf}
    callback={postCheckout(
      props.abParticipations,
      props.amount,
      props.csrf,
      props.currency,
      props.contributionType,
      props.dispatch,
      'PayPal',
      props.referrerAcquisitionData,
      context.store.getState,
    )}
    hasLoaded={props.payPalHasLoaded}
    setHasLoaded={() => props.dispatch(setPayPalHasLoaded())}
    switchStatus={props.payPalSwitchStatus}
  />);

  if (props.hide) {
    directDebitButton = null;
    stripeInlineForm = null;
    payPalButton = null;
  }

  return (
    <section className="regular-contribution-payment">
      { props.paymentStatus === 'Success' ? <Redirect to={{ pathname: routes.recurringContribThankyou }} /> : null }
      { props.paymentStatus === 'PollingTimedOut' ? <Redirect to={{ pathname: routes.recurringContribPending }} /> : null }
      {getStatusMessage(props.paymentStatus, props.hide, props.error)}
      {stripeInlineForm}
      <span className="regular-contribution-payment__or-label">or</span>
      {directDebitButton}
      {payPalButton}
    </section>
  );
}

// ----- Map State/Props ----- //

function mapStateToProps(state) {
  return {
    isTestUser: state.page.user.isTestUser || false,
    isPostDeploymentTestUser: state.page.user.isPostDeploymentTestUser,
    email: state.page.user.email,
    hide: emptyInputField(state.page.user.firstName) || emptyInputField(state.page.user.lastName),
    error: state.page.regularContrib.error,
    paymentStatus: state.page.regularContrib.paymentStatus,
    amount: state.page.regularContrib.amount,
    currency: state.common.currency,
    regularContrib: state.page.regularContrib,
    csrf: state.page.csrf,
    country: state.common.country,
    abParticipations: state.common.abParticipations,
    referrerAcquisitionData: state.common.referrerAcquisitionData,
    payPalHasLoaded: state.page.regularContrib.payPalHasLoaded,
    directDebitSwitchStatus: state.common.switches.recurringPaymentMethods.directDebit,
    stripeSwitchStatus: state.common.switches.recurringPaymentMethods.stripe,
    payPalSwitchStatus: state.common.switches.recurringPaymentMethods.payPal,
    stripeIsLoaded: stripeInlineFormActionsFor('regularContributions').stripeIsLoaded,
    isStripeLoaded: state.page.stripeInlineForm.isStripeLoaded,
  };
}

// ----- Exports ----- //

export default connect(mapStateToProps)(RegularContributionsPayment);
