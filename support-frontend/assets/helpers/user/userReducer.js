// @flow

// ----- Imports ----- //

import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';

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
  stateField: string,
  gnmMarketing: boolean,
  isSignedIn: boolean,
  isRecurringContributor: boolean,
  emailValidated: boolean,
};


// ----- Setup ----- //

const initialState: User = {
  id: '',
  email: '',
  displayName: '',
  firstName: '',
  lastName: '',
  fullName: '',
  stateField: '',
  isTestUser: null,
  isPostDeploymentTestUser: false,
  gnmMarketing: false,
  isSignedIn: false,
  isRecurringContributor: false,
  emailValidated: false,
};


// ----- Functions ----- //


// ----- Reducer ----- //

function createUserReducer(countryGroup: CountryGroupId) {

  return function userReducer(
    state: User = initialState,
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

      case 'SET_IS_RECURRING_CONTRIBUTOR':
        return { ...state, isRecurringContributor: true };

      case 'SET_EMAIL_VALIDATED':
        return { ...state, emailValidated: action.emailValidated };

      default:
        return state;
    }
  };
}

export { createUserReducer };
