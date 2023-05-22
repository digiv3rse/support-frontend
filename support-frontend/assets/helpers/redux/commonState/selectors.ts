import type { ContributionType } from 'helpers/contributions';
import { getConfigAbTestMin } from 'helpers/contributions';
import { config } from 'helpers/contributions';
import { getValidContributionTypesFromUrlOrElse } from 'helpers/forms/checkouts';
import { getContributionType } from '../checkout/product/selectors/productType';
import type { ContributionsState } from '../contributionsStore';

export function getDefaultContributionType(
	state: ContributionsState,
): ContributionType {
	const { countryGroupId } = state.common.internationalisation;
	const contributionTypes = getValidContributionTypesFromUrlOrElse(
		state.common.settings.contributionTypes,
	);
	const contribTypesForLocale = contributionTypes[countryGroupId];
	const defaultContributionType =
		contribTypesForLocale.find((contribType) => contribType.isDefault) ??
		contribTypesForLocale[0];

	return defaultContributionType.contributionType;
}

export function getMinimumContributionAmount(
	state: ContributionsState,
): number {
	const { countryGroupId, useLocalCurrency, localCurrencyCountry } =
		state.common.internationalisation;
	const contributionType = getContributionType(state);

	const min =
		useLocalCurrency && localCurrencyCountry && contributionType === 'ONE_OFF'
			? localCurrencyCountry.config[contributionType].min
			: getConfigAbTestMin(
					countryGroupId,
					contributionType,
					state.common.abParticipations['nudgeMinAmountsTest'] === 'variantA',
					state.common.abParticipations['nudgeMinAmountsTest'] === 'variantB',
			  );

	return min;
}

export function getMaximumContributionAmount(
	state: ContributionsState,
): number {
	const { countryGroupId, useLocalCurrency, localCurrencyCountry } =
		state.common.internationalisation;
	const contributionType = getContributionType(state);

	const { max } =
		useLocalCurrency && localCurrencyCountry && contributionType === 'ONE_OFF'
			? localCurrencyCountry.config[contributionType]
			: config[countryGroupId][contributionType];

	return max;
}

export function isUserInAbVariant(abTestName: string, variantName: string) {
	return function getAbTestStatus(state: ContributionsState): boolean {
		const participations = state.common.abParticipations;
		return participations[abTestName] === variantName;
	};
}
