import { recaptchaRequiredPaymentMethods } from 'helpers/forms/paymentMethods';
import {
	hasPaymentRequestButtonBeenClicked,
	hasPaymentRequestInterfaceClosed,
	hasPaymentRequestPaymentFailed,
} from 'helpers/redux/checkout/payment/paymentRequestButton/selectors';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import type { ContributionsState } from 'helpers/redux/contributionsStore';
import { getOtherAmountErrors } from 'helpers/redux/selectors/formValidation/otherAmountValidation';
import { getPersonalDetailsErrors } from './personalDetailsValidation';
import type { ErrorCollection } from './utils';
import { errorCollectionHasErrors } from './utils';

export function getStripeFormErrors(
	state: ContributionsState,
): ErrorCollection {
	const { abParticipations, internationalisation } = state.common;
	const { errors, showErrors } = state.page.checkoutForm.payment.stripe;
	const shouldShowZipCode =
		internationalisation.countryId === 'US' &&
		abParticipations.mandatoryZipCode !== 'variant';
	const recaptchaErrors = getRecaptchaError(state);

	if (!showErrors) return {};

	if (shouldShowZipCode) {
		const zipCode =
			state.page.checkoutForm.billingAddress.fields.errorObject?.postCode;
		return {
			...errors,
			zipCode,
			robot_checkbox: recaptchaErrors,
		};
	}
	return { ...errors, robot_checkbox: recaptchaErrors };
}

export function getAmazonPayFormErrors(
	state: ContributionsState,
): ErrorCollection {
	const contributionType = getContributionType(state);

	const { errors } = state.page.checkoutForm.payment.amazonPay;

	if (contributionType === 'ONE_OFF') {
		return {
			paymentSelected: errors.paymentSelected,
		};
	}
	return errors;
}

function getDirectDebitFormErrors(state: ContributionsState): ErrorCollection {
	const { errors, formError } = state.page.checkoutForm.payment.directDebit;
	if (formError) {
		return {
			...errors,
			directDebitDetails: [formError],
		};
	}

	return {
		...errors,
	};
}

export function getPaymentMethodErrors(
	state: ContributionsState,
): ErrorCollection {
	const { payment } = state.page.checkoutForm;

	switch (payment.paymentMethod.name) {
		case 'Stripe':
			return getStripeFormErrors(state);

		case 'DirectDebit':
			return getDirectDebitFormErrors(state);

		case 'Sepa':
			return payment.sepa.errors;

		case 'AmazonPay':
			return getAmazonPayFormErrors(state);

		default:
			return {};
	}
}

export function getRecaptchaError(
	state: ContributionsState,
): string[] | undefined {
	const { paymentMethod } = state.page.checkoutForm.payment;

	if (recaptchaRequiredPaymentMethods.includes(paymentMethod.name)) {
		return state.page.checkoutForm.recaptcha.errors;
	}
}

export function getPaymentRequestButtonErrors(
	state: ContributionsState,
): ErrorCollection | null {
	const hasBeenClicked = hasPaymentRequestButtonBeenClicked(state);
	const hasBeenCompleted = hasPaymentRequestInterfaceClosed(state);

	const otherAmount = getOtherAmountErrors(state);

	if (hasBeenClicked && hasBeenCompleted) {
		const hasFailed = hasPaymentRequestPaymentFailed(state);
		const personalDetailsErrors = getPersonalDetailsErrors(state);

		// Either the payment itself has failed, or the personal details on the user's Apple/Google Pay account failed validation-
		// eg. they signed up with an emoji in their name
		// We can't meaningfully recover from this, so the best option is to try another payment method
		if (hasFailed || errorCollectionHasErrors(personalDetailsErrors)) {
			return {
				maincontent: [
					'Sorry, something went wrong. Please try another payment method',
				],
			};
		}
	}

	if (hasBeenClicked) {
		return { otherAmount };
	}

	return null;
}
