// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';

import { classNameWithModifiers } from 'helpers/utilities';
import { type SubscriptionProduct } from 'helpers/subscriptions';

import Heading from 'components/heading/heading';
import { FlashSaleCountdown } from 'components/flashSaleCountdown/flashSaleCountdown';
import type { HeadingSize } from 'components/heading/heading';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { HeroWrapper } from 'components/productPage/productPageHero/productPageHero';

// ----- Types ----- //

type PropTypes = {
  hasTimer?: boolean,
  headingSize: HeadingSize,
  headingText: string,
  countryGroupId: CountryGroupId,
  subheadingText?: ?string,
  bodyText: string,
  cta?: Node,
  image?: Node,
  product: SubscriptionProduct,
};

export default function FeaturedProductHero(props: PropTypes) {

  const {
    hasTimer,
    headingSize,
    headingText,
    subheadingText,
    bodyText,
    cta,
    image,
    product,
  } = props;

  const timerClassName = classNameWithModifiers('component-featured-product-hero__countdownbox', hasTimer ? [] : ['hidden']);
  const rootClassName = classNameWithModifiers(
    'component-featured-product-hero',
    [
      product === 'DigitalPack' ? 'digital-pack' : null,
      product === 'Paper' ? 'paper' : null,
      product === 'GuardianWeekly' ? 'guardian-weekly' : null,
    ],
  );
  return (
    <HeroWrapper className={rootClassName} appearance="custom">
      <div className="component-featured-product-hero__description">
        <Heading
          className="component-featured-product-hero__heading"
          size={headingSize}
        >
          {headingText}
        </Heading>
        {subheadingText &&
        <Heading
          className="component-featured-product-hero__subheading"
          size={headingSize}
        >
          {subheadingText}
        </Heading>
          }
        <div className={timerClassName}>
          <FlashSaleCountdown
            product={props.product}
            countryGroupId={props.countryGroupId}
          />
          <p className="component-featured-product-hero__copy">
            {bodyText}
          </p>
          {cta}
        </div>
      </div>
      <div className="component-featured-product-hero__image">
        {image}
      </div>
    </HeroWrapper>
  );
}


// ----- Default Props ----- //

FeaturedProductHero.defaultProps = {
  subheadingText: null,
  cta: null,
  hasTimer: false,
  image: null,
  product: null,
};
