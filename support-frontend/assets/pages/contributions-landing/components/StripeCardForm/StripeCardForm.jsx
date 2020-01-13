// @flow

// ----- Imports ----- //

import React, { Component } from 'react';
import {
  CardCVCElement,
  CardExpiryElement,
  CardNumberElement,
  injectStripe,
} from 'react-stripe-elements';
import { connect } from 'react-redux';
import { fetchJson, requestOptions } from 'helpers/fetch';
import type {
  State,
  Stripe3DSResult,
} from 'pages/contributions-landing/contributionsLandingReducer';
import { Stripe } from 'helpers/paymentMethods';
import { type PaymentResult } from 'helpers/paymentIntegrations/readerRevenueApis';
import {
  type Action,
  onThirdPartyPaymentAuthorised,
  paymentFailure,
  paymentWaiting as setPaymentWaiting,
  setCreateStripePaymentMethod,
  setHandleStripe3DS,
  setSetupIntentClientSecret,
  setStripeCardFormComplete,
} from 'pages/contributions-landing/contributionsLandingActions';
import { type ContributionType } from 'helpers/contributions';
import type { ErrorReason } from 'helpers/errorReasons';
import { logException } from 'helpers/logger';
import { trackComponentLoad } from 'helpers/tracking/behaviour';
import type { IsoCountry } from 'helpers/internationalisation/country';
import CreditCardsROW from './creditCardsROW.svg';
import CreditCardsUS from './creditCardsUS.svg';
import type { PaymentSecuritySecureTransactionGreyNonUKVariants } from 'helpers/abTests/abtestDefinitions';

// ----- Types -----//

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  stripe: Object, // Available through the injectStripe 'Higher-Order Component'
  onPaymentAuthorised: (paymentMethodId: string) => Promise<PaymentResult>,
  paymentFailure: (paymentError: ErrorReason) => Action,
  contributionType: ContributionType,
  setCreateStripePaymentMethod: ((email: string) => void) => Action,
  setHandleStripe3DS: ((clientSecret: string) => Promise<Stripe3DSResult>) => Action,
  setPaymentWaiting: (isWaiting: boolean) => Action,
  paymentWaiting: boolean,
  setStripeCardFormComplete: (isComplete: boolean) => Action,
  checkoutFormHasBeenSubmitted: boolean,
  stripeKey: string,
  setupIntentClientSecret: string | null,
  setSetupIntentClientSecret: (setupIntentClientSecret: string) => Action,
  country: IsoCountry,
  paymentSecuritySecureTransactionGreyNonUKVariant: PaymentSecuritySecureTransactionGreyNonUKVariants
|};

const mapStateToProps = (state: State) => ({
  contributionType: state.page.form.contributionType,
  checkoutFormHasBeenSubmitted: state.page.form.formData.checkoutFormHasBeenSubmitted,
  setupIntentClientSecret: state.page.form.stripeCardFormData.setupIntentClientSecret,
  paymentWaiting: state.page.form.isWaiting,
  country: state.common.internationalisation.countryId,
  paymentSecuritySecureTransactionGreyNonUKVariant:
    state.common.abParticipations.paymentSecuritySecureTransactionGreyNonUK,
});

const mapDispatchToProps = (dispatch: Function) => ({
  onPaymentAuthorised: (paymentMethodId: string) =>
    dispatch(onThirdPartyPaymentAuthorised({
      paymentMethod: Stripe,
      stripePaymentMethod: 'StripeCheckout',
      paymentMethodId,
    })),
  paymentFailure: (paymentError: ErrorReason) => dispatch(paymentFailure(paymentError)),
  setCreateStripePaymentMethod: (createStripePaymentMethod: (email: string) => void) =>
    dispatch(setCreateStripePaymentMethod(createStripePaymentMethod)),
  setHandleStripe3DS: (handleStripe3DS: (clientSecret: string) => Promise<Stripe3DSResult>) =>
    dispatch(setHandleStripe3DS(handleStripe3DS)),
  setStripeCardFormComplete: (isComplete: boolean) =>
    dispatch(setStripeCardFormComplete(isComplete)),
  setPaymentWaiting: (isWaiting: boolean) =>
    dispatch(setPaymentWaiting(isWaiting)),
  setSetupIntentClientSecret: (setupIntentClientSecret: string) =>
    dispatch(setSetupIntentClientSecret(setupIntentClientSecret)),
});

type CardFieldState =
  {| name: 'Error', errorMessage: string |} |
  {| name: 'Incomplete' |} |
  {| name: 'Complete' |};

type CardFieldName = 'CardNumber' | 'Expiry' | 'CVC';

type StateTypes = {
  [CardFieldName]: CardFieldState,
  currentlySelected: CardFieldName | null,
};

const fieldStyle = {
  base: {
    fontFamily: '\'Guardian Text Sans Web\', \'Helvetica Neue\', Helvetica, Arial, \'Lucida Grande\', sans-serif',
    fontSize: '16px',
    '::placeholder': {
      color: '#999999',
    },
    lineHeight: '24px',
  },
};

const errorMessageFromState = (state: CardFieldState): string | null =>
  (state.name === 'Error' ? state.errorMessage : null);

class CardForm extends Component<PropTypes, StateTypes> {

  constructor(props: PropTypes) {
    super(props);

    this.state = {
      CardNumber: { name: 'Incomplete' },
      Expiry: { name: 'Incomplete' },
      CVC: { name: 'Incomplete' },
      currentlySelected: null,
    };
  }

  componentDidMount(): void {
    if (this.props.contributionType === 'ONE_OFF') {
      this.setupOneOffHandlers();
    } else {
      this.setupRecurringHandlers();
    }
  }

  onChange = (fieldName: CardFieldName) => (update) => {
    let newFieldState = { name: 'Incomplete' };

    if (update.error) {
      newFieldState = { name: 'Error', errorMessage: update.error.message };
    } else if (update.complete) {
      newFieldState = { name: 'Complete' };
    }

    this.setState(
      { [fieldName]: newFieldState },
      () => this.props.setStripeCardFormComplete(this.formIsComplete()),
    );
  };

  onFocus = (fieldName: CardFieldName) => {
    this.setState({
      currentlySelected: fieldName,
    });
  };

  onBlur = () => {
    this.setState({
      currentlySelected: null,
    });
  };

  setupRecurringHandlers(): void {
    // Start by requesting the client_secret for a new SetupIntent.
    // Note - because this value is requested asynchronously when the component loads,
    // it's possible for it to arrive after the user clicks 'Contribute'. This eventuality
    // is handled in the callback below by checking the value of paymentWaiting.
    fetchJson(
      window.guardian.stripeSetupIntentEndpoint,
      requestOptions({ publicKey: this.props.stripeKey }, 'omit', 'POST', null),
    ).then((result) => {
      if (result.client_secret) {
        this.props.setSetupIntentClientSecret(result.client_secret);
        // If user has already clicked contribute then handle card setup now
        if (this.props.paymentWaiting) {
          this.handleCardSetupForRecurring(result.client_secret);
        }
      } else {
        throw new Error(`Missing client_secret field in response from ${window.guardian.stripeSetupIntentEndpoint}`);
      }
    }).catch((error) => {
      logException(`Error getting Stripe client secret for recurring contribution: ${error}`);
      this.props.paymentFailure('internal_error');
    });

    this.props.setCreateStripePaymentMethod(() => {
      this.props.setPaymentWaiting(true);

      // If clientSecret is not yet available then handleCardSetupForRecurring will be called when it is
      if (this.props.setupIntentClientSecret) {
        this.handleCardSetupForRecurring(this.props.setupIntentClientSecret);
      }
    });
  }

  setupOneOffHandlers(): void {
    this.props.setCreateStripePaymentMethod(() => {
      this.props.setPaymentWaiting(true);

      this.props.stripe.createPaymentMethod('card').then((result) => {
        if (result.error) {
          this.handleStripeError(result.error);
        } else {
          this.props.onPaymentAuthorised(result.paymentMethod.id);
        }
      });
    });

    this.props.setHandleStripe3DS((clientSecret: string) => {
      trackComponentLoad('stripe-3ds');
      return this.props.stripe.handleCardAction(clientSecret);
    });
  }

  getFieldBorderClass = (fieldName: CardFieldName): string => {
    if (this.state.currentlySelected === fieldName) {
      return 'form__input-enabled';
    } else if (this.state[fieldName].name === 'Error') {
      return 'form__input--invalid';
    }
    return '';
  };

  handleStripeError(errorData: any): void {
    this.props.setPaymentWaiting(false);

    logException(`Error creating Payment Method: ${JSON.stringify(errorData)}`);

    if (errorData.type === 'validation_error') {
      // This shouldn't be possible as we disable the submit button until all fields are valid, but if it does
      // happen then display a generic error about card details
      this.props.paymentFailure('payment_details_incorrect');
    } else {
      // This is probably a Stripe or network problem
      this.props.paymentFailure('payment_provider_unavailable');
    }
  }

  handleCardSetupForRecurring(clientSecret: string): void {
    // TODO - rename to confirmCardSetup?
    this.props.stripe.handleCardSetup(clientSecret).then((result) => {
      if (result.error) {
        this.handleStripeError(result.error);
      } else {
        this.props.onPaymentAuthorised(result.setupIntent.payment_method);
      }
    });
  }

  formIsComplete = () =>
    this.state.CardNumber.name === 'Complete' &&
    this.state.Expiry.name === 'Complete' &&
    this.state.CVC.name === 'Complete';

  render() {
    const fieldError: ?string =
      errorMessageFromState(this.state.CardNumber) ||
      errorMessageFromState(this.state.Expiry) ||
      errorMessageFromState(this.state.CVC);

    const incompleteMessage = (): ?string => {
      if (
        this.props.checkoutFormHasBeenSubmitted &&
        (
          this.state.CardNumber.name === 'Incomplete' ||
          this.state.Expiry.name === 'Incomplete' ||
          this.state.CVC.name === 'Incomplete'
        )
      ) {
        return 'Please complete your card details';
      }
      return undefined;
    };

    const errorMessage: ?string = fieldError || incompleteMessage();

    const getClasses = (fieldName: CardFieldName): string =>
      `form__input ${this.getFieldBorderClass(fieldName)}`;

    const showCards = (securityTestVariant: PaymentSecuritySecureTransactionGreyNonUKVariants, country: IsoCountry) => {
      if (securityTestVariant === 'V1_securetransactiongrey') {
        if (country === 'US') {
          return <CreditCardsUS className="form__credit-card-icons" />;
        }
        return <CreditCardsROW className="form__credit-card-icons" />;
      }
      return null;
    };

    return (
      <div className="form__fields">
        <legend className="form__legend"><h3>Your card details</h3></legend>
        <div className="form__field">
          <label className="form__label" htmlFor="stripeCardNumberElement">
            <span>Card number</span>
          </label>
          {showCards(this.props.paymentSecuritySecureTransactionGreyNonUKVariant, this.props.country)}
          <span className={getClasses('CardNumber')}>
            <CardNumberElement
              id="stripeCardNumberElement"
              style={fieldStyle}
              onChange={this.onChange('CardNumber')}
              onFocus={() => this.onFocus('CardNumber')}
              onBlur={this.onBlur}
            />
          </span>
        </div>
        <div className="stripe-card-element-container__inline-fields">
          <div className="form__field">
            <label className="form__label" htmlFor="stripeCardExpiryElement">
              <span>Expiry date</span>
            </label>
            <span className={getClasses('Expiry')}>
              <CardExpiryElement
                id="stripeCardExpiryElement"
                style={fieldStyle}
                onChange={this.onChange('Expiry')}
                onFocus={() => this.onFocus('Expiry')}
                onBlur={this.onBlur}
              />
            </span>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="stripeCardCVCElement">
              <span>CVC</span>
            </label>
            <span className={getClasses('CVC')}>
              <CardCVCElement
                id="stripeCardCVCElement"
                style={fieldStyle}
                placeholder=""
                onChange={this.onChange('CVC')}
                onFocus={() => this.onFocus('CVC')}
                onBlur={this.onBlur}
              />
            </span>
          </div>
        </div>
        {errorMessage ? <div className="form__error">{errorMessage}</div> : null}
      </div>
    );
  }
}

const StripeCardForm =
  injectStripe(connect(mapStateToProps, mapDispatchToProps)(CardForm));

export default StripeCardForm;
