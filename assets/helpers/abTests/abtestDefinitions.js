// @flow
import type { Tests } from './abtest';

// ----- Tests ----- //

export const tests: Tests = {
  usSecureLogoTest: {
    variants: ['control', 'logo'],
    audiences: {
      US: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 6,
  },

  pleaseConsiderMonthly: {
    variants: ['control', 'variant'],
    audiences: {
      GB: {
        offset: 0,
        size: 1,
      },
    },
    isActive: true,
    independent: true,
    seed: 7,
  },
};

