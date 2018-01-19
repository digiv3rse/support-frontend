// @flow

// ----- Imports ----- //

import { routes } from 'helpers/routes';
import * as cookie from 'helpers/cookie';

import {
  setId,
  setDisplayName,
  setEmail,
  setFirstName,
  setLastName,
  setTestUser,
  setPostDeploymentTestUser,
  setFullName,
} from './userActions';


// ----- Functions ----- //

const init = (dispatch: Function) => {

  const windowHasUser = window.guardian && window.guardian.user;
  const userAppearsLoggedIn = cookie.get('GU_U');

  const uatMode = window.guardian && window.guardian.uatMode;

  const emailFromCookie: ?string = cookie.get('gu.email');

  const isUndefinedOrNull = x => x === null || x === undefined;

  const testUserCondition = (isUndefinedOrNull(uatMode) && cookie.get('_test_username')) || uatMode;

  if (testUserCondition) {
    dispatch(setTestUser(true));
  }

  if (testUserCondition && cookie.get('_post_deploy_user')) {
    dispatch(setPostDeploymentTestUser(true));
  }

  if (windowHasUser) {
    dispatch(setId(window.guardian.user.id));
    dispatch(setEmail(window.guardian.user.email));
    dispatch(setDisplayName(window.guardian.user.displayName));
    dispatch(setFirstName(window.guardian.user.firstName));
    dispatch(setLastName(window.guardian.user.lastName));
    dispatch(setFullName(`${window.guardian.user.firstName} ${window.guardian.user.lastName}`));
  } else if (userAppearsLoggedIn) {
    fetch(routes.oneOffContribAutofill, { credentials: 'include' }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          if (data.id) {
            dispatch(setId(data.id));
          }
          if (data.name) {
            dispatch(setFullName(data.name));
          }
          if (data.email) {
            dispatch(setEmail(data.email));
          }
        });
      }
    });
  } else if (emailFromCookie) {
    dispatch(setEmail(emailFromCookie));
  }
};


// ----- Exports ----- //

export {
  init,
};
