// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import {
  firstError,
  type FormError,
} from 'helpers/subscriptionsForms/validation';
import type { DigitalBillingPeriod } from 'helpers/billingPeriods';
import Form, { FormSection, FormSectionHiddenUntilSelected } from 'components/checkoutForm/checkoutForm';
import CheckoutLayout, { Content } from 'components/subscriptionCheckouts/layout';
import type { ErrorReason } from 'helpers/errorReasons';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import {
  finalPrice,
  getProductPrice,
} from 'helpers/productPrice/productPrices';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import OrderSummary from 'pages/digital-subscription-checkout/components/orderSummary/orderSummary';
import {
  type Action,
  type FormActionCreators,
  formActionCreators,
} from 'helpers/subscriptionsForms/formActions';
import type { Csrf } from 'helpers/csrf/csrfReducer';
import { setupSubscriptionPayPalPayment } from 'helpers/paymentIntegrations/payPalRecurringCheckout';
import { PaymentMethodSelector } from 'components/subscriptionCheckouts/paymentMethodSelector';
import { signOut } from 'helpers/user/user';
import GridImage from 'components/gridImage/gridImage';

import {
  type FormField,
  type FormFields,
  getFormFields,
} from 'helpers/subscriptionsForms/formFields';
import PersonalDetails from 'components/subscriptionCheckouts/personalDetails';
import DigitalPaymentTerms from './digitalPaymentTerms';
import { withStore } from 'components/subscriptionCheckouts/address/addressFields';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { countries } from 'helpers/internationalisation/country';
import { DigitalPack } from 'helpers/subscriptions';
import type { CheckoutState } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import { getBillingAddress } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import {
  checkoutFormIsValid,
  validateCheckoutForm,
} from 'helpers/subscriptionsForms/formValidation';
import {
  submitCheckoutForm,
  trackSubmitAttempt,
} from 'helpers/subscriptionsForms/submit';
import { PayPal, Stripe, DirectDebit } from 'helpers/paymentMethods';
import GeneralErrorMessage
  from 'components/generalErrorMessage/generalErrorMessage';
import { StripeProviderForCountry } from 'components/subscriptionCheckouts/stripeForm/stripeProviderForCountry';
import DirectDebitForm from 'components/directDebit/directDebitProgressiveDisclosure/directDebitForm';
import { routes } from 'helpers/routes';
import EndSummaryMobile from 'pages/digital-subscription-checkout/components/endSummary/endSummaryMobile';
import type { Participations } from 'helpers/abTests/abtest';

// ----- Types ----- //

type PropTypes = {|
  ...FormFields,
  country: IsoCountry,
  signOut: typeof signOut,
  submitForm: Function,
  formErrors: FormError<FormField>[],
  submissionError: ErrorReason | null,
  productPrices: ProductPrices,
  currencyId: IsoCurrency,
  ...FormActionCreators,
  csrf: Csrf,
  payPalHasLoaded: boolean,
  isTestUser: boolean,
  amount: number,
  billingPeriod: DigitalBillingPeriod,
  setupRecurringPayPalPayment: Function,
  validateForm: () => Function,
  formIsValid: Function,
  addressErrors: Array<Object>,
  participations: Participations,
|};

// ----- Map State/Props ----- //

function mapStateToProps(state: CheckoutState) {
  return {
    ...getFormFields(state),
    country: state.common.internationalisation.countryId,
    formErrors: state.page.checkout.formErrors,
    submissionError: state.page.checkout.submissionError,
    productPrices: state.page.checkout.productPrices,
    currencyId: state.common.internationalisation.currencyId,
    csrf: state.page.csrf,
    payPalHasLoaded: state.page.checkout.payPalHasLoaded,
    paymentMethod: state.page.checkout.paymentMethod,
    isTestUser: state.page.checkout.isTestUser,
    amount: finalPrice(
      state.page.checkout.productPrices,
      state.common.internationalisation.countryId,
      state.page.checkout.billingPeriod,
    ).price,
    billingPeriod: state.page.checkout.billingPeriod,
    addressErrors: state.page.billingAddress.fields.formErrors,
    participations: state.common.abParticipations,
  };
}

// ----- Map Dispatch/Props ----- //
function mapDispatchToProps() {
  return {
    ...formActionCreators,
    formIsValid: () => (dispatch: Dispatch<Action>, getState: () => CheckoutState) => checkoutFormIsValid(getState()),
    submitForm: () => (dispatch: Dispatch<Action>, getState: () => CheckoutState) =>
      submitCheckoutForm(dispatch, getState()),
    validateForm: () => (dispatch: Dispatch<Action>, getState: () => CheckoutState) => {
      const state = getState();
      validateCheckoutForm(dispatch, state);
      // We need to track PayPal payment attempts here because PayPal behaves
      // differently to other payment methods. All others are tracked in submit.js
      const { paymentMethod } = state.page.checkout;
      if (paymentMethod === PayPal) {
        trackSubmitAttempt(PayPal, DigitalPack);
      }
    },
    setupRecurringPayPalPayment: setupSubscriptionPayPalPayment,
    signOut,
  };
}

const Address = withStore(countries, 'billing', getBillingAddress);

// ----- Component ----- //

function DigitalCheckoutForm(props: PropTypes) {
  const productPrice = getProductPrice(
    props.productPrices,
    props.country,
    props.billingPeriod,
  );

  const submissionErrorHeading = props.submissionError === 'personal_details_incorrect' ? 'Sorry there was a problem' :
    'Sorry we could not process your payment';

  const maybeAddress = props.participations.removeDigiSubAddressTest === 'noAddress' ?
    null :
    (
      <FormSection title="Address">
        <Address />
      </FormSection>
    );


  return (
    <Content>
      <CheckoutLayout aside={(
        <OrderSummary
          image={
            <GridImage
              gridId="subscriptionDailyPackshot"
              srcSizes={[1000, 500]}
              sizes="(max-width: 740px) 50vw, 500"
              imgType="png"
              altText=""
            />
            }
          title="Digital Subscription"
          description="Premium App + The Guardian Daily + Ad-free"
          productPrice={productPrice}
          billingPeriod={props.billingPeriod}
          changeSubscription={routes.digitalSubscriptionLanding}
        />)}
      >
        <Form onSubmit={(ev) => {
            ev.preventDefault();
            props.submitForm();
          }}
        >
          <FormSection title="Your details">
            <PersonalDetails
              firstName={props.firstName}
              setFirstName={props.setFirstName}
              lastName={props.lastName}
              setLastName={props.setLastName}
              email={props.email}
              telephone={props.telephone}
              setTelephone={props.setTelephone}
              formErrors={props.formErrors}
              signOut={props.signOut}
            />
          </FormSection>
          {maybeAddress}
          <PaymentMethodSelector
            country={props.country}
            paymentMethod={props.paymentMethod}
            setPaymentMethod={props.setPaymentMethod}
            onPaymentAuthorised={props.onPaymentAuthorised}
            validationError={firstError('paymentMethod', props.formErrors)}
            csrf={props.csrf}
            currencyId={props.currencyId}
            payPalHasLoaded={props.payPalHasLoaded}
            formIsValid={props.formIsValid}
            validateForm={props.validateForm}
            isTestUser={props.isTestUser}
            setupRecurringPayPalPayment={props.setupRecurringPayPalPayment}
            amount={props.amount}
            billingPeriod={props.billingPeriod}
            allErrors={[...props.addressErrors, ...props.formErrors]}
          />
          <FormSectionHiddenUntilSelected
            id="stripeForm"
            show={props.paymentMethod === Stripe}
            title="Your card details"
          >
            <StripeProviderForCountry
              country={props.country}
              isTestUser={props.isTestUser}
              submitForm={props.submitForm}
              allErrors={[...props.addressErrors]}
              setStripePaymentMethod={props.setStripePaymentMethod}
              name={`${props.firstName} ${props.lastName}`}
              validateForm={props.validateForm}
              buttonText="Start your free trial now"
              csrf={props.csrf}
            />
          </FormSectionHiddenUntilSelected>
          <FormSectionHiddenUntilSelected
            id="directDebitForm"
            show={props.paymentMethod === DirectDebit}
            title="Your account details"
          >
            <DirectDebitForm
              buttonText="Start free trial"
              submitForm={props.submitForm}
              allErrors={[...props.addressErrors, ...props.formErrors]}
              submissionError={props.submissionError}
              submissionErrorHeading={submissionErrorHeading}
            />
          </FormSectionHiddenUntilSelected>
          <GeneralErrorMessage
            errorReason={props.submissionError}
            errorHeading={submissionErrorHeading}
          />
          <EndSummaryMobile />
          <DigitalPaymentTerms
            paymentMethod={props.paymentMethod}
          />
        </Form>
      </CheckoutLayout>
    </Content>
  );
}

// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps())(DigitalCheckoutForm);
