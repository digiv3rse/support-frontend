// @flow

// ----- Imports ----- //

import type { Action } from './userActions';


// ----- Types ----- //

type User = {
  email: ?string,
  displayName: ?string,
  firstName: ?string,
  lastName: ?string,
  isTestUser: ?boolean,
  fullName?: string,
  postcode?: string,
};


// ----- Setup ----- //

const initialState: User = {
  email: '',
  displayName: '',
  firstName: '',
  lastName: '',
  isTestUser: null,
};


// ----- Reducer ----- //

export default function userReducer(
  state: User = initialState,
  action: Action): User {

  switch (action.type) {

    case 'SET_DISPLAY_NAME':
      return Object.assign({}, state, { displayName: action.name });

    case 'SET_FIRST_NAME':
      return Object.assign({}, state, { firstName: action.name });

    case 'SET_LAST_NAME':
      return Object.assign({}, state, { lastName: action.name });

    case 'SET_FULL_NAME':
      return Object.assign({}, state, { fullName: action.name });

    case 'SET_TEST_USER':
      return Object.assign({}, state, { isTestUser: action.testUser });

    case 'SET_EMAIL':
      return Object.assign({}, state, { email: action.email });

    case 'SET_POSTCODE':
      return Object.assign({}, state, { postcode: action.postcode });

    default:
      return state;

  }

}
