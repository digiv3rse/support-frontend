// @flow
import * as React from 'react';
import { init as pageInit } from 'helpers/page/page';
// constants
import {
  DigitalPack,
  displayPrice,
  GuardianWeekly,
  Paper,
  PaperAndDigital,
  PremiumTier,
  sendTrackingEventsOnClick,
  subscriptionPricesForDefaultBillingPeriod,
  type SubscriptionProduct,
} from 'helpers/subscriptions';
import { getCampaign } from 'helpers/tracking/acquisitions';
import {
  androidAppUrl,
  getIosAppUrl,
  getSubsLinks,
} from 'helpers/externalLinks';
import trackAppStoreLink from 'components/subscriptionBundles/appCtaTracking';
// images
import GuardianWeeklyPackShot
  from 'components/packshots/guardian-weekly-packshot';
import PremiumAppPackshot from 'components/packshots/premium-app-packshot';
import PaperAndDigitalPackshot
  from 'components/packshots/paper-and-digital-packshot';
import GuardianWeeklyPackShotHero
  from 'components/packshots/guardian-weekly-packshot-hero';
import DigitalPackshotHero
  from 'components/packshots/digital-packshot-hero';
import DigitalPackshot
  from 'components/packshots/digital-packshot';
import PrintFeaturePackshot from 'components/packshots/print-feature-packshot';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
  AUDCountries,
  EURCountries,
  GBPCountries,
  International,
} from 'helpers/internationalisation/countryGroup';
import type { Option } from 'helpers/types/option';
import {
  flashSaleIsActive,
  getDisplayFlashSalePrice,
  getSaleCopy,
} from 'helpers/flashSale';
import { Monthly } from 'helpers/billingPeriods';
import {
  fromCountryGroupId,
  glyph,
} from 'helpers/internationalisation/currency';

// types

export type ProductButton = {
  ctaButtonText: string,
  link: string,
  analyticsTracking: Function,
  hierarchy?: string,
}

type ProductCopy = {
  title: string,
  subtitle: Option<string>,
  description: string,
  productImage: React.Node,
  offer?: string,
  buttons: ProductButton[],
  isFeature?: boolean,
}

// store
const store = pageInit();
const commonStore = store.getState().common;
const { countryGroupId } = commonStore.internationalisation;
const { referrerAcquisitionData, abParticipations } = commonStore;

const digitalIsTop = abParticipations.subsShowcaseOrderingTest !== 'weeklyTop';

const abTest = null;

const subsLinks = getSubsLinks(
  countryGroupId,
  referrerAcquisitionData.campaignCode,
  getCampaign(referrerAcquisitionData),
  referrerAcquisitionData,
  abParticipations,
);

const isUK = () => countryGroupId === GBPCountries;
const isEU = () => countryGroupId === EURCountries;
const isInternational = () => countryGroupId === International;
const isAUS = () => countryGroupId === AUDCountries;

const getPrice = (product: SubscriptionProduct, alternativeText: string) => {

  if (flashSaleIsActive(product, countryGroupId)) {
    return getDisplayFlashSalePrice(product, countryGroupId, Monthly);
  }

  if (subscriptionPricesForDefaultBillingPeriod[product][countryGroupId]) {
    return `${displayPrice(product, countryGroupId)}`;
  }

  return alternativeText;
};

function getGuardianWeeklyOfferCopy() {
  const copy = getSaleCopy(GuardianWeekly, countryGroupId).bundle.subHeading;
  if (copy !== '') {
    return copy;
  }
  const currency = glyph(fromCountryGroupId(countryGroupId) || 'GBP');
  return `6 issues for ${currency}6`;
}

const getDigitalImage = () => {
  if (digitalIsTop && (isEU() || isInternational())) {
    return <DigitalPackshotHero />;
  }
  return <DigitalPackshot />;
};

const digital: ProductCopy = {
  title: 'Digital Subscription',
  subtitle: getPrice(DigitalPack, ''),
  description: isAUS()
    ? 'The UK Guardian Daily, Premium access to The Guardian Live app and ad-free reading on theguardian.com'
    : 'The Guardian Daily, Premium access to The Guardian Live app and ad-free reading on theguardian.com',
  productImage: getDigitalImage(),
  offer: getSaleCopy(DigitalPack, countryGroupId).bundle.subHeading,
  buttons: [{
    ctaButtonText: 'Find out more',
    link: subsLinks.DigitalPack,
    analyticsTracking: sendTrackingEventsOnClick('digipack_cta', 'DigitalPack', abTest, 'digital-subscription'),
  }],
  isFeature: true,
};

const getWeeklyImage = () => {
  if (isUK() || (digitalIsTop && (isEU() || isInternational()))) {
    return <GuardianWeeklyPackShot />;
  }
  return <GuardianWeeklyPackShotHero />;
};

const guardianWeekly: ProductCopy = {
  title: 'The Guardian Weekly',
  subtitle: getPrice(GuardianWeekly, ''),
  description: 'A weekly, global magazine from The Guardian, with delivery worldwide',
  offer: getGuardianWeeklyOfferCopy(),
  buttons: [
    {
      ctaButtonText: 'Find out more',
      link: subsLinks.GuardianWeekly,
      analyticsTracking: sendTrackingEventsOnClick('weekly_cta', 'GuardianWeekly', abTest),
    },
    {
      ctaButtonText: 'See gift options',
      link: subsLinks.GuardianWeeklyGift,
      analyticsTracking: sendTrackingEventsOnClick('weekly_cta_gift', 'GuardianWeekly', abTest),
      modifierClasses: '',
    },
  ],
  productImage: getWeeklyImage(),
};

const paper: ProductCopy = {
  title: 'Paper',
  subtitle: `from ${getPrice(Paper, '')}`,
  description: 'Save on The Guardian and The Observer\'s newspaper retail price all year round',
  buttons: [{
    ctaButtonText: 'Find out more',
    link: subsLinks.Paper,
    analyticsTracking: sendTrackingEventsOnClick('paper_cta', Paper, abTest, 'paper-subscription'),
  }],
  productImage: <PrintFeaturePackshot />,
  offer: getSaleCopy(Paper, countryGroupId).bundle.subHeading,
};

const paperAndDigital: ProductCopy = {
  title: 'Paper+Digital',
  subtitle: `from ${getPrice(PaperAndDigital, '')}`,
  description: 'All the benefits of a paper subscription, plus access to the digital subscription',
  buttons: [{
    ctaButtonText: 'Find out more',
    link: subsLinks.PaperAndDigital,
    analyticsTracking: sendTrackingEventsOnClick('paper_digital_cta', PaperAndDigital, abTest, 'paper-and-digital-subscription'),
  }],
  productImage: <PaperAndDigitalPackshot />,
  offer: getSaleCopy(PaperAndDigital, countryGroupId).bundle.subHeading,
};

const premiumApp: ProductCopy = {
  title: 'Premium App',
  subtitle: getPrice(PremiumTier, '7-day free Trial'),
  description: 'The ad-free, Premium App, designed especially for your smartphone and tablet',
  buttons: [{
    ctaButtonText: 'Buy in App Store',
    link: getIosAppUrl(countryGroupId),
    analyticsTracking: trackAppStoreLink('premium_tier_ios_cta', 'PremiumTier', abTest),
  }, {
    ctaButtonText: 'Buy on Google Play',
    link: androidAppUrl,
    analyticsTracking: trackAppStoreLink('premium_tier_android_cta', 'PremiumTier', abTest),
    hierarchy: 'first',
  }],
  productImage: <PremiumAppPackshot />,
  classModifier: ['subscriptions__premuim-app'],
};

const testOrdering = abParticipations.subsShowcaseOrderingTest === 'weeklyTop' ?
  [
    guardianWeekly,
    digital,
    premiumApp,
  ] :
  [
    digital,
    guardianWeekly,
    premiumApp,
  ];

const orderedProducts: { [CountryGroupId]: ProductCopy[] } = {
  GBPCountries: [
    paper,
    digital,
    guardianWeekly,
    paperAndDigital,
    premiumApp,
  ],
  UnitedStates: [
    guardianWeekly,
    digital,
    premiumApp,
  ],
  International: testOrdering,
  AUDCountries: [
    guardianWeekly,
    digital,
    premiumApp,
  ],
  EURCountries: testOrdering,
  NZDCountries: [
    guardianWeekly,
    digital,
    premiumApp,
  ],
  Canada: [
    guardianWeekly,
    digital,
    premiumApp,
  ],
};

const subscriptionCopy = orderedProducts[countryGroupId];

export { subscriptionCopy };
