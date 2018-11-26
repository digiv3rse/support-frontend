// @flow

import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { getQueryParameter } from 'helpers/url';

const defaultHeaderCopy = 'Help us deliver the independent journalism the world needs';
const defaultContributeCopy = `
  Make a recurring commitment to support The\u00a0Guardian long-term or a single contribution 
  as and when you feel like it – choose the option that suits you best.
`;

export type CountryMetaData = {
  headerCopy: string,
  contributeCopy?: string,
  headerClasses?: string,
};

const countryGroupSpecificDetails: {
  [CountryGroupId]: CountryMetaData
} = {
  GBPCountries: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
  EURCountries: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
  UnitedStates: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
  AUDCountries: {
    headerCopy: 'Help us deliver the independent journalism Australia needs',
    contributeCopy: defaultContributeCopy,
  },
  International: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
  NZDCountries: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
  Canada: {
    headerCopy: defaultHeaderCopy,
    contributeCopy: defaultContributeCopy,
  },
};

const usCampaignDetails: CountryMetaData = {
  headerCopy: 'Make a year-end gift to The Guardian and invest in our independent journalism for 2019 and beyond.',
  headerClasses: 'header__us-campaign',
};

export { countryGroupSpecificDetails, usCampaignDetails };
