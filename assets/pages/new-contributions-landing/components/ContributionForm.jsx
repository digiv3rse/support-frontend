// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import { countryGroupSpecificDetails, type CountryMetaData } from 'helpers/internationalisation/contributions';
import { type UsState, type CaState } from 'helpers/internationalisation/country';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { classNameWithModifiers } from 'helpers/utilities';
import { type PaymentHandler, type PaymentMethod } from 'helpers/checkouts';
import { config, type Contrib, type Amount } from 'helpers/contributions';
import { type CheckoutFailureReason } from 'helpers/checkoutErrors';
import { emailRegexPattern } from 'helpers/checkoutForm/checkoutForm';
import { openDialogBox } from 'helpers/paymentIntegrations/newStripeCheckout';
import { type Token } from 'helpers/paymentIntegrations/readerRevenueApis';

import PaymentFailureMessage from 'components/paymentFailureMessage/paymentFailureMessage';
import SvgEnvelope from 'components/svgs/envelope';
import SvgUser from 'components/svgs/user';
import ProgressMessage from 'components/progressMessage/progressMessage';

import { NewContributionType } from './ContributionType';
import { NewContributionAmount } from './ContributionAmount';
import { NewContributionPayment } from './ContributionPayment';
import { NewContributionState } from './ContributionState';
import { NewContributionSubmit } from './ContributionSubmit';
import { NewContributionTextInput } from './ContributionTextInput';

import { type State } from '../contributionsLandingReducer';

import {
  paymentWaiting,
  updateFirstName,
  updateLastName,
  updateEmail,
  updateState,
  onThirdPartyPaymentDone,
  setCheckoutFormHasBeenSubmitted,
} from '../contributionsLandingActions';

// ----- Types ----- //
/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  done: boolean,
  error: CheckoutFailureReason | null,
  isWaiting: boolean,
  countryGroupId: CountryGroupId,
  selectedCountryGroupDetails: CountryMetaData,
  contributionType: Contrib,
  thankYouRoute: string,
  firstName: string,
  lastName: string,
  email: string,
  state: UsState | CaState | null,
  selectedAmounts: { [Contrib]: Amount | 'other' },
  otherAmount: string | null,
  paymentMethod: PaymentMethod,
  paymentHandler: { [PaymentMethod]: PaymentHandler | null },
  updateFirstName: Event => void,
  updateLastName: Event => void,
  updateEmail: Event => void,
  updateState: Event => void,
  onWaiting: boolean => void,
  onThirdPartyPaymentDone: Token => void,
  checkoutFormHasBeenSubmitted: boolean,
  setCheckoutFormHasBeenSubmitted: () => void,
|};

type FormValueType = string | null;

const getCheckoutFormValue = (formValue: FormValueType, userValue: FormValueType): FormValueType =>
  (formValue === null ? userValue : formValue);

/* eslint-enable react/no-unused-prop-types */

const mapStateToProps = (state: State) => ({
  done: state.page.form.done,
  isWaiting: state.page.form.isWaiting,
  countryGroupId: state.common.internationalisation.countryGroupId,
  firstName: getCheckoutFormValue(state.page.form.formData.firstName, state.page.user.firstName),
  lastName: getCheckoutFormValue(state.page.form.formData.lastName, state.page.user.lastName),
  email: getCheckoutFormValue(state.page.form.formData.email, state.page.user.email),
  state: state.page.form.formData.state || state.page.user.stateField,
  selectedAmounts: state.page.form.selectedAmounts,
  otherAmount: state.page.form.formData.otherAmounts[state.page.form.contributionType].amount,
  paymentMethod: state.page.form.paymentMethod,
  paymentHandler: state.page.form.paymentHandler,
  contributionType: state.page.form.contributionType,
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
});


const mapDispatchToProps = (dispatch: Function) => ({
  updateFirstName: (event) => { dispatch(updateFirstName(event.target.value)); },
  updateLastName: (event) => { dispatch(updateLastName(event.target.value)); },
  updateEmail: (event) => { dispatch(updateEmail(event.target.value)); },
  updateState: (event) => { dispatch(updateState(event.target.value === '' ? null : event.target.value)); },
  onWaiting: (isWaiting) => { dispatch(paymentWaiting(isWaiting)); },
  onThirdPartyPaymentDone: (token) => { dispatch(onThirdPartyPaymentDone(token)); },
  setCheckoutFormHasBeenSubmitted: () => { dispatch(setCheckoutFormHasBeenSubmitted()); },
});

// ----- Functions ----- //

const getAmount = (props: PropTypes) =>
  parseFloat(props.selectedAmounts[props.contributionType] === 'other'
    ? props.otherAmount
    : props.selectedAmounts[props.contributionType].value);

const isNotEmpty: string => boolean = input => input.trim() !== '';
const isValidEmail: string => boolean = input => new RegExp(emailRegexPattern).test(input);
const isLargerOrEqual: (number, string) => boolean = (min, input) => min <= parseFloat(input);
const isSmallerOrEqual: (number, string) => boolean = (max, input) => parseFloat(input) <= max;

const checkFirstName: string => boolean = isNotEmpty;
const checkLastName: string => boolean = isNotEmpty;
const checkEmail: string => boolean = input => isNotEmpty(input) && isValidEmail(input);

// ----- Event handlers ----- //

function onSubmit(props: PropTypes): Event => void {
  return (event) => {
    props.setCheckoutFormHasBeenSubmitted();
    event.preventDefault();
    if (!(event.target: any).checkValidity()) {
      return;
    }
    const amount = getAmount(props);
    const { email } = props;

    if (props.paymentHandler) {
      switch (props.paymentMethod) {
        case 'DebitCard':
          // TODO
          break;

        case 'PayPal':
          // TODO
          break;

        case 'Stripe':
        default:
          if (props.paymentHandler.Stripe) {
            openDialogBox(props.paymentHandler.Stripe, amount, email);
          }
          break;
      }
    }
  };
}

// ----- Render ----- //

function ContributionForm(props: PropTypes) {
  const {
    countryGroupId,
    selectedCountryGroupDetails,
    thankYouRoute,
    firstName,
    lastName,
    email,
    state,
    checkoutFormHasBeenSubmitted,
  } = props;

  const paymentCallback = (token: Token) => {
    props.onWaiting(true);
    props.onThirdPartyPaymentDone(token);
  };

  const checkOtherAmount: string => boolean = input =>
    isNotEmpty(input)
    && isLargerOrEqual(config[props.countryGroupId][props.contributionType].min, input)
    && isSmallerOrEqual(config[props.countryGroupId][props.contributionType].max, input);

  return props.done ?
    <Redirect to={thankYouRoute} />
    : (
      <div className="gu-content__content">
        <h1>{countryGroupSpecificDetails[countryGroupId].headerCopy}</h1>
        <p className="blurb">{countryGroupSpecificDetails[countryGroupId].contributeCopy}</p>
        <PaymentFailureMessage checkoutFailureReason={props.error} />
        <form onSubmit={onSubmit(props)} className={classNameWithModifiers('form', ['contribution'])} noValidate>
          <NewContributionType />
          <NewContributionAmount
            countryGroupDetails={selectedCountryGroupDetails}
            checkOtherAmount={checkOtherAmount}
          />
          <NewContributionTextInput
            id="contributionFirstName"
            name="contribution-fname"
            label="First name"
            value={firstName}
            icon={<SvgUser />}
            autoComplete="given-name"
            autoCapitalize="words"
            onInput={props.updateFirstName}
            isValid={checkFirstName(firstName)}
            checkoutFormHasBeenSubmitted={checkoutFormHasBeenSubmitted}
            errorMessage="Please provide your first name"
            required
          />
          <NewContributionTextInput
            id="contributionLastName"
            name="contribution-lname"
            label="Last name"
            value={lastName}
            icon={<SvgUser />}
            autoComplete="family-name"
            autoCapitalize="words"
            onInput={props.updateLastName}
            isValid={checkLastName(lastName)}
            checkoutFormHasBeenSubmitted={checkoutFormHasBeenSubmitted}
            errorMessage="Please provide your last name"
            required
          />
          <NewContributionTextInput
            id="contributionEmail"
            name="contribution-email"
            label="Email address"
            value={email}
            type="email"
            autoComplete="email"
            placeholder="example@domain.com"
            icon={<SvgEnvelope />}
            onInput={props.updateEmail}
            isValid={checkEmail(email)}
            checkoutFormHasBeenSubmitted={checkoutFormHasBeenSubmitted}
            errorMessage="Please provide a valid email address"
            required
          />
          <NewContributionState onChange={props.updateState} value={state} />
          <NewContributionPayment paymentCallback={paymentCallback} />
          <NewContributionSubmit />
          {props.isWaiting ? <ProgressMessage message={['Processing transaction', 'Please wait']} /> : null}
        </form>
      </div>
    );
}

ContributionForm.defaultProps = {
  error: null,
};

const NewContributionForm = connect(mapStateToProps, mapDispatchToProps)(ContributionForm);

export { NewContributionForm };
