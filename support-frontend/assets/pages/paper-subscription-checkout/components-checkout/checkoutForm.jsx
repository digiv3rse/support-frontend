// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { firstError, type FormError } from 'helpers/subscriptionsForms/validation';
import { regularPrice as paperRegularPrice, promotion as paperPromotion } from 'helpers/productPrice/paperProductPrices';

import { Outset } from 'components/content/content';
import { PriceLabel } from 'components/priceLabel/priceLabel';
import Rows from 'components/base/rows';
import Text from 'components/text/text';
import CheckoutExpander from 'components/checkoutExpander/checkoutExpander';
import Button from 'components/button/button';
import { Input } from 'components/forms/input';
import { Select } from 'components/forms/select';
import { Fieldset } from 'components/forms/fieldset';
import { options } from 'components/forms/customFields/options';
import { RadioInput } from 'components/forms/customFields/radioInput';
import { withLabel } from 'hocs/withLabel';
import { withError } from 'hocs/withError';
import { asControlled } from 'hocs/asControlled';
import Form, { FormSection } from 'components/checkoutForm/checkoutForm';
import Layout from 'components/subscriptionCheckouts/layout';
import GeneralErrorMessage from 'components/generalErrorMessage/generalErrorMessage';
import DirectDebitPopUpForm from 'components/directDebit/directDebitPopUpForm/directDebitPopUpForm';
import type { PaymentAuthorisation } from 'helpers/paymentIntegrations/readerRevenueApis';
import Content from 'components/content/content';
import type { ErrorReason } from 'helpers/errorReasons';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import { HomeDelivery } from 'helpers/productPrice/fulfilmentOptions';
import { titles } from 'helpers/user/details';
import { formatUserDate, formatMachineDate } from '../helpers/deliveryDays';
import {
  type FormActionCreators,
  formActionCreators,
  signOut,
  type FormField,
  type FormFields,
  getFormFields,
  getDeliveryAddress,
  getBillingAddress,
  type State,
  getDays,
} from '../paperSubscriptionCheckoutReducer';
import { withStore } from './addressFields';
import { DirectDebit, Stripe } from 'helpers/paymentMethods';
// ----- Types ----- //

type PropTypes = {|
  ...FormFields,
  signOut: typeof signOut,
  formErrors: FormError<FormField>[],
  submissionError: ErrorReason | null,
  productPrices: ProductPrices,
  ...FormActionCreators,
|};


// ----- Map State/Props ----- //

function mapStateToProps(state: State) {
  return {
    ...getFormFields(state),
    formErrors: state.page.checkout.formErrors,
    submissionError: state.page.checkout.submissionError,
    productPrices: state.page.checkout.productPrices,
  };
}

// ----- Form Fields ----- //

const StaticInputWithLabel = withLabel(Input);
const InputWithLabel = asControlled(StaticInputWithLabel);
const InputWithError = withError(InputWithLabel);
const SelectWithLabel = compose(asControlled, withLabel)(Select);
const FieldsetWithError = withError(Fieldset);

const DeliveryAddress = withStore('delivery', getDeliveryAddress);
const BillingAddress = withStore('billing', getBillingAddress);

// ----- Component ----- //

function CheckoutForm(props: PropTypes) {

  const days = getDays(props.fulfilmentOption, props.productOption);

  const errorHeading = props.submissionError === 'personal_details_incorrect' ? 'Failed to Create Subscription' :
    'Payment Attempt Failed';
  const errorState = props.submissionError ?
    <GeneralErrorMessage errorReason={props.submissionError} errorHeading={errorHeading} /> :
    null;

  const fulfilmentOptionDescriptor = props.fulfilmentOption === HomeDelivery ? 'newspaper' : 'voucher booklet';

  return (
    <Content modifierClasses={['your-details']}>
      <Outset>
        <Layout>
          <Form onSubmit={(ev) => {
            ev.preventDefault();
            props.submitForm();
          }}
          >
            <FormSection title="Your details">
              <SelectWithLabel
                id="title"
                label="Title"
                optional
                value={props.title}
                setValue={props.setTitle}
              >
                <option value="">--</option>
                {options(titles)}
              </SelectWithLabel>
              <InputWithError
                id="first-name"
                label="First name"
                type="text"
                value={props.firstName}
                setValue={props.setFirstName}
                error={firstError('firstName', props.formErrors)}
              />
              <InputWithError
                id="last-name"
                label="Last name"
                type="text"
                value={props.lastName}
                setValue={props.setLastName}
                error={firstError('lastName', props.formErrors)}
              />
              <StaticInputWithLabel
                id="email"
                label="Email"
                type="email"
                disabled
                value={props.email}
                footer={(
                  <span>
                    <CheckoutExpander copy="Want to use a different email address?">
                      <p>You will be able to edit this in your account once you have completed this checkout.</p>
                    </CheckoutExpander>
                    <CheckoutExpander copy="Not you?">
                      <p>
                        <Button
                          appearance="greyHollow"
                          icon={null}
                          type="button"
                          aria-label={null}
                          onClick={() => props.signOut()}
                        >
                          Sign out
                        </Button> and create a new account.
                      </p>
                    </CheckoutExpander>
                  </span>
                )}
              />
              <InputWithError
                id="telephone"
                label="Telephone"
                optional
                type="tel"
                value={props.telephone}
                setValue={props.setTelephone}
                footer="We may use this to get in touch with you about your subscription."
                error={firstError('telephone', props.formErrors)}
              />
            </FormSection>
            <FormSection title="Where should we deliver your newspapers?">
              <DeliveryAddress />
            </FormSection>
            <FormSection title="Is the billing address the same as the delivery address?">
              <Rows>
                <Fieldset legend="Is the billing address the same as the delivery address?">
                  <RadioInput
                    text="Yes"
                    name="billingAddressIsSame"
                    checked={props.billingAddressIsSame}
                    onChange={() => props.setbillingAddressIsSame(true)}
                  />
                  <RadioInput
                    text="No"
                    name="billingAddressIsSame"
                    checked={!props.billingAddressIsSame}
                    onChange={() => props.setbillingAddressIsSame(false)}
                  />
                </Fieldset>
              </Rows>
            </FormSection>
            {
              props.billingAddressIsSame ? null :
              <FormSection title="Where should we bill you?">
                <BillingAddress />
              </FormSection>
            }
            <FormSection title="When would you like your subscription to start?">
              <Rows>
                <FieldsetWithError id="startDate" error={firstError('startDate', props.formErrors)} legend="When would you like your subscription to start?">
                  {days.map((day) => {
                  const [userDate, machineDate] = [formatUserDate(day), formatMachineDate(day)];
                  return (
                    <RadioInput
                      appearance="group"
                      text={userDate}
                      name={machineDate}
                      checked={props.startDate === machineDate}
                      onChange={() => props.setStartDate(machineDate)}
                    />
                  );
                })}
                </FieldsetWithError>
                <Text>
                  <p>
                  We will take the first payment on the date you receive your first {fulfilmentOptionDescriptor}.
                  </p>
                  <p>
                  Subscription starts dates are automatically selected to be the earliest we can fulfil your order.
                  </p>
                </Text>
              </Rows>
            </FormSection>
            <FormSection title="How would you like to pay?">
              <Rows>
                <Fieldset legend="How would you like to pay?">
                  <RadioInput
                    text="Direct debit"
                    name="paymentMethod"
                    checked={props.paymentMethod === DirectDebit}
                    onChange={() => props.setPaymentMethod(DirectDebit)}
                  />
                  <RadioInput
                    text="Credit/Debit card"
                    name="paymentMethod"
                    checked={props.paymentMethod === Stripe}
                    onChange={() => props.setPaymentMethod(Stripe)}
                  />
                </Fieldset>
                {errorState}
              </Rows>
            </FormSection>
            <FormSection>
              <Button aria-label={null} type="submit">Continue to payment</Button>
              <DirectDebitPopUpForm
                onPaymentAuthorisation={(pa: PaymentAuthorisation) => {
                  props.onPaymentAuthorised(pa);
                }}
              />
            </FormSection>
            <FormSection>
              <Text>
                <p>
                  You will pay{' '}
                  <PriceLabel
                    productPrice={paperRegularPrice(
                      props.productPrices,
                      props.fulfilmentOption,
                      props.productOption,
                    )}
                    promotion={paperPromotion(
                      props.productPrices,
                      props.fulfilmentOption,
                      props.productOption,
                    )}
                    billingPeriod="Monthly"
                  />
                </p>
                <p>
                  <strong>Money Back Guarantee.</strong>
                  If you wish to cancel your subscription, we will send you
                  a refund of the unexpired part of your subscription.
                </p>
                <p>
                  <strong>Cancel any time you want.</strong>
                  There is no set time on your agreement so you can stop
                  your subscription anytime
                </p>
              </Text>
            </FormSection>
          </Form>
        </Layout>
      </Outset>
    </Content>
  );

}


// ----- Exports ----- //

export default connect(mapStateToProps, {
  ...formActionCreators,
  signOut,
})(CheckoutForm);
