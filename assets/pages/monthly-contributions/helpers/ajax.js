// @flow

// ----- Imports ----- //

import { addQueryParamToURL } from 'helpers/url';
import type { CombinedState } from '../reducers/reducers';

import { checkoutError } from '../actions/monthlyContributionsActions';


// ----- Setup ----- //

const MONTHLY_CONTRIB_ENDPOINT = '/monthly-contributions/create';
const MONTHLY_CONTRIB_THANKYOU = '/monthly-contributions/thankyou';


// ----- Types ----- //

type MonthlyContribFields = {
  contribution: {
    amount: number,
    currency: string,
  },
  paymentFields: {
    stripeToken: string,
  },
  country: string,
  firstName: string,
  lastName: string,
};

type PaymentField = 'baid' | 'stripeToken';


// ----- Functions ----- //

function requestData(paymentFieldName: PaymentField, token: string, getState: () => CombinedState) {

  const state = getState();

  const monthlyContribFields: MonthlyContribFields = {
    contribution: {
      amount: state.stripeCheckout.amount || 0,
      currency: state.stripeCheckout.currency || '',
    },
    paymentFields: {
      [paymentFieldName]: token || '',
    },
    country: state.monthlyContrib.country || '',
    firstName: state.user.firstName || '',
    lastName: state.user.lastName || '',
  };

  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Csrf-Token': state.csrf.token || '' },
    credentials: 'same-origin',
    body: JSON.stringify(monthlyContribFields),
  };

}

export default function postCheckout(paymentFieldName: PaymentField): Function {
  return (token: string, dispatch: Function, getState: () => CombinedState) => {

    const request = requestData(paymentFieldName, token, getState);

    return fetch(MONTHLY_CONTRIB_ENDPOINT, request).then((response) => {

      const url: string = addQueryParamToURL(MONTHLY_CONTRIB_THANKYOU, 'INTCMP', getState().intCmp);

      if (response.ok) {
        window.location.assign(url);
        return;
      }

      response.text().then(err => dispatch(checkoutError(err)));

    });
  };
}
