import type { ComponentType, React } from 'react';
import type { Participations } from 'helpers/abTests/abtest';
import type {
	AmazonObject,
	AmazonPaymentsObject,
} from 'helpers/forms/paymentIntegrations/amazonPay/types';
import type { StripeKey } from 'helpers/forms/stripe';
import type { Settings } from 'helpers/globalsAndSwitches/settings';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import type { CsrfState } from 'helpers/redux/checkout/csrf/state';
import type { SendEventId } from 'helpers/tracking/quantumMetric';
import type { User } from 'helpers/user/user';

declare global {
	/* ~ Here, declare things that go in the global namespace, or augment
	 *~ existing declarations in the global namespace
	 */

	type PayPalButtonProps = {
		env: string;
		style: Record<string, string | boolean>;
		commit: boolean;
		validate: (actions: { enable: () => void; disable: () => void }) => void;
		funding: {
			disallowed: unknown[];
		};
		onClick: () => void;
		// This function is called when user clicks the PayPal button.
		payment: (
			resolve: (arg0: string) => void,
			reject: (error: Error) => void,
		) => void;
		// This function is called when the user finishes with PayPal interface (approves payment).
		onAuthorize: (data: Record<string, unknown>) => void | Promise<void>;
		onError?: () => void;
	};

	interface Window {
		guardian: {
			amazonPayClientId: {
				default: string;
				test: string;
			};
			amazonPaySellerId: {
				default: string;
				test: string;
			};
			csrf?: CsrfState;
			email?: string;
			enableContributionsCampaign: boolean;
			forceContributionsCampaign: boolean;
			geoip?: {
				countryCode: string;
				stateCode?: string;
			};
			gitCommitId?: string;
			mdapiUrl: string;
			orderIsAGift: boolean;
			paymentApiPayPalEndpoint: string;
			paymentApiUrl: string;
			payPalEnvironment: {
				default: string;
				test: string;
			};
			polyfillScriptLoaded?: boolean;
			polyfillVersion?: string;
			productPrices: ProductPrices;
			recaptchaEnabled?: boolean;
			serversideTests?: Participations | null;
			settings: Settings;
			stripeKeyAustralia: StripeKey;
			stripeKeyDefaultCurrencies: StripeKey;
			stripeKeyUnitedStates: StripeKey;
			testMode?: boolean;
			user?: User;
			v2recaptchaPublicKey: string;
		};

		amazon?: AmazonObject;
		disablePayPalButton?: () => void;
		enablePayPalButton?: () => void;
		googleTagManagerDataLayer?: Array<Record<string, unknown>>;
		grecaptcha?: {
			render: (arg0: string, arg1: Record<string, unknown>) => number;
			reset: (id: number | undefined) => void;
		};
		gtag_enable_tcf_support?: boolean;
		OffAmazonPayments?: AmazonPaymentsObject;
		onAmazonLoginReady: unknown;
		onAmazonPaymentsReady: () => void;
		paypal: {
			FUNDING: {
				CREDIT: unknown;
			};
			Button: {
				driver: (
					name: 'react',
					{ React, ReactDOM }: { React: React; ReactDOM: typeof ReactDOM },
				) => ComponentType<PayPalButtonProps>;
			};
		};
		QuantumMetricAPI?: {
			isOn: () => boolean;
			sendEvent: (
				id: SendEventId,
				isConversion: 0 | 1 | 64,
				value: string,
			) => void;
			currencyConvertFromToValue: (
				value: number,
				sourceCurrency: IsoCurrency,
				targetCurrency: IsoCurrency,
			) => number;
		};
		v2OnloadCallback: () => void;
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: <R>(a: R) => R;
		__REDUX_DEVTOOLS_EXTENSION__?: () => undefined;
	}
}
/* ~ this line is required as per TypeScript's global-modifying-module.d.ts instructions */
export {};
