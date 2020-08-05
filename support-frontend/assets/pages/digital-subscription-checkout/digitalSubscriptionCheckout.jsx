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
import ThankYouContent from 'pages/digital-subscription-checkout/thankYouContainer';
import ThankYouPendingContent from './thankYouPendingContent';
import CheckoutForm
  from 'pages/digital-subscription-checkout/components/digitalCheckoutForm';
import 'stylesheets/skeleton/skeleton.scss';
import CheckoutStage from 'components/subscriptionCheckouts/stage';
import './digitalSubscriptionCheckout.scss';
import { getQueryParameter } from 'helpers/url';
import type { DigitalBillingPeriod } from 'helpers/billingPeriods';
import { Monthly } from 'helpers/billingPeriods';
import { createCheckoutReducer } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import type { CommonState } from 'helpers/page/commonReducer';
import { DigitalPack } from 'helpers/subscriptions';
import HeaderWrapper from 'components/subscriptionCheckouts/headerWrapper';
import MarketingConsent from 'components/subscriptionCheckouts/thankYou/marketingConsentContainer';

// ----- Redux Store ----- //
const billingPeriodInUrl = getQueryParameter('period');
const initialBillingPeriod: DigitalBillingPeriod = billingPeriodInUrl === 'Monthly' || billingPeriodInUrl === 'Annual'
  ? billingPeriodInUrl
  : Monthly;

const reducer = (commonState: CommonState) => createCheckoutReducer(
  commonState.internationalisation.countryId,
  DigitalPack,
  initialBillingPeriod,
  null, null, null,
);

const store = pageInit(reducer, true);

const { countryGroupId } = store.getState().common.internationalisation;

const thankyouProps = {
  countryGroupId,
  marketingConsent: (<MarketingConsent />),
};

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page
      header={<HeaderWrapper />}
      footer={
        <Footer>
          <SubscriptionTermsPrivacy subscriptionProduct="DigitalPack" />
          <CustomerService
            selectedCountryGroup={countryGroupId}
            subscriptionProduct="DigitalPack"
            paperFulfilmentOptions={null}
          />
          <SubscriptionFaq subscriptionProduct="DigitalPack" />
        </Footer>}
    >
      <CheckoutStage
        checkoutForm={<CheckoutForm />}
        thankYouContentPending={<ThankYouPendingContent includePaymentCopy {...thankyouProps} />}
        thankYouContent={<ThankYouContent {...thankyouProps} />}
        subscriptionProduct="DigitalPack"
      />
    </Page>
  </Provider>
);

renderPage(content, 'digital-subscription-checkout-page');
