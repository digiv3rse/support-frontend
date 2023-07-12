// ----- Imports ----- //
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
	countryGroups,
	detect,
} from 'helpers/internationalisation/countryGroup';
import { setUpTrackingAndConsents } from 'helpers/page/page';
import { isDetailsSupported, polyfillDetails } from 'helpers/polyfills/details';
import { initReduxForContributions } from 'helpers/redux/contributionsStore';
import { renderPage } from 'helpers/rendering/render';
import { SupporterPlusLandingPage } from 'pages/supporter-plus-landing/supporterPlusLanding';
import { SupporterPlusThankYou } from 'pages/supporter-plus-thank-you/supporterPlusThankYou';
import { setUpRedux } from './setup/setUpRedux';
import { SupporterPlusFirstStep } from './supporterPlusFirstStep';

if (!isDetailsSupported) {
	polyfillDetails();
}

setUpTrackingAndConsents();

// ----- Redux Store ----- //

const countryGroupId: CountryGroupId = detect();
const store = initReduxForContributions();

setUpRedux(store);

const reactElementId = `supporter-plus-landing-page-${countryGroups[countryGroupId].supportInternationalisationId}`;
const thankYouRoute = `/${countryGroups[countryGroupId].supportInternationalisationId}/thankyou`;
const countryIds = Object.values(countryGroups).map(
	(group) => group.supportInternationalisationId,
);

// ----- Render ----- //

const router = () => {
	const landingPage = <SupporterPlusFirstStep thankYouRoute={thankYouRoute} />;

	const checkout = <SupporterPlusLandingPage thankYouRoute={thankYouRoute} />;

	return (
		<BrowserRouter>
			<Provider store={store}>
				<Routes>
					{countryIds.map((countryId) => (
						<Route path={`/${countryId}/contribute/`} element={landingPage} />
					))}
					{countryIds.map((countryId) => (
						<Route
							path={`/${countryId}/contribute/:campaignCode`}
							element={landingPage}
						/>
					))}
					{countryIds.map((countryId) => (
						<Route
							path={`/${countryId}/contribute/checkout`}
							element={checkout}
						/>
					))}
					{countryIds.map((countryId) => (
						<Route
							path={`/${countryId}/thankyou`}
							element={<SupporterPlusThankYou />}
						/>
					))}
				</Routes>
			</Provider>
		</BrowserRouter>
	);
};

renderPage(router(), reactElementId);
