// @flow
import type { Tests } from './abtest';

// ----- Tests ----- //

export const tests: Tests = {
  desktopAboveTheFold: {
    variants: ['control', 'variant'],
    audiences: {
      ALL: {
        offset: 0,
        size: 1,
      },
    },
    customSegmentCondition: () => window.matchMedia('(min-width: 980px)').matches && (window.location.pathname.indexOf('contribute') > 0), // matches the 'desktop' breakpoint defined in breakpoints.scss and contribute page
    isActive: true,
    independent: true,
    seed: 0,
  },
  ContributeLandingOneOffOnlyTest: {
    variants: ['control', 'oneOffOnly'],
    audiences: {
      ALL: {
        offset: 0,
        size: 1,
      },
    },
    customSegmentCondition: () => window.matchMedia('(max-width: 660px)').matches && (window.location.pathname.indexOf('contribute') > 0), // matches the 'phablet' breakpoint defined in breakpoints.scss
    isActive: false,
    independent: true,
    seed: 1,
  },
};
