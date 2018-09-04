// @flow

// ----- Imports ----- //

import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { usStates, caStates } from 'helpers/internationalisation/country';

import type { Action } from './userActions';


// ----- Types ----- //

export type User = {
  id: ?string,
  email: string,
  displayName: ?string,
  firstName: string,
  lastName: string,
  fullName: string,
  isTestUser: ?boolean,
  isPostDeploymentTestUser: boolean,
  stateField?: string,
  gnmMarketing: boolean,
  isSignedIn: boolean,
};


// ----- Setup ----- //

const initialState: User = {
  id: '',
  email: '',
  displayName: '',
  firstName: '',
  lastName: '',
  fullName: '',
  isTestUser: null,
  isPostDeploymentTestUser: false,
  gnmMarketing: false,
  isSignedIn: false,
};


// ----- Functions ----- //

function defaultStateOrProvince(countryGroup: CountryGroupId): string {
  if (countryGroup === 'UnitedStates') {
    return Object.keys(usStates)[0];
  } else if (countryGroup === 'Canada') {
    return Object.keys(caStates)[0];
  }

  return '';
}


// ----- Reducer ----- //

function createUserReducer(countryGroup: CountryGroupId) {

  const initialStateWithStateOrProvince = {
    ...initialState,
    stateField: defaultStateOrProvince(countryGroup),
  };

  return function userReducer(
    state: User = initialStateWithStateOrProvince,
    action: Action,
  ): User {

    switch (action.type) {
      case 'SET_USER_ID':
        return { ...state, id: action.id };

      case 'SET_DISPLAY_NAME':
        return { ...state, displayName: action.name };

      case 'SET_FIRST_NAME':
        return { ...state, firstName: action.name };

      case 'SET_LAST_NAME':
        return { ...state, lastName: action.name };

      case 'SET_FULL_NAME':
        return { ...state, fullName: action.name };

      case 'SET_TEST_USER':
        return { ...state, isTestUser: action.testUser };

      case 'SET_POST_DEPLOYMENT_TEST_USER':
        return { ...state, isPostDeploymentTestUser: action.postDeploymentTestUser };

      case 'SET_EMAIL':
        return { ...state, email: action.email };

      case 'SET_STATEFIELD':
        return { ...state, stateField: action.stateField };

      case 'SET_GNM_MARKETING':
        return { ...state, gnmMarketing: action.preference };

      case 'SET_IS_SIGNED_IN':
        return { ...state, isSignedIn: action.isSignedIn };

      default:
        return state;

    }
  };
}

export { createUserReducer };
