import type {
	PaymentMethod,
	PaymentRequestPaymentMethodEvent,
} from '@stripe/stripe-js';
import type { ErrorReason } from 'helpers/forms/errorReasons';
import type { StripeAccount } from 'helpers/forms/stripe';
import {
	findIsoCountry,
	stateProvinceFromString,
} from 'helpers/internationalisation/country';
import { setPaymentRequestError } from 'helpers/redux/checkout/payment/paymentRequestButton/actions';
import {
	setEmail,
	setFirstName,
	setLastName,
} from 'helpers/redux/checkout/personalDetails/actions';
import type { ContributionsDispatch } from 'helpers/redux/contributionsStore';
import { logException } from 'helpers/utilities/logger';
import {
	paymentWaiting,
	updateBillingCountry,
	updateBillingState,
} from 'pages/contributions-landing/contributionsLandingActions';

function setPayerName(
	dispatch: ContributionsDispatch,
	payerName?: string,
): void {
	// This turns "    jean    claude    van    damme     " into ["jean", "claude", "van", "damme"]
	const nameParts = payerName?.trim().replace(/\s+/g, ' ').split(' ') ?? [];

	if (nameParts.length > 1) {
		dispatch(setFirstName(nameParts[0]));
		dispatch(setLastName(nameParts.slice(1).join(' ')));
	} else if (nameParts.length === 1) {
		logException(
			`Failed to set name: no spaces in data object: ${nameParts.join('')}`,
		);
	} else {
		logException('Failed to set name: no name in data object');
	}
}

function setPayerEmail(
	dispatch: ContributionsDispatch,
	payerEmail?: string,
): void {
	if (payerEmail) {
		dispatch(setEmail(payerEmail));
	} else {
		logException('Failed to set email: no email in data object');
	}
}

function setBillingCountryAndState(
	dispatch: ContributionsDispatch,
	billingDetails: PaymentMethod.BillingDetails,
): void {
	const { country, state } = billingDetails.address ?? {};

	const validatedCountry = findIsoCountry(country ?? undefined);

	if (validatedCountry) {
		const validatedState = stateProvinceFromString(
			validatedCountry,
			state ?? undefined,
		);

		dispatch(updateBillingCountry(validatedCountry));
		dispatch(updateBillingState(validatedState ?? ''));
	}
}

export function addPayerDetailsToRedux(
	dispatch: ContributionsDispatch,
	paymentMethodEvent: PaymentRequestPaymentMethodEvent,
): void {
	const { paymentMethod, payerName, payerEmail } = paymentMethodEvent;
	setPayerName(dispatch, payerName);
	setPayerEmail(dispatch, payerEmail);
	setBillingCountryAndState(dispatch, paymentMethod.billing_details);
}

export function createPaymentRequestErrorHandler(
	dispatch: ContributionsDispatch,
	account: StripeAccount | 'NONE',
): (error: ErrorReason) => void {
	return function paymentRequestErrorHandler(error: ErrorReason) {
		if (account !== 'NONE') {
			dispatch(
				setPaymentRequestError({
					error,
					account,
				}),
			);
		}
		dispatch(paymentWaiting(false));
	};
}
