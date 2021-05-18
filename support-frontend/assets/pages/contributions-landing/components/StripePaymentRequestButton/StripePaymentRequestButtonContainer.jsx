// @flow

// Docs: https://github.com/stripe/react-stripe-elements#using-the-paymentrequestbuttonelement

// ----- Imports ----- //

// We import from preact/compat here rather than react because flow doesn't like it if the child component uses redux
// $FlowIgnore - required for hooks
import React, { useState } from 'preact/compat';
import { Elements } from '@stripe/react-stripe-js';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import {
  getStripeKey,
  stripeAccountForContributionType,
  useStripeObjects,
  type StripeAccount,
} from 'helpers/stripe';
import type {
  ContributionType,
  OtherAmounts,
  SelectedAmounts,
} from 'helpers/contributions';
import { getAmount } from 'helpers/contributions';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { isInStripePaymentRequestAllowedCountries } from 'helpers/internationalisation/country';
import StripePaymentRequestButton from './StripePaymentRequestButton';
// ----- Types -----//

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  country: IsoCountry,
  currency: IsoCurrency,
  isTestUser: boolean,
  contributionType: ContributionType,
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
|};

// ----- Component ----- //

const StripePaymentRequestButtonContainer = (props: PropTypes) => {
  // Maintain the PRB objects here because we must not re-create them when user switches between regular/one-off.
  // We have to create the PRB object inside the Elements component.
  const [prbObjects, setPrbObjects] = useState<{ [StripeAccount]: Object | null }>({
    ONE_OFF: null,
    REGULAR: null,
  });
  const stripeAccount = stripeAccountForContributionType[props.contributionType];
  const stripeKey = getStripeKey(
    stripeAccount,
    props.country,
    props.isTestUser,
  );

  const stripeObjects = useStripeObjects(stripeAccount, stripeKey, props.isTestUser);

  const showStripePaymentRequestButton = isInStripePaymentRequestAllowedCountries(props.country);

  if (showStripePaymentRequestButton && stripeObjects[stripeAccount]) {
    const amount = getAmount(props.selectedAmounts, props.otherAmounts, props.contributionType);

    // `options` must be set even if it's empty, otherwise we get 'Unsupported prop change on Elements' warnings
    // in the console
    const elementsOptions = {};

    /**
     * The `key` attribute is necessary here because you cannot update the stripe object on the Elements.
     * Instead, we create separate instances for ONE_OFF and REGULAR
     */
    return (
      <div className="stripe-payment-request-button" key={stripeAccount}>
        <Elements stripe={stripeObjects[stripeAccount]} options={elementsOptions}>
          <StripePaymentRequestButton
            stripeAccount={stripeAccount}
            amount={amount}
            stripeKey={stripeKey}
            paymentRequestObject={prbObjects[stripeAccount]}
            setPaymentRequestObject={prbObject => setPrbObjects({
              ...prbObjects,
              [stripeAccount]: prbObject,
            })}
          />
        </Elements>
      </div>
    );
  }
  return null;
};

export default StripePaymentRequestButtonContainer;
