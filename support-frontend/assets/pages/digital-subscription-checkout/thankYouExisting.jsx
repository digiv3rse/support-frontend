
// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';

import { renderPage } from 'helpers/rendering/render';
import { initRedux, setUpTrackingAndConsents } from 'helpers/page/page';

import Page from 'components/page/page';
import Header from 'components/headers/header/header';
import Footer from 'components/footerCompliant/Footer';
import 'stylesheets/skeleton/skeleton.scss';

import HeadingBlock from 'components/headingBlock/headingBlock';
import { HeroWrapper } from 'components/productPage/productPageHero/productPageHero';

import ReturnSection from 'components/subscriptionCheckouts/thankYou/returnSection';
import ThankYouExistingContent from './thankYouExistingContent';
import ThankYouContent from './components/thankYou/hero';

import './digitalSubscriptionCheckout.scss';

setUpTrackingAndConsents();

// ----- Redux Store ----- //

const store = initRedux();

const { countryGroupId } = store.getState().common.internationalisation;

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page
      header={<Header countryGroupId={countryGroupId} />}
      footer={
        <Footer
          faqsLink="https://manage.theguardian.com/help-centre"
          termsConditionsLink="https://www.theguardian.com/info/2014/aug/06/guardian-observer-digital-subscriptions-terms-conditions"
        />}
    >
      <div className="thank-you-stage">
        <HeroWrapper appearance="custom">
          <ThankYouContent countryGroupId={countryGroupId} />
          <HeadingBlock>
            You already have an active digital subscription
          </HeadingBlock>
        </HeroWrapper>
        <ThankYouExistingContent countryGroupId={countryGroupId} />
        <ReturnSection subscriptionProduct="DigitalPack" />
      </div>
    </Page>
  </Provider>
);

renderPage(content, 'digital-subscription-checkout-page');
