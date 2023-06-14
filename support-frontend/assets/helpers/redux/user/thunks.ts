import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchJson } from 'helpers/async/fetch';
import { isSwitchOn } from 'helpers/globalsAndSwitches/globals';
import * as cookie from 'helpers/storage/cookie';
import type { SupporterStatus } from './state';

type UserAttributes = {
	userId: string;
	showSupportMessaging: boolean;
	contentAccess?: SupporterStatus;
};

export const getRecurringContributorStatus = createAsyncThunk<
	SupporterStatus,
	undefined
>(
	'user/getRecurringContributorStatus',
	async function getIsRecurringContributor() {
		const authWithOkta = isSwitchOn('featureSwitches.authenticateWithOkta');
		const accessToken = cookie.get('GU_ACCESS_TOKEN');

		// No point in making the call if we don't have an access token as we know it's going to fail
		if (authWithOkta && !accessToken) return {};

		// Okta authorization uses the Authorization header rather than a cookie
		const authHeader =
			authWithOkta && accessToken
				? { Authorization: `Bearer ${accessToken}` }
				: undefined;

		const attributes = (await fetchJson(
			`${window.guardian.mdapiUrl}/user-attributes/me`,
			{
				mode: 'cors',
				credentials: 'include',
				headers: authHeader,
			},
		)) as UserAttributes;

		return attributes.contentAccess ?? {};
	},
);
