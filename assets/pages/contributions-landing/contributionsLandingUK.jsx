// @flow

// ----- Imports ----- //

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SimpleFooter from 'components/footers/simpleFooter/simpleFooter';
import IntroductionText from 'components/introductionText/introductionText';
import ContribLegal from 'components/legal/contribLegal/contribLegal';

import pageStartup from 'helpers/pageStartup';
import { getQueryParameter } from 'helpers/url';

import reducer from './reducers/reducers';
import ContributionsBundle from './components/contributionsBundle';


// ----- Page Startup ----- //

const participation = pageStartup.start();


// ----- Redux Store ----- //

const store = createStore(reducer, {
  intCmp: getQueryParameter('INTCMP'),
});

store.dispatch({ type: 'SET_AB_TEST_PARTICIPATION', payload: participation });


// ----- AB Test ----- //

const showMonthly = participation.contributionsLandingAddingMonthly !== 'control';


// ----- Copy ----- //

const introductionCopy = [
  {
    heading: 'support the Guardian',
    copy: ['be part of our future', 'by helping to secure it'],
  },
  {
    heading: 'hold power to account',
    copy: ['by funding quality,', 'independent journalism'],
  },
];


// ----- Render ----- //

const content = (
  <Provider store={store}>
    <div className="gu-content">
      <SimpleHeader />
      <IntroductionText messages={introductionCopy} />
      <section className="contributions-bundle">
        <div className="introduction-bleed-margins" />
        <div className={`contributions-bundle__content gu-content-margin ${showMonthly ? '' : 'hide-monthly'}`}>
          <div className="introduction-bleed" />
          <ContributionsBundle />
        </div>
      </section>
      <section className="contributions-legal gu-content-filler">
        <div className="contributions-legal__content gu-content-filler__inner">
          <ContribLegal />
        </div>
      </section>
      <SimpleFooter />
    </div>
  </Provider>
);

ReactDOM.render(content, document.getElementById('contributions-landing-page-uk'));
