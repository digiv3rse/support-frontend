// @flow

// ----- Imports ----- //

import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
  Annual,
  type BillingPeriod,
  Monthly,
  Quarterly,
  SixForSix,
  type WeeklyBillingPeriod,
} from 'helpers/billingPeriods';
import { trackComponentEvents } from './tracking/ophanComponentEventTracking';
import { gaEvent } from './tracking/googleTagManager';
import { currencies, detect } from './internationalisation/currency';
import { isTestSwitchedOn } from 'helpers/globals';
import type { PaperProductOptions } from 'helpers/productPrice/productOptions';


// ----- Types ------ //

export type SubscriptionProduct =
  'DigitalPack' |
  'PremiumTier' |
  'DailyEdition' |
  'GuardianWeekly' |
  'Paper' |
  'PaperAndDigital';

type OphanSubscriptionsProduct = 'DIGITAL_SUBSCRIPTION' | 'PRINT_SUBSCRIPTION';

export type ComponentAbTest = {
  name: string,
  variant: string,
};

const dailyNewsstandPrice = 2.20;
const weekendNewsstandPrice = 3.20;
const newsstandPrices: {[PaperProductOptions]: number} = {
  Saturday: weekendNewsstandPrice,
  Sunday: weekendNewsstandPrice,
  Everyday: (dailyNewsstandPrice * 5) + (weekendNewsstandPrice * 2),
  Sixday: (dailyNewsstandPrice * 5) + weekendNewsstandPrice,
  Weekend: weekendNewsstandPrice * 2,
};

// ----- Config ----- //

const subscriptionPricesForDefaultBillingPeriod: {
  [SubscriptionProduct]: {
    [CountryGroupId]: number,
  }
} = {
  PremiumTier: {
    GBPCountries: 5.99,
    UnitedStates: 6.99,
    AUDCountries: 7.99,
    International: 5.99,
  },
  DigitalPack: {
    GBPCountries: 11.99,
    UnitedStates: 19.99,
    AUDCountries: 21.50,
    International: 19.99,
  },
  GuardianWeekly: {
    GBPCountries: 37.50,
    EURCountries: 61.30,
    UnitedStates: 75,
    Canada: 80,
    AUDCountries: 97.50,
    NZDCountries: 123,
    International: 81.30,
  },
  Paper: {
    GBPCountries: 10.79,
  },
  PaperAndDigital: {
    GBPCountries: 21.62,
  },
  DailyEdition: {
    GBPCountries: 11.99,
  },
};

const subscriptionPromoPricesForGuardianWeekly: {
  [string]: {
    [CountryGroupId]: {
      [WeeklyBillingPeriod]: number,
    }
  }
} = {
  '10ANNUAL': {
    GBPCountries: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.GBPCountries,
      [SixForSix]: 6,
      [Annual]: 135,
    },
    EURCountries: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.EURCountries,
      [SixForSix]: 6,
      [Annual]: 220.68,
    },
    UnitedStates: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.UnitedStates,
      [SixForSix]: 6,
      [Annual]: 270,
    },
    Canada: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.Canada,
      [SixForSix]: 6,
      [Annual]: 288,
    },
    AUDCountries: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.AUDCountries,
      [SixForSix]: 6,
      [Annual]: 351,
    },
    NZDCountries: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.NZDCountries,
      [SixForSix]: 6,
      [Annual]: 442.8,
    },
    International: {
      [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.International,
      [SixForSix]: 6,
      [Annual]: 292.68,
    },
  },
};

const subscriptionPricesForGuardianWeekly: {
  [CountryGroupId]: {
    [WeeklyBillingPeriod]: number,
  }
} = {
  GBPCountries: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.GBPCountries,
    [SixForSix]: 6,
    [Annual]: 150,
  },
  EURCountries: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.EURCountries,
    [SixForSix]: 6,
    [Annual]: 245.20,
  },
  UnitedStates: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.UnitedStates,
    [SixForSix]: 6,
    [Annual]: 300,
  },
  Canada: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.Canada,
    [SixForSix]: 6,
    [Annual]: 320,
  },
  AUDCountries: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.AUDCountries,
    [SixForSix]: 6,
    [Annual]: 390,
  },
  NZDCountries: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.NZDCountries,
    [SixForSix]: 6,
    [Annual]: 492,
  },
  International: {
    [Quarterly]: subscriptionPricesForDefaultBillingPeriod.GuardianWeekly.International,
    [SixForSix]: 6,
    [Annual]: 325.20,
  },
};

const defaultBillingPeriods: {
  [SubscriptionProduct]: BillingPeriod
} = {
  PremiumTier: Monthly,
  DigitalPack: Monthly,
  GuardianWeekly: Quarterly,
  Paper: Monthly,
  PaperAndDigital: Monthly,
  DailyEdition: Monthly,
};


// ----- Functions ----- //

function fixDecimals(number: number): string {
  if (Number.isInteger(number)) {
    return number.toString();
  }
  return number.toFixed(2);
}

function getProductPrice(product: SubscriptionProduct, countryGroupId: CountryGroupId): string {
  return fixDecimals(subscriptionPricesForDefaultBillingPeriod[product][countryGroupId]);
}
function displayPrice(product: SubscriptionProduct, countryGroupId: CountryGroupId): string {
  const currency = currencies[detect(countryGroupId)].glyph;
  const price = getProductPrice(product, countryGroupId);
  return `${currency}${price}/${defaultBillingPeriods[product]}`;
}

function getWeeklyProductPrice(countryGroupId: CountryGroupId, billingPeriod: WeeklyBillingPeriod): string {
  return fixDecimals(subscriptionPricesForGuardianWeekly[countryGroupId][billingPeriod]);
}

function getPromotionWeeklyProductPrice(
  countryGroupId: CountryGroupId,
  billingPeriod: WeeklyBillingPeriod,
  promoCode: string,
): string {
  return fixDecimals(subscriptionPromoPricesForGuardianWeekly[promoCode][countryGroupId][billingPeriod]);
}

function ophanProductFromSubscriptionProduct(product: SubscriptionProduct): OphanSubscriptionsProduct {

  switch (product) {
    case 'DigitalPack':
    case 'PremiumTier':
    case 'DailyEdition':
      return 'DIGITAL_SUBSCRIPTION';
    case 'GuardianWeekly':
    case 'Paper':
    case 'PaperAndDigital':
    default:
      return 'PRINT_SUBSCRIPTION';
  }

}

function sendTrackingEventsOnClick(
  id: string,
  product: SubscriptionProduct,
  abTest: ComponentAbTest | null,
  context?: string,
): () => void {

  const componentEvent = {
    component: {
      componentType: 'ACQUISITIONS_BUTTON',
      id,
      products: [ophanProductFromSubscriptionProduct(product)],
    },
    action: 'CLICK',
    id,
    ...(abTest ? { abTest } : {}),
  };

  return () => {

    trackComponentEvents(componentEvent);

    gaEvent({
      category: 'click',
      action: product,
      label: (context ? context.concat('-') : '').concat(id),
    });

  };

}


// ----- Newsstand savings ----- //
const getMonthlyNewsStandPrice = (newsstand: number) => ((newsstand) * 52) / 12;

const getNewsstandSaving = (subscriptionMonthlyCost: number, newsstandWeeklyCost: number) =>
  fixDecimals(getMonthlyNewsStandPrice(newsstandWeeklyCost) - subscriptionMonthlyCost);

const getNewsstandPrice = (productOption: PaperProductOptions) =>
  newsstandPrices[productOption];


// Paper product
const paperHasDeliveryEnabled = (): boolean => isTestSwitchedOn('paperHomeDeliveryEnabled');


// ----- Exports ----- //

export {
  sendTrackingEventsOnClick,
  displayPrice,
  getProductPrice,
  getWeeklyProductPrice,
  getPromotionWeeklyProductPrice,
  getNewsstandSaving,
  getNewsstandPrice,
  fixDecimals,
  paperHasDeliveryEnabled,
};
