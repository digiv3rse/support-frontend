/* eslint-disable react/no-unused-state */
// @flow

// $FlowIgnore - required for hooks
import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import * as stripeJs from '@stripe/react-stripe-js';
import Button from 'components/button/button';
import { ErrorSummary } from '../submitFormErrorSummary';
import { type FormError } from 'helpers/subscriptionsForms/validation';
import { type FormField } from 'helpers/subscriptionsForms/formFields';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { withError } from 'hocs/withError';
import { withLabel } from 'hocs/withLabel';

import './stripeForm.scss';
import { fetchJson, requestOptions } from 'helpers/fetch';
import { logException } from 'helpers/logger';
import type { Option } from 'helpers/types/option';
import { appropriateErrorMessage } from 'helpers/errorReasons';
import type { Csrf } from 'helpers/csrf/csrfReducer';
import { trackComponentLoad } from 'helpers/tracking/behaviour';
import { loadRecaptchaV2 } from 'helpers/recaptcha';
import { isPostDeployUser } from 'helpers/user/user';
import { routes } from 'helpers/routes';
import { Recaptcha } from 'components/recaptcha/recaptcha';

// Types

export type StripeFormPropTypes = {
  allErrors: FormError<FormField>[],
  stripeKey: string,
  setStripePaymentMethod: Function,
  submitForm: Function,
  validateForm: Function,
  buttonText: string,
  csrf: Csrf,
}

type CardFieldData = {
  complete: boolean,
  empty: boolean,
  error: string,
  errorEmpty: string,
  errorIncomplete: string,
}

type CardFieldName = 'cardNumber' | 'cardExpiry' | 'cardCvc';

type CardFieldsData = {
  [CardFieldName]: CardFieldData,
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

const CardNumberWithError = compose(withLabel, withError)(CardNumberElement);
const CardExpiryWithError = compose(withLabel, withError)(CardExpiryElement);
const CardCvcWithError = compose(withLabel, withError)(CardCvcElement);
const RecaptchaWithError = compose(withLabel, withError)(Recaptcha);

const StripeForm = (props: StripeFormPropTypes) => {
  /**
   * State
   */
  const [cardErrors, setCardErrors] = useState<FormError<CardFieldName>[]>([]);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<Option<string>>(null);
  const [paymentWaiting, setPaymentWaiting] = useState<boolean>(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState<boolean>(false);
  const [recaptchaError, setRecaptchaError] = useState<FormError<'recaptcha'> | null>(null);
  const [cardFieldsData, setCardFieldsData] = useState<CardFieldsData>({
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
  });

  const stripe = stripeJs.useStripe();
  const elements = stripeJs.useElements();

  /**
   * Handlers
   */

  const getAllCardErrors = () => ['cardNumber', 'cardExpiry', 'cardCvc'].reduce((acc, field) => {
    if (cardFieldsData[field].error.length > 0) {
      acc.push({ field: [field], message: cardFieldsData[field].error });
    }
    return acc;
  }, []);

  const handleStripeError = (errorData: any): void => {
    setPaymentWaiting(false);

    logException(`Error creating Payment Method: ${JSON.stringify(errorData)}`);

    if (errorData.type === 'validation_error') {
      // This shouldn't be possible as we disable the submit button until all fields are valid, but if it does
      // happen then display a generic error about card details
      setCardErrors(prevData => [...prevData, { field: 'cardNumber', message: appropriateErrorMessage('payment_details_incorrect') }]);
    } else {
      // This is probably a Stripe or network problem
      setCardErrors(prevData => [...prevData, { field: 'cardNumber', message: appropriateErrorMessage('payment_provider_unavailable') }]);
    }
  };

  const handleCardSetup = (clientSecret: Option<string>): Promise<string> => {
    const cardElement = elements.getElement(CardNumberElement);
    return stripe.handleCardSetup(clientSecret, cardElement).then((result) => {
      if (result.error) {
        handleStripeError(result.error);
        return Promise.resolve(result.error);
      }
      return result.setupIntent.payment_method;

    });
  };

  const fetchPaymentIntent = (token) => {
    fetchJson(
      routes.stripeSetupIntentRecaptcha,
      requestOptions(
        { token, stripePublicKey: props.stripeKey },
        'same-origin',
        'POST',
        props.csrf,
      ),
    )
      .then((result) => {
        if (result.client_secret) {
          setSetupIntentClientSecret(result.client_secret);
        } else {
          throw new Error(`Missing client_secret field in response from ${routes.stripeSetupIntentRecaptcha}`);
        }
      }).catch((error) => {
        logException(`Error getting Stripe client secret for subscription: ${error}`);

        setCardErrors(prevData => [...prevData, { field: 'cardNumber', message: appropriateErrorMessage('internal_error') }]);
      });
  };

  // Creates a new setupIntent upon recaptcha verification
  const setupRecurringRecaptchaCallback = () => {
    window.grecaptcha.render('robot_checkbox', {
      sitekey: window.guardian.v2recaptchaPublicKey,
      callback: (token) => {
        trackComponentLoad('subscriptions-recaptcha-client-token-received');
        setRecaptchaCompleted(true);
        setRecaptchaError(null);
        fetchPaymentIntent(token);
      },
    });
  };

  const setupRecurringHandlers = (): void => {
    if (!window.guardian.recaptchaEnabled || isPostDeployUser()) {
      fetchPaymentIntent('dummy');
    } else if (window.grecaptcha && window.grecaptcha.render) {
      setupRecurringRecaptchaCallback();
    } else {
      window.v2OnloadCallback = setupRecurringRecaptchaCallback;
    }
  };

  const handleCardErrors = () => {
    // eslint-disable-next-line array-callback-return
    ['cardNumber', 'cardExpiry', 'cardCvc'].map((field) => {
      if (cardFieldsData[field].empty === true) {
        setCardFieldsData(prevData => ({
          ...prevData,
          [field]: {
            ...prevData[field],
            error: cardFieldsData[field].errorEmpty,
          },
        }));
      } else if (!cardFieldsData[field].complete) {
        setCardFieldsData(prevData => ({
          ...prevData,
          [field]: {
            ...prevData[field],
            error: prevData[field].errorIncomplete,
          },
        }));
      }
      setCardErrors(getAllCardErrors());
    });
  };

  const handleChange = (event) => {
    if (cardFieldsData[event.elementType].error) {
      setCardFieldsData(prevData => ({
        ...prevData,
        [event.elementType]: {
          ...prevData[event.elementType],
          error: '',
        },
      }));
    } else {
      setCardFieldsData(prevData => ({
        ...prevData,
        [event.elementType]: {
          ...prevData[event.elementType],
          complete: event.complete,
          empty: event.empty,
        },
      }));
    }
  };

  const checkRecaptcha = () => {
    if (window.guardian.recaptchaEnabled &&
      !isPostDeployUser() &&
      !recaptchaCompleted &&
      recaptchaError === null) {
      setRecaptchaError({
        field: 'recaptcha',
        message: 'Please check the \'I am not a robot\' checkbox',
      });
    }
  };

  const requestSCAPaymentMethod = (event) => {
    event.preventDefault();
    props.validateForm();
    handleCardErrors();
    checkRecaptcha();

    if (stripe && props.allErrors.length === 0 && cardErrors.length === 0 && !recaptchaError) {
      if (setupIntentClientSecret) {
        handleCardSetup(setupIntentClientSecret)
          .then(props.setStripePaymentMethod)
          .then(() => props.submitForm());
      } else if (recaptchaCompleted) {
        // User has completed the form and recaptcha, but we're still waiting for the setupIntentClientSecret to
        // come back. A hook will complete subscription once the setupIntentClientSecret is available.
        setPaymentWaiting(true);
      }
    }
  };

  /**
   * Hooks
   */

  useEffect(() => {
    if (stripe) {
      setupRecurringHandlers();
      loadRecaptchaV2();
    }
  }, [stripe]);

  useEffect(() => {
    if (paymentWaiting && setupIntentClientSecret) {
      // User has already completed the form and clicked the button, so go ahead and complete the subscription
      handleCardSetup(setupIntentClientSecret)
        .then(props.setStripePaymentMethod)
        .then(() => props.submitForm());
    }
  }, [setupIntentClientSecret]);

  /**
   * Rendering
   */

  const errors = [
    ...props.allErrors,
    ...cardErrors,
    ...(recaptchaError ? [recaptchaError] : []),
  ];

  return (
    <span>
      {stripe && (
      <fieldset>
        <CardNumberWithError
          id="card-number"
          error={cardFieldsData.cardNumber.error}
          label="Card number"
          options={{
            style: { base: { ...baseStyles }, invalid: { ...invalidStyles } },
          }}
          onChange={e => handleChange(e)}
        />
        <CardExpiryWithError
          id="card-expiry"
          error={cardFieldsData.cardExpiry.error}
          label="Expiry date"
          options={{
            style: { base: { ...baseStyles }, invalid: { ...invalidStyles } },
          }}
          onChange={e => handleChange(e)}
        />
        <CardCvcWithError
          id="cvc"
          error={cardFieldsData.cardCvc.error}
          label="CVC"
          options={{
            style: { base: { ...baseStyles }, invalid: { ...invalidStyles } },
          }}
          onChange={e => handleChange(e)}
        />
        { window.guardian.recaptchaEnabled ?
          <RecaptchaWithError
            id="robot_checkbox"
            label="Security check"
            error={recaptchaError && recaptchaError.message}
          /> : null }
        <div className="component-stripe-submit-button">
          <Button id="qa-stripe-submit-button" onClick={event => requestSCAPaymentMethod(event)}>
            {props.buttonText}
          </Button>
        </div>
        { errors.length > 0 && <ErrorSummary errors={errors} /> }
      </fieldset>
    )}
    </span>
  );
};

export default StripeForm;
