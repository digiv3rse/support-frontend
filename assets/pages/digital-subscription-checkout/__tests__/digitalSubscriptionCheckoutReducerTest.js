// @flow

// ----- Imports ----- //

import { initReducer, setStage, type Stage } from '../digitalSubscriptionCheckoutReducer';

jest.mock('ophan', () => {});

// ----- Tests ----- //

describe('Digital Subscription Checkout Reducer', () => {

  global.guardian = { productPrices: null };

  it('should default to Direct Debit if the country is GB', () => {
    const reducer = initReducer('GB');
    expect(reducer(undefined, {}).checkout.paymentMethod).toEqual('DirectDebit');
  });

  it('should default to Stripe if the country is US', () => {
    const reducer = initReducer('US');
    expect(reducer(undefined, {}).checkout.paymentMethod).toEqual('Stripe');
  });

  it('should handle SET_STAGE to "thankyou"', () => {

    const stage: Stage = 'thankyou';
    const action = setStage(stage);

    const newState = initReducer('GB')(undefined, action);

    expect(newState.checkout.stage).toEqual(stage);

  });

  it('should handle SET_STAGE to "checkout"', () => {

    const stage: Stage = 'checkout';
    const action = setStage(stage);

    const newState = initReducer('GB')(undefined, action);

    expect(newState.checkout.stage).toEqual(stage);

  });

});
