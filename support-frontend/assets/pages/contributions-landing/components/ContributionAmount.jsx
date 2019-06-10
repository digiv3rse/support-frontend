// @flow

// ----- Imports ----- //

import type { OtherAmounts, SelectedAmounts } from 'helpers/contributions';
import React from 'react';
import { connect } from 'react-redux';
import { config, type AmountsRegions, type Amount, type ContributionType, getAmount } from 'helpers/contributions';

import type { EditorialiseAmountsRoundTwoVariant } from 'helpers/abTests/abtestDefinitions';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
  type IsoCurrency,
  type Currency,
  type SpokenCurrency,
  currencies,
  spokenCurrencies,
  detect,
} from 'helpers/internationalisation/currency';
import { classNameWithModifiers } from 'helpers/utilities';
import { trackComponentClick } from 'helpers/tracking/ophan';
import { EURCountries, GBPCountries } from 'helpers/internationalisation/countryGroup';
import { formatAmount } from 'helpers/checkouts';
import SvgDollar from 'components/svgs/dollar';
import SvgEuro from 'components/svgs/euro';
import SvgPound from 'components/svgs/pound';

import { selectAmount, updateOtherAmount } from '../contributionsLandingActions';
import ContributionTextInput from './ContributionTextInput';

// ----- Types ----- //

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  countryGroupId: CountryGroupId,
  currency: IsoCurrency,
  contributionType: ContributionType,
  amounts: AmountsRegions,
  selectedAmounts: SelectedAmounts,
  selectAmount: (Amount | 'other', CountryGroupId, ContributionType) => (() => void),
  otherAmounts: OtherAmounts,
  checkOtherAmount: (string, CountryGroupId, ContributionType) => boolean,
  updateOtherAmount: (string, CountryGroupId, ContributionType) => void,
  checkoutFormHasBeenSubmitted: boolean,
  stripePaymentRequestButtonClicked: boolean,
  editorialiseAmountsRoundTwoVariant: EditorialiseAmountsRoundTwoVariant,
|};

/* eslint-enable react/no-unused-prop-types */

const mapStateToProps = state => ({
  countryGroupId: state.common.internationalisation.countryGroupId,
  currency: state.common.internationalisation.currencyId,
  contributionType: state.page.form.contributionType,
  amounts: state.common.settings.amounts,
  selectedAmounts: state.page.form.selectedAmounts,
  otherAmounts: state.page.form.formData.otherAmounts,
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
  stripePaymentRequestButtonClicked: state.page.form.stripePaymentRequestButtonData.stripePaymentRequestButtonClicked,
  editorialiseAmountsRoundTwoVariant: state.common.abParticipations.editorialiseAmountsRoundTwo,
});

const mapDispatchToProps = (dispatch: Function) => ({
  selectAmount: (amount, countryGroupId, contributionType) => () => {
    trackComponentClick(`npf-contribution-amount-toggle-${countryGroupId}-${contributionType}-${amount.value || amount}`);
    dispatch(selectAmount(amount, contributionType));
  },
  updateOtherAmount: (amount, countryGroupId, contributionType) => {
    trackComponentClick(`npf-contribution-amount-toggle-${countryGroupId}-${contributionType}-${amount}`);
    dispatch(updateOtherAmount(amount));
  },
});

// ----- Render ----- //

const isSelected = (amount: Amount, props: PropTypes) => {
  if (props.selectedAmounts[props.contributionType]) {
    return props.selectedAmounts[props.contributionType] !== 'other' &&
      amount.value === props.selectedAmounts[props.contributionType].value;
  }
  return amount.isDefault;
};

const renderAmount = (currency: Currency, spokenCurrency: SpokenCurrency, props: PropTypes) => (amount: Amount) => (
  <li className="form__radio-group-item">
    <input
      id={`contributionAmount-${amount.value}`}
      className="form__radio-group-input"
      type="radio"
      name="contributionAmount"
      value={amount.value}
      /* eslint-disable react/prop-types */
      checked={isSelected(amount, props)}
      onChange={props.selectAmount(amount, props.countryGroupId, props.contributionType)}
      /* eslint-enable react/prop-types */
    />
    <label htmlFor={`contributionAmount-${amount.value}`} className="form__radio-group-label" aria-label={formatAmount(currency, spokenCurrency, amount, true)}>
      {formatAmount(currency, spokenCurrency, amount, false)}
    </label>
  </li>
);

const iconForCountryGroup = (countryGroupId: CountryGroupId): React$Element<*> => {
  switch (countryGroupId) {
    case GBPCountries: return <SvgPound />;
    case EURCountries: return <SvgEuro />;
    default: return <SvgDollar />;
  }
};

const amountFormatted = (amount: number, currencyString: string, countryGroupId: CountryGroupId) => {
  if (amount < 1 && countryGroupId === 'GBPCountries') {
    return `${(amount * 100).toFixed(0)}p`;
  }
  return `${currencyString}${(amount).toFixed(2)}`;
};

const getAmountPerWeekBreakdown = (
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
): string => {
  const currencyString = currencies[detect(countryGroupId)].glyph;
  const amount = getAmount(selectedAmounts, otherAmounts, contributionType);

  let weeklyAmount: number;
  if (contributionType === 'ANNUAL') {
    weeklyAmount = amount / 52.0;
  } else if (contributionType === 'MONTHLY') {
    weeklyAmount = (amount * 12) / 52.0;
  }

  if (amount && weeklyAmount) {
    return `Contributing ${currencyString}${amount} works out as ${amountFormatted(weeklyAmount, currencyString, countryGroupId)} each week`;
  }

  return '';
};

function ContributionAmount(props: PropTypes) {
  const validAmounts: Amount[] = props.amounts[props.countryGroupId][props.contributionType];
  const showOther: boolean = props.selectedAmounts[props.contributionType] === 'other';
  const showWeeklyBreakdown: boolean = props.editorialiseAmountsRoundTwoVariant === 'weeklyBreakdownMonthlyAsWell'
    ? props.contributionType === 'MONTHLY' || props.contributionType === 'ANNUAL'
    : props.contributionType === 'ANNUAL';
  const { min, max } = config[props.countryGroupId][props.contributionType]; // eslint-disable-line react/prop-types
  const minAmount: string =
    formatAmount(currencies[props.currency], spokenCurrencies[props.currency], { value: min.toString() }, false);
  const maxAmount: string =
    formatAmount(currencies[props.currency], spokenCurrencies[props.currency], { value: max.toString() }, false);
  const otherAmount = props.otherAmounts[props.contributionType].amount;

  return (
    <fieldset className={classNameWithModifiers('form__radio-group', ['pills', 'contribution-amount'])}>
      <legend className={classNameWithModifiers('form__legend', ['radio-group'])}>Amount</legend>
      <ul className="form__radio-group-list">
        {validAmounts.map(renderAmount(currencies[props.currency], spokenCurrencies[props.currency], props))}
        <li className="form__radio-group-item">
          <input
            id="contributionAmount-other"
            className="form__radio-group-input"
            type="radio"
            name="contributionAmount"
            value="other"
            checked={showOther}
            onChange={props.selectAmount('other', props.countryGroupId, props.contributionType)}
          />
          <label htmlFor="contributionAmount-other" className="form__radio-group-label">Other</label>
        </li>
      </ul>
      {showOther ? (
        <ContributionTextInput
          id="contributionOther"
          name="contribution-other-amount"
          type="number"
          label="Other amount"
          value={otherAmount}
          icon={iconForCountryGroup(props.countryGroupId)}
          onInput={e => props.updateOtherAmount((e.target: any).value, props.countryGroupId, props.contributionType)}
          isValid={props.checkOtherAmount(otherAmount || '', props.countryGroupId, props.contributionType)}
          formHasBeenSubmitted={(props.checkoutFormHasBeenSubmitted || props.stripePaymentRequestButtonClicked)}
          errorMessage={`Please provide an amount between ${minAmount} and ${maxAmount}`}
          autoComplete="off"
          step={0.01}
          min={min}
          max={max}
          autoFocus
          required
        />
      ) : null}
      {showWeeklyBreakdown ? (
        <p className="amount-per-week-breakdown">
          {getAmountPerWeekBreakdown(
            props.contributionType,
            props.countryGroupId,
            props.selectedAmounts,
            props.otherAmounts,
          )}
        </p>
      ) : null}
    </fieldset>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ContributionAmount);
