// @flow

// ----- Imports ----- //

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SimpleFooter from 'components/footers/simpleFooter/simpleFooter';

import { getQueryParameter } from 'helpers/url';
import { init as pageInit } from 'helpers/page/page';
import { setIntCmp } from 'helpers/page/pageActions';

import Introduction from './components/Introduction';
import Bundles from './components/Bundles';
import WhySupport from './components/WhySupport';
import WaysOfSupport from './components/WaysOfSupport';
import reducer from './bundlesLandingReducers';
import { trackOphan } from '../../helpers/abtest';

// New Design Test
import supportLanding from './supportLanding';


// ----- Redux Store ----- //

const store = pageInit(reducer);


// ----- Setup ----- //

let intCmp = store.getState().common.intCmp;

if (!intCmp) {
  intCmp = 'gdnwb_copts_bundles_landing_default';
  store.dispatch(setIntCmp(intCmp));
}

const participations = store.getState().common.abParticipations;
if (participations.addAnnualContributions) {
  trackOphan('addAnnualContributions', participations.addAnnualContributions);
}


// ----- Render ----- //

let content = null;

// New Design Test: Replace with check for variant when test goes live.
if (getQueryParameter('newDesigns', 'false') === 'true') {
  content = supportLanding(store);
} else {
  content = (
    <Provider store={store}>
      <div>
        <SimpleHeader />
        <Introduction />
        <Bundles />
        <WhySupport />
        {store.getState().common.campaign === 'baseline_test' ? '' : <WaysOfSupport />}
        <SimpleFooter />
      </div>
    </Provider>
  );
}

ReactDOM.render(content, document.getElementById('bundles-landing-page'));
