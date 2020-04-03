// @flow

// ----- Imports ----- //

import { canContributeWithoutSigningIn } from 'helpers/identityApis';
import { type Action as UserAction } from 'helpers/user/userActions';
import {
  checkAmountOrOtherAmount,
  checkEmail,
  checkFirstName,
  checkLastName,
  checkStateIfApplicable,
} from 'helpers/formValidation';
import {
  type ContributionType,
  type OtherAmounts,
  type SelectedAmounts,
  contributionTypeIsRecurring,
} from 'helpers/contributions';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { StateProvince } from 'helpers/internationalisation/country';
import type { State } from './contributionsLandingReducer';
import {
  type Action as ContributionsLandingAction,
  setFormIsValid,
} from './contributionsLandingActions';
import { recaptchaEnabled } from 'helpers/recaptcha';
import {Stripe} from "helpers/paymentMethods";

// ----- Types ----- //

type Action = ContributionsLandingAction | UserAction;

// ----- Functions ----- //

const enableOrDisablePayPalExpressCheckoutButton = (formIsSubmittable: boolean) => {
  if (formIsSubmittable && window.enablePayPalButton) {
    window.enablePayPalButton();
  } else if (window.disablePayPalButton) {
    window.disablePayPalButton();
  }
};

const setFormIsSubmittable = (formIsSubmittable: boolean, payPalButtonReady: boolean): Action => {
  if (payPalButtonReady) {
    enableOrDisablePayPalExpressCheckoutButton(formIsSubmittable);
  }
  return ({ type: 'SET_FORM_IS_SUBMITTABLE', formIsSubmittable });
};

export type FormIsValidParameters = {
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
  countryGroupId: CountryGroupId,
  contributionType: ContributionType,
  billingState: StateProvince | null,
  firstName: string | null,
  lastName: string | null,
  email: string | null,
  stripeCardFormOk: boolean,
}

const getFormIsValid = (formIsValidParameters: FormIsValidParameters) => {
  const {
    selectedAmounts,
    otherAmounts,
    countryGroupId,
    contributionType,
    billingState,
    firstName,
    lastName,
    email,
    stripeCardFormOk,
  } = formIsValidParameters;

  const hasNameFields = contributionType !== 'ONE_OFF';

  return (
    hasNameFields ?
      checkFirstName(firstName) && checkLastName(lastName) :
      true
  ) && checkEmail(email)
    && stripeCardFormOk
    && checkStateIfApplicable(billingState, countryGroupId, contributionType)
    && checkAmountOrOtherAmount(selectedAmounts, otherAmounts, contributionType, countryGroupId);
};

const formIsValidParameters = (state: State) => ({
  selectedAmounts: state.page.form.selectedAmounts,
  otherAmounts: state.page.form.formData.otherAmounts,
  countryGroupId: state.common.internationalisation.countryGroupId,
  contributionType: state.page.form.contributionType,
  billingState: state.page.form.formData.billingState,
  firstName: state.page.form.formData.firstName,
  lastName: state.page.form.formData.lastName,
  email: state.page.form.formData.email,
  stripeCardFormOk: state.page.form.paymentMethod !== Stripe || state.page.form.stripeCardFormData.formComplete,
});

function enableOrDisableForm() {
  return (dispatch: Function, getState: () => State): void => {

    const state = getState();
    const { isRecurringContributor } = state.page.user;

    const shouldBlockExistingRecurringContributor =
      isRecurringContributor && contributionTypeIsRecurring(state.page.form.contributionType);

    const userCanContributeWithoutSigningIn = canContributeWithoutSigningIn(
      state.page.form.contributionType,
      state.page.user.isSignedIn,
      state.page.form.userTypeFromIdentityResponse,
    );

    const formIsValid = getFormIsValid(formIsValidParameters(state));
    dispatch(setFormIsValid(formIsValid));

    const stripeRecurringNotVerified =
      recaptchaEnabled(state.common.internationalisation.countryGroupId, state.page.form.contributionType)
      && state.page.form.paymentMethod === 'Stripe'
      && !state.page.form.stripeCardFormData.recaptchaVerified;

    const shouldEnable =
      formIsValid
      && !(shouldBlockExistingRecurringContributor)
      && userCanContributeWithoutSigningIn
      && !stripeRecurringNotVerified;

    dispatch(setFormIsSubmittable(shouldEnable, state.page.form.payPalButtonReady));
  };
}

function setFormSubmissionDependentValue(setStateValue: () => Action) {
  return (dispatch: Function): void => {
    dispatch(setStateValue());
    dispatch(enableOrDisableForm());
  };
}

export { setFormSubmissionDependentValue, enableOrDisableForm };
