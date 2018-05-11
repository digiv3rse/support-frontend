// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import * as user from 'helpers/user/user';
import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';
import { routes } from 'helpers/routes';
import { getAmount, getPaymentMethod } from 'helpers/checkouts';
import { parseContrib } from 'helpers/contributions';
import { getQueryParameter } from 'helpers/url';
import { detect as detectCountryGroup } from 'helpers/internationalisation/countryGroup';

import ContributionsThankYouPageContainer from './components/contributionsThankYouPageContainer';
import RegularContributionsPage from './components/regularContributionsPage';
import reducer from './regularContributionsReducers';


// ----- Page Startup ----- //

const store = pageInit(reducer(
  getAmount(parseContrib(getQueryParameter('contribType'), 'MONTHLY'), detectCountryGroup()),
  getPaymentMethod(),
), true);

user.init(store.dispatch);


// ----- Render ----- //

const router = (
  <BrowserRouter>
    <Provider store={store}>
      <div>
        <Route exact path={routes.recurringContribCheckout} component={RegularContributionsPage} />
        <Route exact path={routes.recurringContribThankyou} component={ContributionsThankYouPageContainer} />
        <Route exact path={routes.recurringContribPending} component={ContributionsThankYouPageContainer} />
      </div>
    </Provider>
  </BrowserRouter>
);

renderPage(router, 'regular-contributions-page');
