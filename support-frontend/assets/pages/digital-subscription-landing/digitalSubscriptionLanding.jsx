// @flow

// ----- Imports ----- //

import { renderPage } from 'helpers/rendering/render';
import React, { useEffect } from 'react';
import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';
import { neutral } from '@guardian/src-foundations/palette';

import {
  AUDCountries,
  Canada,
  type CountryGroupId,
  EURCountries,
  GBPCountries,
  International,
  NZDCountries,
  UnitedStates,
} from 'helpers/internationalisation/countryGroup';
import { routes } from 'helpers/urls/routes';
import { useHasBeenSeen } from 'helpers/customHooks/useHasBeenSeen';
import { initRedux, setUpTrackingAndConsents } from 'helpers/page/page';

import Page from 'components/page/page';
import FullWidthContainer from 'components/containers/fullWidthContainer';
import CentredContainer from 'components/containers/centredContainer';
import Block from 'components/page/block';
import { getPromotionCopy } from 'helpers/productPrice/promotions';
import headerWithCountrySwitcherContainer
  from 'components/headers/header/headerWithCountrySwitcher';
import { HeroWithPriceCards } from './components/hero/heroWithPriceCards';
import { HeroWithImage } from './components/hero/heroWithImage';
import ProductBlock from './components/productBlock/productBlock';
import Prices from './components/prices';
import GiftNonGiftCta from 'components/product/giftNonGiftCta';
import DigitalFooter from 'components/footerCompliant/DigitalFooter';
import FeedbackWidget from 'pages/digital-subscription-landing/components/feedbackWidget/feedbackWidget';
import { getHeroCtaProps } from './components/paymentSelection/helpers/paymentSelection';
import EventsModule from 'pages/digital-subscription-landing/components/events/eventsModule';
import { digitalLandingProps, type DigitalLandingPropTypes } from './digitalSubscriptionLandingProps';
import ComparisonTable from './components/comparison/comparisonTable';

// ----- Styles ----- //
import 'stylesheets/skeleton/skeleton.scss';
import { showPayPal } from 'helpers/forms/paymentIntegrations/payPalRecurringCheckout';
import { Provider } from 'react-redux';
import CheckoutStage from 'components/subscriptionCheckouts/stage';
import ThankYouContent from 'pages/digital-subscription-checkout/thankYouContainer';
import ThankYouPendingContent from 'pages/digital-subscription-checkout/thankYouPendingContent';
import { DigitalPack } from 'helpers/productPrice/subscriptions';
import MarketingConsentGift from 'components/subscriptionCheckouts/thankYou/marketingConsentContainerGift';
import MarketingConsent from 'components/subscriptionCheckouts/thankYou/marketingConsentContainer';
import type { CommonState } from 'helpers/page/commonReducer';
import { createCheckoutReducer } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import { Monthly } from 'helpers/productPrice/billingPeriods';

const productBlockContainer = css`
  background-color: ${neutral[93]};
  border-top: none;
  border-right: none;
  margin-top: ${space[3]}px;
  padding-top: 0;

  ${from.tablet} {
    background-color: ${neutral[100]};
    margin-top: ${space[12]}px;
    border-top: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
  }
`;

const productBlockContainerWithEvents = css`
  margin-top: 0;
  ${from.tablet} {
    margin-top: ${space[6]}px;
  }
`;

const eventsProductBlockContainer = css`
    margin-top: 43px;
    padding-top: 0;
    padding-bottom: 0;

  ${from.tablet} {
    margin-top: ${space[12]}px;
  }
`;

const comparisonTableContainer = css`
    margin-top: 43px;
    margin-bottom: ${space[2]}px;
    padding-top: 0;
    padding-bottom: 0;

  ${from.tablet} {
    margin-top: 60px;
    margin-bottom: ${space[2]}px;
  }
`;

// ----- Internationalisation ----- //

const reactElementId: {
  [CountryGroupId]: string,
} = {
  GBPCountries: 'digital-subscription-landing-page-uk',
  UnitedStates: 'digital-subscription-landing-page-us',
  AUDCountries: 'digital-subscription-landing-page-au',
  EURCountries: 'digital-subscription-landing-page-eu',
  NZDCountries: 'digital-subscription-landing-page-nz',
  Canada: 'digital-subscription-landing-page-ca',
  International: 'digital-subscription-landing-page-int',
};

// ----- Render ----- //
function DigitalLandingPage({
  countryGroupId,
  currencyId,
  participations,
  productPrices,
  promotionCopy,
  orderIsAGift,
}: DigitalLandingPropTypes) {
  if (!productPrices) {
    return null;
  }

  useEffect(() => {showPayPal(store.dispatch);}, []);
  const isGift = orderIsAGift || false;
  const showEventsComponent = participations.emailDigiSubEventsTest === 'variant';
  const showComparisonTable = participations.comparisonTableTest === 'variant';
  const isUsingGuestCheckout = true; // participations.subscriptionsGuestCheckoutTest === 'variant';
  const path = orderIsAGift ? routes.digitalSubscriptionLandingGift : routes.digitalSubscriptionLanding;
  const giftNonGiftLink = orderIsAGift ? routes.digitalSubscriptionLanding : routes.digitalSubscriptionLandingGift;
  const sanitisedPromoCopy = getPromotionCopy(promotionCopy);

  // For CTAs in hero test
  const heroPriceList = getHeroCtaProps(
    productPrices,
    currencyId,
    countryGroupId,
    isUsingGuestCheckout,
  );

  const CountrySwitcherHeader = headerWithCountrySwitcherContainer({
    path,
    countryGroupId,
    listOfCountryGroups: [
      GBPCountries,
      UnitedStates,
      AUDCountries,
      EURCountries,
      NZDCountries,
      Canada,
      International,
    ],
    trackProduct: 'DigitalPack',
  });

  const [widgetShouldDisplay, setElementToObserve] = useHasBeenSeen({
    threshold: 0.3,
    debounce: true,
  });

  const footer = (
    <div className="footer-container">
      <div className="footer-alignment">
        <DigitalFooter
          country={countryGroupId}
          orderIsAGift={isGift}
          productPrices={productPrices}
          centred
        />
      </div>
    </div>);

  return (
    <Page
      header={<CountrySwitcherHeader />}
      footer={footer}
    >
      {orderIsAGift ?
        <HeroWithImage
          orderIsAGift={isGift}
          countryGroupId={countryGroupId}
          promotionCopy={sanitisedPromoCopy}
        /> :
        <HeroWithPriceCards
          promotionCopy={sanitisedPromoCopy}
          countryGroupId={countryGroupId}
          priceList={heroPriceList}
        />
      }
      {showComparisonTable &&
      <FullWidthContainer>
        <CentredContainer>
          <Block cssOverrides={comparisonTableContainer}>
            <ComparisonTable />
          </Block>
        </CentredContainer>
      </FullWidthContainer>
      }
      {showEventsComponent &&
      <FullWidthContainer>
        <CentredContainer>
          <Block cssOverrides={eventsProductBlockContainer}>
            <EventsModule />
          </Block>
        </CentredContainer>
      </FullWidthContainer>
      }
      <FullWidthContainer>
        <CentredContainer>
          <Block cssOverrides={[productBlockContainer, showEventsComponent ? productBlockContainerWithEvents : '']}>
            <div ref={setElementToObserve}>
              <ProductBlock
                countryGroupId={countryGroupId}
              />
            </div>
          </Block>
        </CentredContainer>
      </FullWidthContainer>
      <FullWidthContainer theme="dark" hasOverlap>
        <CentredContainer>
          <Prices
            countryGroupId={countryGroupId}
            currencyId={currencyId}
            productPrices={productPrices}
            orderIsAGift={isGift}
            isUsingGuestCheckout={isUsingGuestCheckout}
          />
        </CentredContainer>
      </FullWidthContainer>
      <FullWidthContainer theme="white">
        <CentredContainer>
          <GiftNonGiftCta product="digital" href={giftNonGiftLink} orderIsAGift={isGift} />
        </CentredContainer>
      </FullWidthContainer>
      <FeedbackWidget display={widgetShouldDisplay} />
    </Page>
  );
}

setUpTrackingAndConsents();
const props = digitalLandingProps();
const thankyouProps = {
  countryGroupId: GBPCountries, //TODO
  marketingConsent: (false ? <MarketingConsentGift /> : <MarketingConsent />),
};

const reducer = (commonState: CommonState) => createCheckoutReducer(
  commonState.internationalisation.countryId,
  DigitalPack,
  Monthly,
  null, null, null,
);

const store = initRedux(reducer, true);
const content = <Provider store={store}>
  <CheckoutStage
    checkoutForm={<DigitalLandingPage {...props} />}
    thankYouContentPending={<ThankYouPendingContent includePaymentCopy {...thankyouProps} />}
    thankYouContent={<ThankYouContent {...thankyouProps} />}
    subscriptionProduct={DigitalPack}
  />
</Provider>


renderPage(content, reactElementId[props.countryGroupId]);
