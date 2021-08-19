// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { type ContributionType } from 'helpers/contributions';
import { type StateProvince } from 'helpers/internationalisation/country';
import SvgEnvelope from 'components/svgs/envelope';
import SvgUser from 'components/svgs/user';
import Signout from 'components/signout/signout';
import {
  checkFirstName,
  checkLastName,
  checkBillingState,
  checkEmail,
  emailRegexPattern,
} from 'helpers/forms/formValidation';
import { type UserTypeFromIdentityResponse } from 'helpers/identityApis';
import ContributionState from './ContributionState';
import ContributionTextInput from './ContributionTextInput';
import { MustSignIn } from './MustSignIn';
import { type State } from '../contributionsLandingReducer';
import {
  updateFirstName,
  updateLastName,
  updateEmail,
  updateBillingState,
  checkIfEmailHasPassword,
} from '../contributionsLandingActions';
import { classNameWithModifiers } from 'helpers/utilities/utilities';
import { TextInput } from '@guardian/src-text-input';


// ----- Types ----- //
/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  firstName: string,
  lastName: string,
  email: string,
  billingState: StateProvince | null,
  checkoutFormHasBeenSubmitted: boolean,
  isSignedIn: boolean,
  userTypeFromIdentityResponse: UserTypeFromIdentityResponse,
  updateFirstName: (Event) => void,
  updateLastName: (Event) => void,
  updateEmail: (Event) => void,
  updateBillingState: (Event) => void,
  checkIfEmailHasPassword: (Event) => void,
  contributionType: ContributionType,
|};

// We only want to use the user state value if the form state value has not been changed since it was initialised,
// i.e it is null.
const getCheckoutFormValue = (formValue: string | null, userValue: string | null): string | null =>
  ((formValue === null || formValue === '') ? userValue : formValue);

/* eslint-enable react/no-unused-prop-types */

const mapStateToProps = (state: State) => ({
  firstName: getCheckoutFormValue(state.page.form.formData.firstName, state.page.user.firstName),
  lastName: getCheckoutFormValue(state.page.form.formData.lastName, state.page.user.lastName),
  email: getCheckoutFormValue(state.page.form.formData.email, state.page.user.email),
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
  billingState: getCheckoutFormValue(state.page.form.formData.billingState, state.page.user.stateField),
  isSignedIn: state.page.user.isSignedIn,
  userTypeFromIdentityResponse: state.page.form.userTypeFromIdentityResponse,
  contributionType: state.page.form.contributionType,
});

const mapDispatchToProps = (dispatch: Function) => ({
  updateFirstName: (event) => { dispatch(updateFirstName(event.target.value)); },
  updateLastName: (event) => { dispatch(updateLastName(event.target.value)); },
  updateEmail: (event) => { dispatch(updateEmail(event.target.value)); },
  updateBillingState: (event) => { dispatch(updateBillingState(event.target.value === '' ? null : event.target.value)); },
  checkIfEmailHasPassword: (event) => { dispatch(checkIfEmailHasPassword(event.target.value)); },
});


// ----- Render ----- //

function withProps(props: PropTypes) {
  const {
    firstName,
    lastName,
    email,
    isSignedIn,
    billingState,
    checkoutFormHasBeenSubmitted,
  } = props;

  return (
    <div className="form-fields">
      <h3 className="hidden-heading">Your details</h3>
      <div className={classNameWithModifiers('form__field', ['contribution-email'])}>
        <TextInput
          id="contributionEmail"
          label="Email address"
          value={email}
          type="email"
          autoComplete="email"
          supporting="example@domain.com"
          onInput={props.updateEmail}
          onChange={props.checkIfEmailHasPassword}
          pattern={emailRegexPattern}
          error={checkoutFormHasBeenSubmitted && !checkEmail(email) ? 'Please provide a valid email address' : null}
          disabled={isSignedIn}
        />
      </div>
      <Signout isSignedIn />
      <MustSignIn
        isSignedIn={props.isSignedIn}
        userTypeFromIdentityResponse={props.userTypeFromIdentityResponse}
        contributionType={props.contributionType}
        checkoutFormHasBeenSubmitted={props.checkoutFormHasBeenSubmitted}
        email={props.email}
      />
      {props.contributionType !== 'ONE_OFF' ?
        <div>
          <div className={classNameWithModifiers('form__field', ['contribution-fname'])}>
            <TextInput
              id="contributionFirstName"
              label="First name"
              value={firstName}
              autoComplete="given-name"
              autoCapitalize="words"
              onInput={props.updateFirstName}
              error={checkoutFormHasBeenSubmitted && !checkFirstName(firstName) ? 'Please provide your first name' : null}
              required
            />
          </div>
          <div className={classNameWithModifiers('form__field', ['contribution-lname'])}>
            <TextInput
              id="contributionLastName"
              label="Last name"
              value={lastName}
              autoComplete="family-name"
              autoCapitalize="words"
              onInput={props.updateLastName}
              error={checkoutFormHasBeenSubmitted && !checkLastName(lastName) ? 'Please provide your last name' : null}
              required
            />
          </div>
        </div> : null
      }
      <ContributionState
        onChange={props.updateBillingState}
        selectedState={billingState}
        isValid={checkBillingState(billingState)}
        formHasBeenSubmitted={checkoutFormHasBeenSubmitted}
      />
    </div>
  );
}

function withoutProps() {
  return (
    <div className="form-fields">
      <TextInput
        id="contributionEmail"
        label="Email address"
        type="email"
        supporting="example@domain.com"
      />
    </div>
  );
}

export const ContributionFormFields = connect(mapStateToProps, mapDispatchToProps)(withProps);
export const EmptyContributionFormFields = withoutProps;
