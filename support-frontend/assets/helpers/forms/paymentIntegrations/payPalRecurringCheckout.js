// @flow

// ----- Imports ----- //

import { logException } from 'helpers/utilities/logger';
import { routes } from 'helpers/urls/routes';
import type { Csrf as CsrfState } from 'helpers/csrf/csrfReducer';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import * as storage from 'helpers/storage/storage';
import type { BillingPeriod } from 'helpers/productPrice/billingPeriods';
import { setPayPalHasLoaded } from 'helpers/forms/paymentIntegrations/payPalActions';
import { PayPal } from 'helpers/forms/paymentMethods';
import { billingPeriodFromContrib, getAmount } from '../../contributions';
import type { Csrf } from '../../csrf/csrfReducer';
import type { State } from 'pages/contributions-landing/contributionsLandingReducer';
import { type Action } from 'pages/contributions-landing/contributionsLandingActions';


export type SetupPayPalRequestType = (
  resolve: string => void,
  reject: Error => void,
  IsoCurrency, CsrfState,
  amount: number,
  billingPeriod: BillingPeriod,
) => void

// ----- Functions ----- //

function loadPayPalRecurring(): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.src = 'https://www.paypalobjects.com/api/checkout.js';
    if (document.head) {
      document.head.appendChild(script);
    }
  });
}

const showPayPal = (dispatch: Function) => {
  loadPayPalRecurring()
    .then(() => {
      dispatch(setPayPalHasLoaded());
    });
};


function payPalRequestData(bodyObj: Object, csrfToken: string) {
  return {
    credentials: 'include',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
    body: JSON.stringify(bodyObj),
  };
}

// This is the recurring PayPal equivalent of the "Create a payment" Step 1 described above.
// It happens when the user clicks the recurring PayPal button,
// before the PayPal popup in which they authorise the payment appears.
// It should probably be called createOneOffPayPalPayment but it's called setupPayment
// on the backend so pending a far-reaching rename, I'll keep the terminology consistent with the backend.
const setupRecurringPayPalPayment = (
  resolve: string => void,
  reject: Error => void,
  currency: IsoCurrency,
  csrf: Csrf,
) =>
  (dispatch: Function, getState: () => State): void => {
    const state = getState();
    const csrfToken = csrf.token;
    const { contributionType } = state.page.form;
    const amount = getAmount(
      state.page.form.selectedAmounts,
      state.page.form.formData.otherAmounts,
      contributionType,
    );
    const billingPeriod = billingPeriodFromContrib(contributionType);
    storage.setSession('selectedPaymentMethod', 'PayPal');
    const requestBody = {
      amount,
      billingPeriod,
      currency,
    };

    fetch(routes.payPalSetupPayment, payPalRequestData(requestBody, csrfToken || ''))
      .then(response => (response.ok ? response.json() : null))
      .then((token: { token: string } | null) => {
        if (token) {
          resolve(token.token);
        } else {
          logException('PayPal token came back blank');
        }
      }).catch((err: Error) => {
        logException(err.message);
        reject(err);
      });
  };

// This is the recurring PayPal Express version of the PayPal checkout.
// It happens when the user clicks the PayPal button, and before the PayPal popup
// appears to allow the user to authorise the payment.
const setupSubscriptionPayPalPayment = (
  resolve: string => void,
  reject: Error => void,
  currency: IsoCurrency,
  csrf: CsrfState,
  amount: number,
  billingPeriod: BillingPeriod,
) =>
  (): void => {
    const csrfToken = csrf.token;
    storage.setSession('selectedPaymentMethod', PayPal);
    const requestBody = {
      amount,
      billingPeriod,
      currency,
    };

    fetch(routes.payPalSetupPayment, payPalRequestData(requestBody, csrfToken || ''))
      .then(response => (response.ok ? response.json() : null))
      .then((token: { token: string } | null) => {
        if (token) {
          resolve(token.token);
        } else {
          logException('PayPal token came back blank');
        }
      }).catch((err: Error) => {
        logException(err.message);
        reject(err);
      });
  };

function setupPayment(
  currencyId: IsoCurrency,
  csrf: CsrfState,
  amount: number,
  billingPeriod: BillingPeriod,
  setupPayPalPayment: SetupPayPalRequestType,
) {
  return (resolve, reject) => {
    setupPayPalPayment(resolve, reject, currencyId, csrf, amount, billingPeriod);
  };
}

function getPayPalEnvironment(isTestUser: boolean): string {
  return isTestUser ? window.guardian.payPalEnvironment.uat : window.guardian.payPalEnvironment.default;
}

function createAgreement(payPalData: Object, csrf: CsrfState) {
  const body = { token: payPalData.paymentToken };
  const csrfToken = csrf.token;

  return fetch(routes.payPalExpressCheckout, payPalRequestData(body, csrfToken || '')) // TODO: Hack! this will break PayPal on the regular checkouts
    .then(response => response.json());
}


function getPayPalOptions(
  currencyId: IsoCurrency,
  csrf: CsrfState,
  onPaymentAuthorisation: string => void,
  canOpen: () => boolean,
  onClick: () => void,
  formClassName: string,
  isTestUser: boolean,
  amount: number,
  billingPeriod: BillingPeriod,
  setupPayPalPayment: SetupPayPalRequestType,
  updatePayPalButtonReady: (boolean) => Action,
): Object {

  function toggleButton(actions): void {
    return canOpen() ? actions.enable() : actions.disable();
  }

  return {
    env: getPayPalEnvironment(isTestUser),

    style: {
      color: 'blue',
      size: 'responsive',
      label: 'pay',
      tagline: false,
      layout: 'horizontal',
      fundingicons: false,
    },

    // Defines whether user sees 'Agree and Continue' or 'Agree and Pay now' in overlay.
    commit: true,

    validate(actions) {

      window.enablePayPalButton = actions.enable;
      window.disablePayPalButton = actions.disable;

      toggleButton(actions);

      updatePayPalButtonReady(true);
    },

    funding: {
      disallowed: [window.paypal.FUNDING.CREDIT],
    },

    onClick,

    // This function is called when user clicks the PayPal button.
    payment: setupPayment(currencyId, csrf, amount, billingPeriod, setupPayPalPayment),

    // This function is called when the user finishes with PayPal interface (approves payment).
    onAuthorize: (data) => {
      createAgreement(data, csrf)
        .then((payPalCheckoutDetails: Object) => {
          onPaymentAuthorisation(payPalCheckoutDetails);
        })
        .catch((err) => {
          logException(err.message);
        });
    },
  };
}


// ----- Exports ----- //

export {
  getPayPalOptions,
  showPayPal,
  loadPayPalRecurring,
  payPalRequestData,
  setupSubscriptionPayPalPayment,
  setupRecurringPayPalPayment,
};
