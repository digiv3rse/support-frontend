// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';

import { renderPage } from 'helpers/render';
import { init as pageInit } from 'helpers/page/page';

import Page from 'components/page/page';
import Header from 'components/headers/header/header';
import Footer from 'components/footer/footer';
import CustomerService from 'components/customerService/customerService';
import SubscriptionTermsPrivacy from 'components/legal/subscriptionTermsPrivacy/subscriptionTermsPrivacy';
import SubscriptionFaq from 'components/subscriptionFaq/subscriptionFaq';
import 'stylesheets/skeleton/skeleton.scss';

import { initReducer } from './digitalSubscriptionCheckoutReducer';
import CheckoutStage from './components/checkoutStage';
import './digitalSubscriptionCheckout.scss';

// ----- Redux Store ----- //

const store = pageInit(commonState => initReducer(commonState.internationalisation.countryId), true);

const { countryGroupId } = store.getState().common.internationalisation;

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page
      header={<Header displayNavigation={false} />}
      footer={
        <Footer>
          <SubscriptionTermsPrivacy subscriptionProduct="DigitalPack" />
          <CustomerService selectedCountryGroup={countryGroupId} />
          <SubscriptionFaq subscriptionProduct="DigitalPack" />
        </Footer>}
    >
      <CheckoutStage />
    </Page>
  </Provider>
);

renderPage(content, 'digital-subscription-checkout-page');
