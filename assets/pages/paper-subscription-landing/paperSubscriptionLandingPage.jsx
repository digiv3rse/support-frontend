// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';

import Page from 'components/page/page';
import Header from 'components/headers/header/header';
import Footer from 'components/footer/footer';
import AnchorButton from 'components/button/anchorButton';
import SvgChevron from 'components/svgs/chevron';
// import GridPicture from 'components/gridPicture/gridPicture';
import ProductPageContentBlock from 'components/productPage/productPageContentBlock/productPageContentBlock';
import ProductPageTextBlock, { LargeParagraph } from 'components/productPage/productPageTextBlock/productPageTextBlock';
// import ProductPageHero from 'components/productPage/productPageHero/productPageHero';
import ProductPageHeroSale from 'components/productPage/productPageHero/productPageHeroSale';

import { getQueryParameter } from 'helpers/url';
import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';
import { type PaperDeliveryMethod } from 'helpers/subscriptions';
import { flashSaleIsActive, getSaleCopy } from 'helpers/flashSale';

import Tabs from './components/tabs';
import Content from './components/content';
import reducer from './paperSubscriptionLandingPageReducer';

import './paperSubscriptionLandingPage.scss';


// ----- Collection or delivery ----- //

const method: PaperDeliveryMethod = window.location.pathname.includes('delivery') ? 'delivery' : 'collection';

const reactElementId: {
  [PaperDeliveryMethod]: string,
} = {
  collection: 'paper-subscription-landing-page-collection',
  delivery: 'paper-subscription-landing-page-delivery',
};


// ----- Initial selection? ----- //

const promoInUrl = getQueryParameter('promo');

// ----- Redux Store ----- //

const store = pageInit(reducer(method, promoInUrl), true);


// ----- Render ----- //

function getHeading(): string {
  if (flashSaleIsActive('Paper', 'GBPCountries')) {
    const saleCopy = getSaleCopy('Paper', 'GBPCountries');
    return saleCopy.landingPage.subHeading;
  }

  return 'Save up to 31% on The Guardian and The Observer - all year round';
}

function getStandfirst(): string {
  const defaultWording = 'We offer two different subscription types: voucher booklets and home delivery.';
  if (flashSaleIsActive('Paper', 'GBPCountries')) {
    const saleCopy = getSaleCopy('Paper', 'GBPCountries');
    return saleCopy.landingPage.standfirst || defaultWording;
  }

  return defaultWording;
}

const content = (
  <Provider store={store}>
    <Page
      header={<Header />}
      footer={<Footer />}
    >
      <ProductPageHeroSale
        overheading="The Guardian newspaper subscriptions"
        heading={getHeading()}
        type="sale"
        modifierClasses={['paper-sale']}
        cta={<AnchorButton aria-label={null} onClick={sendTrackingEventsOnClick('options_cta_click', 'GuardianWeekly', null)} icon={<SvgChevron />} href="#subscribe">See Subscription options</AnchorButton>}
      />
      {/* <ProductPageHero
        overheading="The Guardian newspaper subscriptions"
        heading={getHeading()}
        type="feature"
        modifierClasses={['paper']}
        cta={<AnchorButton aria-label={null} onClick={sendTrackingEventsOnClick('options_cta_click', 'GuardianWeekly', null)} icon={<SvgChevron />} href="#subscribe">See Subscription options</AnchorButton>}
      >
        <GridPicture
          sources={[
            {
              gridId: 'paperLandingHeroMobile',
              srcSizes: [500, 922],
              imgType: 'png',
              sizes: '100vw',
              media: '(max-width: 739px)',
            },
            {
              gridId: 'paperLandingHero',
              srcSizes: [1000, 2000],
              imgType: 'png',
              sizes: '(min-width: 1000px) 2000px, 1000px',
              media: '(min-width: 740px)',
            },
          ]}
          fallback="paperLandingHero"
          fallbackSize={1000}
          altText=""
          fallbackImgType="png"
        />
      </ProductPageHero> */}

      {/* Should we do this?

        if sale
        show  ProductPageHeroSale
        else
        show ProductPageHero  */}

      <ProductPageContentBlock needsHigherZindex>
        <ProductPageTextBlock>
          <LargeParagraph>
            {getStandfirst()}
          </LargeParagraph>
        </ProductPageTextBlock>

      </ProductPageContentBlock>
      <ProductPageContentBlock>
        <Tabs />
      </ProductPageContentBlock>
      <Content />
    </Page>
  </Provider>
);

renderPage(content, reactElementId[method]);

