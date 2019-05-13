// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { firstError, type FormError } from 'helpers/subscriptionsForms/validation';

import Rows from 'components/base/rows';
import Text from 'components/text/text';
import Button from 'components/button/button';
import { Select } from 'components/forms/select';
import { Fieldset } from 'components/forms/fieldset';
import { options } from 'components/forms/customFields/options';
import { RadioInput } from 'components/forms/customFields/radioInput';
import { withLabel } from 'hocs/withLabel';
import { withError } from 'hocs/withError';
import { asControlled } from 'hocs/asControlled';
import Form, { FormSection } from 'components/checkoutForm/checkoutForm';
import Layout, { Content } from 'components/subscriptionCheckouts/layout';
import Summary from 'components/subscriptionCheckouts/summary';
import DirectDebitPopUpForm from 'components/directDebit/directDebitPopUpForm/directDebitPopUpForm';
import type { PaymentAuthorisation } from 'helpers/paymentIntegrations/readerRevenueApis';
import type { ErrorReason } from 'helpers/errorReasons';
import type { ProductPrices } from 'helpers/productPrice/productPrices';
import { titles } from 'helpers/user/details';
import {
  type FormActionCreators,
  formActionCreators,
  type FormField,
  type FormFields,
  getBillingAddress,
  getDeliveryAddress,
  getFormFields,
  signOut,
  type State,
} from '../weeklySubscriptionCheckoutReducer';
import { withStore } from 'components/subscriptionCheckouts/address/addressFields';
import GridImage from 'components/gridImage/gridImage';
import type { FormField as PersonalDetailsFormField } from 'components/subscriptionCheckouts/personalDetails';
import PersonalDetails from 'components/subscriptionCheckouts/personalDetails';
import { PaymentMethodSelector } from 'components/subscriptionCheckouts/paymentMethodSelector';
import CancellationSection from 'components/subscriptionCheckouts/cancellationSection';
import { newspaperCountries } from 'helpers/internationalisation/country';


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

const SelectWithLabel = compose(asControlled, withLabel)(Select);
const FieldsetWithError = withError(Fieldset);

const DeliveryAddress = withStore(newspaperCountries, 'delivery', getDeliveryAddress);
const BillingAddress = withStore(newspaperCountries, 'billing', getBillingAddress);

// ----- Component ----- //

function WeeklyCheckoutForm(props: PropTypes) {

  return (
    <Content modifierClasses={['your-details']}>
      <Layout aside={(
        <Summary
          image={
            <GridImage
              gridId="checkoutPackshotWeekly"
              srcSizes={[696, 500]}
              sizes="(max-width: 740px) 50vw, 696"
              imgType="png"
              altText=""
            />
          }
          title="weekly holding page"
          description="placeholder description"
          productPrice={{ price: 99.89, currency: 'GBP' }}
          promotion={undefined}
          dataList={[
          ]}
          billingPeriod="Monthly"
          changeSubscription="TODO placeholder"
        />
      )}
      >
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
            <PersonalDetails
              firstName={props.firstName}
              setFirstName={props.setFirstName}
              lastName={props.lastName}
              setLastName={props.setLastName}
              email={props.email}
              telephone={props.telephone}
              setTelephone={props.setTelephone}
              formErrors={((props.formErrors: any): FormError<PersonalDetailsFormField>[])}
              signOut={props.signOut}
            />
          </FormSection>
          <FormSection title="Where should we deliver your vouchers?">
            <DeliveryAddress />
          </FormSection>
          <FormSection title="Is the billing address the same as the delivery address?">
            <Rows>
              <FieldsetWithError
                id="billingAddressIsSame"
                error={firstError('billingAddressIsSame', props.formErrors)}
                legend="Is the billing address the same as the delivery address?"
              >
                <RadioInput
                  text="Yes"
                  name="billingAddressIsSame"
                  checked={props.billingAddressIsSame === true}
                  onChange={() => props.setbillingAddressIsSame(true)}
                />
                <RadioInput
                  text="No"
                  name="billingAddressIsSame"
                  checked={props.billingAddressIsSame === false}
                  onChange={() => props.setbillingAddressIsSame(false)}
                />
              </FieldsetWithError>
            </Rows>
          </FormSection>
          {
            props.billingAddressIsSame === false ?
              <FormSection title="Where should we bill you?">
                <BillingAddress />
              </FormSection>
            : null
          }
          <FormSection title="When would you like your subscription to start?">
            <Rows>
              <FieldsetWithError id="startDate" error={firstError('startDate', props.formErrors)} legend="When would you like your subscription to start?">
                <RadioInput
                  appearance="group"
                  text="userDate"
                  name="machineDate"
                  checked="true"
                  onChange={() => props.setStartDate('machineDate')}
                />
              </FieldsetWithError>
              <Text className="component-text__paddingTop">
                <p>
                We will take the first payment on the
                date you receive your first Guardian Weekly.
                </p>
                <p>
                Subscription starts dates are automatically selected to be the earliest we can fulfil your order.
                </p>
              </Text>
            </Rows>
          </FormSection>
          <PaymentMethodSelector
            countrySupportsDirectDebit
            paymentMethod={props.paymentMethod}
            setPaymentMethod={props.setPaymentMethod}
            onPaymentAuthorised={props.onPaymentAuthorised}
            submissionError={props.submissionError}
            payPalEnabled={false}
          />
          <FormSection noBorder>
            <Button aria-label={null} type="submit">Continue to payment</Button>
            <DirectDebitPopUpForm
              buttonText="Subscribe with Direct Debit"
              onPaymentAuthorisation={(pa: PaymentAuthorisation) => {
                props.onPaymentAuthorised(pa);
              }}
            />
          </FormSection>
          <CancellationSection />
        </Form>
      </Layout>
    </Content>
  );

}


// ----- Exports ----- //

export default connect(mapStateToProps, {
  ...formActionCreators,
  signOut,
})(WeeklyCheckoutForm);
