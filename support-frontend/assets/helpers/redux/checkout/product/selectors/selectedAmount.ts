import type { ContributionsState } from 'helpers/redux/contributionsStore';
import { getContributionType } from './productType';

export function getUserSelectedAmount(state: ContributionsState): number {
	const contributionType = getContributionType(state);
	const { selectedAmounts, otherAmounts } = state.page.checkoutForm.product;
	const priceCardAmountSelected = selectedAmounts[contributionType];

	if (priceCardAmountSelected === 'other') {
		const customAmount = otherAmounts[contributionType];
		return Number.parseFloat(customAmount.amount ?? '');
	}

	return priceCardAmountSelected;
}
