import type { ContributionType } from 'helpers/contributions';
import { simpleFormatAmount } from 'helpers/forms/checkouts';
import { currencies } from 'helpers/internationalisation/currency';
import { setSelectedAmount } from 'helpers/redux/checkout/product/actions';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import { getUserSelectedAmount } from 'helpers/redux/checkout/product/selectors/selectedAmount';
import {
	getMinimumContributionAmount,
	isUserInAbVariant,
} from 'helpers/redux/commonState/selectors';
import {
	useContributionsDispatch,
	useContributionsSelector,
} from 'helpers/redux/storeHooks';
import { getThresholdPrice } from 'helpers/supporterPlus/benefitsThreshold';
import { isOneOff } from 'helpers/supporterPlus/isContributionRecurring';
import type { CheckoutBenefitsListProps } from './checkoutBenefitsList';
import { checkListData } from './checkoutBenefitsListData';

type CheckoutBenefitsListContainerProps = {
	renderBenefitsList: (props: CheckoutBenefitsListProps) => JSX.Element;
};

function getBenefitsListTitle(
	priceString: string,
	contributionType: ContributionType,
	isEmotionalBenefitTestVariant: boolean,
	isAustralia: boolean,
) {
	const billingPeriod = contributionType === 'MONTHLY' ? 'month' : 'year';
	return isEmotionalBenefitTestVariant && !isAustralia
		? `For ${priceString} per ${billingPeriod}`
		: `For ${priceString} per ${billingPeriod}, you’ll unlock`;
}

const getbuttonCopy = (
	higherTier: boolean,
	thresholdPriceWithCurrency: string,
	selectedAmount: number,
) =>
	higherTier || Number.isNaN(selectedAmount)
		? null
		: `Switch to ${thresholdPriceWithCurrency} to unlock all extras`;

export function CheckoutBenefitsListContainer({
	renderBenefitsList,
}: CheckoutBenefitsListContainerProps): JSX.Element | null {
	const dispatch = useContributionsDispatch();

	const contributionType = useContributionsSelector(getContributionType);
	if (isOneOff(contributionType)) {
		return null;
	}

	const { countryGroupId, currencyId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);
	const isAustralia = countryGroupId === 'AUDCountries' ? true : false;
	const selectedAmount = useContributionsSelector(getUserSelectedAmount);
	const minimumContributionAmount = useContributionsSelector(
		getMinimumContributionAmount,
	);

	const isEmotionalBenefitTestVariant = useContributionsSelector(
		isUserInAbVariant('emotionalBenefitTest', 'variant'),
	);

	const currency = currencies[currencyId];

	const thresholdPrice = getThresholdPrice(countryGroupId, contributionType);
	const thresholdPriceWithCurrency = simpleFormatAmount(
		currency,
		thresholdPrice,
	);
	const userSelectedAmountWithCurrency = simpleFormatAmount(
		currency,
		selectedAmount,
	);

	const higherTier = thresholdPrice <= selectedAmount;
	const displayBenefits =
		!Number.isNaN(selectedAmount) &&
		selectedAmount >= minimumContributionAmount;

	function handleButtonClick() {
		dispatch(
			setSelectedAmount({
				contributionType,
				amount: thresholdPrice.toString(),
			}),
		);
	}

	if (!displayBenefits) {
		return null;
	}

	return renderBenefitsList({
		title: getBenefitsListTitle(
			userSelectedAmountWithCurrency,
			contributionType,
			isEmotionalBenefitTestVariant,
			isAustralia,
		),
		checkListData: checkListData({
			higherTier,
			isAustralia,
			isEmotionalBenefitTestVariant,
		}),
		buttonCopy: getbuttonCopy(
			higherTier,
			thresholdPriceWithCurrency,
			selectedAmount,
		),
		handleButtonClick,
		countryGroupId,
	});
}
