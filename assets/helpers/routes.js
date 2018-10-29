// @flow

// ----- Routes ----- //

import type { CountryGroupId } from './internationalisation/countryGroup';
import { countryGroups } from './internationalisation/countryGroup';
import { getOrigin } from './url';

const routes: {
  [string]: string,
} = {
  recurringContribCheckout: '/contribute/recurring',
  recurringContribCheckoutGuest: '/contribute/recurring-guest',
  recurringContribThankyou: '/contribute/recurring/thankyou',
  recurringContribCreate: '/contribute/recurring/create',
  recurringContribPending: '/contribute/recurring/pending',
  contributionsSendMarketing: '/contribute/send-marketing',
  contributionsSetPasswordGuest: '/identity/set-password-guest',
  getUserType: '/identity/get-user-type',
  oneOffContribCheckout: '/contribute/one-off',
  oneOffContribThankyou: '/contribute/one-off/thankyou',
  oneOffContribAutofill: '/contribute/one-off/autofill',
  contributionsMarketingConfirm: '/contribute/marketing-confirm',
  payPalSetupPayment: '/paypal/setup-payment',
  payPalCreateAgreement: '/paypal/create-agreement',
  directDebitCheckAccount: '/direct-debit/check-account',
  payPalRestReturnURL: '/paypal/rest/return',
};

function payPalCancelUrl(cgId: CountryGroupId): string {
  return `${getOrigin()}/${countryGroups[cgId].supportInternationalisationId}/contribute`;
}

function payPalReturnUrl(cgId: CountryGroupId): string {
  return `${getOrigin()}/${countryGroups[cgId].supportInternationalisationId}/paypal/rest/return.new`;
}

// ----- Exports ----- //

export { routes, payPalCancelUrl, payPalReturnUrl };
