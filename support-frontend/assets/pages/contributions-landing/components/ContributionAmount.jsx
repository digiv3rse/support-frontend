// @flow

// ----- Imports ----- //

import type { OtherAmounts, SelectedAmounts } from 'helpers/contributions';
import React from 'react';
import { connect } from 'react-redux';
import { config, type ContributionAmounts, type ContributionType } from 'helpers/contributions';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
  type IsoCurrency,
  currencies,
  spokenCurrencies,
} from 'helpers/internationalisation/currency';
import { amountIsValid } from 'helpers/formValidation';
import { classNameWithModifiers } from 'helpers/utilities';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import { formatAmount } from 'helpers/checkouts';
import { selectAmount, updateOtherAmount } from '../contributionsLandingActions';
import { type State } from '../contributionsLandingReducer';
import ContributionAmountChoices from './ContributionAmountChoices';
import { TextInput } from '@guardian/src-text-input';
import type {LocalCurrencyCountry} from "../../../helpers/internationalisation/localCurrencyCountry";

// ----- Types ----- //

type PropTypes = {|
  countryGroupId: CountryGroupId,
  currency: IsoCurrency,
  contributionType: ContributionType,
  amounts: ContributionAmounts,
  selectedAmounts: SelectedAmounts,
  selectAmount: (number | 'other', CountryGroupId, ContributionType) => (() => void),
  otherAmounts: OtherAmounts,
  updateOtherAmount: (string, CountryGroupId, ContributionType) => void,
  checkoutFormHasBeenSubmitted: boolean,
  stripePaymentRequestButtonClicked: boolean,
|};

const mapStateToProps = (state: State) => ({
  countryGroupId: state.common.internationalisation.countryGroupId,
  currency: state.common.internationalisation.currencyId,
  contributionType: state.page.form.contributionType,
  amounts: state.common.amounts,
  selectedAmounts: state.page.form.selectedAmounts,
  otherAmounts: state.page.form.formData.otherAmounts,
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
  stripePaymentRequestButtonClicked:
    state.page.form.stripePaymentRequestButtonData.ONE_OFF.stripePaymentRequestButtonClicked ||
    state.page.form.stripePaymentRequestButtonData.REGULAR.stripePaymentRequestButtonClicked,
});

const mapDispatchToProps = (dispatch: Function) => ({
  selectAmount: (amount, countryGroupId, contributionType) => () => {
    trackComponentClick(`npf-contribution-amount-toggle-${countryGroupId}-${contributionType}-${amount.value || amount}`);
    dispatch(selectAmount(amount, contributionType));
  },
  updateOtherAmount: (amount, countryGroupId, contributionType) => {
    trackComponentClick(`npf-contribution-amount-toggle-${countryGroupId}-${contributionType}-${amount}`);
    dispatch(updateOtherAmount(amount, contributionType));
  },
});

const renderEmptyAmount = (id: string) => (
  <li className="form__radio-group-item amounts__placeholder">
    <input
      id={`contributionAmount-${id}`}
      className="form__radio-group-input"
      type="radio"
      name="contributionAmount"
    />
    <label htmlFor={`contributionAmount-${id}`} className="form__radio-group-label">&nbsp;</label>
  </li>
);

function withProps(props: PropTypes) {
  const { amounts: validAmounts, defaultAmount } = props.amounts[props.contributionType];
  const showOther: boolean = props.selectedAmounts[props.contributionType] === 'other';
  const { min, max } = config[props.countryGroupId][props.contributionType]; // eslint-disable-line react/prop-types
  const minAmount: string =
    formatAmount(currencies[props.currency], spokenCurrencies[props.currency], min, false);
  const maxAmount: string =
    formatAmount(currencies[props.currency], spokenCurrencies[props.currency], max, false);
  const otherAmount = props.otherAmounts[props.contributionType].amount;
  const otherLabelSymbol: string = currencies[props.currency].glyph;
  const {
    checkoutFormHasBeenSubmitted, stripePaymentRequestButtonClicked,
  } = props;
  const canShowOtherAmountErrorMessage =
    checkoutFormHasBeenSubmitted || stripePaymentRequestButtonClicked || !!otherAmount;
  const otherAmountErrorMessage: string | null =
    canShowOtherAmountErrorMessage && !amountIsValid(otherAmount || '', props.countryGroupId, props.contributionType) ?
      `Please provide an amount between ${minAmount} and ${maxAmount}` :
      null;

  return (
    <fieldset className={classNameWithModifiers('form__radio-group', ['pills', 'contribution-amount'])}>
      <legend className={classNameWithModifiers('form__legend', ['radio-group'])}>How much would you like to give?</legend>

      <ContributionAmountChoices
        countryGroupId={props.countryGroupId}
        currency={props.currency}
        contributionType={props.contributionType}
        validAmounts={validAmounts}
        defaultAmount={defaultAmount}
        showOther={showOther}
        selectedAmounts={props.selectedAmounts}
        selectAmount={props.selectAmount}
        shouldShowFrequencyButtons={props.contributionType !== 'ONE_OFF'}
      />

      { showOther &&
        <div className={classNameWithModifiers('form__field', ['contribution-other-amount'])}>
          <TextInput
            id="contributionOther"
            label={`Other amount (${otherLabelSymbol})`}
            value={otherAmount}
            onChange={e => props.updateOtherAmount(
              (e.target: any).value,
              props.countryGroupId,
              props.contributionType,
            )}
            error={otherAmountErrorMessage}
            autoComplete="off"
            autoFocus
          />
        </div>
      }

    </fieldset>
  );
}

function withoutProps() {
  return (
    <fieldset className={classNameWithModifiers('form__radio-group', ['pills', 'contribution-amount'])}>
      <legend className={classNameWithModifiers('form__legend', ['radio-group'])}>How much would you like to give?</legend>
      <ul className="form__radio-group-list">
        {
          ['a', 'b', 'c', 'd'].map(renderEmptyAmount)
        }
      </ul>
    </fieldset>
  );
}

export const ContributionAmount = connect(mapStateToProps, mapDispatchToProps)(withProps);
export const EmptyContributionAmount = withoutProps;
