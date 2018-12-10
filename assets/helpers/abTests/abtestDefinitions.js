// @flow
import { isFromEpicOrBanner } from 'helpers/referrerComponent';
import type { Tests } from './abtest';

// ----- Tests ----- //

export type AnnualContributionsTestVariant = 'control' | 'annualAmountsA' | 'notintest';

export const tests: Tests = {

  usBackgroundImage: {
    variants: ['backgroundImage'],
    audiences: {
      UnitedStates: {
        offset: 0,
        size: 1,
      },
    },
    isActive: false,
    independent: true,
    seed: 1,
  },

  usSingleContributionsAmounts: {
    variants: ['control', 'singleD100', 'single3575'],
    audiences: {
      UnitedStates: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 5,
  },

  annualContributionsRoundThree: {
    variants: ['control', 'annualAmountsA'],
    audiences: {
      ALL: {
        offset: 0,
        size: 1,
      },
    },
    isActive: false,
    independent: true,
    seed: 3,
  },

  smallMobileHeaderNotEpicOrBanner: {
    variants: ['control', 'shrink', 'shrink_no-blurb', 'shrink_no-blurb_no-header'],
    audiences: {
      ALL: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 4,
    canRun: () => !isFromEpicOrBanner,
  },

  usContributionTypes: {
    variants: [
      'control',
      'default-annual',
      'default-single',
      'default-annual_no-monthly',
    ],
    audiences: {
      UnitedStates: {
        offset: 0,
        size: 1,
      },
    },
    isActive: false,
    independent: true,
    seed: 5,
  },
};
