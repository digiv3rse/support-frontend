// @flow

// ----- Imports ----- //

import type { CheckoutFailureReason } from 'helpers/checkoutErrors';
import { combineReducers } from 'redux';
import { amounts, type Amount, type Contrib, type PaymentMethod, type ThirdPartyPaymentLibraries } from 'helpers/contributions';
import csrf from 'helpers/csrf/csrfReducer';
import sessionId from 'helpers/sessionId/reducer';
import { type CommonState } from 'helpers/page/page';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { type UsState, type CaState } from 'helpers/internationalisation/country';
import { createUserReducer, type User as UserState } from 'helpers/user/userReducer';
import type { DirectDebitState } from 'components/directDebit/directDebitReducer';
import { directDebitReducer as directDebit } from 'components/directDebit/directDebitReducer';
import { type Csrf as CsrfState } from 'helpers/csrf/csrfReducer';
import { type SessionId as SessionIdState } from 'helpers/sessionId/reducer';
import * as storage from 'helpers/storage';

import { type Action } from './contributionsLandingActions';
import type { State as MarketingConsentState } from '../../components/marketingConsent/marketingConsentReducer';
import { marketingConsentReducerFor } from '../../components/marketingConsent/marketingConsentReducer';

// ----- Types ----- //

export type UserFormData = {
  firstName: string | null,
  lastName: string | null,
  email: string | null,
}

export type ThankYouPageStageMap<T> = {
  thankYouSetPassword: T,
  thankYou: T,
  thankYouPasswordSet: T,
  thankYouPasswordDeclinedToSet: T,
}

export type ThankYouPageStage = $Keys<ThankYouPageStageMap<null>>

type FormData = UserFormData & {
  otherAmounts: {
    [Contrib]: { amount: string | null }
  },
  state: UsState | CaState | null,
  checkoutFormHasBeenSubmitted: boolean,
};

type SetPasswordData = {
  password: string,
  passwordHasBeenSubmitted: boolean,
  passwordError: boolean,
}

type FormState = {
  contributionType: Contrib,
  paymentMethod: PaymentMethod,
  thirdPartyPaymentLibraries: ThirdPartyPaymentLibraries,
  selectedAmounts: { [Contrib]: Amount | 'other' },
  isWaiting: boolean,
  formData: FormData,
  setPasswordData: SetPasswordData,
  paymentComplete: boolean,
  paymentError: CheckoutFailureReason | null,
  guestAccountCreationToken: ?string,
  thankYouPageStage: ThankYouPageStage,
  hasSeenDirectDebitThankYouPageCopy: boolean,
  payPalHasLoaded: boolean,
};

type PageState = {
  form: FormState,
  user: UserState,
  csrf: CsrfState,
  directDebit: DirectDebitState,
  sessionId: SessionIdState,
  marketingConsent: MarketingConsentState,
};

export type State = {
  common: CommonState,
  page: PageState,
};

// ----- Functions ----- //

function createFormReducer(countryGroupId: CountryGroupId) {
  const amountsForCountry: { [Contrib]: Amount[] } = {
    ONE_OFF: amounts('notintest').ONE_OFF[countryGroupId],
    MONTHLY: amounts('notintest').MONTHLY[countryGroupId],
    ANNUAL: amounts('notintest').ANNUAL[countryGroupId],
  };

  const initialAmount: { [Contrib]: Amount | 'other' } = {
    ONE_OFF: amountsForCountry.ONE_OFF.find(amount => amount.isDefault) || amountsForCountry.ONE_OFF[0],
    MONTHLY: amountsForCountry.MONTHLY.find(amount => amount.isDefault) || amountsForCountry.MONTHLY[0],
    ANNUAL: amountsForCountry.ANNUAL.find(amount => amount.isDefault) || amountsForCountry.ANNUAL[0],
  };

  // ----- Initial state ----- //

  const initialState: FormState = {
    contributionType: 'MONTHLY',
    paymentMethod: 'None',
    thirdPartyPaymentLibraries: {
      ONE_OFF: {
        Stripe: {},
      },
      MONTHLY: {
        Stripe: {},
        PayPal: {},
      },
      ANNUAL: {
        Stripe: {},
        PayPal: {},
      },
    },
    formData: {
      firstName: null,
      lastName: null,
      email: storage.getSession('email') || null,
      otherAmounts: {
        ONE_OFF: { amount: null },
        MONTHLY: { amount: null },
        ANNUAL: { amount: null },
      },
      state: null,
      checkoutFormHasBeenSubmitted: false,
    },
    setPasswordData: {
      password: '',
      passwordHasBeenSubmitted: false,
      passwordError: false,
    },
    showOtherAmount: false,
    selectedAmounts: initialAmount,
    isWaiting: false,
    paymentComplete: false,
    paymentError: null,
    guestAccountCreationToken: null,
    thankYouPageStage: 'thankYou',
    payPalHasLoaded: false,
    hasSeenDirectDebitThankYouPageCopy: false,
  };

  return function formReducer(state: FormState = initialState, action: Action): FormState {
    switch (action.type) {
      case 'UPDATE_CONTRIBUTION_TYPE':
        return {
          ...state,
          contributionType: action.contributionType,
          showOtherAmount: false,
          paymentMethod: action.paymentMethodToSelect,
          formData: { ...state.formData },
        };

      case 'UPDATE_PAYMENT_METHOD':
        return { ...state, paymentMethod: action.paymentMethod };

      case 'UPDATE_PAYMENT_READY':
        return {
          ...state,
          thirdPartyPaymentLibraries: {
            ONE_OFF: {
              ...state.thirdPartyPaymentLibraries.ONE_OFF,
              ...action.thirdPartyPaymentLibraryByContrib.ONE_OFF,
            },
            MONTHLY: {
              ...state.thirdPartyPaymentLibraries.MONTHLY,
              ...action.thirdPartyPaymentLibraryByContrib.MONTHLY,
            },
            ANNUAL: {
              ...state.thirdPartyPaymentLibraries.ANNUAL,
              ...action.thirdPartyPaymentLibraryByContrib.ANNUAL,
            },
          },
        };

      case 'UPDATE_FIRST_NAME':
        return { ...state, formData: { ...state.formData, firstName: action.firstName } };

      case 'UPDATE_LAST_NAME':
        return { ...state, formData: { ...state.formData, lastName: action.lastName } };

      case 'UPDATE_EMAIL':
        return { ...state, formData: { ...state.formData, email: action.email } };

      case 'UPDATE_PASSWORD':
        return { ...state, setPasswordData: { ...state.setPasswordData, password: action.password } };

      case 'SET_PASSWORD_HAS_BEEN_SUBMITTED':
        return { ...state, setPasswordData: { ...state.setPasswordData, passwordHasBeenSubmitted: true } };

      case 'SET_PASSWORD_ERROR':
        return { ...state, setPasswordData: { ...state.setPasswordData, passwordError: action.passwordError } };

      case 'UPDATE_STATE':
        return { ...state, formData: { ...state.formData, state: action.state } };

      case 'UPDATE_USER_FORM_DATA':
        return { ...state, formData: { ...state.formData, ...action.userFormData } };

      case 'SET_PAYPAL_HAS_LOADED':
        return { ...state, payPalHasLoaded: true };


      case 'SELECT_AMOUNT':
        return {
          ...state,
          selectedAmounts: { ...state.selectedAmounts, [action.contributionType]: action.amount },
        };

      case 'UPDATE_OTHER_AMOUNT':
        return {
          ...state,
          formData: {
            ...state.formData,
            otherAmounts: {
              ...state.formData.otherAmounts,
              [state.contributionType]: {
                amount: action.otherAmount,
              },
            },
          },
        };

      case 'PAYMENT_FAILURE':
        return { ...state, paymentComplete: false, paymentError: action.paymentError };

      case 'PAYMENT_WAITING':
        return { ...state, paymentComplete: false, isWaiting: action.isWaiting };

      case 'PAYMENT_SUCCESS':
        return { ...state, paymentComplete: true };

      case 'SET_CHECKOUT_FORM_HAS_BEEN_SUBMITTED':
        return { ...state, formData: { ...state.formData, checkoutFormHasBeenSubmitted: true } };

      case 'SET_HAS_SEEN_DIRECT_DEBIT_THANK_YOU_COPY':
        return { ...state, hasSeenDirectDebitThankYouPageCopy: true };

      case 'SET_GUEST_ACCOUNT_CREATION_TOKEN':
        return { ...state, guestAccountCreationToken: action.guestAccountCreationToken };

      // Don't allow the stage to be set to thankYouSetPassword unless both an email and
      // guest registration token is present
      case 'SET_THANK_YOU_PAGE_STAGE':
        if ((action.thankYouPageStage === 'thankYouSetPassword')
          && (!state.guestAccountCreationToken || !state.formData.email)) {
          return { ...state, thankYouPageStage: 'thankYou' };
        }
        return { ...state, thankYouPageStage: action.thankYouPageStage };

      default:
        return state;
    }
  };
}

function initReducer(countryGroupId: CountryGroupId) {

  return combineReducers({
    form: createFormReducer(countryGroupId),
    user: createUserReducer(countryGroupId),
    directDebit,
    csrf,
    sessionId,
    marketingConsent: marketingConsentReducerFor('MARKETING_CONSENT'),
  });
}


// ----- Reducer ----- //

export { initReducer };
