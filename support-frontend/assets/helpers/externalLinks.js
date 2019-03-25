// @flow

// ----- Imports ----- //

import { type Campaign, deriveSubsAcquisitionData, type ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import { type CountryGroupId, countryGroups } from 'helpers/internationalisation/countryGroup';
import { type Option } from 'helpers/types/option';
import type { Participations } from 'helpers/abTests/abtest';
import { type OptimizeExperiments } from 'helpers/optimize/optimize';
import { getBaseDomain } from 'helpers/url';
import { Annual, Quarterly, SixForSix, Monthly, type WeeklyBillingPeriod, type DigitalBillingPeriod } from 'helpers/billingPeriods';
import type { SubscriptionProduct } from 'helpers/subscriptions';
import { getIntcmp, getPromoCode, getAnnualPlanPromoCode } from './flashSale';
import { getOrigin } from './url';
import { GBPCountries } from './internationalisation/countryGroup';
import type { PaperProductOptions } from 'helpers/productPrice/productOptions';
import type { PaperFulfilmentOptions } from 'helpers/productPrice/fulfilmentOptions';
import { HomeDelivery } from 'helpers/productPrice/fulfilmentOptions';

// ----- Types ----- //

export type MemProduct = 'patrons' | 'events';

type PromoCodes = {
  [SubscriptionProduct]: string,
};

export type SubsUrls = {
  [SubscriptionProduct]: string,
};


// ----- Setup ----- //

const subsUrl = `https://subscribe.${getBaseDomain()}`;
const patronsUrl = 'https://patrons.theguardian.com';
const profileUrl = `https://profile.${getBaseDomain()}`;
const manageUrl = `https://manage.${getBaseDomain()}`;
const defaultIntCmp = 'gdnwb_copts_bundles_landing_default';
const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.guardian';
const emailPreferencesUrl = `${profileUrl}/email-prefs`;
const myAccountUrl = `${profileUrl}/account/edit`;
const manageSubsUrl = `${manageUrl}/subscriptions`;


function getWeeklyZuoraCode(period: WeeklyBillingPeriod, countryGroup: CountryGroupId) {

  const sixWeekDomestic = 'weeklydomestic-gwoct18-sixforsix-domestic';
  const sixWeekRow = 'weeklyrestofworld-gwoct18-sixforsix-row';

  const quarterDomestic = 'weeklydomestic-gwoct18-quarterly-domestic';
  const quarterRow = 'weeklyrestofworld-gwoct18-quarterly-row';

  const yearDomestic = 'weeklydomestic-gwoct18-annual-domestic';
  const yearRow = 'weeklyrestofworld-gwoct18-annual-row';

  const urls = {
    [SixForSix]: {
      GBPCountries: sixWeekDomestic,
      UnitedStates: sixWeekDomestic,
      AUDCountries: sixWeekDomestic,
      NZDCountries: sixWeekDomestic,
      EURCountries: sixWeekDomestic,
      Canada: sixWeekDomestic,
      International: sixWeekRow,
    },
    [Quarterly]: {
      GBPCountries: quarterDomestic,
      UnitedStates: quarterDomestic,
      AUDCountries: quarterDomestic,
      NZDCountries: quarterDomestic,
      EURCountries: quarterDomestic,
      Canada: quarterDomestic,
      International: quarterRow,
    },
    [Annual]: {
      GBPCountries: yearDomestic,
      UnitedStates: yearDomestic,
      AUDCountries: yearDomestic,
      NZDCountries: yearDomestic,
      EURCountries: yearDomestic,
      Canada: yearDomestic,
      International: yearRow,
    },
  };

  return urls[period][countryGroup];
}

const memUrls: {
  [MemProduct]: string,
} = {
  events: 'https://membership.theguardian.com/events',
};

const defaultPromos: PromoCodes = {
  DigitalPack: getPromoCode('DigitalPack', GBPCountries, 'DXX83X'),
  Paper: getPromoCode('Paper', GBPCountries, 'GXX83P'),
  PaperAndDigital: getPromoCode('PaperAndDigital', GBPCountries, 'GXX83X'),
  GuardianWeekly: getPromoCode('GuardianWeekly', GBPCountries, '10ANNUAL'),
};

const customPromos: {
  [Campaign]: PromoCodes,
} = {
  seven_fifty_middle: {
    DigitalPack: 'D750MIDDLE',
    Paper: 'N750MIDDLE',
    PaperAndDigital: 'ND750MIDDLE',
  },
  seven_fifty_end: {
    DigitalPack: 'D750END',
    Paper: 'N750END',
    PaperAndDigital: 'ND750END',
  },
  seven_fifty_email: {
    DigitalPack: 'D750EMAIL',
    Paper: 'N750EMAIL',
    PaperAndDigital: 'ND750EMAIL',
  },
  epic_paradise_paradise_highlight: {
    DigitalPack: 'DPARAHIGH',
    Paper: 'NPARAHIGH',
    PaperAndDigital: 'NDPARAHIGH',
  },
  epic_paradise_control: {
    DigitalPack: 'DPARACON',
    Paper: 'NPARACON',
    PaperAndDigital: 'NDPARACON',
  },
  epic_paradise_different_highlight: {
    DigitalPack: 'DPARADIFF',
    Paper: 'NPARADIFF',
    PaperAndDigital: 'NDPARADIFF',
  },
  epic_paradise_standfirst: {
    DigitalPack: 'DPARASTAND',
    Paper: 'NPARASTAND',
    PaperAndDigital: 'NDPARASTAND',
  },
  banner_just_one_control: {
    DigitalPack: 'DBANJUSTCON',
    Paper: 'NBANJUSTCON',
    PaperAndDigital: 'NDBANJUSTCON',
  },
  banner_just_one_just_one: {
    DigitalPack: 'DBANJUSTONE',
    Paper: 'NBANJUSTONE',
    PaperAndDigital: 'NDBANJUSTONE',
  },
};


// ----- Functions ----- //

// Creates URLs for the membership site from promo codes and intCmp.
function getMemLink(product: MemProduct, intCmp: ?string): string {

  const params = new URLSearchParams();
  params.append('INTCMP', intCmp || defaultIntCmp);

  return `${memUrls[product]}?${params.toString()}`;

}

function getPatronsLink(intCmp: ?string): string {

  const params = new URLSearchParams();
  params.append('INTCMP', intCmp || defaultIntCmp);

  return `${patronsUrl}?${params.toString()}`;
}

function buildParamString(
  product: SubscriptionProduct,
  countryGroupId: CountryGroupId,
  intCmp: ?string,
  referrerAcquisitionData: ReferrerAcquisitionData | null,
): string {
  const params = new URLSearchParams(window.location.search);

  const maybeCustomIntcmp = getIntcmp(product, countryGroupId, intCmp, defaultIntCmp);
  params.set('INTCMP', maybeCustomIntcmp);

  if (referrerAcquisitionData) {
    params.set('acquisitionData', JSON.stringify(referrerAcquisitionData));
  }

  return params.toString();
}

// Creates URLs for the subs site from promo codes and intCmp.
function buildSubsUrls(
  countryGroupId: CountryGroupId,
  promoCodes: PromoCodes,
  intCmp: ?string,
  referrerAcquisitionData: ReferrerAcquisitionData,
): SubsUrls {

  const countryId = countryGroups[countryGroupId].supportInternationalisationId;

  // paper only applies to uk, so hardcode the country
  const paper = '/uk/subscribe/paper';
  const paperDig = `${subsUrl}/p/${promoCodes.PaperAndDigital}?${buildParamString('PaperAndDigital', countryGroupId, intCmp, referrerAcquisitionData)}`;
  const digital = `/${countryId}/subscribe/digital`;
  const weekly = `/${countryId}/subscribe/weekly`;

  return {
    DigitalPack: digital,
    Paper: paper,
    PaperAndDigital: paperDig,
    GuardianWeekly: weekly,
  };

}

// Creates links to subscriptions, tailored to the user's campaign.
function getSubsLinks(
  countryGroupId: CountryGroupId,
  intCmp: ?string,
  campaign: ?Campaign,
  referrerAcquisitionData: ReferrerAcquisitionData,
  nativeAbParticipations: Participations,
  optimizeExperiments: OptimizeExperiments,
): SubsUrls {
  const acquisitionData = deriveSubsAcquisitionData(
    referrerAcquisitionData,
    nativeAbParticipations,
    optimizeExperiments,
  );

  if ((campaign && customPromos[campaign])) {
    return buildSubsUrls(
      countryGroupId,
      customPromos[campaign],
      intCmp,
      acquisitionData,
    );
  }

  return buildSubsUrls(countryGroupId, defaultPromos, intCmp, acquisitionData);

}

// Puts in URL parameters
const withParams = ({
  referrerAcquisitionData,
  cgId,
  nativeAbParticipations,
  optimizeExperiments,
  promoCode,
}: {
  referrerAcquisitionData: ReferrerAcquisitionData,
  cgId: Option<CountryGroupId>,
  nativeAbParticipations: Participations,
  optimizeExperiments: OptimizeExperiments,
  promoCode: Option<string>,
}) => (url: string) => {
  const acquisitionData = deriveSubsAcquisitionData(
    referrerAcquisitionData,
    nativeAbParticipations,
    optimizeExperiments,
  );

  const params = new URLSearchParams(window.location.search);

  params.set('acquisitionData', JSON.stringify(acquisitionData));
  if (cgId) {
    params.set('countryGroup', countryGroups[cgId].supportInternationalisationId);
  }
  if (promoCode) {
    params.set('promoCode', promoCode);
  }
  return [url, params.toString()].join('?');
};

function getDigitalPackPromoCode(cgId: CountryGroupId, billingPeriod: DigitalBillingPeriod): string {
  if (billingPeriod === 'Annual') {
    return getAnnualPlanPromoCode('DigitalPack', cgId, defaultPromos.DigitalPack);
  }
  return getPromoCode('DigitalPack', cgId, defaultPromos.DigitalPack);

}

// Builds a link to the digital pack checkout.
function getDigitalCheckout(
  countryGroupId: CountryGroupId,
  billingPeriod: DigitalBillingPeriod = Monthly,
): string {
  const promoCode = getDigitalPackPromoCode(countryGroupId, billingPeriod);
  const params = new URLSearchParams(window.location.search);
  params.set('promoCode', promoCode);
  if (billingPeriod === Annual) {
    params.set('period', Annual);
  }
  return `${getOrigin()}/subscribe/digital/checkout?${params.toString()}`;
}


// Builds a link to the GW checkout.
function getWeeklyCheckout(
  referrerAcquisitionData: ReferrerAcquisitionData,
  period: WeeklyBillingPeriod,
  cgId: CountryGroupId,
  nativeAbParticipations: Participations,
  optimizeExperiments: OptimizeExperiments,
  promoCode: Option<string>,
): string {
  const acquisitionData = deriveSubsAcquisitionData(
    referrerAcquisitionData,
    nativeAbParticipations,
    optimizeExperiments,
  );

  const url = getWeeklyZuoraCode(period, cgId);
  const params = new URLSearchParams(window.location.search);

  params.set('acquisitionData', JSON.stringify(acquisitionData));
  params.set('countryGroup', countryGroups[cgId].supportInternationalisationId);

  if (promoCode) {
    params.set('promoCode', promoCode);
  }

  return `${subsUrl}/checkout/${url}?${params.toString()}`;
}


// Builds a link to paper subs checkout
function getLegacyPaperCheckout(
  productOption: PaperProductOptions,
  fulfilmentOption: PaperFulfilmentOptions,
  referrerAcquisitionData: ReferrerAcquisitionData,
  nativeAbParticipations: Participations,
  optimizeExperiments: OptimizeExperiments,
) {
  const promoCode = getPromoCode('Paper', GBPCountries, defaultPromos.Paper);

  const fulfilmentPart = fulfilmentOption === HomeDelivery ? 'delivery' : 'voucher';

  return withParams({
    referrerAcquisitionData,
    cgId: null,
    nativeAbParticipations,
    optimizeExperiments,
    promoCode,
  })([subsUrl, 'checkout', `${fulfilmentPart}-${productOption.toLowerCase()}`].join('/'));
}


function convertCountryGroupIdToAppStoreCountryCode(cgId: CountryGroupId) {
  const groupFromId = countryGroups[cgId];
  if (groupFromId) {
    switch (groupFromId.supportInternationalisationId.toLowerCase()) {
      case 'uk':
        return 'gb';
      case 'int':
        return 'us';
      case 'eu':
        return 'us';
      default:
        return groupFromId.supportInternationalisationId.toLowerCase();
    }
  } else {
    return 'us';
  }
}

function getAppleStoreUrl(product: string, countryGroupId: CountryGroupId) {
  const appStoreCountryCode = convertCountryGroupIdToAppStoreCountryCode(countryGroupId);
  return `https://itunes.apple.com/${appStoreCountryCode}/app/${product}?mt=8`;
}

function getIosAppUrl(countryGroupId: CountryGroupId) {
  return getAppleStoreUrl('the-guardian/id409128287', countryGroupId);
}

function getDailyEditionUrl(countryGroupId: CountryGroupId) {
  return getAppleStoreUrl('guardian-observer-daily-edition/id452707806', countryGroupId);
}

function getSignoutUrl(returnUrl: ?string): string {
  const encodedReturn = encodeURIComponent(returnUrl || window.location);
  return `https://profile.${getBaseDomain()}/signout?returnUrl=${encodedReturn}`;
}

// ----- Exports ----- //

export {
  getSubsLinks,
  getMemLink,
  getPatronsLink,
  getDigitalCheckout,
  getIosAppUrl,
  androidAppUrl,
  getDailyEditionUrl,
  getSignoutUrl,
  emailPreferencesUrl,
  myAccountUrl,
  manageSubsUrl,
  getWeeklyCheckout,
  getLegacyPaperCheckout,
};
