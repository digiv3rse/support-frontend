// @flow
import React from 'react';
import type { Element } from 'react';

// helpers
import { getDigitalCheckout } from 'helpers/externalLinks';
import { sendTrackingEventsOnClick, sendTrackingEventsOnView } from 'helpers/subscriptions';
import { currencies } from 'helpers/internationalisation/currency';
import { countryGroups } from 'helpers/internationalisation/countryGroup';
import { fixDecimals } from 'helpers/subscriptions';
import { gaEvent } from 'helpers/tracking/googleTagManager';

// types
import {
  type Product,
} from 'components/product/productOption';
import {
  type ProductSmall,
} from 'components/product/productOptionSmall';

import { type BillingPeriod, Annual, Monthly, Quarterly } from 'helpers/billingPeriods';
import { type State } from 'pages/digital-subscription-landing/digitalSubscriptionLandingReducer';
import { type Option } from 'helpers/types/option';
import type {
  ProductPrices,
  BillingPeriods,
  ProductPrice,
} from 'helpers/productPrice/productPrices';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import { getAppliedPromo } from 'helpers/productPrice/promotions';
import { getFirstValidPrice, isNumeric } from 'helpers/productPrice/productPrices';
import { getPriceDescription, getAdverbialSubscriptionDescription } from 'helpers/productPrice/priceDescriptions';

import { type PropTypes } from '../paymentSelection';

export type PaymentOption = {
  title: string,
  href: string,
  salesCopy: Element<'span'>,
  offer: Option<string>,
  onClick: Function,
  label: Option<string>,
}

export const getProductOptions = (productPrices: ProductPrices, countryGroupId: CountryGroupId) => (
  productPrices[countryGroups[countryGroupId].name].NoFulfilmentOptions.NoProductOptions
);

export const getCurrencySymbol = (currencyId: IsoCurrency): string => currencies[currencyId].glyph;

export const getDisplayPrice = (currencyId: IsoCurrency, price: number) =>
  getCurrencySymbol(currencyId) + fixDecimals(price);

export const getProductPrice = (
  productOptions: BillingPeriods,
  billingPeriod: BillingPeriod,
  currencyId: IsoCurrency,
): ProductPrice => (
  productOptions[billingPeriod][currencyId]
);

export const getSavingPercentage = (annualCost: number, monthlyCostAnnualized: number) => `${Math.round((1 - (annualCost / monthlyCostAnnualized)) * 100)}%`;

const BILLING_PERIOD = {
  [Monthly]: {
    title: 'Monthly',
    salesCopy: (currencyId: IsoCurrency, displayPrice: number, promotionalPrice: Option<number>) => {
      const display = price => getDisplayPrice(currencyId, price);
      return promotionalPrice ?
        <span>
          <span className="product-option__price-detail">then {display(displayPrice)} per month</span>
        </span>
        :
        <span>
          <span className="product-option__price-detail">14 day free trial</span>
        </span>;
    },
    offer: '',
    label: '',
  },
  [Annual]: {
    title: 'Annual',
    salesCopy: (currencyId: IsoCurrency, displayPrice: number, promotionalPrice: Option<number>) => {
      const display = price => getDisplayPrice(currencyId, price);
      return isNumeric(promotionalPrice) ?
        <span>
          <span className="product-option__price-detail">then {display(displayPrice)} a year</span>
        </span>
        :
        <span>
          <span className="product-option__price-detail">per month</span>
        </span>;
    },
    offer: 'Save an additional 21%',
    label: 'Best Deal',
  },
};

const BILLING_PERIOD_GIFT = {
  [Quarterly]: {
    title: '3 months',
    salesCopy: () => (
      <span>
        <span className="product-option__price-detail">One-off payment</span>
      </span>),
    offer: '',
    label: '',
  },
  [Annual]: {
    title: '12 months',
    salesCopy: () => (
      <span>
        <span className="product-option__price-detail">One-off payment</span>
      </span>),
    offer: '',
    label: 'Best Deal',
  },
};

const getHeroCtaProps = (
  productPrices: ProductPrices,
  currencyId: IsoCurrency,
  countryGroupId: CountryGroupId,
): ProductSmall[] => {
  const productOptions = getProductOptions(productPrices, countryGroupId);

  const createPaymentOption = (billingPeriod: BillingPeriod): ProductSmall => {
    const digitalBillingPeriod = billingPeriod === 'Monthly' || billingPeriod === 'Annual' ? billingPeriod : 'Monthly';
    const productPrice = getProductPrice(productOptions, billingPeriod, currencyId);
    const promotion = getAppliedPromo(productPrice.promotions);
    const promoCode = promotion ? promotion.promoCode : null;
    const offerCopy = promotion &&
    promotion.landingPage &&
    promotion.landingPage.roundel ? promotion.landingPage.roundel :
      BILLING_PERIOD[digitalBillingPeriod].offer;
    const trackingProperties = {
      id: `subscribe_now_cta_hero-${billingPeriod}`,
      product: 'DigitalPack',
      componentType: 'ACQUISITIONS_BUTTON',
    };

    const onClick = () => {
      gaEvent({
        category: 'click',
        action: 'DigitalPack',
        label: trackingProperties.id,
      });

      sendTrackingEventsOnClick(trackingProperties)();
    };

    return {
      href: getDigitalCheckout(countryGroupId, digitalBillingPeriod, promoCode, false),
      onClick,
      priceCopy: getPriceDescription(productPrice, digitalBillingPeriod, false, false),
      offerCopy,
      buttonCopy: getAdverbialSubscriptionDescription(productPrice, digitalBillingPeriod),
    };
  };

  return Object.keys(productOptions).sort((optA, optB) => {
    if (optA === 'Annual') {
      return 1;
    } else if (optB === 'Annual') {
      return -1;
    }
    return 0;
  }).map(createPaymentOption);
};

// state
const mapStateToProps = (state: State): PropTypes => {
  const { productPrices, orderIsAGift } = state.page;
  const { countryGroupId, currencyId } = state.common.internationalisation;
  const productOptions = getProductOptions(productPrices, countryGroupId);

  const createPaymentOption = (billingPeriod: BillingPeriod): Product => {
    const digitalBillingPeriod = billingPeriod === 'Monthly' || billingPeriod === 'Annual' ? billingPeriod : 'Monthly';
    const digitalBillingPeriodGift = billingPeriod === 'Annual' || billingPeriod === 'Quarterly' ? billingPeriod : 'Quarterly';
    const billingPeriodForHref = orderIsAGift ? digitalBillingPeriodGift : digitalBillingPeriod;
    const productPrice = getProductPrice(productOptions, billingPeriod, currencyId);
    const fullPrice = productPrice.price;
    const promotion = getAppliedPromo(productPrice.promotions);
    const promoCode = promotion ? promotion.promoCode : null;
    const promotionalPrice = promotion && isNumeric(promotion.discountedPrice) ? promotion.discountedPrice : null;
    const offerCopy = promotion &&
    promotion.landingPage &&
    promotion.landingPage.roundel ? promotion.landingPage.roundel :
      BILLING_PERIOD[digitalBillingPeriod].offer;
    const trackingProperties = {
      id: orderIsAGift ? `subscribe_now_cta_gift-${billingPeriod}` : `subscribe_now_cta-${billingPeriod}`,
      product: 'DigitalPack',
      componentType: 'ACQUISITIONS_BUTTON',
    };

    const onClick = () => {
      gaEvent({
        category: 'click',
        action: 'DigitalPack',
        label: trackingProperties.id,
      });

      sendTrackingEventsOnClick(trackingProperties)();
    };

    return orderIsAGift ?
      {
        title: BILLING_PERIOD_GIFT[digitalBillingPeriodGift].title,
        price: getDisplayPrice(currencyId, fullPrice),
        href: getDigitalCheckout(countryGroupId, billingPeriodForHref, promoCode, orderIsAGift),
        onClick,
        onView: sendTrackingEventsOnView(trackingProperties),
        priceCopy: BILLING_PERIOD_GIFT[digitalBillingPeriodGift].salesCopy(),
        offerCopy: '',
        label: BILLING_PERIOD_GIFT[digitalBillingPeriodGift].label,
        buttonCopy: 'Give this gift',
      } :
      {
        title: BILLING_PERIOD[digitalBillingPeriod].title,
        price: getDisplayPrice(currencyId, getFirstValidPrice(promotionalPrice, fullPrice)),
        href: getDigitalCheckout(countryGroupId, billingPeriodForHref, promoCode, orderIsAGift),
        onClick,
        onView: sendTrackingEventsOnView(trackingProperties),
        priceCopy: BILLING_PERIOD[digitalBillingPeriod].salesCopy(currencyId, fullPrice, promotionalPrice),
        offerCopy,
        label: BILLING_PERIOD[digitalBillingPeriod].label,
        buttonCopy: 'Start free trial',
      };

  };
  return {
    paymentOptions: Object.keys(productOptions).map(createPaymentOption),
  };
};

export {
  getHeroCtaProps,
  mapStateToProps,
};
