// @flow

// ----- Imports ----- //

import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { Action } from './stripeCheckoutActions';


// ----- Types ----- //

export type State = {
  loaded: boolean,
  amount: number,
  token: ?string,
  currency: IsoCurrency,
};


// ----- Exports ----- //

export default function stripeCheckoutReducer(amount: number, currency: IsoCurrency) {

  const initialState: State = {
    loaded: false,
    amount,
    token: null,
    currency,
  };

  return (state: State = initialState, action: Action): State => {

    switch (action.type) {

      case 'STRIPE_CHECKOUT_LOADED':
        return Object.assign({}, state, { loaded: true });

      default:
        return state;

    }
  };
}
