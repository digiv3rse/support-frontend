// ----- Imports ----- //

import ophan from 'ophan';
import type { Participations } from 'helpers/abTests/abtest';
import { getGlobal } from 'helpers/globalsAndSwitches/globals';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import * as googleTagManager from 'helpers/tracking/googleTagManager';
import {
	setReferrerDataInLocalStorage,
	trackAbTests,
} from 'helpers/tracking/ophan';
import { init as initQuantumMetric } from 'helpers/tracking/quantumMetric';
import { isPostDeployUser } from 'helpers/user/user';
import { init as initLogger } from 'helpers/utilities/logger';
import 'helpers/internationalisation/country';

// ----- Functions ----- //

// Sets up GA and logging.
function analyticsInitialisation(
	participations: Participations,
	acquisitionData: ReferrerAcquisitionData,
): void {
	setReferrerDataInLocalStorage(acquisitionData);
	void googleTagManager.init(participations);
	ophan.init();
	initQuantumMetric();
	trackAbTests(participations);
	// Sentry logging.
	initLogger().catch((err) => {
		throw err;
	});
}

async function consentInitialisation(country: IsoCountry): Promise<void> {
	if (shouldInitCmp()) {
		const { cmp } = await import('@guardian/consent-management-platform');
		cmp.init({
			country,
		});
	}
}

// ----- Helpers ----- //

function shouldInitCmp(): boolean {
	/**
	 * We only init the CMP on condition we're not:
	 *   - server side rendering (ssr) the page (@guardian/consent-management-platform breaks ssr)
	 *   - a post deploy user
	 *   - on the in-Epic checkout page (this page is iframed into dotcom, so doesn't need its own CMP)
	 */
	return !getGlobal('ssr') && !isPostDeployUser() && !isInEpicCheckoutPage();
}

function isInEpicCheckoutPage(): boolean {
	return window.location.pathname.includes('contribute-in-epic');
}

// ----- Exports ----- //

export { analyticsInitialisation, consentInitialisation };
