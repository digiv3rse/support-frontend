// @flow

// ----- Imports ----- //

import { addQueryParamsToURL } from 'helpers/url';
import { derivePaymentApiAcquisitionData } from 'helpers/tracking/acquisitions';

import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import type { Participations } from 'helpers/abTests/abtest';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { PaymentAPIAcquisitionData } from 'helpers/tracking/acquisitions';
import type { OptimizeExperiments } from 'helpers/tracking/optimize';
import * as cookie from 'helpers/cookie';
import trackConversion from 'helpers/tracking/conversions';
import { routes } from 'helpers/routes';
import { logException } from 'helpers/logger';

import { checkoutError, checkoutSuccess } from '../oneoffContributionsActions';


// ----- Setup ----- //

const ONEOFF_CONTRIB_ENDPOINT = window.guardian.paymentApiStripeEndpoint;

function stripeOneOffContributionEndpoint(testUser: ?string) {
  if (testUser) {
    return addQueryParamsToURL(
      ONEOFF_CONTRIB_ENDPOINT,
      { mode: 'test' },
    );
  }

  return ONEOFF_CONTRIB_ENDPOINT;
}

// ----- Types ----- //

type PaymentApiStripeExecutePaymentBody = {|
  paymentData: {
    currency: IsoCurrency,
    amount: number,
    token: string,
    email: string
  },
  acquisitionData: PaymentAPIAcquisitionData,
|};

// ----- Functions ----- //

function requestData(
  abParticipations: Participations,
  paymentToken: string,
  currency: IsoCurrency,
  amount: number,
  referrerAcquisitionData: ReferrerAcquisitionData,
  getState: Function,
  optimizeExperiments: OptimizeExperiments,
) {
  const { user } = getState().page;

  if (user.fullName !== null && user.fullName !== undefined &&
    user.email !== null && user.email !== undefined) {

    const oneOffContribFields: PaymentApiStripeExecutePaymentBody = {
      paymentData: {
        currency,
        amount,
        token: paymentToken,
        email: user.email,
      },
      acquisitionData: derivePaymentApiAcquisitionData(referrerAcquisitionData, abParticipations, optimizeExperiments),
    };

    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oneOffContribFields),
      credentials: 'include',
    };
  }

  return Promise.resolve({
    ok: false,
    text: () => 'Failed to process payment - missing fields',
  });
}

function postToEndpoint(request: Object, dispatch: Function, abParticipations: Participations): Promise<*> {
  return fetch(stripeOneOffContributionEndpoint(cookie.get('_test_username')), request).then((response) => {
    if (response.ok) {
      trackConversion(abParticipations, routes.oneOffContribThankyou);
      dispatch(checkoutSuccess());
    }
    return response.json();
  }).then((data) => {
    if (data.type === 'error') {
      const { error: { exceptionType, responseCode, errorName = 'Unknown' } } = data;
      if (exceptionType === 'CardException') {
        dispatch(checkoutError('Your card has been declined.'));
      } else {
        logException(`Stripe payment attempt failed with following error: code: ${responseCode} type: ${exceptionType} error-name: ${errorName}.`);
        dispatch(checkoutError('There was an error processing your payment. Please\u00a0try\u00a0again\u00a0later.'));
      }
    }
  }).catch((err) => {
    logException(`Stripe payment attempt failed with unexpected error while attempting to process payment response ${err}`);
    dispatch(checkoutError('There was an error processing your payment. Please\u00a0try\u00a0again\u00a0later.'));
  });
}

export default function postCheckout(
  abParticipations: Participations,
  dispatch: Function,
  amount: number,
  currencyId: IsoCurrency,
  referrerAcquisitionData: ReferrerAcquisitionData,
  getState: Function,
  optimizeExperiments: OptimizeExperiments,
): (string) => Promise<*> {
  return (paymentToken: string) => {
    const request = requestData(
      abParticipations,
      paymentToken,
      currencyId,
      amount,
      referrerAcquisitionData,
      getState,
      optimizeExperiments,
    );

    return postToEndpoint(request, dispatch, abParticipations);
  };
}
