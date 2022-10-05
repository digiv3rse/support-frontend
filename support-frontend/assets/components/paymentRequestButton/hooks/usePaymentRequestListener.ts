import type { PaymentMethod, PaymentRequest } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useContributionsDispatch } from 'helpers/redux/storeHooks';
import { trackComponentEvents } from 'helpers/tracking/ophan';
import { addPayerDetailsToRedux } from './utils';

type PaymentRequestListenerData = {
	paymentMethod: PaymentMethod | null;
	paymentWallet: string;
	paymentAuthorised: boolean;
};

export function usePaymentRequestListener(
	paymentRequest: PaymentRequest | null,
): PaymentRequestListenerData {
	const [paymentWallet, setPaymentWallet] = useState<string>('');
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
		null,
	);
	const [paymentAuthorised, setPaymentAuthorised] = useState<boolean>(false);

	const dispatch = useContributionsDispatch();

	useEffect(() => {
		if (paymentRequest) {
			paymentRequest.on('paymentmethod', (paymentMethodEvent) => {
				const { paymentMethod, walletName } = paymentMethodEvent;

				// Always dismiss the payment popup immediately - any pending/success/failure will be displayed on our own page.
				// This is because `complete` must be called within 30 seconds or the user will see an error.
				// Our backend (support-workers) can in extreme cases take longer than this, so we must call complete now.
				// This means that the browser's payment popup will be dismissed, and our own 'spinner' will be displayed until
				// the backend job finishes.
				paymentMethodEvent.complete('success');

				setPaymentMethod(paymentMethod);
				setPaymentWallet(walletName);
				addPayerDetailsToRedux(dispatch, paymentMethodEvent);

				setPaymentAuthorised(true);

				const walletType =
					(paymentMethod.card?.wallet?.type as string | null) ?? 'no-wallet';

				trackComponentEvents({
					component: {
						componentType: 'ACQUISITIONS_OTHER',
					},
					action: 'CLICK',
					id: 'stripe-prb-wallet',
					value: walletType,
				});
			});
		}
	}, [paymentRequest]);

	return {
		paymentMethod,
		paymentWallet,
		paymentAuthorised,
	};
}
