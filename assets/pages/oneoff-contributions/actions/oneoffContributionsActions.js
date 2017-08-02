// @flow

// ----- Imports ----- //

import { setStripeAmount } from 'helpers/stripeCheckout/stripeCheckoutActions';
import { setPayPalExpressAmount } from 'helpers/payPalExpressCheckout/payPalExpressCheckoutActions';
import { parse as parseContribution } from 'helpers/contributions';


// ----- Types ----- //

export type Action =
  | { type: 'SET_CONTRIB_VALUE', value: number }
  | { type: 'CHECKOUT_ERROR', message: string }
  ;


// ----- Actions ----- //

function setContribValue(value: number): Action {
  return { type: 'SET_CONTRIB_VALUE', value };
}

export function checkoutError(message: string): Action {
  return { type: 'CHECKOUT_ERROR', message };
}

export function setContribAmount(amount: string): Function {

  const value = parseContribution(amount, 'ONE_OFF').amount;

  return (dispatch) => {
    dispatch(setContribValue(value));
    dispatch(setStripeAmount(value));
    dispatch(setPayPalExpressAmount(value));
  };

}
