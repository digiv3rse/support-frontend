// @flow

// ----- Imports ----- //

import { renderPage } from 'helpers/rendering/render';
import React from 'react';
import { Provider } from 'react-redux';
import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';
import { neutral } from '@guardian/src-foundations/palette';

import {
  AUDCountries,
  Canada,
  type CountryGroupId,
  detect,
  EURCountries,
  GBPCountries,
  International,
  NZDCountries,
  UnitedStates,
} from 'helpers/internationalisation/countryGroup';
import { init as pageInit } from 'helpers/page/page';
import { routes } from 'helpers/urls/routes';
import { useHasBeenSeen } from 'helpers/customHooks/useHasBeenSeen';

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
import ProductBlockAus from './components/productBlock/productBlockAus';
import digitalSubscriptionLandingReducer, { type State }
  from './digitalSubscriptionLandingReducer';
import Prices from './components/prices';
import GiftNonGiftCta from 'components/product/giftNonGiftCta';
import DigitalFooter from 'components/footerCompliant/DigitalFooter';
import FeedbackWidget from 'pages/digital-subscription-landing/components/feedbackWidget/feedbackWidget';
import EditorialVoice, { evContainerOverrides } from './components/editorialVoice/editorialVoice';
import { getHeroCtaProps } from './components/paymentSelection/helpers/paymentSelection';
import EventsModule from 'pages/digital-subscription-landing/components/events/eventsModule';

// ----- Redux Store ----- //

const store = pageInit(() => digitalSubscriptionLandingReducer, true);

const { page, common }: State = store.getState();
const { orderIsAGift, productPrices, promotionCopy } = page;
const { internationalisation, abParticipations } = common;
const sanitisedPromoCopy = getPromotionCopy(promotionCopy);

// For CTAs in hero test
const heroPriceList = getHeroCtaProps(
  productPrices,
  internationalisation.currencyId,
  internationalisation.countryGroupId,
);
const showEditorialVoiceComponent = abParticipations.editorialVoiceTestPart2 === 'variant';
const showEventsComponent = abParticipations.digiSubEventsTest === 'variant';

// ----- Styles ----- //
import 'stylesheets/skeleton/skeleton.scss';

const productBlockContainer = css`
    background-color: ${neutral[93]};
    border-top: none;
    border-right: none;
    margin-top: ${showEventsComponent ? '0' : `${space[3]}px`};
    padding-top: 0;

  ${from.tablet} {
    background-color: ${neutral[100]};
    margin-top: ${showEventsComponent ? `${space[6]}px` : `${space[12]}px`};
    border-top: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
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

// ----- Internationalisation ----- //

const countryGroupId: CountryGroupId = detect();

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

const path = orderIsAGift ? routes.digitalSubscriptionLandingGift : routes.digitalSubscriptionLanding;
const giftNonGiftLink = orderIsAGift ? routes.digitalSubscriptionLanding : routes.digitalSubscriptionLandingGift;

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

// ----- Render ----- //
function LandingPage() {
  const [widgetShouldDisplay, setElementToObserve] = useHasBeenSeen({
    threshold: 0.3,
    debounce: true,
  });

  const footer = (
    <div className="footer-container">
      <div className="footer-alignment">
        <DigitalFooter
          country={countryGroupId}
          orderIsAGift={orderIsAGift}
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
          countryGroupId={countryGroupId}
          promotionCopy={sanitisedPromoCopy}
        /> :
        <HeroWithPriceCards
          promotionCopy={sanitisedPromoCopy}
          countryGroupId={countryGroupId}
          priceList={heroPriceList}
        />
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
          <Block cssOverrides={productBlockContainer}>
            <div ref={setElementToObserve}>
              {countryGroupId === AUDCountries ?
                <ProductBlockAus
                  countryGroupId={countryGroupId}
                /> :
                <ProductBlock
                  countryGroupId={countryGroupId}
                />
              }
            </div>
          </Block>
        </CentredContainer>
      </FullWidthContainer>
      {showEditorialVoiceComponent &&
        <FullWidthContainer cssOverrides={evContainerOverrides}>
          <CentredContainer>
            <EditorialVoice />
          </CentredContainer>
        </FullWidthContainer>
      }
      <FullWidthContainer theme="dark" hasOverlap>
        <CentredContainer>
          <Prices orderIsAGift={orderIsAGift} />
        </CentredContainer>
      </FullWidthContainer>
      <FullWidthContainer theme="white">
        <CentredContainer>
          <GiftNonGiftCta product="digital" href={giftNonGiftLink} orderIsAGift={orderIsAGift} />
        </CentredContainer>
      </FullWidthContainer>
      <FeedbackWidget display={widgetShouldDisplay} />
    </Page>
  );

}

const content = (
  <Provider store={store}>
    <LandingPage />
  </Provider>
);

renderPage(content, reactElementId[countryGroupId]);
