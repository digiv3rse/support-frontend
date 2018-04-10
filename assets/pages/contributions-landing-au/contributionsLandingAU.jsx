// @flow

// ----- Imports ----- //

import React from 'react';
import { applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import Footer from 'components/footer/footer';
import ContribLegal from 'components/legal/contribLegal/contribLegal';

import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';

import { createContributionsLandingReducer } from './contributionsLandingReducers';
import { saveContext } from './helpers/context';

import CountrySwitcherHeaderContainer from './components/countrySwitcherHeaderContainer';
import ContributionsBundleContent from './components/contributionsBundleContent';

// ----- Page Startup ----- //

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = pageInit(createContributionsLandingReducer('20'), undefined, composeEnhancers(applyMiddleware(thunkMiddleware)));

saveContext(store.dispatch);

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <div className="gu-content">
      <CountrySwitcherHeaderContainer />
      <section className="contributions-bundle">
        <ContributionsBundleContent />
      </section>
      <section className="contributions-legal gu-content-filler">
        <div className="contributions-legal__content gu-content-filler__inner">
          <ContribLegal />
        </div>
      </section>
      <Footer privacyPolicy />
    </div>
  </Provider>
);

renderPage(content, 'contributions-landing-page-au');
