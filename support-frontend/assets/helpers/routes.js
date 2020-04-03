// @flow

// ----- Routes ----- //

import type { CountryGroupId } from './internationalisation/countryGroup';
import { countryGroups } from './internationalisation/countryGroup';
import { getOrigin, isProd } from './url';
import type { FulfilmentOptions } from 'helpers/productPrice/fulfilmentOptions';
import type { ProductOptions } from 'helpers/productPrice/productOptions';
import { type Option } from 'helpers/types/option';

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
  subscriptionCreate: '/subscribe/create',
  showcase: '/support',
  subscriptionsLanding: '/subscribe',
  digitalSubscriptionLanding: '/subscribe/digital',
  paperSubscriptionLanding: '/subscribe/paper',
  paperSubscriptionProductChoices: '/subscribe/paper#subscribe',
  guardianWeeklySubscriptionLanding: '/subscribe/weekly',
  guardianWeeklySubscriptionLandingGift: '/subscribe/weekly/gift',
  postcodeLookup: '/postcode-lookup',
  createSignInUrl: '/identity/signin-url',
  stripeSetupIntent: '/stripe/create-setup-intent'
};

const createReminderEndpoint = isProd() ?
  'https://contribution-reminders.support.guardianapis.com/remind-me' : 'https://contribution-reminders-code.support.guardianapis.com/remind-me';

const countryPath = (countryGroupId: CountryGroupId) =>
  countryGroups[countryGroupId].supportInternationalisationId;

function postcodeLookupUrl(postcode: string): string {
  return `${getOrigin() + routes.postcodeLookup}/${postcode}`;
}

function paperSubsUrl(withDelivery: boolean = false): string {
  return [getOrigin(), 'uk/subscribe/paper', ...(withDelivery ? ['delivery'] : [])].join('/');
}

function digitalSubscriptionLanding(countryGroupId: CountryGroupId) {
  return `${getOrigin()}/${countryPath(countryGroupId)}${routes.digitalSubscriptionLanding}`;
}

function guardianWeeklyLanding(countryGroupId: CountryGroupId, gift: boolean) {
  return `${getOrigin()}/${countryPath(countryGroupId)}${gift ? routes.guardianWeeklySubscriptionLandingGift : routes.guardianWeeklySubscriptionLanding}`;
}

const promotionTermsUrl = (promoCode: string) => `${getOrigin()}/p/${promoCode}/terms`;

function paperCheckoutUrl(
  fulfilmentOption: FulfilmentOptions,
  productOptions: ProductOptions,
  promoCode?: Option<string>,
) {
  return promoCode ?
    `${getOrigin()}/subscribe/paper/checkout?fulfilment=${fulfilmentOption}&product=${productOptions}&promoCode=${promoCode}`
    : `${getOrigin()}/subscribe/paper/checkout?fulfilment=${fulfilmentOption}&product=${productOptions}`;
}

// If the user cancels before completing the payment flow, send them back to the contribute page.
function payPalCancelUrl(cgId: CountryGroupId): string {
  return `${getOrigin()}/${countryPath(cgId)}/contribute`;
}

function payPalReturnUrl(cgId: CountryGroupId, email: string): string {
  return `${getOrigin()}/${countryPath(cgId)}/paypal/rest/return?email=${encodeURIComponent(email)}`;
}

// ----- Exports ----- //

export {
  routes,
  createReminderEndpoint,
  postcodeLookupUrl,
  payPalCancelUrl,
  payPalReturnUrl,
  paperSubsUrl,
  paperCheckoutUrl,
  digitalSubscriptionLanding,
  guardianWeeklyLanding,
  promotionTermsUrl,
};
