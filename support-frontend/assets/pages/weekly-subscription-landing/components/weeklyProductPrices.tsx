import React from "react";
import { connect } from "react-redux";
import { billingPeriodTitle, weeklyBillingPeriods, weeklyGiftBillingPeriods, type WeeklyBillingPeriod } from "helpers/billingPeriods";
import { sendTrackingEventsOnClick, sendTrackingEventsOnView } from "helpers/subscriptions";
import { getAppliedPromo } from "helpers/productPrice/promotions";
import Prices, { type PropTypes } from "./content/prices";
import { type State } from "../weeklySubscriptionLandingReducer";
import { getProductPrice, getFirstValidPrice } from "helpers/productPrice/productPrices";
import { getSimplifiedPriceDescription } from "helpers/productPrice/priceDescriptions";
import { getWeeklyFulfilmentOption } from "helpers/productPrice/fulfilmentOptions";
import { getOrigin, getQueryParameter } from "helpers/url";
import { promoQueryParam, type Promotion } from "helpers/productPrice/promotions";
import type { ProductPrice } from "helpers/productPrice/productPrices";
import { currencies } from "helpers/internationalisation/currency";
import { fixDecimals } from "helpers/subscriptions";
import type { IsoCurrency } from "helpers/internationalisation/currency";

const getCheckoutUrl = (billingPeriod: WeeklyBillingPeriod, orderIsGift: boolean): string => {
  const promoCode = getQueryParameter(promoQueryParam);
  const promoQuery = promoCode ? `&${promoQueryParam}=${promoCode}` : '';
  const gift = orderIsGift ? '/gift' : '';
  return `${getOrigin()}/subscribe/weekly/checkout${gift}?period=${billingPeriod.toString()}${promoQuery}`;
};

const getCurrencySymbol = (currencyId: IsoCurrency): string => currencies[currencyId].glyph;

const getPriceWithSymbol = (currencyId: IsoCurrency, price: number) => getCurrencySymbol(currencyId) + fixDecimals(price);

const getPromotionLabel = (promotion: Promotion | null) => {
  if (!promotion || !promotion.discount) {
    return null;
  }

  return `Save ${Math.round(promotion.discount.amount)}%`;
};

const getMainDisplayPrice = (productPrice: ProductPrice, promotion?: Promotion | null): number => {
  if (promotion) {
    const introductoryPrice = promotion.introductoryPrice && promotion.introductoryPrice.price;
    return getFirstValidPrice(promotion.discountedPrice, introductoryPrice, productPrice.price);
  }

  return productPrice.price;
};

const weeklyProductProps = (billingPeriod: WeeklyBillingPeriod, productPrice: ProductPrice, orderIsAGift = false) => {
  const promotion = getAppliedPromo(productPrice.promotions);
  const mainDisplayPrice = getMainDisplayPrice(productPrice, promotion);
  const offerCopy = promotion && promotion.landingPage && promotion.landingPage.roundel || '';
  const trackingProperties = {
    id: orderIsAGift ? `subscribe_now_cta_gift-${billingPeriod}` : `subscribe_now_cta-${billingPeriod}`,
    product: 'GuardianWeekly',
    componentType: 'ACQUISITIONS_BUTTON'
  };
  return {
    title: billingPeriodTitle(billingPeriod, orderIsAGift),
    price: getPriceWithSymbol(productPrice.currency, mainDisplayPrice),
    offerCopy,
    priceCopy: <span>
        {getSimplifiedPriceDescription(productPrice, billingPeriod)}
      </span>,
    buttonCopy: 'Subscribe now',
    href: getCheckoutUrl(billingPeriod, orderIsAGift),
    label: getPromotionLabel(promotion) || '',
    onClick: sendTrackingEventsOnClick(trackingProperties),
    onView: sendTrackingEventsOnView(trackingProperties)
  };
};

const mapStateToProps = (state: State): PropTypes => {
  const {
    countryId
  } = state.common.internationalisation;
  const {
    productPrices,
    orderIsAGift
  } = state.page;
  const billingPeriodsToUse = orderIsAGift ? weeklyGiftBillingPeriods : weeklyBillingPeriods;
  return {
    orderIsAGift,
    products: billingPeriodsToUse.map(billingPeriod => {
      const productPrice = productPrices ? getProductPrice(productPrices, countryId, billingPeriod, getWeeklyFulfilmentOption(countryId)) : {
        price: 0,
        fixedTerm: false,
        currency: 'GBP'
      };
      return weeklyProductProps(billingPeriod, productPrice, orderIsAGift);
    })
  };
}; // ----- Exports ----- //


export default connect(mapStateToProps)(Prices);