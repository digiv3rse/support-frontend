// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';

import { renderPage } from 'helpers/render';
import { init as pageInit } from 'helpers/page/page';

import Page from 'components/page/page';
import Footer from 'components/footer/footer';
import CustomerService from 'components/customerService/customerService';
import SubscriptionTermsPrivacy
  from 'components/legal/subscriptionTermsPrivacy/subscriptionTermsPrivacy';
import SubscriptionFaq from 'components/subscriptionFaq/subscriptionFaq';
import 'stylesheets/skeleton/skeleton.scss';
import CheckoutStage from 'components/subscriptionCheckouts/stage';
import ThankYouContent from './components/thankYou';
import CheckoutForm
  from 'pages/paper-subscription-checkout/components/paperCheckoutForm';
import './_legacyImports.scss';
import {
  getFulfilmentOption,
  getProductOption,
  getStartDate,
} from 'pages/paper-subscription-checkout/helpers/options';
import { createWithDeliveryCheckoutReducer } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import type { CommonState } from 'helpers/page/commonReducer';
import { Monthly } from 'helpers/billingPeriods';
import { Paper } from 'helpers/subscriptions';
import HeaderWrapper from 'components/subscriptionCheckouts/headerWrapper';

// ----- Redux Store ----- //

const fulfilmentOption = getFulfilmentOption();
const productOption = getProductOption();
const startDate = getStartDate(fulfilmentOption, productOption);
const reducer = (commonState: CommonState) => createWithDeliveryCheckoutReducer(
  commonState.internationalisation.countryId,
  Paper,
  Monthly,
  startDate,
  productOption,
  fulfilmentOption,
);


const store = pageInit(
  reducer,
  true,
);

const { countryGroupId } = store.getState().common.internationalisation;

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page
      header={<HeaderWrapper />}
      footer={
        <Footer>
          <SubscriptionTermsPrivacy subscriptionProduct="Paper" />
          <CustomerService
            selectedCountryGroup={countryGroupId}
            subscriptionProduct="Paper"
            paperFulfilmentOptions={fulfilmentOption}
          />
          <SubscriptionFaq subscriptionProduct="Paper" />
        </Footer>
      }
    >
      <CheckoutStage
        checkoutForm={<CheckoutForm />}
        thankYouContentPending={<ThankYouContent isPending />}
        thankYouContent={<ThankYouContent isPending={false} />}
        subscriptionProduct="Paper"
      />
    </Page>
  </Provider>
);

renderPage(content, 'paper-subscription-checkout-page');
