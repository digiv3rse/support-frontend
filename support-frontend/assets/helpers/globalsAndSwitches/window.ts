import type { Output } from 'valibot';
import { boolean, object, optional, string, ValiError } from 'valibot';

/**
 * This file is used to validate data that get's injected from
 * the Play controllers onto the `window.guardian` object of the page.
 *
 * It will only error in NODE_ENV === 'development'.
 */
const PaymentConfigSchema = object({
	geoip: optional(
		object({
			countryCode: string(),
			stateCode: optional(string()),
		}),
	),
	stripeKeyDefaultCurrencies: object({
		ONE_OFF: object({ default: string(), test: string() }),
		REGULAR: object({ default: string(), test: string() }),
	}),
	stripeKeyAustralia: object({
		ONE_OFF: object({ default: string(), test: string() }),
		REGULAR: object({ default: string(), test: string() }),
	}),
	stripeKeyUnitedStates: object({
		ONE_OFF: object({ default: string(), test: string() }),
		REGULAR: object({ default: string(), test: string() }),
	}),
	amazonPayClientId: object({
		default: string(),
		test: string(),
	}),
	amazonPaySellerId: object({
		default: string(),
		test: string(),
	}),
	payPalEnvironment: object({
		default: string(),
		test: string(),
	}),
	mdapiUrl: string(),
	paymentApiPayPalEndpoint: string(),
	paymentApiUrl: string(),
	csrf: object({ token: string() }),
	guestAccountCreationToken: optional(string()),
	recaptchaEnabled: boolean(),
	v2recaptchaPublicKey: string(),
});

export type PaymentConfig = Output<typeof PaymentConfigSchema>;

export const validatePaymentConfig = (obj: unknown) => {
	// We only run this in development as we don't want to hard error on what might be an OK error.
	if (process.env.NODE_ENV === 'development') {
		void import('valibot').then((valibot) => {
			try {
				valibot.parse(PaymentConfigSchema, obj);
			} catch (e) {
				if (e instanceof ValiError) {
					console.error('Valibot error', e.issues);
				} else {
					console.error(e);
				}
			}
		});
	}
};
