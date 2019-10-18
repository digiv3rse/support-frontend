// @flow

// Docs: https://github.com/stripe/react-stripe-elements#using-the-paymentrequestbuttonelement

// ----- Imports ----- //

import React from 'react';
import { StripeProvider, Elements } from 'react-stripe-elements';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
 import { getStripeKey, stripeAccountForContributionType } from 'helpers/paymentIntegrations/stripeCheckout';
import type { ContributionType, OtherAmounts, SelectedAmounts } from 'helpers/contributions';
import { getAmount } from 'helpers/contributions';
import { isInStripePaymentRequestAllowedCountries } from 'helpers/internationalisation/country';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { setupStripe } from 'helpers/stripe';
import StripePaymentRequestButton from './StripePaymentRequestButton';


// ----- Types -----//

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  country: IsoCountry,
  currency: IsoCurrency,
  isTestUser: boolean,
  contributionType: ContributionType,
  setStripeHasLoaded: () => void,
  stripeHasLoaded: boolean,
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
|};

// ----- Component ----- //

class StripePaymentRequestButtonContainer extends React.Component<PropTypes, void> {

  componentDidMount(): void {
    if (!this.props.stripeHasLoaded) { setupStripe(this.props.setStripeHasLoaded); }
  }

  render() {
    const showStripePaymentRequestButton = isInStripePaymentRequestAllowedCountries(this.props.country);

    if (showStripePaymentRequestButton && this.props.stripeHasLoaded) {
      const singleKey = getStripeKey('ONE_OFF', this.props.country, this.props.isTestUser);
      const recurringKey =  getStripeKey('REGULAR', this.props.country, this.props.isTestUser);
      const amount = getAmount(this.props.selectedAmounts, this.props.otherAmounts, this.props.contributionType);

      return (
        <div className="stripe-payment-request-button">
          {
            this.props.contributionType === 'ONE_OFF' ?
              <StripeProvider apiKey={singleKey}>
                <Elements>
                  <StripePaymentRequestButton
                    amount={amount}
                  />
                </Elements>
              </StripeProvider>
            :
              <StripeProvider apiKey={recurringKey}>
                <Elements>
                  <StripePaymentRequestButton
                    amount={amount}
                  />
                </Elements>
              </StripeProvider>
          }
        </div>

      );
    }
    return null;
  }
}

export default StripePaymentRequestButtonContainer;
