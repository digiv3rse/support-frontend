// @flow
import React from 'react';
import type { Element } from 'react';

// helpers
import { getDigitalCheckout } from 'helpers/externalLinks';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';
import { currencies } from 'helpers/internationalisation/currency';
import { countryGroups } from 'helpers/internationalisation/countryGroup';
import { type State } from 'pages/digital-subscription-landing/digitalSubscriptionLandingReducer';
import type { BillingPeriod } from 'helpers/billingPeriods';
import { Annual, Monthly } from 'helpers/billingPeriods';
import { type Option } from 'helpers/types/option';
import { fixDecimals } from 'helpers/subscriptions';

const getProductOptions = (productPrices, countryGroupId) => (
  productPrices[countryGroups[countryGroupId].name].NoFulfilmentOptions.NoProductOptions
);

const getCurrencySymbol = currencyId => currencies[currencyId].glyph;

const getDisplayPrice = (currencyId, price) => getCurrencySymbol(currencyId) + fixDecimals(price);

const getProductPrice = (productOptions, billingPeriodTitle, currencyId) => (
  productOptions[billingPeriodTitle][currencyId].price
);

const getSavingPercentage = (annualCost, annualizedMonthlyCost) => `${Math.round((1 - (annualCost / annualizedMonthlyCost)) * 100)}%`;

const BILLING_PERIOD = {
  [Monthly]: {
    title: 'Monthly',
    singlePeriod: 'month',
    salesCopy: (displayPrice: string, saving?: string) => (
      <span>14 day free trial, then
        &nbsp;<strong>{displayPrice}</strong> a month for 12 months {saving && null}
        <br className="product-option__full-screen-break" />
      </span>
    ),
  },
  [Annual]: {
    title: 'Annually',
    singlePeriod: 'year',
    salesCopy: (displayPrice: string, saving?: string) => (
      <span>
        14 day free trial, then <strong>{displayPrice}</strong>
        &nbsp;for the first year<br />
        (save <strong>{saving}</strong> per year)
      </span>
    ),
  },
};

export type PaymentOption = {
  title: string,
  singlePeriod: string,
  href: string,
  salesCopy: Element<'span'>,
  offer: Option<string>,
  price: Option<string>,
  onClick: Function,
}

// state
const mapStateToProps = (state: State): { paymentOptions: Array<PaymentOption> } => {
  const { productPrices } = state.page;
  const { countryGroupId, currencyId } = state.common.internationalisation;

  /*
  * NoFulfilmentOptions - means there this nothing to be delivered
  * NoProductOptions   - means there is only one product to choose
  */
  const productOptions = getProductOptions(productPrices, countryGroupId);
  const annualizedMonthlyCost = getProductPrice(productOptions, 'Monthly', currencyId) * 12;
  const annualCost = getProductPrice(productOptions, 'Annual', currencyId);
  const saving = getDisplayPrice(currencyId, annualizedMonthlyCost - annualCost);
  const offer = getSavingPercentage(annualCost, annualizedMonthlyCost);

  const paymentOptions: Array<PaymentOption> = Object.keys(productOptions).map((productTitle: BillingPeriod) => {

    const billingPeriodTitle = productTitle === 'Monthly' || productTitle === 'Annual' ? productTitle : 'Monthly';
    const displayPrice = getDisplayPrice(currencyId, getProductPrice(productOptions, billingPeriodTitle, currencyId));

    return {
      title: BILLING_PERIOD[billingPeriodTitle].title,
      singlePeriod: BILLING_PERIOD[billingPeriodTitle].singlePeriod,
      price: displayPrice,
      href: getDigitalCheckout(countryGroupId, billingPeriodTitle),
      onClick: sendTrackingEventsOnClick('subscribe_now_cta', 'DigitalPack', null, billingPeriodTitle),
      salesCopy: BILLING_PERIOD[billingPeriodTitle].salesCopy(displayPrice, saving),
      offer,
    };

  });

  return {
    paymentOptions,
  };
};

export {
  mapStateToProps,
};
