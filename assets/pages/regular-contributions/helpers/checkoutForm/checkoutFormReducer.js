// @flow

// ----- Imports ----- //
import { type Action } from './checkoutFormActions';

// ----- Types ----- //


export type CheckoutFormAttribute = {
  shouldValidate: boolean;
}

export type Stage = 'checkout' | 'payment'

export type RegularContributionsCheckoutFormState = {
  email: CheckoutFormAttribute,
  firstName: CheckoutFormAttribute,
  lastName: CheckoutFormAttribute,
  stage: Stage,
};

// ----- Setup ----- //

const initialState: RegularContributionsCheckoutFormState = {
  email: {
    shouldValidate: false,
  },
  firstName: {
    shouldValidate: false,
  },
  lastName: {
    shouldValidate: false,
  },
  stage: 'checkout',
};


// ----- Reducer ----- //

function checkoutFormReducer(
  state: RegularContributionsCheckoutFormState = initialState,
  action: Action,
): RegularContributionsCheckoutFormState {

  switch (action.type) {
    case 'SET_FIRST_NAME_SHOULD_VALIDATE':
      return { ...state, firstName: { ...state.firstName, shouldValidate: action.shouldValidate } };

    case 'SET_LAST_NAME_SHOULD_VALIDATE':
      return { ...state, lastName: { ...state.lastName, shouldValidate: action.shouldValidate } };

    case 'SET_EMAIL_SHOULD_VALIDATE':
      return { ...state, email: { ...state.email, shouldValidate: action.shouldValidate } };

    case 'SET_STAGE':
      return { ...state, stage: action.stage };

    default:
      return state;
  }

}

export { checkoutFormReducer };
