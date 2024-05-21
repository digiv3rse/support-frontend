import { useEffect } from 'react';
import type { ContributionType } from 'helpers/contributions';
import { getValidPaymentMethods } from 'helpers/forms/checkouts';
import type { RecentlySignedInExistingPaymentMethod } from 'helpers/forms/existingPaymentMethods/existingPaymentMethods';
import type { PaymentMethod } from 'helpers/forms/paymentMethods';
import {
	ExistingCard,
	ExistingDirectDebit,
} from 'helpers/forms/paymentMethods';
import { selectExistingPaymentMethod } from 'helpers/redux/checkout/payment/existingPaymentMethods/actions';
import type { ExistingPaymentMethodsState } from 'helpers/redux/checkout/payment/existingPaymentMethods/state';
import { setPaymentMethod } from 'helpers/redux/checkout/payment/paymentMethod/actions';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import {
	useContributionsDispatch,
	useContributionsSelector,
} from 'helpers/redux/storeHooks';
import {
	trackComponentClick,
	trackComponentInsert,
} from 'helpers/tracking/behaviour';
import { sendEventContributionPaymentMethod } from 'helpers/tracking/quantumMetric';
import type { PaymentMethodSelectorProps } from './paymentMethodSelector';

function getExistingPaymentMethodProps(
	existingPaymentMethods: ExistingPaymentMethodsState,
) {
	if (existingPaymentMethods.showExistingPaymentMethods) {
		const showReauthenticateLink =
			existingPaymentMethods.showReauthenticateLink;

		const existingPaymentMethodList = existingPaymentMethods.paymentMethods;

		return {
			existingPaymentMethod: existingPaymentMethods.selectedPaymentMethod,
			existingPaymentMethodList,
			pendingExistingPaymentMethods:
				existingPaymentMethods.status === 'pending',
			showReauthenticateLink,
		};
	}
	return {
		existingPaymentMethodList: [],
		pendingExistingPaymentMethods: existingPaymentMethods.status === 'pending',
		showReauthenticateLink: false,
	};
}

type PaymentMethodSelectorContainerProps = {
	render: (
		paymentMethodSelectorProps: PaymentMethodSelectorProps,
	) => JSX.Element;
	contributionTypeOverride?: ContributionType;
};

function PaymentMethodSelectorContainer({
	render,
	contributionTypeOverride,
}: PaymentMethodSelectorContainerProps): JSX.Element {
	const dispatch = useContributionsDispatch();
	const contributionType =
		contributionTypeOverride ?? useContributionsSelector(getContributionType);

	const { countryId, countryGroupId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);

	const { name, errors } = useContributionsSelector(
		(state) => state.page.checkoutForm.payment.paymentMethod,
	);

	const { existingPaymentMethods } = useContributionsSelector(
		(state) => state.page.checkoutForm.payment,
	);

	const availablePaymentMethods = getValidPaymentMethods(
		contributionType,
		countryId,
		countryGroupId,
	).filter(
		(methodName) =>
			methodName !== ExistingCard && methodName !== ExistingDirectDebit,
	);

	function onPaymentMethodEvent(
		event: 'select' | 'render',
		paymentMethod: PaymentMethod,
		existingPaymentMethod?: RecentlySignedInExistingPaymentMethod,
	): void {
		const paymentMethodDescription = existingPaymentMethod
			? existingPaymentMethod.paymentType
			: paymentMethod;

		const trackingId = `payment-method-selector-${paymentMethodDescription}`;

		if (event === 'select') {
			console.log('TEST trackComponentClick-paymentMethodSelectorContainer');
			trackComponentClick(trackingId);
			sendEventContributionPaymentMethod(paymentMethodDescription);
			dispatch(setPaymentMethod({ paymentMethod }));
			existingPaymentMethod &&
				dispatch(selectExistingPaymentMethod(existingPaymentMethod));
		} else {
			trackComponentInsert(trackingId);
		}
	}

	useEffect(() => {
		availablePaymentMethods.length === 1 &&
			dispatch(setPaymentMethod({ paymentMethod: availablePaymentMethods[0] }));
	}, []);

	return render({
		availablePaymentMethods: availablePaymentMethods,
		paymentMethod: name,
		validationError: errors?.[0],
		...getExistingPaymentMethodProps(existingPaymentMethods),
		onPaymentMethodEvent,
	});
}

export default PaymentMethodSelectorContainer;
