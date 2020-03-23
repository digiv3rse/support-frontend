// @flow

// ----- Imports ----- //

import { renderPage } from 'helpers/render';
import React from 'react';
import { Provider } from 'react-redux';
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

import Page from 'components/page/page';
import headerWithCountrySwitcherContainer
  from 'components/headers/header/headerWithCountrySwitcher';
import { CampaignHeader } from './components/digitalSubscriptionLandingHeader';
import ProductBlock from './components/productBlock';
import './digitalSubscriptionLanding.scss';
import ConsentBanner from 'components/consentBanner/consentBanner';
import digitalSubscriptionLandingReducer
  from './digitalSubscriptionLandingReducer';
import CallToAction from './components/cta';
import TermsAndConditions from './components/termsAndConditions';
import FaqsAndHelp from './components/faqsAndHelp';
// ----- Styles ----- //

import './components/digitalSubscriptionLanding.scss';
import 'stylesheets/skeleton/skeleton.scss';

// ----- Redux Store ----- //

const store = pageInit(() => digitalSubscriptionLandingReducer(), true);

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

const CountrySwitcherHeader = headerWithCountrySwitcherContainer({
  path: '/subscribe/digital',
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
});

// ----- Render ----- //
function LandingPage() {

  return (
    <Page
      header={<CountrySwitcherHeader />}
    >
      <CampaignHeader countryGroupId={countryGroupId} />
      <ProductBlock countryGroupId={countryGroupId} />
      <CallToAction />
      <TermsAndConditions />
      <FaqsAndHelp selectedCountryGroup={countryGroupId} />
      <ConsentBanner />
    </Page>
  );

}

const content = (
  <Provider store={store}>
    <LandingPage />
  </Provider>
);

renderPage(content, reactElementId[countryGroupId]);
