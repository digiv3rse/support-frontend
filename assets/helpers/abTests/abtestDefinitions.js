// @flow
import type { Tests } from './abtest';

// ----- Tests ----- //

export const tests: Tests = {
  paymentLogosTest: {
    variants: ['control', 'variant'],
    audiences: {
      GB: {
        offset: 0,
        size: 1,
      },
      US: {
        offset: 0,
        size: 1,
      },
    },
    customSegmentCondition: () => window.matchMedia('(min-width: 980px)').matches, // matches the 'desktop' breakpoint defined in breakpoints.scss
    isActive: false,
    independent: true,
    seed: 0,
  },
};
