// @flow

// ----- Imports ----- //

import {
  parseContribution,
  validateContribution,
  config,
} from 'helpers/contributions';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';

import type {
  ContributionType,
  ContributionError,
  ValidationError,
} from 'helpers/contributions';

import type { Action } from './contributionSelectionActions';


// ----- Types ----- //

export type State = {
  contributionType: ContributionType,
  oneOffAmount: string,
  monthlyAmount: string,
  annualAmount: string,
  isCustomAmount: boolean,
  customAmount: ?number,
  error: ?ContributionError,
};


// ----- Functions ----- //

// Returns a countryGroupId-specific initial state for the reducer.
function getInitialState(countryGroupId: CountryGroupId): State {
  return {
    contributionType: 'MONTHLY',
    oneOffAmount: config[countryGroupId].ONE_OFF.default.toString(),
    monthlyAmount: config[countryGroupId].MONTHLY.default.toString(),
    annualAmount: config[countryGroupId].ANNUAL.default.toString(),
    customAmount: null,
    isCustomAmount: false,
    error: null,
  };
}

// Changes the amount of the currently selected type of contribution.
function updatePredefinedAmount(state, contributionType: ContributionType, newAmount: string): State {

  const resetCustom = { isCustomAmount: false, error: null };

  switch (contributionType) {
    case 'ONE_OFF':
      return { ...state, ...resetCustom, oneOffAmount: newAmount };
    case 'MONTHLY':
      return { ...state, ...resetCustom, monthlyAmount: newAmount };
    case 'ANNUAL':
      return { ...state, ...resetCustom, annualAmount: newAmount };
    default:
      return state;
  }

}

// Re-parses the custom amount when the contribution type is changed.
function checkCustomAmount(
  isCustomAmount: boolean,
  customAmount: ?number,
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
): ?{ error: ?ValidationError } {

  if (isCustomAmount && customAmount) {

    const error = validateContribution(customAmount, contributionType, countryGroupId);
    return { error };

  }

  return null;

}

function parseCustomAmount(
  amount: string,
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
): { customAmount: ?number, error: ?ContributionError } {

  const parsed = parseContribution(amount);

  if (!parsed.valid) {
    return { customAmount: null, error: parsed.error };
  }

  return {
    customAmount: parsed.amount,
    error: validateContribution(parsed.amount, contributionType, countryGroupId),
  };

}


// ----- Selectors ----- //

// Retrieves the amount for the currently chosen contribution type.
function getAmount(state: State): string {

  if (state.isCustomAmount && state.customAmount) {
    return state.customAmount.toString();
  }

  switch (state.contributionType) {
    case 'ONE_OFF':
      return state.oneOffAmount;
    case 'MONTHLY':
      return state.monthlyAmount;
    default:
    case 'ANNUAL':
      return state.annualAmount;
  }

}


// ----- Reducer ----- //

function contributionSelectionReducerFor(scope: string, countryGroupId: CountryGroupId): Function {

  const initialState = getInitialState(countryGroupId);

  function contributionSelectionReducer(state: State = initialState, action: Action): State {

    if (action.scope !== scope) {
      return state;
    }

    switch (action.type) {
      case 'SET_CONTRIBUTION_TYPE':

        return {
          ...state,
          contributionType: action.contributionType,
          ...checkCustomAmount(
            state.isCustomAmount,
            state.customAmount,
            action.contributionType,
            action.countryGroupId,
          ),
        };

      case 'SET_AMOUNT':
        return updatePredefinedAmount(state, state.contributionType, action.amount);

      case 'SET_AMOUNT_FOR_CONTRIBUTION_TYPE':
        return updatePredefinedAmount(state, action.contributionType, action.amount);

      case 'SET_CUSTOM_AMOUNT':

        return {
          ...state,
          isCustomAmount: true,
          ...parseCustomAmount(action.amount, state.contributionType, action.countryGroupId),
        };

      default:
        return state;
    }

  }

  return contributionSelectionReducer;

}


// ----- Exports ----- //

export {
  contributionSelectionReducerFor,
  getAmount,
};
