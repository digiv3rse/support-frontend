// @flow

// ----- Imports ----- //

import type { Contrib, ContribError, Amounts } from 'helpers/contributions';

import { parse as parseContribution } from 'helpers/contributions';
import type { CommonState } from 'helpers/page/page';
import type { Action } from './contributionsLandingActions';


// ----- Types ----- //

export type ContribState = {
  type: Contrib,
  error: ?ContribError,
  amount: Amounts,
  payPalError: ?string,
  context: ?boolean,
};

export type State ={
  common: CommonState,
  page: ContribState,
}


// ----- Reducers ----- //

function createContributionsLandingReducer(amountMonthly: string) {

  const initialContrib: ContribState = {
    type: 'MONTHLY',
    error: null,
    amount: {
      annual: {
        value: '75',
        userDefined: false,
      },
      monthly: {
        value: amountMonthly,
        userDefined: false,
      },
      oneOff: {
        value: '50',
        userDefined: false,
      },
    },
    payPalError: null,
    context: false,
  };

  return function contributionsLandingReducer(
    state: ContribState = initialContrib,
    action: Action,
  ): ContribState {

    switch (action.type) {

      case 'CHANGE_CONTRIB_TYPE': {

        let amount;

        if (action.contribType === 'ONE_OFF') {
          amount = state.amount.oneOff.value;
        } else if (action.contribType === 'ANNUAL') {
          amount = state.amount.annual.value;
        } else {
          amount = state.amount.monthly.value;
        }

        return Object.assign({}, state, {
          type: action.contribType,
          error: parseContribution(amount, action.contribType, action.countryGroupId).error,
        });

      }

      case 'CHANGE_CONTRIB_AMOUNT':

        return Object.assign({}, state, {
          amount: { annual: action.amount, monthly: action.amount, oneOff: action.amount },
          error: parseContribution(action.amount.value, state.type, action.countryGroupId).error,
        });

      case 'CHANGE_CONTRIB_AMOUNT_ANNUAL':

        return Object.assign({}, state, {
          amount: {
            annual: action.amount,
            monthly: state.amount.monthly,
            oneOff: state.amount.oneOff,
          },
          error: parseContribution(action.amount.value, state.type, action.countryGroupId).error,
        });

      case 'CHANGE_CONTRIB_AMOUNT_MONTHLY':

        return Object.assign({}, state, {
          amount: {
            annual: state.amount.annual,
            monthly: action.amount,
            oneOff: state.amount.oneOff,
          },
          error: parseContribution(action.amount.value, state.type, action.countryGroupId).error,
        });

      case 'CHANGE_CONTRIB_AMOUNT_ONEOFF':

        return Object.assign({}, state, {
          amount: {
            annual: state.amount.annual,
            monthly: state.amount.monthly,
            oneOff: action.amount,
          },
          error: parseContribution(action.amount.value, state.type, action.countryGroupId).error,
        });

      case 'PAYPAL_ERROR':

        return Object.assign({}, state, {
          payPalError: action.message,
        });

      case 'SET_CONTEXT':

        return Object.assign({}, state, { context: action.context });

      default:
        return state;

    }

  };
}

// ----- Exports ----- //

export { createContributionsLandingReducer };
