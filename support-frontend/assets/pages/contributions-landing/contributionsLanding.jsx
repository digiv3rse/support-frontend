// @flow

// ----- Imports ----- //

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route } from 'react-router-dom';
import { isDetailsSupported, polyfillDetails } from 'helpers/polyfills/details';
import { initRedux, setUpTrackingAndConsents } from 'helpers/page/page';
import { renderPage } from 'helpers/rendering/render';
import {
  type CountryGroupId,
  countryGroups,
  detect,
} from 'helpers/internationalisation/countryGroup';
import * as user from 'helpers/user/user';
import { gaEvent } from 'helpers/tracking/googleTagManager';
import * as storage from 'helpers/storage/storage';
import { set as setCookie } from 'helpers/storage/cookie';
import Page from 'components/page/page';
import ContributionsFooter from 'components/footerCompliant/ContributionsFooter';
import { RoundelHeader } from 'components/headers/roundelHeader/header';
import { getCampaignSettings } from 'helpers/campaigns/campaigns';
import { init as formInit } from './contributionsLandingInit';
import { initReducer } from './contributionsLandingReducer';
import { ContributionFormContainer } from './components/ContributionFormContainer';
import { enableOrDisableForm } from './checkoutFormIsSubmittableActions';
import ContributionThankYouPage from './components/ContributionThankYou/ContributionThankYouPage';
import { setUserStateActions } from './setUserStateActions';
import './contributionsLanding.scss';
import './newContributionsLandingTemplate.scss';
import { FocusStyleManager } from '@guardian/src-utilities';


if (!isDetailsSupported) {
  polyfillDetails();
}

setUpTrackingAndConsents();

// ----- Redux Store ----- //

const countryGroupId: CountryGroupId = detect();

const store = initRedux(() => initReducer(), true);

if (!window.guardian.polyfillScriptLoaded) {
  gaEvent({
    category: 'polyfill',
    action: 'not loaded',
    label: window.guardian.polyfillVersion || '',
  });
}

if (typeof Object.values !== 'function') {
  gaEvent({
    category: 'polyfill',
    action: 'Object.values not available after polyfill',
    label: window.guardian.polyfillVersion || '',
  });
}

// We need to initialise in this order, as
// formInit depends on the user being populated
user.init(store.dispatch, setUserStateActions(countryGroupId));
formInit(store);


const reactElementId = `contributions-landing-page-${countryGroups[countryGroupId].supportInternationalisationId}`;

// ----- Internationalisation ----- //

const selectedCountryGroup = countryGroups[countryGroupId];

// ----- Render ----- //

const ONE_OFF_CONTRIBUTION_COOKIE = 'gu.contributions.contrib-timestamp';
const currentTimeInEpochMilliseconds: number = Date.now();
const cookieDaysToLive = 365;

const setOneOffContributionCookie = () => {
  setCookie(
    ONE_OFF_CONTRIBUTION_COOKIE,
    currentTimeInEpochMilliseconds.toString(),
    cookieDaysToLive,
  );
};

const campaignSettings = getCampaignSettings();

const cssModifiers = campaignSettings && campaignSettings.cssModifiers ?
  campaignSettings.cssModifiers : [];

const backgroundImageSrc = campaignSettings && campaignSettings.backgroundImage ?
  campaignSettings.backgroundImage : null;

FocusStyleManager.onlyShowFocusOnTabs(); // https://www.theguardian.design/2a1e5182b/p/6691bb-accessibility

const contributionsLandingPage = (campaignCodeParameter: ?string) => (
  <Page
    classModifiers={['new-template', 'contribution-form', ...cssModifiers]}
    header={<RoundelHeader selectedCountryGroup={selectedCountryGroup} />}
    footer={<ContributionsFooter />}
    backgroundImageSrc={backgroundImageSrc}
  >
    <ContributionFormContainer
      thankYouRoute={`/${countryGroups[countryGroupId].supportInternationalisationId}/thankyou`}
      campaignCodeParameter={campaignCodeParameter}
    />
  </Page>
);

const router = (
  <BrowserRouter>
    <Provider store={store}>
      <div>
        <Route
          exact
          path="/:countryId(uk|us|au|eu|int|nz|ca)/contribute/"
          render={() => contributionsLandingPage()}
        />
        <Route
          exact
          path="/:countryId(uk|us|au|eu|int|nz|ca)/contribute/:campaignCode"
          render={props => contributionsLandingPage(props.match.params.campaignCode)}
        />
        <Route
          exact
          path="/:countryId(uk|us|au|eu|int|nz|ca)/thankyou"
          render={(props) => {
            const paymentMethod = storage.getSession('selectedPaymentMethod');
            const isPaymentMethodSelected = paymentMethod && paymentMethod !== 'None';

            const { pathname, search } = props.location;
            const queryParams = new URLSearchParams(search);

            if (!isPaymentMethodSelected && !queryParams.has('no-redirect')) {
              const redirectPath = pathname.replace('thankyou', 'contribute') + search;
              return <Redirect to={redirectPath} push={false} />;
            }

            // we set the recurring cookie server side
            if (storage.getSession('selectedContributionType') === 'ONE_OFF') {
              setOneOffContributionCookie();
            }
            return (
              <ContributionThankYouPage countryGroupId={countryGroupId} />
            );
          }}
        />
      </div>
    </Provider>
  </BrowserRouter>
);

renderPage(router, reactElementId, () => store.dispatch(enableOrDisableForm()));
