import type {
	ContributionType,
	RegularContributionType,
} from 'helpers/contributions';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { BillingPeriod } from 'helpers/productPrice/billingPeriods';
import { getPromotion } from 'helpers/productPrice/promotions';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { isRecurring } from './isContributionRecurring';

export type ThresholdAmounts = Record<RegularContributionType, number>;
export const upperBenefitsThresholds: Record<CountryGroupId, ThresholdAmounts> =
	{
		GBPCountries: {
			MONTHLY: 20,
			ANNUAL: 120,
		},
		UnitedStates: {
			MONTHLY: 20,
			ANNUAL: 120,
		},
		EURCountries: {
			MONTHLY: 20,
			ANNUAL: 120,
		},
		International: {
			MONTHLY: 22,
			ANNUAL: 150,
		},
		AUDCountries: {
			MONTHLY: 30,
			ANNUAL: 170,
		},
		NZDCountries: {
			MONTHLY: 30,
			ANNUAL: 170,
		},
		Canada: {
			MONTHLY: 22,
			ANNUAL: 150,
		},
	};

export const lowerBenefitsThresholds: Record<CountryGroupId, ThresholdAmounts> =
	{
		GBPCountries: {
			MONTHLY: 10,
			ANNUAL: 95,
		},
		UnitedStates: {
			MONTHLY: 13,
			ANNUAL: 120,
		},
		EURCountries: {
			MONTHLY: 10,
			ANNUAL: 95,
		},
		International: {
			MONTHLY: 13,
			ANNUAL: 120,
		},
		AUDCountries: {
			MONTHLY: 17,
			ANNUAL: 160,
		},
		NZDCountries: {
			MONTHLY: 17,
			ANNUAL: 160,
		},
		Canada: {
			MONTHLY: 13,
			ANNUAL: 120,
		},
	};
export function getLowerBenefitsThreshold(
	countryGroupId: CountryGroupId,
	contributionType: RegularContributionType,
): number {
	const contributionTypeThreshold =
		contributionType.toUpperCase() as keyof ThresholdAmounts;
	const billingPeriod = (contributionType[0] +
		contributionType.slice(1).toLowerCase()) as BillingPeriod;
	const promotion = useContributionsSelector((state) =>
		getPromotion(
			state.page.checkoutForm.product.productPrices,
			state.common.internationalisation.countryId,
			billingPeriod,
		),
	);
	return (
		promotion?.discountedPrice ??
		lowerBenefitsThresholds[countryGroupId][contributionTypeThreshold]
	);
}
export function getLowerBenefitsThresholds(
	countryGroupId: CountryGroupId,
): ThresholdAmounts {
	return {
		MONTHLY: getLowerBenefitsThreshold(countryGroupId, 'MONTHLY'),
		ANNUAL: getLowerBenefitsThreshold(countryGroupId, 'ANNUAL'),
	};
}

// This is a function overload that means if the caller has already determined that contributionType is recurring
// they do not have to handle an undefined return type from getThresholdPrice
// cf. https://www.typescriptlang.org/docs/handbook/2/functions.html#overload-signatures-and-the-implementation-signature

// Signatures
export function getThresholdPrice(
	countryGroupId: CountryGroupId,
	contributionType: 'ONE_OFF',
): undefined;
export function getThresholdPrice(
	countryGroupId: CountryGroupId,
	contributionType: RegularContributionType,
): number;
export function getThresholdPrice(
	countryGroupId: CountryGroupId,
	contributionType: ContributionType,
): number | undefined;
// Implementation
export function getThresholdPrice(
	countryGroupId: CountryGroupId,
	contributionType: ContributionType,
): number | undefined {
	if (isRecurring(contributionType)) {
		return getLowerBenefitsThreshold(countryGroupId, contributionType);
	}
}
