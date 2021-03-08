// @flow

// Copied from
// https://github.com/playframework/playframework/blob/master/framework/src/play/
// src/main/scala/play/api/data/validation/Validation.scala#L81
// but with minor modification (last * becomes +) to enforce at least one dot in domain.  This is
// for compatibility with Stripe
import { config } from 'helpers/contributions';
import type { CountryGroup, CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { ContributionType, OtherAmounts, SelectedAmounts } from 'helpers/contributions';
import { Canada, UnitedStates, AUDCountries, countryGroups } from './internationalisation/countryGroup';
import { DateUtils } from 'react-day-picker';
import { daysFromNowForGift } from 'pages/digital-subscription-checkout/components/helpers';

export const emailRegexPattern = '^[a-zA-Z0-9\\.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$';

export const isEmpty: (string | null) => boolean = input =>
  typeof input === 'undefined' || input == null || input.trim().length === 0;

export const isNotEmpty: (string | null) => boolean = input => !isEmpty(input);

export const isNotTooFarInTheFuture: (Date | null) => boolean = (date) => {
  const rangeDate = new Date();
  rangeDate.setDate(rangeDate.getDate() + daysFromNowForGift);
  const dateIsInsideRange = !DateUtils.isDayAfter(date, rangeDate);
  return dateIsInsideRange;
};

export const isValidEmail: (string | null) => boolean = input => !!input && new RegExp(emailRegexPattern).test(input);
export const isLargerOrEqual: (number, string) => boolean = (min, input) => min <= parseFloat(input);
export const isSmallerOrEqual: (number, string) => boolean = (max, input) => parseFloat(input) <= max;
export const maxTwoDecimals: string => boolean = input => new RegExp('^\\d+\\.?\\d{0,2}$').test(input);

export const checkFirstName: (string | null) => boolean = isNotEmpty;
export const checkLastName: (string | null) => boolean = isNotEmpty;
export const checkBillingState: (string | null) => boolean = s => typeof s === 'string' && isNotEmpty(s);

export const checkEmail: (string | null) => boolean = input => isNotEmpty(input) && isValidEmail(input);

export const checkOptionalEmail: (string | null) => boolean = input => isEmpty(input) || isValidEmail(input);

export const checkGiftStartDate: (string | null) => boolean = (rawDate) => {
  const date = rawDate ? new Date(rawDate) : null;
  return isNotEmpty(rawDate) && isNotTooFarInTheFuture(date);
};

export const checkAmount = (
  input: string,
  countryGroupId: CountryGroupId,
  contributionType: ContributionType,
): boolean =>
  isNotEmpty(input)
    && isLargerOrEqual(config[countryGroupId][contributionType].min, input)
    && isSmallerOrEqual(config[countryGroupId][contributionType].max, input)
    && maxTwoDecimals(input);


export const checkAmountOrOtherAmount: (SelectedAmounts, OtherAmounts, ContributionType, CountryGroupId) => boolean = (
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
) => {
  let amt = '';
  if (selectedAmounts[contributionType] && selectedAmounts[contributionType] === 'other') {
    if (otherAmounts[contributionType] && otherAmounts[contributionType].amount) {
      amt = otherAmounts[contributionType].amount;
    }
  } else if (selectedAmounts[contributionType]) {
    amt = selectedAmounts[contributionType].toString();
  }
  return checkAmount(amt, countryGroupId, contributionType);
};

export const checkStateIfApplicable: ((string | null), CountryGroupId, ContributionType) => boolean = (
  billingState: (string | null),
  countryGroupId: CountryGroupId,
  contributionType: ContributionType,
) => {
  if (contributionType !== 'ONE_OFF') {
    if (countryGroupId === UnitedStates || countryGroupId === Canada) {
      return checkBillingState(billingState);
    } else if (countryGroupId === AUDCountries) {
      // Allow no state to be selected if the user is GEO-IP'd to one of the non AU countries that use AUD.
      if (window.guardian && window.guardian.geoip) {
        const AUDCountryGroup: CountryGroup = countryGroups[AUDCountries];
        const AUDCountriesWithNoStates = AUDCountryGroup.countries.filter(c => c !== 'AU');
        if (AUDCountriesWithNoStates.includes(window.guardian.geoip.countryCode)) {
          return true;
        }
      }
      return checkBillingState(billingState);
    }
  }
  return true;
};
