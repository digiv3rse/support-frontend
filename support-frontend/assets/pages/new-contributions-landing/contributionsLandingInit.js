// @flow

// ----- Imports ----- //
import { type Store } from 'redux';
import { type PaymentAuthorisation } from 'helpers/paymentIntegrations/readerRevenueApis';
import { loadPayPalRecurring } from 'helpers/paymentIntegrations/payPalRecurringCheckout';
import { setPayPalHasLoaded } from 'helpers/paymentIntegrations/payPalActions';
import {
  loadStripe,
  setupStripeCheckout,
  type StripeAccount,
} from 'helpers/paymentIntegrations/stripeCheckout';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { Switches } from 'helpers/settings';
import { getQueryParameter } from 'helpers/url';
import {
  getContributionTypeFromSessionOrElse,
  getContributionTypeFromUrlOrElse,
  getPaymentMethodFromSession,
  getValidContributionTypes,
  getValidPaymentMethods,
  type ThirdPartyPaymentLibrary,
} from 'helpers/checkouts';
import { type ContributionType } from 'helpers/contributions';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import {
  type Action,
  checkIfEmailHasPassword,
  onThirdPartyPaymentAuthorised,
  paymentWaiting,
  selectAmount,
  setThirdPartyPaymentLibrary,
  updateContributionTypeAndPaymentMethod, updatePaymentMethod, updateSelectedExistingPaymentMethod,
  updateUserFormData,
} from './contributionsLandingActions';
import { type State } from './contributionsLandingReducer';
import type { PaymentMethod } from 'helpers/paymentMethods';
import { Stripe } from 'helpers/paymentMethods';
import {
  isFullDetailExistingPaymentMethod,
  mapExistingPaymentMethodToPaymentMethod, sendGetExistingPaymentMethodsRequest,
} from 'helpers/existingPaymentMethods/existingPaymentMethods';
import type { ExistingPaymentMethod } from 'helpers/existingPaymentMethods/existingPaymentMethods';
import { setExistingPaymentMethods } from 'helpers/page/commonActions';
import { doesUserAppearToBeSignedIn } from 'helpers/user/user';
import { isSwitchOn } from 'helpers/globals';
import type { ContributionTypes } from 'helpers/contributions';

// ----- Functions ----- //

function getInitialPaymentMethod(
  contributionType: ContributionType,
  countryId: IsoCountry,
  switches: Switches,
): PaymentMethod {
  const paymentMethodFromSession = getPaymentMethodFromSession();
  const validPaymentMethods = getValidPaymentMethods(contributionType, switches, countryId);

  return (
    paymentMethodFromSession && validPaymentMethods.includes(getPaymentMethodFromSession())
      ? paymentMethodFromSession
      : validPaymentMethods[0] || 'None'
  );
}

function getInitialContributionType(
  countryGroupId: CountryGroupId,
  contributionTypes: ContributionTypes,
): ContributionType {
  const getDefaultContributionType = () => {
    const defaultContributionType = contributionTypes[countryGroupId].find(ct => ct.isDefault);
    return defaultContributionType ?
      defaultContributionType.contributionType :
      contributionTypes[countryGroupId][0].contributionType;
  };

  const contributionType =
    getContributionTypeFromUrlOrElse(getContributionTypeFromSessionOrElse(getDefaultContributionType()));

  return (
    // make sure we don't select a contribution type which isn't on the page
    contributionTypes[countryGroupId].find(ct => ct.contributionType === contributionType)
      ? contributionType
      : contributionTypes[countryGroupId][0].contributionType
  );
}

const stripeAccountForContributionType: {[ContributionType]: StripeAccount } = {
  ONE_OFF: 'ONE_OFF',
  MONTHLY: 'REGULAR',
  ANNUAL: 'REGULAR',
};


function initialiseStripeCheckout(
  onPaymentAuthorisation: (paymentAuthorisation: PaymentAuthorisation) => void,
  contributionType: ContributionType,
  currencyId: IsoCurrency,
  isTestUser: boolean,
  dispatch: Function,
) {
  const library: ThirdPartyPaymentLibrary =
    setupStripeCheckout(
      onPaymentAuthorisation,
      stripeAccountForContributionType[contributionType],
      currencyId,
      isTestUser,
    );
  dispatch(setThirdPartyPaymentLibrary({ [contributionType]: { Stripe: library } }));
}


function initialisePaymentMethods(state: State, dispatch: Function) {
  const { countryId, currencyId, countryGroupId } = state.common.internationalisation;
  const { switches } = state.common.settings;
  const { isTestUser } = state.page.user;

  const onPaymentAuthorisation = (paymentAuthorisation: PaymentAuthorisation) => {
    dispatch(paymentWaiting(true));
    dispatch(onThirdPartyPaymentAuthorised(paymentAuthorisation));
  };

  const contributionTypes = getValidContributionTypes(countryGroupId);

  if (getQueryParameter('stripe-checkout-js') !== 'no') {
    loadStripe().then(() => {
      contributionTypes.forEach((contribType) => {
        const validPayments = getValidPaymentMethods(contribType, switches, countryId);
        if (validPayments.includes(Stripe)) {
          initialiseStripeCheckout(
            onPaymentAuthorisation,
            contribType,
            currencyId,
            !!isTestUser,
            dispatch,
          );
        }
      });
    });

    // initiate fetch of existing payment methods
    const userAppearsLoggedIn = doesUserAppearToBeSignedIn();
    const existingDirectDebitON = isSwitchOn('recurringPaymentMethods.existingDirectDebit');
    const existingCardON = isSwitchOn('recurringPaymentMethods.existingCard');
    const existingPaymentsEnabledViaUrlParam = getQueryParameter('displayExistingPaymentOptions') === 'true';
    if (userAppearsLoggedIn && (existingCardON || existingDirectDebitON) && existingPaymentsEnabledViaUrlParam) {
      sendGetExistingPaymentMethodsRequest(
        currencyId,
        (allExistingPaymentMethods: ExistingPaymentMethod[]) => {
          const filteredExistingPaymentMethods = allExistingPaymentMethods.filter(existingPaymentMethod => (
            (existingPaymentMethod.paymentType === 'Card' && existingCardON) ||
            (existingPaymentMethod.paymentType === 'DirectDebit' && existingDirectDebitON)
          ));
          dispatch(setExistingPaymentMethods(filteredExistingPaymentMethods));
          const firstExistingPaymentMethod = (filteredExistingPaymentMethods[0]: any);
          if (firstExistingPaymentMethod && isFullDetailExistingPaymentMethod(firstExistingPaymentMethod)) {
            dispatch(updatePaymentMethod(mapExistingPaymentMethodToPaymentMethod(firstExistingPaymentMethod)));
            dispatch(updateSelectedExistingPaymentMethod(firstExistingPaymentMethod));
          }
        },
      );
    } else {
      dispatch(setExistingPaymentMethods([]));
    }
  }

  const recurringContributionsAvailable = contributionTypes.includes('MONTHLY')
    || contributionTypes.includes('ANNUAL');

  if (getQueryParameter('paypal-js') !== 'no' && recurringContributionsAvailable) {
    loadPayPalRecurring().then(() => dispatch(setPayPalHasLoaded()));
  }
}

function selectInitialAmounts(state: State, dispatch: Function) {
  const { amounts } = state.common.settings;
  const { countryGroupId } = state.common.internationalisation;

  Object.keys(amounts[countryGroupId]).forEach((contributionType) => {
    const defaultAmount =
      amounts[countryGroupId][contributionType].find(amount => amount.isDefault) ||
      amounts[countryGroupId][contributionType][0];

    dispatch(selectAmount(defaultAmount, contributionType));
  });
}

function selectInitialContributionTypeAndPaymentMethod(state: State, dispatch: Function) {
  const { countryId } = state.common.internationalisation;
  const { switches, contributionTypes } = state.common.settings;
  const { countryGroupId } = state.common.internationalisation;
  const contributionType = getInitialContributionType(countryGroupId, contributionTypes);
  const paymentMethod = getInitialPaymentMethod(contributionType, countryId, switches);
  dispatch(updateContributionTypeAndPaymentMethod(contributionType, paymentMethod));
}

const init = (store: Store<State, Action, Function>) => {
  const { dispatch } = store;

  const state = store.getState();

  initialisePaymentMethods(state, dispatch);

  selectInitialAmounts(state, dispatch);
  selectInitialContributionTypeAndPaymentMethod(state, dispatch);

  const {
    firstName,
    lastName,
    email,
  } = state.page.user;

  dispatch(checkIfEmailHasPassword(email));
  dispatch(updateUserFormData({ firstName, lastName, email }));

};


// ----- Exports ----- //

export { init };
