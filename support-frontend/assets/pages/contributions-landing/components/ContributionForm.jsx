// @flow

// ----- Imports ----- //

import { getAmount, type ThirdPartyPaymentLibraries } from 'helpers/contributions';
import React from 'react';
import { connect } from 'react-redux';

import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { classNameWithModifiers } from 'helpers/utilities';
import {
  type ContributionType,
  type PaymentMatrix,
  logInvalidCombination,
} from 'helpers/contributions';
import { type ErrorReason } from 'helpers/errorReasons';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { type PaymentAuthorisation } from 'helpers/paymentIntegrations/readerRevenueApis';
import { type CreatePaypalPaymentData } from 'helpers/paymentIntegrations/oneOffContributions';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import { payPalCancelUrl, payPalReturnUrl } from 'helpers/routes';

import ProgressMessage from 'components/progressMessage/progressMessage';
import { openDirectDebitPopUp } from 'components/directDebit/directDebitActions';
import TermsPrivacy from 'components/legal/termsPrivacy/termsPrivacy';

import { onFormSubmit } from 'helpers/checkoutForm/onFormSubmit';
import { type UserTypeFromIdentityResponse } from 'helpers/identityApis';
import type { OtherAmounts, SelectedAmounts } from 'helpers/contributions';
import type { CampaignSettings } from 'helpers/campaigns';

import { ContributionFormFields, EmptyContributionFormFields } from './ContributionFormFields';
import { ContributionTypeTabs, EmptyContributionTypeTabs } from './ContributionTypeTabs';
import { ContributionAmount, EmptyContributionAmount } from './ContributionAmount';
import { PaymentMethodSelector, EmptyPaymentMethodSelector } from './PaymentMethodSelector';
import { ContributionSubmit, EmptyContributionSubmit } from './ContributionSubmit';

import { type State } from 'pages/contributions-landing/contributionsLandingReducer';

import {
  setUseLocalCurrency,
  paymentWaiting,
  setCheckoutFormHasBeenSubmitted,
  createOneOffPayPalPayment,
} from 'pages/contributions-landing/contributionsLandingActions';
import ContributionErrorMessage from './ContributionErrorMessage';
import StripePaymentRequestButtonContainer from './StripePaymentRequestButton/StripePaymentRequestButtonContainer';
import StripeCardFormContainer from './StripeCardForm/StripeCardFormContainer';
import type { RecentlySignedInExistingPaymentMethod } from 'helpers/existingPaymentMethods/existingPaymentMethods';
import type { PaymentMethod } from 'helpers/paymentMethods';
import { DirectDebit, ExistingCard, ExistingDirectDebit, AmazonPay } from 'helpers/paymentMethods';
import { logException } from 'helpers/logger';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';

// ----- Types ----- //
/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  isWaiting: boolean,
  countryGroupId: CountryGroupId,
  email: string,
  otherAmounts: OtherAmounts,
  paymentMethod: PaymentMethod,
  existingPaymentMethod: RecentlySignedInExistingPaymentMethod,
  thirdPartyPaymentLibraries: ThirdPartyPaymentLibraries,
  contributionType: ContributionType,
  currency: IsoCurrency,
  paymentError: ErrorReason | null,
  selectedAmounts: SelectedAmounts,
  setPaymentIsWaiting: boolean => void,
  openDirectDebitPopUp: () => void,
  createOneOffPayPalPayment: (data: CreatePaypalPaymentData) => void,
  setCheckoutFormHasBeenSubmitted: () => void,
  onPaymentAuthorisation: PaymentAuthorisation => void,
  userTypeFromIdentityResponse: UserTypeFromIdentityResponse,
  isSignedIn: boolean,
  formIsValid: boolean,
  isPostDeploymentTestUser: boolean,
  formIsSubmittable: boolean,
  isTestUser: boolean,
  country: IsoCountry,
  createStripePaymentMethod: (clientSecret: string | null) => void,
  stripeClientSecret: string | null,
  amazonPayOrderReferenceId: string | null,
  checkoutFormHasBeenSubmitted: boolean,
  campaignSettings: CampaignSettings | null,
  referrerSource: ?string,
  amazonPayBillingAgreementId: ?string,

  isEligibleCountry: boolean,
  localCurrency: IsoCurrency | null,
  localAmounts: number[] | null,
  useLocalCurrency: boolean,
  setUseLocalCurrency: boolean => void,
|};

// We only want to use the user state value if the form state value has not been changed since it was initialised,
// i.e it is null.
const getCheckoutFormValue = (formValue: string | null, userValue: string | null): string | null =>
  (formValue === null ? userValue : formValue);

/* eslint-enable react/no-unused-prop-types */

const mapStateToProps = (state: State) => ({
  isWaiting: state.page.form.isWaiting,
  countryGroupId: state.common.internationalisation.countryGroupId,
  email: getCheckoutFormValue(state.page.form.formData.email, state.page.user.email),
  otherAmounts: state.page.form.formData.otherAmounts,
  paymentMethod: state.page.form.paymentMethod,
  existingPaymentMethod: state.page.form.existingPaymentMethod,
  thirdPartyPaymentLibraries: state.page.form.thirdPartyPaymentLibraries,
  createStripePaymentMethod: state.page.form.stripeCardFormData.createPaymentMethod,
  stripeClientSecret: state.page.form.stripeCardFormData.setupIntentClientSecret,
  contributionType: state.page.form.contributionType,
  currency: state.common.internationalisation.currencyId,
  paymentError: state.page.form.paymentError,
  selectedAmounts: state.page.form.selectedAmounts,
  userTypeFromIdentityResponse: state.page.form.userTypeFromIdentityResponse,
  isSignedIn: state.page.user.isSignedIn,
  formIsValid: state.page.form.formIsValid,
  isPostDeploymentTestUser: state.page.user.isPostDeploymentTestUser,
  formIsSubmittable: state.page.form.formIsSubmittable,
  isTestUser: state.page.user.isTestUser || false,
  country: state.common.internationalisation.countryId,
  amazonPayOrderReferenceId: state.page.form.amazonPayData.orderReferenceId,
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
  referrerSource: state.common.referrerAcquisitionData.source,
  amazonPayBillingAgreementId: state.page.form.amazonPayData.amazonBillingAgreementId,
  isEligibleCountry: state.page.form.isEligibleCountry,
  localCurrency: state.page.form.localCurrency,
  localAmounts: state.page.form.localAmounts,
  useLocalCurrency: state.page.form.useLocalCurrency,
});


const mapDispatchToProps = (dispatch: Function) => ({
  setPaymentIsWaiting: (isWaiting) => { dispatch(paymentWaiting(isWaiting)); },
  openDirectDebitPopUp: () => { dispatch(openDirectDebitPopUp()); },
  setCheckoutFormHasBeenSubmitted: () => { dispatch(setCheckoutFormHasBeenSubmitted()); },
  createOneOffPayPalPayment: (data: CreatePaypalPaymentData) => { dispatch(createOneOffPayPalPayment(data)); },
  setUseLocalCurrency: (useLocalCurrency) => { dispatch(setUseLocalCurrency(useLocalCurrency)); },
});

// Bizarrely, adding a type to this object means the type-checking on the
// formHandlers is no longer accurate.
// (Flow thinks it's OK when it's missing required properties).

const formHandlersForRecurring = {
  PayPal: () => {
    // we don't get an onSubmit event for PayPal recurring, so there
    // is no need to handle anything here
  },
  Stripe: (props: PropTypes) => {
    if (props.createStripePaymentMethod) {
      props.createStripePaymentMethod(props.stripeClientSecret);
    }
  },
  DirectDebit: (props: PropTypes) => {
    props.openDirectDebitPopUp();
  },
  ExistingCard: (props: PropTypes) => props.onPaymentAuthorisation({
    paymentMethod: 'ExistingCard',
    billingAccountId: props.existingPaymentMethod.billingAccountId,
  }),
  ExistingDirectDebit: (props: PropTypes) => props.onPaymentAuthorisation({
    paymentMethod: 'ExistingDirectDebit',
    billingAccountId: props.existingPaymentMethod.billingAccountId,
  }),
  AmazonPay: (props: PropTypes) => {
    if (props.amazonPayBillingAgreementId) {
      props.onPaymentAuthorisation({
        paymentMethod: 'AmazonPay',
        amazonPayBillingAgreementId: props.amazonPayBillingAgreementId,
      });
    }
  },
};

const formHandlers: PaymentMatrix<PropTypes => void> = {
  ONE_OFF: {
    Stripe: (props: PropTypes) => {
      if (props.createStripePaymentMethod) {
        props.createStripePaymentMethod(null);
      }
    },
    PayPal: (props: PropTypes) => {
      props.setPaymentIsWaiting(true);
      props.createOneOffPayPalPayment({
        currency: props.currency,
        amount: getAmount(
          props.selectedAmounts,
          props.otherAmounts,
          props.contributionType,
        ),
        returnURL: payPalReturnUrl(props.countryGroupId, props.email),
        cancelURL: payPalCancelUrl(props.countryGroupId),
      });
    },
    DirectDebit: () => { logInvalidCombination('ONE_OFF', DirectDebit); },
    ExistingCard: () => { logInvalidCombination('ONE_OFF', ExistingCard); },
    ExistingDirectDebit: () => { logInvalidCombination('ONE_OFF', ExistingDirectDebit); },
    AmazonPay: (props: PropTypes) => {
      const { amazonPayOrderReferenceId } = props;
      if (amazonPayOrderReferenceId) {
        props.setPaymentIsWaiting(true);
        props.onPaymentAuthorisation({ paymentMethod: AmazonPay, orderReferenceId: amazonPayOrderReferenceId });
      } else {
        logException('Missing orderReferenceId for amazon pay');
      }

    },
    None: () => { logInvalidCombination('ONE_OFF', 'None'); },
  },
  ANNUAL: {
    ...formHandlersForRecurring,
    None: () => { logInvalidCombination('ANNUAL', 'None'); },
  },
  MONTHLY: {
    ...formHandlersForRecurring,
    None: () => { logInvalidCombination('MONTHLY', 'None'); },
  },
};

// Note PayPal recurring flow does not call this function
function onSubmit(props: PropTypes): Event => void {
  return (event) => {
    // Causes errors to be displayed against payment fields
    event.preventDefault();
    const flowPrefix = 'npf';
    const form = event.target;
    const handlePayment = () => formHandlers[props.contributionType][props.paymentMethod](props);

    onFormSubmit({
      ...props,
      flowPrefix,
      handlePayment,
      form,
    });
  };
}

// ----- Render ----- //

function withProps(props: PropTypes) {
  const baseClass = 'form';

  const classModifiers = ['contribution', 'with-labels'];

  function toggleUseLocalCurrency() {
    let currentState = props.useLocalCurrency;
    let newState = !currentState
    props.setUseLocalCurrency(newState)
  }

  return (
    <form onSubmit={onSubmit(props)} className={classNameWithModifiers(baseClass, classModifiers)} noValidate>
      <h2 className="hidden-heading">Make a contribution</h2>
      <div className="contributions-form-selectors">
        <ContributionTypeTabs />
        <ContributionAmount />
        { `useLocalCurrency: ${props.useLocalCurrency}` }
        {
          props.contributionType === 'ONE_OFF' && props.isEligibleCountry &&
          (
            <CheckboxGroup cssOverrides='margin-top:16px;'>
              <Checkbox
                label='View in local currency'
                defaultChecked={props.useLocalCurrency}
                onChange={toggleUseLocalCurrency}
              />
            </CheckboxGroup>
          )
        }
      </div>
      <StripePaymentRequestButtonContainer
        currency={props.currency}
        contributionType={props.contributionType}
        isTestUser={props.isTestUser}
        country={props.country}
        otherAmounts={props.otherAmounts}
        selectedAmounts={props.selectedAmounts}
      />
      <div className={classNameWithModifiers('form', ['content'])}>
        <ContributionFormFields />
        <PaymentMethodSelector />

        <StripeCardFormContainer
          currency={props.currency}
          contributionType={props.contributionType}
          paymentMethod={props.paymentMethod}
          isTestUser={props.isTestUser}
          country={props.country}
        />

        <div>
          <ContributionErrorMessage />
        </div>
        <ContributionSubmit
          onPaymentAuthorisation={props.onPaymentAuthorisation}
        />
      </div>

      <TermsPrivacy
        countryGroupId={props.countryGroupId}
        contributionType={props.contributionType}
        campaignSettings={props.campaignSettings}
        referrerSource={props.referrerSource}
      />
      {props.isWaiting ? <ProgressMessage message={['Processing transaction', 'Please wait']} /> : null}
    </form>
  );
}

function withoutProps() {
  return (
    <form className={classNameWithModifiers('form', ['contribution'])}>
      <div>
        <EmptyContributionTypeTabs />
        <EmptyContributionAmount />
        <div className={classNameWithModifiers('form', ['content'])}>
          <EmptyContributionFormFields />
          <EmptyPaymentMethodSelector />
          <EmptyContributionSubmit />
        </div>
      </div>
      <div>
        <ProgressMessage message={['Loading the page']} />
      </div>
    </form>
  );
}

export const ContributionForm = connect(mapStateToProps, mapDispatchToProps)(withProps);
export const EmptyContributionForm = withoutProps;
