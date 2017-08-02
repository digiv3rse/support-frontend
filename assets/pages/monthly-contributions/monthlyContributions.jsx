// @flow

// ----- Imports ----- //

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SimpleFooter from 'components/footers/simpleFooter/simpleFooter';
import InfoSection from 'components/infoSection/infoSection';
import DisplayName from 'components/displayName/displayName';
import Secure from 'components/secure/secure';
import TermsPrivacy from 'components/legal/termsPrivacy/termsPrivacy';
import TestUserBanner from 'components/testUserBanner/testUserBanner';
import PaymentAmount from 'components/paymentAmount/paymentAmount';
import ContribLegal from 'components/legal/contribLegal/contribLegal';

import pageStartup from 'helpers/pageStartup';
import * as user from 'helpers/user/user';
import { getQueryParameter } from 'helpers/url';

import postCheckout from './helpers/ajax';
import NameForm from './components/nameForm';
import PaymentMethodsContainer from './components/paymentMethodsContainer';
import reducer from './reducers/reducers';

import { setContribAmount, setPayPalButton } from './actions/monthlyContributionsActions';


// ----- Page Startup ----- //

pageStartup.start();


// ----- Redux Store ----- //

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, { intCmp: getQueryParameter('INTCMP'), }, composeEnhancers(applyMiddleware(thunkMiddleware)));

// Retrieves the contrib amount from the url and sends it to the redux store.
const contributionAmount = getQueryParameter('contributionValue', '5');

if (contributionAmount !== undefined && contributionAmount !== null) {
  store.dispatch(setContribAmount(contributionAmount));
}


user.init(store.dispatch);
store.dispatch(setPayPalButton(window.guardian.payPalButtonExists));

// ----- Render ----- //

const content = (
  <Provider store={store}>
    <div className="gu-content gu-content-filler">
      <TestUserBanner />
      <SimpleHeader />
      <div className="monthly-contrib gu-content-filler__inner">
        <InfoSection className="monthly-contrib__header">
          <h1 className="monthly-contrib__heading">Make a monthly contribution</h1>
          <Secure />
        </InfoSection>
        <InfoSection heading="Your monthly contribution" className="monthly-contrib__your-contrib">
          <PaymentAmount amount={store.getState().monthlyContrib.amount} />
        </InfoSection>
        <InfoSection heading="Your details" className="monthly-contrib__your-details">
          <DisplayName />
          <NameForm />
        </InfoSection>
        <InfoSection heading="Payment methods" className="monthly-contrib__payment-methods">
          <PaymentMethodsContainer
            stripeCallback={postCheckout('stripeToken')}
            payPalCallback={postCheckout('baid')}
            payPalButtonExists={store.getState().monthlyContrib.payPalButtonExists}
          />
        </InfoSection>
        <InfoSection className="monthly-contrib__payment-methods">
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

ReactDOM.render(content, document.getElementById('monthly-contributions-page'));
