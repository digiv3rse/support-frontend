// @flow

import { getQueryParameter } from 'helpers/url';
import { type CountryGroupId, detect } from 'helpers/internationalisation/countryGroup';
import { fixDecimals } from 'helpers/subscriptions';
import { type BillingPeriod } from 'helpers/billingPeriods';

import { type SubscriptionProduct, type PaperBillingPlan } from './subscriptions';

export type SaleCopy = {
  featuredProduct: {
    heading: string,
    subHeading: string,
    description: string,
  },
  landingPage: {
    heading: string,
    subHeading: string,
    standfirst?: string,
  },
  bundle: {
    heading: string,
    subHeading: string,
    description: string,
  },
}

export type PlanPrice = {
  [PaperBillingPlan]: number,
}

type SaleDetails = {
  [CountryGroupId]: {
    promoCode: string,
    annualPlanPromoCode?: string,
    intcmp: string,
    price: number,
    annualPrice?: number,
    discountPercentage?: number,
    saleCopy: SaleCopy,
    planPrices: PlanPrice[],
  },
};

export type FlashSaleSubscriptionProduct = SubscriptionProduct | 'AnnualDigitalPack'

type Sale = {
  subscriptionProduct: FlashSaleSubscriptionProduct,
  activeRegions: CountryGroupId[],
  startTime: number,
  endTime: number,
  duration?: string,
  saleDetails: SaleDetails,
};

// Days are 1 based, months are 0 based
const Sales: Sale[] = [
  {
    subscriptionProduct: 'Paper',
    activeRegions: ['GBPCountries'],
    startTime: new Date(2019, 0, 4).getTime(), // 4 Jan 2019
    endTime: new Date(2019, 1, 4).getTime(), // 3 Feb 2019 (to finish at 0:00 in the morning)
    duration: '12 months',
    saleDetails: {
      GBPCountries: {
        promoCode: 'GCB80X',
        intcmp: '',
        price: 8.09,
        discountPercentage: 0.25,
        saleCopy: {
          featuredProduct: {
            heading: 'Paper subscriptions',
            subHeading: 'Save up to 52% on your newspaper',
            description: 'Find analysis, opinions, reviews, recipes and more with a subscription to The Guardian and The Observer. Subscribe now and save an additional 25% for a year.',
          },
          landingPage: {
            heading: 'The Guardian newspaper subscriptions',
            subHeading: 'Subscribe and save on the joy of print',
            standfirst: 'We offer two different subscription types: voucher booklet and home delivery.',
          },
          bundle: {
            heading: 'Paper',
            subHeading: 'From £8.09/month',
            description: 'Save an additional 25% for the first year of your subscription to The Guardian and The Observer',
          },
        },
        planPrices: [
          { collectionEveryday: 35.71 },
          { collectionSixday: 30.84 },
          { collectionWeekend: 15.57 },
          { collectionSunday: 8.09 },
          { deliveryEveryday: 47.09 },
          { deliverySixday: 40.59 },
          { deliveryWeekend: 18.82 },
          { deliverySunday: 11.34 },
        ],
      },
    },
  },
  {
    subscriptionProduct: 'PaperAndDigital',
    activeRegions: ['GBPCountries'],
    startTime: new Date(2019, 0, 4).getTime(), // 4 Jan 2019
    endTime: new Date(2019, 1, 4).getTime(), // 3 Feb 2019 (to finish at 0:00 in the morning)
    saleDetails: {
      GBPCountries: {
        promoCode: 'GCB56X',
        intcmp: '',
        price: 16.22,
        saleCopy: {
          featuredProduct: {
            heading: 'Paper subscriptions',
            subHeading: 'Save up to 52% on your newspaper',
            description: 'Find analysis, opinions, reviews, recipes and more with a subscription to The Guardian and The Observer. Subscribe now and save an additional 25% for a year.',
          },
          landingPage: {
            heading: 'The Guardian newspaper subscriptions',
            subHeading: 'Subscribe and save up to 52% off the retail price of your newspaper',
            standfirst: 'Subscribers already save up to 37% off the retail price. With this limited time offer, you\'ll enjoy and additional 25% off for the first year of your subscription. We offer two different subscription types: voucher booklets and home delivery.',
          },
          bundle: {
            heading: 'Paper+Digital',
            subHeading: 'From £16.22/month',
            description: 'The Paper + Digital subscription includes all the benefits of a paper subscription, plus access to the Digital Pack. Save 25% for your first year.',
          },
        },
        planPrices: [],
      },
    },
  },
  {
    subscriptionProduct: 'Paper',
    activeRegions: ['GBPCountries'],
    startTime: new Date(2019, 1, 4).getTime(), // 4 Feb 2019
    endTime: new Date(2019, 1, 18).getTime(), // 17 Feb 2019 (to finish at 0:00 in the morning)
    duration: '3 months',
    saleDetails: {
      GBPCountries: {
        promoCode: 'GCC80X',
        intcmp: '',
        price: 5.40,
        discountPercentage: 0.50,
        saleCopy: {
          featuredProduct: {
            heading: 'Paper subscriptions',
            subHeading: 'Save up to 68% on your newspaper',
            description: 'Find analysis, opinions, reviews, recipes and more with a subscription to The Guardian and The Observer. Subscribe now and save an additional 50% for your first three months.',
          },
          landingPage: {
            heading: 'The Guardian newspaper subscriptions',
            subHeading: 'Subscribe and save on the joy of print',
            standfirst: 'We offer two different subscription types: voucher booklets and home delivery.',
          },
          bundle: {
            heading: 'Paper',
            subHeading: 'From £5.40/month',
            description: 'Save an additional 50% for the first three months of your subscription to The Guardian and The Observer',
          },
        },
        planPrices: [
          { collectionEveryday: 23.81 },
          { collectionSixday: 20.56 },
          { collectionWeekend: 10.38 },
          { collectionSunday: 5.40 },
          { deliveryEveryday: 31.40 },
          { deliverySixday: 27.06 },
          { deliveryWeekend: 12.55 },
          { deliverySunday: 7.56 },
        ],
      },
    },
  },
  {
    subscriptionProduct: 'PaperAndDigital',
    activeRegions: ['GBPCountries'],
    startTime: new Date(2019, 1, 4).getTime(), // 4 Feb 2019
    endTime: new Date(2019, 1, 18).getTime(), // 17 Feb 2019 (to finish at 0:00 in the morning)
    saleDetails: {
      GBPCountries: {
        promoCode: 'GCC56X',
        intcmp: '',
        price: 11.03,
        saleCopy: {
          featuredProduct: {
            heading: 'Paper subscriptions',
            subHeading: 'Save up to 68% on your newspaper',
            description: 'Find analysis, opinions, reviews, recipes and more with a subscription to The Guardian and The Observer. Subscribe now and save an additional 50% for your first three months.',
          },
          landingPage: {
            heading: 'The Guardian newspaper subscriptions',
            subHeading: 'Subscribe and save up to 68% off the retail price of your newspaper',
            standfirst: 'Subscribers already save up to 37% off the retail price. With this limited time offer, you\'ll enjoy and additional 50% off for the first three months of your subscription. We offer two different subscription types: voucher booklets and home delivery.',
          },
          bundle: {
            heading: 'Paper+Digital',
            subHeading: 'From £16.22/month',
            description: 'The Paper + Digital subscription includes all the benefits of a paper subscription, plus access to the Digital Pack. Save 50% for your first three months.',
          },
        },
        planPrices: [],
      },
    },
  },
  {
    subscriptionProduct: 'DigitalPack',
    activeRegions: ['UnitedStates', 'AUDCountries', 'International'],
    startTime: new Date(2019, 1, 4).getTime(), // 4 Feb 2019
    endTime: new Date(2019, 3, 1).getTime(), // 31 Mar 2019
    saleDetails: {
      UnitedStates: {
        promoCode: 'DDPFMINT80',
        annualPlanPromoCode: 'DDPFMANINT80',
        intcmp: '',
        price: 14.99,
        annualPrice: 179.85,
        discountPercentage: 0.25,
        saleCopy: {
          featuredProduct: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'Read The Guardian ad-free on all devices, including the Premium App and UK Daily Edition iPad app.',
          },
          landingPage: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% on award-winning, independent journalism, ad-free on all of your devices',
          },
          bundle: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'The Premium App and the daily edition iPad app of the UK newspaper in one pack, plus ad-free reading on all your devices',
          },
        },
        planPrices: [],
      },
      International: {
        promoCode: 'DDPFMINT80',
        annualPlanPromoCode: 'DDPFMANINT80',
        intcmp: '',
        price: 14.99,
        annualPrice: 179.85,
        discountPercentage: 0.25,
        saleCopy: {
          featuredProduct: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'Read The Guardian ad-free on all devices, including the Premium App and UK Daily Edition iPad app.',
          },
          landingPage: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% on award-winning, independent journalism, ad-free on all of your devices',
          },
          bundle: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'The Premium App and the daily edition iPad app of the UK newspaper in one pack, plus ad-free reading on all your devices',
          },
        },
        planPrices: [],
      },
      AUDCountries: {
        promoCode: 'DDPFMINT80',
        annualPlanPromoCode: 'DDPFMANINT80',
        intcmp: '',
        price: 16.13,
        annualPrice: 193.44,
        discountPercentage: 0.25,
        saleCopy: {
          featuredProduct: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'Read The Guardian ad-free on all devices, including the Premium App and UK Daily Edition iPad app.',
          },
          landingPage: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% - $16.13/month for a year, then $21.50/month',
          },
          bundle: {
            heading: 'Digital Pack',
            subHeading: 'Save 25% for a year',
            description: 'The Premium App and the daily edition iPad app of the UK newspaper in one pack, plus ad-free reading on all your devices',
          },
        },
        planPrices: [],
      },

    },
  },
];

function getTimeTravelDaysOverride() {
  return Number(getQueryParameter('flash_sale_time_travel')) || null;
}

function getFlashSaleActiveOverride() {
  return getQueryParameter('flash_sale') === 'true';
}

function sortSalesByStartTimesDescending(a: Sale, b: Sale) {
  return b.startTime - a.startTime;
}

function getActiveFlashSales(product: SubscriptionProduct, countryGroupId: CountryGroupId = detect()): Sale[] {

  const timeTravelDays = getTimeTravelDaysOverride();
  const now = timeTravelDays ? Date.now() + (timeTravelDays * 86400000) : Date.now();

  const sales = Sales.filter(sale =>
    sale.subscriptionProduct === product &&
    sale.activeRegions.includes(countryGroupId)).sort(sortSalesByStartTimesDescending);

  return sales.filter(sale =>
    (now > sale.startTime && now < sale.endTime) ||
    getFlashSaleActiveOverride() === true);
}

function getDiscount(product: SubscriptionProduct, countryGroupId: CountryGroupId): ?number {
  const sale = getActiveFlashSales(product, countryGroupId)[0];
  return sale && sale.saleDetails[countryGroupId] && sale.saleDetails[countryGroupId].discountPercentage;
}

function getDuration(product: SubscriptionProduct, countryGroupId: CountryGroupId): ?string {
  const sale = getActiveFlashSales(product, countryGroupId)[0];
  return sale && sale.duration;
}

function flashSaleIsActive(product: SubscriptionProduct, countryGroupId: CountryGroupId = detect()): boolean {
  const sales = getActiveFlashSales(product, countryGroupId);

  return sales.length > 0;
}

function getPromoCode(
  product: SubscriptionProduct,
  countryGroupId?: CountryGroupId = detect(),
  defaultCode: string,
): string {
  if (flashSaleIsActive(product, countryGroupId)) {
    const sale = getActiveFlashSales(product, countryGroupId)[0];
    return sale && sale.saleDetails[countryGroupId].promoCode;
  }
  return defaultCode;
}

function getAnnualPlanPromoCode(
  product: SubscriptionProduct,
  countryGroupId?: CountryGroupId = detect(),
  defaultCode: string,
): string {
  if (flashSaleIsActive(product, countryGroupId)) {
    const sale = getActiveFlashSales(product, countryGroupId)[0];
    return (sale
      && sale.saleDetails[countryGroupId]
      && sale.saleDetails[countryGroupId].annualPlanPromoCode) || defaultCode;
  }
  return defaultCode;
}

function getIntcmp(
  product: SubscriptionProduct,
  countryGroupId: CountryGroupId = detect(),
  intcmp: ?string,
  defaultIntcmp: string,
): string {
  if (flashSaleIsActive(product)) {
    const sale = getActiveFlashSales(product, countryGroupId)[0];
    return (sale && sale.saleDetails[countryGroupId].intcmp) || intcmp || defaultIntcmp;
  }
  return intcmp || defaultIntcmp;
}

function getPlanPrices(product: SubscriptionProduct, countryGroupId: CountryGroupId): PlanPrice[] {
  const sale = getActiveFlashSales(product, countryGroupId)[0];
  return sale && sale.saleDetails[countryGroupId].planPrices;
}

function getEndTime(product: SubscriptionProduct, countryGroupId: CountryGroupId) {
  const sale = getActiveFlashSales(product, countryGroupId)[0];
  return sale && sale.endTime;
}

function getSaleCopy(product: SubscriptionProduct, countryGroupId: CountryGroupId): SaleCopy {
  const emptyCopy = {
    featuredProduct: {
      heading: '',
      subHeading: '',
      description: '',
    },
    landingPage: {
      heading: '',
      subHeading: '',
    },
    bundle: {
      heading: '',
      subHeading: '',
      description: '',
    },
  };
  if (flashSaleIsActive(product, countryGroupId)) {
    const sale = getActiveFlashSales(product, countryGroupId)[0];
    return sale.saleDetails[countryGroupId].saleCopy;
  }
  return emptyCopy;
}

function getFormattedFlashSalePrice(
  product: SubscriptionProduct,
  countryGroupId: CountryGroupId,
  period?: BillingPeriod,
): string {
  const sale = getActiveFlashSales(product, countryGroupId)[0];
  if (period === 'Annual') {
    const { annualPrice } = sale.saleDetails[countryGroupId];
    if (annualPrice) {
      return fixDecimals(annualPrice);
    }
    return fixDecimals(sale.saleDetails[countryGroupId].price);

  }
  return fixDecimals(sale.saleDetails[countryGroupId].price);
}

function showCountdownTimer(flashSaleActive: boolean, showForHowManyDays: number, endTime: number): boolean {
  if (flashSaleActive) {
    const now = new Date();
    const daysFromNow = now.setDate(now.getDate() + showForHowManyDays);

    return daysFromNow - endTime > 0;
  }
  return false;
}


export {
  flashSaleIsActive,
  getPromoCode,
  getAnnualPlanPromoCode,
  getIntcmp,
  getEndTime,
  getSaleCopy,
  getFormattedFlashSalePrice,
  getPlanPrices,
  getDiscount,
  getDuration,
  getTimeTravelDaysOverride,
  getFlashSaleActiveOverride,
  showCountdownTimer,
};
