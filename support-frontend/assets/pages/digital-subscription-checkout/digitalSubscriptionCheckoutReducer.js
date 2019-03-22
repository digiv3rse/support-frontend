// @flow

// ----- Imports ----- //

import { combineReducers, type Dispatch } from 'redux';

import { type ReduxState } from 'helpers/page/page';
import { type Option } from 'helpers/types/option';
import { type DigitalBillingPeriod, Monthly } from 'helpers/billingPeriods';
import { getQueryParameter } from 'helpers/url';
import csrf, { type Csrf as CsrfState } from 'helpers/csrf/csrfReducer';
import {
  type IsoCountry,
  type StateProvince,
  stateProvinceFromString,
} from 'helpers/internationalisation/country';
import { GBPCountries } from 'helpers/internationalisation/countryGroup';
import { type FormError } from 'helpers/subscriptionsForms/validation';
import { directDebitReducer as directDebit } from 'components/directDebit/directDebitReducer';
import {
  marketingConsentReducerFor,
  type State as MarketingConsentState,
} from 'components/marketingConsent/marketingConsentReducer';
import { isTestUser } from 'helpers/user/user';
import type { ErrorReason } from 'helpers/errorReasons';
import { createUserReducer } from 'helpers/user/userReducer';
import { fromCountry } from 'helpers/internationalisation/countryGroup';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import { validateForm } from 'pages/digital-subscription-checkout/helpers/validation';
import type { Action } from './digitalSubscriptionCheckoutActions';
import { getUser } from './helpers/user';
import { showPaymentMethod, countrySupportsDirectDebit } from './helpers/paymentProviders';
import type { PaymentMethod } from 'helpers/paymentMethods';
import { DirectDebit, Stripe } from 'helpers/paymentMethods';

// ----- Types ----- //

export type Stage = 'checkout' | 'thankyou' | 'thankyou-pending';

export type FormFieldsInState = {|
  firstName: string,
  lastName: string,
  addressLine1: string,
  addressLine2: Option<string>,
  townCity: string,
  postcode: string,
  email: string,
  stateProvince: Option<StateProvince>,
  telephone: Option<string>,
  billingPeriod: DigitalBillingPeriod,
  paymentMethod: Option<PaymentMethod>,
|};

export type FormFields = {|
  ...FormFieldsInState,
  country: IsoCountry,
  countrySupportsDirectDebit: boolean,
|};


export type FormField = $Keys<FormFields>;


type CheckoutState = {|
  stage: Stage,
  ...FormFieldsInState,
  email: string,
  formErrors: FormError<FormField>[],
  submissionError: ErrorReason | null,
  formSubmitted: boolean,
  isTestUser: boolean,
  productPrices: ProductPrices,
  payPalHasLoaded: boolean,
|};

export type State = ReduxState<{|
  checkout: CheckoutState,
  csrf: CsrfState,
  marketingConsent: MarketingConsentState,
|}>;

// ----- Selectors ----- //

function getFormFields(state: State): FormFields {
  return {
    firstName: state.page.checkout.firstName,
    email: state.page.checkout.email,
    lastName: state.page.checkout.lastName,
    addressLine1: state.page.checkout.addressLine1,
    addressLine2: state.page.checkout.addressLine2,
    townCity: state.page.checkout.townCity,
    postcode: state.page.checkout.postcode,
    country: state.common.internationalisation.countryId,
    stateProvince: state.page.checkout.stateProvince,
    telephone: state.page.checkout.telephone,
    billingPeriod: state.page.checkout.billingPeriod,
    paymentMethod: state.page.checkout.paymentMethod,
    countrySupportsDirectDebit: countrySupportsDirectDebit(state.common.internationalisation.countryId),
  };
}

function getEmail(state: State): string {
  return state.page.checkout.email;
}

// ----- Functions ----- //

function submitForm(dispatch: Dispatch<Action>, state: State) {
  if (validateForm(dispatch, state)) {
    showPaymentMethod(dispatch, state);
  }
}

// ----- Reducer ----- //

function initReducer(initialCountry: IsoCountry) {
  const billingPeriodInUrl = getQueryParameter('period');
  const user = getUser(); // TODO: this is unnecessary, it should use the user reducer
  const initialBillingPeriod: DigitalBillingPeriod = billingPeriodInUrl === 'Monthly' || billingPeriodInUrl === 'Annual'
    ? billingPeriodInUrl
    : Monthly;
  const { productPrices } = window.guardian;

  const initialState = {
    stage: 'checkout',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    addressLine1: '',
    addressLine2: null,
    townCity: '',
    postcode: '',
    stateProvince: null,
    telephone: null,
    billingPeriod: initialBillingPeriod,
    paymentMethod: countrySupportsDirectDebit(initialCountry) ? DirectDebit : Stripe,
    formErrors: [],
    submissionError: null,
    formSubmitted: false,
    isTestUser: isTestUser(),
    productPrices,
    payPalHasLoaded: false,
  };

  function reducer(state: CheckoutState = initialState, action: Action): CheckoutState {

    switch (action.type) {

      case 'SET_STAGE':
        return { ...state, stage: action.stage };

      case 'SET_FIRST_NAME':
        return { ...state, firstName: action.firstName };

      case 'SET_LAST_NAME':
        return { ...state, lastName: action.lastName };

      case 'SET_ADDRESS_LINE_1':
        return { ...state, addressLine1: action.addressLine1 };

      case 'SET_ADDRESS_LINE_2':
        return { ...state, addressLine2: action.addressLine2 };

      case 'SET_TOWN_CITY':
        return { ...state, townCity: action.townCity };

      case 'SET_POSTCODE':
        return { ...state, postcode: action.postcode };

      case 'SET_TELEPHONE':
        return { ...state, telephone: action.telephone };

      case 'SET_STATE_PROVINCE':
        return { ...state, stateProvince: stateProvinceFromString(action.country, action.stateProvince) };

      case 'SET_BILLING_PERIOD':
        return { ...state, billingPeriod: action.billingPeriod };

      case 'SET_PAYMENT_METHOD':
        return {
          ...state,
          paymentMethod: action.paymentMethod,
        };

      case 'SET_COUNTRY_CHANGED':
        return {
          ...state,
          stateProvince: null,
          paymentMethod: countrySupportsDirectDebit(action.country) ? DirectDebit : Stripe,
        };

      case 'SET_FORM_ERRORS':
        return { ...state, formErrors: action.errors };

      case 'SET_SUBMISSION_ERROR':
        return { ...state, submissionError: action.error, formSubmitted: false };

      case 'SET_FORM_SUBMITTED':
        return { ...state, formSubmitted: action.formSubmitted };

      case 'SET_PAYPAL_HAS_LOADED':
        return { ...state, payPalHasLoaded: true };

      default:
        return state;
    }
  }

  return combineReducers({
    checkout: reducer,
    user: createUserReducer(fromCountry(initialCountry) || GBPCountries),
    directDebit,
    csrf,
    marketingConsent: marketingConsentReducerFor('MARKETING_CONSENT'),
  });
}


// ----- Export ----- //

export {
  initReducer,
  getFormFields,
  getEmail,
  submitForm,
};
