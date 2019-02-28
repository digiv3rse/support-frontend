// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';

import { PaymentRequestButtonElement, injectStripe } from 'react-stripe-elements';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { ContributionType, OtherAmounts, PaymentMethod, SelectedAmounts } from 'helpers/contributions';
import type { PaymentAuthorisation } from 'helpers/paymentIntegrations/readerRevenueApis';
import { checkAmountOrOtherAmount, isValidEmail } from 'helpers/formValidation';
import {
  type PaymentResult,
  type StripePaymentMethod,
  type StripePaymentRequestButtonMethod,
} from 'helpers/paymentIntegrations/readerRevenueApis';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { getContributeButtonCopy } from 'helpers/checkouts';
import { trackComponentClick } from 'helpers/tracking/ophanComponentEventTracking';
import type { IsoCountry } from 'helpers/internationalisation/country';
import Button from 'components/button/button';
import SvgChevron from 'components/svgs/chevron';
import { classNameWithModifiers } from 'helpers/utilities';
import GridImage from 'components/gridImage/gridImage';
import AnimatedDots from 'components/spinners/animatedDots';
import { logException } from 'helpers/logger';
import type { State } from '../../contributionsLandingReducer';
import {
  setPaymentRequestButtonPaymentMethod,
  setStripePaymentRequestButtonClicked,
  setStripePaymentRequestObject,
  onStripePaymentRequestApiPaymentAuthorised,
  updateEmail,
  stripePaymentRequestButtonToggleOtherPaymentMethods,
} from '../../contributionsLandingActions';


// ----- Types -----//

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  stripe: Object,
  country: IsoCountry,
  currency: IsoCurrency,
  selectedAmounts: SelectedAmounts,
  otherAmounts: OtherAmounts,
  contributionType: ContributionType,
  countryGroupId: CountryGroupId,
  isTestUser: boolean,
  amount: number,
  stripePaymentRequestObject: Object | null,
  paymentRequestButtonPaymentMethod: StripePaymentMethod,
  setPaymentRequestButtonPaymentMethod: (StripePaymentRequestButtonMethod) => void,
  setStripePaymentRequestObject: (Object) => void,
  onPaymentAuthorised: (PaymentAuthorisation) => Promise<PaymentResult>,
  setStripePaymentRequestButtonClicked: () => void,
  toggleOtherPaymentMethods: () => void,
  updateEmail: string => void,
  paymentMethod: PaymentMethod,
  viewOtherPaymentMethods: boolean,
  stripePaymentRequestButtonImprovementVariant: 'control' | 'variant' | 'notintest',

|};

const mapStateToProps = (state: State) => ({
  selectedAmounts: state.page.form.selectedAmounts,
  otherAmounts: state.page.form.formData.otherAmounts,
  paymentRequestButtonPaymentMethod: state.page.form.stripePaymentRequestButtonData.paymentMethod,
  stripePaymentRequestObject: state.page.form.stripePaymentRequestButtonData.stripePaymentRequestObject,
  countryGroupId: state.common.internationalisation.countryGroupId,
  country: state.common.internationalisation.countryId,
  currency: state.common.internationalisation.currencyId,
  isTestUser: state.page.user.isTestUser || false,
  contributionType: state.page.form.contributionType,
  paymentMethod: state.page.form.paymentMethod,
  viewOtherPaymentMethods:
    state.page.form.stripePaymentRequestButtonData.stripePaymentRequestButtonViewOtherPaymentMethods,
  stripePaymentRequestButtonImprovementVariant: state.common.abParticipations.stripePaymentRequestButtonImprovement,
});

const mapDispatchToProps = (dispatch: Function) => ({
  onPaymentAuthorised:
    (paymentAuthorisation: PaymentAuthorisation) =>
      dispatch(onStripePaymentRequestApiPaymentAuthorised(paymentAuthorisation)),
  setPaymentRequestButtonPaymentMethod:
    (paymentMethod: StripePaymentRequestButtonMethod) => {
      dispatch(setPaymentRequestButtonPaymentMethod(paymentMethod));
    },
  setStripePaymentRequestObject:
    (paymentRequest: Object) => { dispatch(setStripePaymentRequestObject(paymentRequest)); },
  updateEmail: (email: string) => { dispatch(updateEmail(email)); },
  setStripePaymentRequestButtonClicked: () => { dispatch(setStripePaymentRequestButtonClicked()); },
  toggleOtherPaymentMethods: () => { dispatch(stripePaymentRequestButtonToggleOtherPaymentMethods()); },
});


// ----- Functions -----//


function updateUserEmail(data: Object, setEmail: string => void) {
  const email = data.payerEmail;
  if (email) {
    if (isValidEmail(email)) {
      setEmail(email);
    } else {
      logException(`Failed to set email for stripe payment request user with email: ${email}`);
    }
  } else {
    logException('Failed to set email: no email in data object');
  }
}

// Calling the complete function will close the pop up payment window
const onComplete = (complete: Function) => (res: PaymentResult) => {
  if (res.paymentStatus === 'success') {
    trackComponentClick('apple-pay-payment-complete');
    complete('success');
  } else if (res.paymentStatus === 'failure') {
    complete('fail');
  }
};


function updateAmount(amount: number, paymentRequest: Object | null) {
  // When the other tab is clicked, the value of amount is NaN
  if (!Number.isNaN(amount) && paymentRequest) {
    paymentRequest.update({
      total: {
        label: 'The Guardian',
        amount: amount * 100,
      },
    });
  }
}

// We need to intercept the click ourselves because we need to check
// that the user has entered a valid amount before we allow them to continue
function onClick(event, props: PropTypes) {
  event.preventDefault();
  trackComponentClick('apple-pay-clicked');
  updateAmount(props.amount, props.stripePaymentRequestObject);
  props.setStripePaymentRequestButtonClicked();
  const amountIsValid =
    checkAmountOrOtherAmount(
      props.selectedAmounts,
      props.otherAmounts,
      props.contributionType,
      props.countryGroupId,
    );
  if (props.stripePaymentRequestObject && amountIsValid) {
    props.stripePaymentRequestObject.show();
  }
}

// The value of result will either be:
// . null - browser has no compatible payment method)
// . {applePay: true} - applePay is available
// . {applePay: false} - GooglePay, Microsoft Pay and PaymentRequestApi available
const availablePaymentRequestButtonPaymentMethod = (result: Object): StripePaymentMethod | null => {
  if (result && result.applePay === true) {
    return 'StripeApplePay';
  } else if (result && result.applePay === false) {
    return 'StripePaymentRequestButton';
  }
  return null;
};

function setUpPaymentListener(props: PropTypes, paymentRequest: Object, paymentMethod: StripePaymentMethod) {
  paymentRequest.on('token', ({ complete, token, ...data }) => {
    // We need to do this so that we can offer marketing permissions on the thank you page
    updateUserEmail(data, props.updateEmail);
    const tokenId = props.isTestUser ? 'tok_visa' : token.id;
    if (data.methodName) {
      // https://stripe.com/docs/stripe-js/reference#payment-response-object
      // methodName:
      // "The unique name of the payment handler the customer
      // chose to authorize payment. For example, 'basic-card'."
      trackComponentClick(`${data.methodName}-paymentAuthorised`);
    }
    props.onPaymentAuthorised({ paymentMethod: 'Stripe', token: tokenId, stripePaymentMethod: paymentMethod })
      .then(onComplete(complete));
  });
}

function initialisePaymentRequest(props: PropTypes) {
  const paymentRequest = props.stripe.paymentRequest({
    country: props.country,
    currency: props.currency.toLowerCase(),
    total: {
      label: 'The Guardian',
      amount: props.amount,
    },
    requestPayerEmail: true,
  });

  paymentRequest.canMakePayment().then((result) => {
    const paymentMethod = availablePaymentRequestButtonPaymentMethod(result);
    if (paymentMethod !== null) {
      trackComponentClick(`${paymentMethod}-loaded`);
      setUpPaymentListener(props, paymentRequest, paymentMethod);
      props.setPaymentRequestButtonPaymentMethod(paymentMethod);
    } else {
      props.setPaymentRequestButtonPaymentMethod('none');
    }
  });
  props.setStripePaymentRequestObject(paymentRequest);
}

const paymentButtonStyle = {
  paymentRequestButton: {
    theme: 'dark',
    height: '42px',
  },
};


// ---- Component ----- //
function PaymentRequestButton(props: PropTypes) {

  // If we haven't initialised the payment request, initialise it and return null, as we can't insert the button
  // until the async canMakePayment() function has been called on the stripePaymentRequestObject object.
  if (!props.stripePaymentRequestObject) {
    initialisePaymentRequest({ ...props });
    return null;
  }

  if (props.paymentRequestButtonPaymentMethod === 'none') {
    return null;
  }

  // We don't want to check this until we have initialised the payment request object, so the check has to come
  // after the initialisation of the payment request object
  if (!props.paymentRequestButtonPaymentMethod) {
    if (props.stripePaymentRequestButtonImprovementVariant === 'variant') {
      return (<AnimatedDots
        appearance="medium"
        modifierClasses={['stripe-payment-request-screen']}
      />);
    }
    return null;
  }

  if (
    props.paymentRequestButtonPaymentMethod === 'StripeApplePay'
    || props.stripePaymentRequestButtonImprovementVariant !== 'variant'
  ) {

    return (
      <div className="stripe-payment-request-button__container">
        <PaymentRequestButtonElement
          paymentRequest={props.stripePaymentRequestObject}
          className="stripe-payment-request-button__button"
          style={paymentButtonStyle}
          onClick={(event) => {
            onClick(event, props);
          }}
        />

        <div className="stripe-payment-request-button__divider">
          or
        </div>
      </div>
    );
  }


  const submitButtonCopy: string = getContributeButtonCopy(
    props.contributionType,
    props.otherAmounts[props.contributionType].amount,
    props.selectedAmounts,
    props.currency,
  );

  const viewOtherPaymentsClass = `view-other-${props.viewOtherPaymentMethods.toString()}`;

  return (
    <div>
      <div
        className={classNameWithModifiers('stripe-payment-request-button--contribute__container', [viewOtherPaymentsClass])}
      >
        <Button
          aria-label="submit-contribution"
          modifierClasses={[
            classNameWithModifiers('stripe-payment-request-button--contribute', [viewOtherPaymentsClass]),
          ]}
          type="button"
          onClick={() => {
            if (props.stripePaymentRequestObject) {
              props.stripePaymentRequestObject.show();
            }
          }}
        >
          {`${submitButtonCopy} now`}
        </Button>
        <GridImage
          gridId="stripePaymentRequestButtonLogos"
          srcSizes={[536]}
          sizes="536px"
          imgType="png"
          classModifiers={['stripe-payment-request-button-logos']}
        />
      </div>

      <Button
        aria-label="view-other-payment-options"
        modifierClasses={
          [
            classNameWithModifiers('stripe-payment-request-button--view-other-methods', [viewOtherPaymentsClass]),
          ]
        }
        type="button"
        onClick={props.toggleOtherPaymentMethods}
        appearance="greyHollow"
        icon={<SvgChevron />}
      >
        {props.viewOtherPaymentMethods ? 'Hide other payment methods' : 'View other payment methods'}
      </Button>

    </div>
  );
}

// ----- Auxiliary components ----- //

// ----- Default props----- //

const StripePaymentRequestButton =
  injectStripe(connect(mapStateToProps, mapDispatchToProps)(PaymentRequestButton));

export default StripePaymentRequestButton;
