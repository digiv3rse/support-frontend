// @flow
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import { type Settings } from 'helpers/settings';
import type {
  PromotionCopy,
} from 'helpers/productPrice/promotions';
import type { Option } from 'helpers/types/option';

function getGlobal<T>(path: string = ''): Option<T> {

  const value = path
    .replace(/\[(.+?)\]/g, '.$1')
    .split('.')
    .reduce((o, key: any) => o && o[key], window.guardian);

  if (value) {
    return ((value: any): T);
  }

  return null;
}

const emptyAmountsSettings = {
  ONE_OFF: [],
  MONTHLY: [],
  ANNUAL: [],
};

const getSettings = (): Settings => {
  const globalSettings = getGlobal('settings');
  if (globalSettings) {
    const useDigitalVoucher = getGlobal('useDigitalVoucher');
    return { ...globalSettings, useDigitalVoucher };
  }
  return {
    switches: {
      experiments: {},
    },
    amounts: {
      GBPCountries: emptyAmountsSettings,
      UnitedStates: emptyAmountsSettings,
      EURCountries: emptyAmountsSettings,
      AUDCountries: emptyAmountsSettings,
      International: emptyAmountsSettings,
      NZDCountries: emptyAmountsSettings,
      Canada: emptyAmountsSettings,
    },
    contributionTypes: {
      GBPCountries: [],
      UnitedStates: [],
      EURCountries: [],
      AUDCountries: [],
      International: [],
      NZDCountries: [],
      Canada: [],
    },
    metricUrl: '',
    useDigitalVoucher: null,
  };
};

const getProductPrices = (): ?ProductPrices => getGlobal('productPrices');

const getPromotionCopy = (): ?PromotionCopy => getGlobal('promotionCopy');

const isSwitchOn = (switchName: string): boolean => {
  const sw = getGlobal(`settings.switches.${switchName}`);
  return !!(sw && sw === 'On');
};

const isTestSwitchedOn = (testName: string): boolean => {
  const test = getGlobal(`settings.switches.experiments.${testName}`);

  if (test) {
    return !!(test && test.state && test.state === 'On');
  }
  return false;
};

export {
  getProductPrices,
  getPromotionCopy,
  getGlobal,
  isTestSwitchedOn,
  getSettings,
  isSwitchOn,
};
