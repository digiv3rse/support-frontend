// @flow

// ----- Imports ----- //

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SimpleFooter from 'components/footers/simpleFooter/simpleFooter';
import InfoSection from 'components/infoSection/infoSection';
import Secure from 'components/secure/secure';
import TermsPrivacy from 'components/legal/termsPrivacy/termsPrivacy';
import TestUserBanner from 'components/testUserBanner/testUserBanner';
import PaymentAmount from 'components/paymentAmount/paymentAmount';
import ContribLegal from 'components/legal/contribLegal/contribLegal';

import pageStartup from 'helpers/pageStartup';
import * as user from 'helpers/user/user';
import { getQueryParameter } from 'helpers/url';

import PaymentMethodsContainer from './components/paymentMethodsContainer';
import FormFields from './components/formFields';
import reducer from './reducers/reducers';
import postCheckout from './helpers/ajax';

import { setContribAmount } from './actions/oneoffContributionsActions';


// ----- Page Startup ----- //

pageStartup.start();


// ----- Redux Store ----- //

const store = createStore(reducer, {
  intCmp: getQueryParameter('INTCMP'),
}, applyMiddleware(thunkMiddleware));

user.init(store.dispatch);

// Retrieves the contrib amount from the url and sends it to the redux store.
const contributionAmount = getQueryParameter('contributionValue', '50');

if (contributionAmount !== undefined && contributionAmount !== null) {
  store.dispatch(setContribAmount(contributionAmount));
}


// ----- Render ----- //

const content = (
  <Provider store={store}>
    <div className="gu-content">
      <TestUserBanner />
      <SimpleHeader />
      <div className="oneoff-contrib gu-content-filler__inner">
        <InfoSection className="oneoff-contrib__header">
          <h1 className="oneoff-contrib__heading">Make a one-off contribution</h1>
          <Secure />
        </InfoSection>
        <InfoSection heading="Your one-off contribution" className="oneoff-contrib__your-contrib">
          <PaymentAmount amount={store.getState().oneoffContrib.amount} />
        </InfoSection>
        <InfoSection heading="Your details" className="oneoff-contrib__your-details">
          <FormFields />
        </InfoSection>
        <InfoSection heading="Payment methods" className="oneoff-contrib__payment-methods">
          <PaymentMethodsContainer
            stripeCallback={postCheckout}
            payPalCallback={postCheckout}
            payPalButtonExists={false}
          />
        </InfoSection>
        <InfoSection className="oneoff-contrib__payment-methods">
          <TermsPrivacy
            termsLink="https://www.theguardian.com/info/2016/apr/04/contribution-terms-and-conditions"
            privacyLink="https://www.theguardian.com/help/privacy-policy"
          />
          <ContribLegal />
        </InfoSection>
      </div>
      <SimpleFooter />
    </div>
  </Provider>
);

ReactDOM.render(content, document.getElementById('oneoff-contributions-page'));
