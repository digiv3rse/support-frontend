// @flow

// ----- Imports ----- //

import React from 'react';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import type { BillingPeriod } from 'helpers/billingPeriods';
import { billingPeriodNoun } from 'helpers/billingPeriods';
import { countryGroups, fromCountry } from 'helpers/internationalisation/countryGroup';
import { currencies } from 'helpers/internationalisation/currency';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { fixDecimals } from 'helpers/subscriptions';
import type { Option } from 'helpers/types/option';
import { GBPCountries } from 'helpers/internationalisation/countryGroup';
import { getPromotion, getProductPrice } from 'helpers/productPrice/productPrices';

export type PropTypes = {
  productPrices: ProductPrices,
  country: Option<IsoCountry>,
  billingPeriod: BillingPeriod,
}

const displayPrice = (glyph: string, price: number) => `${glyph}${fixDecimals(price)}`;

const billingPeriodQuantifier = (numberOfBillingPeriods: number, noun: string) =>
  (numberOfBillingPeriods > 1 ?
    `/${noun} for ${numberOfBillingPeriods} ${noun}s` :
    ` for 1 ${noun}`);


function getSummary(
  glyph: string,
  price: number,
  discountedPrice: number,
  numberOfDiscountedPeriods: ?number,
  billingPeriod: BillingPeriod,
) {
  const noun = billingPeriodNoun(billingPeriod).toLowerCase();

  if (numberOfDiscountedPeriods !== undefined && numberOfDiscountedPeriods !== null) {
    const discountCopy = `${displayPrice(glyph, discountedPrice)}${billingPeriodQuantifier(numberOfDiscountedPeriods, noun)}`;
    const standardCopy = `then standard rate (${displayPrice(glyph, price)}/${noun})`;
    return `${discountCopy}, ${standardCopy}`;
  }

  return null;
}

function discountSummary(
  price: number,
  promoCode: string,
  discountedPrice: number,
  discountAmount: number,
  numberOfDiscountedPeriods: ?number,
  billingPeriod: BillingPeriod,
  country: IsoCountry,
) {
  const countryGroup = countryGroups[fromCountry(country) || GBPCountries];
  const { glyph } = currencies[countryGroup.currency];

  return (
    <div className="component-promotion-summary">
      <h3 className="component-promotion-summary__heading">
        Promotion applied ({promoCode})
      </h3>
      <p>
        {getSummary(glyph, price, discountedPrice, numberOfDiscountedPeriods, billingPeriod)}
      </p>
    </div>
  );
}

function PromotionSummary(props: PropTypes) {
  if (props.country) {
    const { country } = props;
    const productPrice = getProductPrice(props.productPrices, country, props.billingPeriod);
    const promotion = getPromotion(props.productPrices, country, props.billingPeriod);
    if (promotion &&
      promotion.discountedPrice &&
      promotion.discount) {
      return discountSummary(
        productPrice.price,
        promotion.promoCode,
        promotion.discountedPrice,
        promotion.discount.amount,
        promotion.numberOfDiscountedPeriods,
        props.billingPeriod,
        country,
      );
    }
  }

  return null;
}

export { PromotionSummary, getSummary };
