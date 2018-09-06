// @flow
import type { Tests } from './abtest';

// ----- Tests ----- //

export type AnnualContributionsTestVariant = 'control' | 'annual' | 'annualHigherAmounts' | 'notintest';

export const tests: Tests = {
  oneOffOneTimeSingle: {
    variants: ['control', 'single', 'once', 'oneTime'],
    audiences: {
      GBPCountries: {
        offset: 0,
        size: 1,
      },
      AUDCountries: {
        offset: 0,
        size: 1,
      },
      Canada: {
        offset: 0,
        size: 1,
      },
      NZDCountries: {
        offset: 0,
        size: 1,
      },
      International: {
        offset: 0,
        size: 1,
      },
      EURCountries: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 0,
  },
  recurringGuestCheckoutRoundTwo: {
    variants: ['control', 'guest'],
    audiences: {
      ALL: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 4,
  },
};
