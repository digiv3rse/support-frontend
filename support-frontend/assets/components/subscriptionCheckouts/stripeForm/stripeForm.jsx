/* eslint-disable react/no-unused-state */
// @flow

import React, { Component, type Node } from 'react';
import { compose } from 'redux';
import { injectStripe } from 'react-stripe-elements';
import Button from 'components/button/button';
import { ErrorSummary } from '../submitFormErrorSummary';
import { type FormError } from 'helpers/subscriptionsForms/validation';
import { type FormField } from 'helpers/subscriptionsForms/formFields';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from 'react-stripe-elements';
import { withError } from 'hocs/withError';
import { withLabel } from 'hocs/withLabel';

import './stripeForm.scss';
import { fetchJson, requestOptions } from 'helpers/fetch';
import { logException } from 'helpers/logger';
import type { Option } from 'helpers/types/option';
import { appropriateErrorMessage } from 'helpers/errorReasons';
import type { Csrf } from '../../../helpers/csrf/csrfReducer';
import { trackComponentLoad } from '../../../helpers/tracking/behaviour';
import { loadRecaptchaV2 } from '../../../helpers/recaptcha';

// Types

export type StripeFormPropTypes = {
  component: Node,
  stripe: Object,
  allErrors: FormError<FormField>[],
  stripeKey: string,
  setStripePaymentMethod: Function,
  submitForm: Function,
  validateForm: Function,
  buttonText: string,
  stripeSetupIntentEndpoint: string,
  csrf: Csrf,
}

type StateTypes = {
  cardNumber: Object,
  cardExpiry: Object,
  cardCvc: Object,
  cardErrors: Array<Object>,
  setupIntentClientSecret: Option<string>,
  paymentWaiting: boolean
}

// Styles for stripe elements

const baseStyles = {
  fontSize: '16px',
  color: '#121212',
  '::placeholder': {
    color: 'white',
  },
};

const invalidStyles = {
  color: '#c70000',
};

// Main component

const CardNumberWithError = compose(withError, withLabel)(CardNumberElement);
const CardExpiryWithError = compose(withError, withLabel)(CardExpiryElement);
const CardCvcWithError = compose(withError, withLabel)(CardCvcElement);

class StripeForm extends Component<StripeFormPropTypes, StateTypes> {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: {
        complete: false,
        empty: true,
        error: '',
        errorEmpty: 'Please enter a card number',
        errorIncomplete: 'Please enter a valid card number',
      },
      cardExpiry: {
        complete: false,
        empty: true,
        error: '',
        errorEmpty: 'Please enter an expiry date',
        errorIncomplete: 'Please enter a valid expiry date',
      },
      cardCvc: {
        complete: false,
        empty: true,
        error: '',
        errorEmpty: 'Please enter a CVC number',
        errorIncomplete: 'Please enter a valid CVC number',
      },
      cardErrors: [],
      setupIntentClientSecret: null,
      paymentWaiting: false,
    };
  }


  componentDidMount() {
    this.setupRecurringHandlers();
  }

  getAllCardErrors = () => ['cardNumber', 'cardExpiry', 'cardCvc'].reduce((cardErrors, field) => {
    if (this.state[field].error.length > 0) {
      cardErrors.push({ field: [field], message: this.state[field].error });
    }
    return cardErrors;
  }, []);

  // Creates a new setupIntent upon recaptcha verification
  setupRecurringRecaptchaCallback = () => {
    window.grecaptcha.render('robot_checkbox', {
      sitekey: window.guardian.v2recaptchaPublicKey, // To Do this needs to be the site key
      callback: (token) => {
        trackComponentLoad('subscriptions-recaptcha-client-token-received');
        fetchJson(
          '/stripe/create-setup-intent/recaptcha',
          requestOptions(
            { token, stripePublicKey: this.props.stripeKey },
            'same-origin',
            'POST',
            this.props.csrf,
          ),
        )
          .then((result) => {
            if (result.client_secret) {
              this.setState({ setupIntentClientSecret: result.client_secret });

              // If user has already clicked contribute then handle card setup now
              if (this.state.paymentWaiting) {
                this.handleCardSetup(result.client_secret);
              }
            } else {
              throw new Error(`Missing client_secret field in response from ${this.props.stripeSetupIntentEndpoint}`);
            }
          }).catch((error) => {
            logException(`Error getting Stripe client secret for recurring contribution: ${error}`);

            this.setState({
              cardErrors: [...this.state.cardErrors, { field: 'cardNumber', message: appropriateErrorMessage('internal_error') }],
            });
          });
      },
    });
  };

  setupRecurringHandlers(): void {
    if (window.grecaptcha && window.grecaptcha.render) {
      this.setupRecurringRecaptchaCallback();
    } else {
      window.v2OnloadCallback = this.setupRecurringRecaptchaCallback;
    }
  }

  handleCardErrors = () => {
    // eslint-disable-next-line array-callback-return
    ['cardNumber', 'cardExpiry', 'cardCvc'].map((field) => {
      if (this.state[field].empty === true) {
        this.setState({
          [field]: {
            ...this.state[field],
            error: this.state[field].errorEmpty,
          },
        });
      } else if (!this.state[field].complete) {
        this.setState({
          [field]: {
            ...this.state[field],
            error: this.state[field].errorIncomplete,
          },
        });
      }
      this.setState({ cardErrors: this.getAllCardErrors() });
    });
  };

  handleChange = (event) => {
    if (this.state[event.elementType].error) {
      this.setState({
        [event.elementType]: {
          ...this.state[event.elementType],
          error: '',
        },
      });
    } else {
      this.setState({
        [event.elementType]: {
          ...this.state[event.elementType],
          complete: event.complete,
          empty: event.empty,
        },
      });
    }
  };

  handleStripeError(errorData: any): void {
    this.setState({ paymentWaiting: false });

    logException(`Error creating Payment Method: ${errorData}`);

    if (errorData.type === 'validation_error') {
      // This shouldn't be possible as we disable the submit button until all fields are valid, but if it does
      // happen then display a generic error about card details
      this.setState({
        cardErrors: [...this.state.cardErrors, { field: 'cardNumber', message: appropriateErrorMessage('payment_details_incorrect') }],
      });
    } else {
      // This is probably a Stripe or network problem
      this.setState({
        cardErrors: [...this.state.cardErrors, { field: 'cardNumber', message: appropriateErrorMessage('payment_provider_unavailable') }],
      });
    }
  }

   handleCardSetup(clientSecret: Option<string>): Promise<string> {
    return this.props.stripe.handleCardSetup(clientSecret).then((result) => {
      if (result.error) {
        this.handleStripeError(result.error);
        return Promise.resolve(result.error);
      }
      return result.setupIntent.payment_method;

    });
  }

  requestSCAPaymentMethod = (event) => {
    event.preventDefault();
    this.props.validateForm();
    this.handleCardErrors();

    if (this.props.stripe && this.props.allErrors.length === 0 && this.state.cardErrors.length === 0) {

      this.handleCardSetup(this.state.setupIntentClientSecret).then((paymentMethod) => {
        this.props.setStripePaymentMethod(paymentMethod);
      }).then(() => this.props.submitForm());
    }
  };

  render() {
    loadRecaptchaV2();
    const { stripe } = this.props;
    if (stripe) {
      stripe.elements();
    }

    return (
      <span>
        {stripe && (
        <fieldset>
          <CardNumberWithError
            id="card-number"
            error={this.state.cardNumber.error}
            label="Card number"
            style={{ base: { ...baseStyles }, invalid: { ...invalidStyles } }}
            onChange={e => this.handleChange(e)}
          />
          <CardExpiryWithError
            id="card-expiry"
            error={this.state.cardExpiry.error}
            label="Expiry date"
            style={{ base: { ...baseStyles }, invalid: { ...invalidStyles } }}
            onChange={e => this.handleChange(e)}
          />
          <CardCvcWithError
            id="cvc"
            error={this.state.cardCvc.error}
            label="CVC"
            style={{ base: { ...baseStyles }, invalid: { ...invalidStyles } }}
            onChange={e => this.handleChange(e)}
          />
          <div className="component-stripe-submit-button">
            <Button id="qa-stripe-submit-button" onClick={event => this.requestSCAPaymentMethod(event)}>
              {this.props.buttonText}
            </Button>
          </div>
          <span>{this.props.component}</span>
          {(this.state.cardErrors.length > 0 || this.props.allErrors.length > 0)
          && <ErrorSummary errors={[...this.props.allErrors, ...this.state.cardErrors]} />}
        </fieldset>
      )}
      </span>
    );
  }
}

export default injectStripe(StripeForm);
