import type { Settings, Status } from 'helpers/globalsAndSwitches/settings';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import type { PromotionCopy } from 'helpers/productPrice/promotions';
import type { AmountsTest, AmountsVariant } from '../contributions';

function isRecord(
	item: Record<string, unknown> | unknown,
): item is Record<string, unknown> {
	return item != null && !Array.isArray(item) && typeof item === 'object';
}

function getGlobal<T>(path = ''): T | null {
	const value = path
		.replace(/^window.guardian./, '')
		.replace(/\[(.+?)\]/g, '.$1')
		.split('.')
		.reduce<unknown>((config: unknown, key: string) => {
			if (isRecord(config)) {
				return config[key];
			}
			return config;
		}, window.guardian);

	if (value) {
		return value as T;
	}

	return null;
}

const emptyAmountsTestVariants: AmountsVariant[] = [
	{
		variantName: 'CONTROL',
		defaultContributionType: 'MONTHLY',
		displayContributionType: ['ONE_OFF', 'MONTHLY', 'ANNUAL'],
		amountsCardData: {
			ONE_OFF: {
				amounts: [],
				defaultAmount: 0,
				hideChooseYourAmount: false,
			},
			MONTHLY: {
				amounts: [],
				defaultAmount: 0,
				hideChooseYourAmount: false,
			},
			ANNUAL: {
				amounts: [],
				defaultAmount: 0,
				hideChooseYourAmount: false,
			},
		},
	},
];

export const emptyConfiguredRegionAmounts: AmountsTest = {
	testName: '',
	liveTestName: '',
	isLive: false,
	target: '',
	seed: 0,
	variants: emptyAmountsTestVariants,
};

const getSettings = (): Settings => {
	const globalSettings = getGlobal<Settings>('settings');
	const defaultSettings = {
		switches: {
			experiments: {},
		},
		// amounts: {
		// 	GBPCountries: emptyConfiguredRegionAmounts,
		// 	UnitedStates: emptyConfiguredRegionAmounts,
		// 	EURCountries: emptyConfiguredRegionAmounts,
		// 	AUDCountries: emptyConfiguredRegionAmounts,
		// 	International: emptyConfiguredRegionAmounts,
		// 	NZDCountries: emptyConfiguredRegionAmounts,
		// 	Canada: emptyConfiguredRegionAmounts,
		// },
		amounts: [
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__GBPCountries',
				target: 'GBPCountries',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__UnitedStates',
				target: 'UnitedStates',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__Canada',
				target: 'Canada',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__NZDCountries',
				target: 'NZDCountries',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__EURCountries',
				target: 'EURCountries',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__International',
				target: 'International',
			},
			{
				...emptyConfiguredRegionAmounts,
				testName: 'EMPTY_TEST__AUDCountries',
				target: 'AUDCountries',
			},
		],
		contributionTypes: {
			GBPCountries: [],
			UnitedStates: [],
			EURCountries: [],
			AUDCountries: [],
			International: [],
			NZDCountries: [],
			Canada: [],
		},
		metricUrl: '',
	};
	return globalSettings ?? defaultSettings;
};

const getProductPrices = (): ProductPrices | null =>
	getGlobal<ProductPrices>('productPrices');

const getPromotionCopy = (): PromotionCopy | null =>
	getGlobal<PromotionCopy>('promotionCopy');

const isSwitchOn = (switchName: string): boolean => {
	const sw = getGlobal<Status>(`settings.switches.${switchName}`);
	return !!(sw && sw === 'On');
};

export {
	getProductPrices,
	getPromotionCopy,
	getGlobal,
	getSettings,
	isSwitchOn,
};
