// @flow

// ----- Imports ----- //
import React from 'react';

import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';

import Page from 'components/page/page';

import Footer from 'components/footerCompliant/Footer';
import Heading from 'components/heading/heading';
import headerWithCountrySwitcherContainer from 'components/headers/header/headerWithCountrySwitcher';
import { detect, type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { GBPCountries, AUDCountries, Canada, EURCountries, International, NZDCountries, UnitedStates } from 'helpers/internationalisation/countryGroup';

import Content from 'components/content/content';

import 'stylesheets/skeleton/skeleton.scss';

import WhySupportMatters from './components/whySupportMatters';
import BreakingHeadlines from './components/breakingHeadlines';
import NoOneEdits from './components/noOneEdits';
import Hero from './components/hero';
import CtaSubscribe from './components/ctaSubscribe';
import CtaContribute from './components/ctaContribute';
import OtherProducts from './components/otherProducts';
import './showcase.scss';
import { Provider } from 'react-redux';

// ----- Internationalisation ----- //

const countryGroupId: CountryGroupId = detect();

const CountrySwitcherHeader = headerWithCountrySwitcherContainer({
  path: '/support',
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

// ----- Page Startup ----- //

const store = pageInit();
const state = store.getState();

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <Page header={<CountrySwitcherHeader />} footer={<Footer />}>
      <Hero countryGroupId={state.common.internationalisation.countryGroupId} />
      <WhySupportMatters />
      <BreakingHeadlines />
      <NoOneEdits />
      <Content id="support">
        <Heading size={2} className="anchor">
          Ways you can support The Guardian
        </Heading>
      </Content>
      <CtaSubscribe />
      <CtaContribute />
      {countryGroupId === 'GBPCountries' && <OtherProducts />}
    </Page>
  </Provider>
);

renderPage(content, 'showcase-landing-page');

export { content };
