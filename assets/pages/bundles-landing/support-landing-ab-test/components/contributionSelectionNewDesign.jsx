// @flow

// ----- Imports ----- //

import React from 'react';

import RadioToggle from 'components/radioToggle/radioToggle';
import NumberInput from 'components/numberInput/numberInput';
import { clickSubstituteKeyPressHandler } from 'helpers/utilities';

import type { IsoCountry } from 'helpers/internationalisation/country';
import type { Currency } from 'helpers/internationalisation/currency';
import type {
  Amount,
  Contrib as ContributionType,
} from 'helpers/contributions';
import { generateClassName } from 'helpers/utilities';

import {
  getClassName as getContributionTypeClassName,
  getContributionTypes,
} from '../helpers/contributionTypes';
import {
  getCustomAmountA11yHint,
  getContributionAmounts,
} from '../helpers/contributionAmounts';


// ----- Types ----- //

type PropTypes = {
  contributionType: ContributionType,
  country: IsoCountry,
  currency: Currency,
  selectedAmount: Amount,
  toggleAmount: string => void,
  toggleType: string => void,
  setCustomAmount: string => void,
};


// ----- Functions ----- //

function getClassName(contributionType: ContributionType) {

  return generateClassName(
    'component-contribution-selection',
    getContributionTypeClassName(contributionType),
  );

}


// ----- Exports ----- //

export default function ContributionSelection(props: PropTypes) {

  return (
    <div className={getClassName(props.contributionType)}>
      <div className="component-contribution-selection__type">
        <RadioToggle
          name="contribution-type-toggle"
          radios={getContributionTypes(props.country)}
          checked={props.contributionType}
          toggleAction={props.toggleType}
        />
      </div>
      <div className="component-contribution-selection__amount">
        <RadioToggle
          name="contribution-amount-toggle"
          radios={getContributionAmounts(props.contributionType, props.currency)}
          checked={props.selectedAmount.value}
          toggleAction={props.toggleAmount}
        />
      </div>
      <div className="component-contribution-selection__custom-amount">
        <NumberInput
          onFocus={props.setCustomAmount}
          onInput={props.setCustomAmount}
          selected={props.selectedAmount.userDefined}
          placeholder={`Other amount (${props.currency.glyph})`}
          onKeyPress={clickSubstituteKeyPressHandler(() => {})}
          ariaDescribedBy="component-contribution-selection__custom-amount-a11y"
        />
        <p className="accessibility-hint" id="component-contribution-selection__custom-amount-a11y">
          {getCustomAmountA11yHint(props.contributionType, props.country, props.currency)}
        </p>
      </div>
    </div>
  );

}
