// @flow

// ----- Imports ----- //

import type { PayPalButtonType } from './components/regularContributionsPayment';


// ----- Types ----- //

export type Action =
  | { type: 'CHECKOUT_ERROR', message: string }
  | { type: 'SET_PAYPAL_BUTTON', value: PayPalButtonType }
  | { type: 'CREATING_CONTRIBUTOR' };


// ----- Actions ----- //

function checkoutError(message: string): Action {
  return { type: 'CHECKOUT_ERROR', message };
}

function setPayPalButton(value: PayPalButtonType): Action {
  return { type: 'SET_PAYPAL_BUTTON', value };
}

function creatingContributor(): Action {
  return { type: 'CREATING_CONTRIBUTOR' };
}

// ----- Exports ----- //

export {
  checkoutError,
  setPayPalButton,
  creatingContributor,
};
