// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';

import Page from 'components/page/page';
import FooterContainer from 'components/footer/footerContainer';
import InvestIntroduction from 'components/introduction/investIntroduction';
import ReadyToSupport from 'components/readyToSupport/readyToSupport';
import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SubscriptionsByCountryGroup from 'components/subscriptionsByCountryGroup/subscriptionsByCountryGroup';
import WhySupportVideoContainer from 'components/whySupportVideo/whySupportVideoContainer';

import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';


// ----- Setup ----- //

const supporterSectionId = 'supporter-options';


// ----- Redux Store ----- //

const store = pageInit();


// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page
      header={<SimpleHeader />}
      footer={<FooterContainer disclaimer privacyPolicy />}
    >
      <InvestIntroduction />
      <SubscriptionsByCountryGroup headingSize={3} appMedium="subscribe_landing_page" />
      <WhySupportVideoContainer headingSize={3} id="why-support" />
      <ReadyToSupport
        ctaUrl={`#${supporterSectionId}`}
        headingSize={2}
      />
    </Page>
  </Provider>
);

renderPage(content, 'subscriptions-landing-page');
