// @flow

// ----- Imports ----- //

import React from 'react';

import type { Node } from 'react';

import CtaLink from 'components/ctaLink/ctaLink';
import ErrorMessage from 'components/errorMessage/errorMessage';
import TermsPrivacy from 'components/legal/termsPrivacy/termsPrivacy';

import {
  getSpokenType,
  getOneOffSpokenName,
} from 'helpers/contributions';
import { classNameWithModifiers } from 'helpers/utilities';
import { routes } from 'helpers/routes';
import { addQueryParamsToURL } from 'helpers/url';

import type { Currency } from 'helpers/internationalisation/currency';
import type { Contrib as ContributionType } from 'helpers/contributions';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';


// ----- Types ----- //

type PropTypes = {
  contributionType: ContributionType,
  amount: number,
  referrerAcquisitionData: ReferrerAcquisitionData,
  country: IsoCountry,
  countryGroupId: CountryGroupId,
  currency: Currency,
  isDisabled: boolean,
  PayPalButton: React$ComponentType<{
    buttonText?: string,
    onClick?: ?(void => void),
    additionalClass?: string,
    switchedOff?: boolean,
  }>,
  error: ?string,
  resetError: void => void,
};


// ----- Heading ----- //

// Prevents a click event if it's not allowed.
function onCtaClick(isDisabled: boolean, resetError: void => void): Function {

  return (clickEvent) => {

    if (isDisabled) {
      clickEvent.preventDefault();
    }

    resetError();

  };

}


// ----- Component ----- //

export default function ContributionPaymentCtas(props: PropTypes) {

  const baseClassName = 'component-contribution-payment-ctas';

  if (props.contributionType === 'ONE_OFF') {
    return (
      <div className={classNameWithModifiers(baseClassName, props.isDisabled ? ['disabled'] : [])}>
        <props.PayPalButton
          buttonText={`Contribute ${props.currency.glyph}${props.amount} with PayPal`}
          onClick={props.resetError}
        />
        <OneOffCta {...props} />
        <ErrorMessage message={props.error} />
        <TermsPrivacy country={props.country} />
      </div>
    );

  }

  return (
    <div className={classNameWithModifiers(baseClassName, props.isDisabled ? ['disabled'] : [])}>
      <RegularCta {...props} />
    </div>
  );

}


// ----- Auxiliary Components ----- //

// Build the one-off payment button.
function OneOffCta(props: {
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
  amount: number,
  currency: Currency,
  isDisabled: boolean,
  resetError: void => void,
}): Node {

  const spokenType = getOneOffSpokenName(props.countryGroupId);
  const clickUrl = addQueryParamsToURL(routes.oneOffContribCheckout, {
    contributionValue: props.amount.toString(),
    contribType: props.contributionType,
    currency: props.currency.iso,
  });

  return (
    <CtaLink
      ctaId="contribute-one-off"
      text={`Contribute ${props.currency.glyph}${props.amount} with card`}
      accessibilityHint={`proceed to make your ${spokenType} contribution`}
      url={clickUrl}
      onClick={onCtaClick(props.isDisabled, props.resetError)}
      id="qa-contribute-button"
    />
  );

}

// Build the regular payment button.
function RegularCta(props: {
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
  amount: number,
  currency: Currency,
  isDisabled: boolean,
  resetError: void => void,
}): Node {

  const spokenType = getSpokenType(props.contributionType, props.countryGroupId);
  const clickUrl = addQueryParamsToURL(routes.recurringContribCheckout, {
    contributionValue: props.amount.toString(),
    contribType: props.contributionType,
    currency: props.currency.iso,
  });

  return (
    <CtaLink
      ctaId="contribute-regular"
      text={`Contribute ${props.currency.glyph}${props.amount} with card or PayPal`}
      accessibilityHint={`proceed to make your ${spokenType} contribution`}
      url={clickUrl}
      onClick={onCtaClick(props.isDisabled, props.resetError)}
      id="qa-contribute-button"
    />
  );

}
