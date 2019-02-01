// @flow

// ----- Imports ----- //

import { initReducer, setStage, type Stage } from '../digitalSubscriptionCheckoutReducer';

jest.mock('ophan', () => {});

// ----- Tests ----- //

describe('Digital Subscription Checkout Reducer', () => {

  global.guardian = { productPrices: null };

  it('should handle SET_STAGE to "thankyou"', () => {

    const stage: Stage = 'thankyou';
    const action = setStage(stage);

    const newState = initReducer('GBPCountries')(undefined, action);

    expect(newState.checkout.stage).toEqual(stage);

  });

  it('should handle SET_STAGE to "checkout"', () => {

    const stage: Stage = 'checkout';
    const action = setStage(stage);

    const newState = initReducer('GBPCountries')(undefined, action);

    expect(newState.checkout.stage).toEqual(stage);

  });

});
