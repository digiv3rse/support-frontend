import type { AmountsCardData, Config } from '../contributions';
import type { IsoCountry } from './country';
import type { IsoCurrency } from './currency';

export type LocalCurrencyCountry = {
	countryCode: IsoCountry;
	countryName: string;
	currency: IsoCurrency;
	amounts: Omit<AmountsCardData, 'MONTHLY' | 'ANNUAL'>;
	config: Omit<Config, 'MONTHLY' | 'ANNUAL'>;
};
export const localCurrencyCountries: {
	[key in IsoCountry]?: LocalCurrencyCountry;
} = {
	SE: {
		countryCode: 'SE',
		countryName: 'Sweden',
		currency: 'SEK',
		amounts: {
			ONE_OFF: {
				amounts: [250, 500, 1000, 2500],
				defaultAmount: 500,
				hideChooseYourAmount: false,
			},
		},
		config: {
			ONE_OFF: {
				min: 10,
				minInWords: 'ten',
				max: 23_000,
				maxInWords: 'twenty three thousand',
				default: 500,
			},
		},
	},
	CH: {
		countryCode: 'CH',
		countryName: 'Switzerland',
		currency: 'CHF',
		amounts: {
			ONE_OFF: {
				amounts: [27, 55, 110, 275],
				defaultAmount: 55,
				hideChooseYourAmount: false,
			},
		},
		config: {
			ONE_OFF: {
				min: 2,
				minInWords: 'two',
				max: 2_200,
				maxInWords: 'two thousand and two hundred',
				default: 55,
			},
		},
	},
	NO: {
		countryCode: 'NO',
		countryName: 'Norway',
		currency: 'NOK',
		amounts: {
			ONE_OFF: {
				amounts: [250, 500, 1000, 2500],
				defaultAmount: 500,
				hideChooseYourAmount: false,
			},
		},
		config: {
			ONE_OFF: {
				min: 10,
				minInWords: 'ten',
				max: 23_000,
				maxInWords: 'twenty three thousand',
				default: 500,
			},
		},
	},
	DK: {
		countryCode: 'DK',
		countryName: 'Denmark',
		currency: 'DKK',
		amounts: {
			ONE_OFF: {
				amounts: [185, 375, 745, 1850],
				defaultAmount: 375,
				hideChooseYourAmount: false,
			},
		},
		config: {
			ONE_OFF: {
				min: 10,
				minInWords: 'ten',
				max: 23_000,
				maxInWords: 'twenty three thousand',
				default: 375,
			},
		},
	},
};
