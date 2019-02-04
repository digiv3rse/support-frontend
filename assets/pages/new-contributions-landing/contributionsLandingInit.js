// @flow

// ----- Imports ----- //
import { type Store } from 'redux';
import { type PaymentAuthorisation } from 'helpers/paymentIntegrations/newPaymentFlow/readerRevenueApis';
import { loadPayPalRecurring } from 'helpers/paymentIntegrations/newPaymentFlow/payPalRecurringCheckout';
import {
  loadStripe,
  setupStripeCheckout,
  type StripeAccount,
} from 'helpers/paymentIntegrations/newPaymentFlow/stripeCheckout';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { Switches } from 'helpers/settings';
import {
  getContributionTypeFromSessionOrElse,
  getContributionTypeFromUrlOrElse,
  getPaymentMethodFromSession,
  getValidContributionTypes,
  getValidPaymentMethods,
  type ThirdPartyPaymentLibrary,
} from 'helpers/checkouts';
import type { Participations } from 'helpers/abTests/abtest';
import { type ContributionType, type PaymentMethod } from 'helpers/contributions';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import {
  type Action,
  checkIfEmailHasPassword,
  onThirdPartyPaymentAuthorised,
  paymentWaiting,
  selectAmount,
  setPayPalHasLoaded,
  setThirdPartyPaymentLibrary,
  updateContributionTypeAndPaymentMethod,
  updateUserFormData,
} from './contributionsLandingActions';
import { type State } from './contributionsLandingReducer';

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

function getInitialContributionType(): ContributionType {
  const contributionType = getContributionTypeFromUrlOrElse(getContributionTypeFromSessionOrElse('ANNUAL'));

  return (
    // make sure we don't select a contribution type which isn't on the page
    getValidContributionTypes().includes(contributionType)
      ? contributionType
      : getValidContributionTypes()[0]
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
  const { countryId, currencyId } = state.common.internationalisation;
  const { switches } = state.common.settings;
  const { isTestUser } = state.page.user;

  const onPaymentAuthorisation = (paymentAuthorisation: PaymentAuthorisation) => {
    dispatch(paymentWaiting(true));
    dispatch(onThirdPartyPaymentAuthorised(paymentAuthorisation));
  };

  loadStripe().then(() => {
    ['ONE_OFF', 'ANNUAL', 'MONTHLY'].forEach((contribType) => {
      const validPayments = getValidPaymentMethods(contribType, switches, countryId);
      if (validPayments.includes('Stripe')) {
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

  loadPayPalRecurring().then(() => dispatch(setPayPalHasLoaded()));
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
  const { switches } = state.common.settings;
  const contributionType = getInitialContributionType();
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
