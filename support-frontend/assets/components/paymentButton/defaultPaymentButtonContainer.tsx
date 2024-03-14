import type { ContributionType } from 'helpers/contributions';
import { simpleFormatAmount } from 'helpers/forms/checkouts';
import { currencies } from 'helpers/internationalisation/currency';
import { isSupporterPlus } from 'helpers/redux/checkout/product/selectors/isSupporterPlus';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import { getUserSelectedAmount } from 'helpers/redux/checkout/product/selectors/selectedAmount';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { threeTierCheckoutEnabled } from 'pages/supporter-plus-landing/setup/threeTierChecks';
import { DefaultPaymentButton } from './defaultPaymentButton';

const contributionTypeToPaymentInterval: Partial<
	Record<ContributionType, 'month' | 'year'>
> = {
	MONTHLY: 'month',
	ANNUAL: 'year',
};

type ButtonTextCreator = (
	amountWithCurrency: string,
	amountIsAboveThreshold: boolean,
	paymentInterval?: 'month' | 'year' | undefined,
) => string;

export type DefaultPaymentContainerProps = {
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	createButtonText?: ButtonTextCreator;
	disabled?: boolean;
};

function getButtonText(
	amountWithCurrency: string,
	amountIsAboveThreshold: boolean,
	paymentInterval?: 'month' | 'year',
) {
	if (paymentInterval) {
		return `${
			amountIsAboveThreshold ? 'Pay' : 'Support us with'
		} ${amountWithCurrency} per ${paymentInterval}`;
	}

	return `Support us with ${amountWithCurrency}`;
}

export function DefaultPaymentButtonContainer({
	onClick,
	createButtonText = getButtonText,
}: DefaultPaymentContainerProps): JSX.Element {
	const { currencyId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);
	const { selectedAmounts, otherAmounts } = useContributionsSelector(
		(state) => state.page.checkoutForm.product,
	);
	const selectedAmount = useContributionsSelector(getUserSelectedAmount);
	const contributionType = useContributionsSelector(getContributionType);

	const currency = currencies[currencyId];
	const amountWithCurrency = simpleFormatAmount(currency, selectedAmount);

	const { countryGroupId, countryId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);

	const testId = 'qa-contributions-landing-submit-contribution-button';

	const amountIsAboveThreshold = isSupporterPlus(
		contributionType,
		selectedAmounts,
		otherAmounts,
		countryGroupId,
	);

	const buttonText = Number.isNaN(selectedAmount)
		? 'Pay now'
		: createButtonText(
				amountWithCurrency,
				amountIsAboveThreshold ||
					threeTierCheckoutEnabled(
						useContributionsSelector((state) => state.common).abParticipations,
						countryId,
					),
				contributionTypeToPaymentInterval[contributionType],
		  );

	return (
		<DefaultPaymentButton
			id={testId}
			buttonText={buttonText}
			onClick={onClick}
		/>
	);
}
