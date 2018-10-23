// @flow

// ----- Imports ----- //

import React from 'react';

import Switchable from 'components/switchable/switchable';
import PaymentError from 'components/switchable/errorComponents/paymentError';
import SvgArrowRightStraight from 'components/svgs/arrowRightStraight';
import { paypalPaymentAPIRedirect } from 'helpers/paymentIntegrations/payPalPaymentAPICheckout';
import { classNameWithModifiers } from 'helpers/utilities';
import * as storage from 'helpers/storage';

import type { IsoCountry } from 'helpers/internationalisation/country';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import type { Status } from 'helpers/settings';
import type { Participations } from 'helpers/abTests/abtest';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { OptimizeExperiments } from 'helpers/tracking/optimize';


// ---- Types ----- //

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  amount: number,
  referrerAcquisitionData: ReferrerAcquisitionData,
  abParticipations: Participations,
  isoCountry: IsoCountry,
  countryGroupId: CountryGroupId,
  errorHandler: (string) => void,
  canClick: boolean,
  buttonText: string,
  additionalClass: string,
  onClick: ?(void => void),
  switchStatus: Status,
  cancelURL: string,
  optimizeExperiments: OptimizeExperiments,
|};
/* eslint-enable react/no-unused-prop-types */


// ----- Functions ----- //

function payWithPayPal(props: PropTypes) {
  return () => {

    if (props.onClick) {
      props.onClick();
    }

    if (props.canClick) {
      storage.setSession('paymentMethod', 'PayPal');
      paypalPaymentAPIRedirect(
        props.amount,
        props.referrerAcquisitionData,
        props.isoCountry,
        props.countryGroupId,
        props.errorHandler,
        props.abParticipations,
        props.cancelURL,
        props.optimizeExperiments,
      );
    }
  };
}


// ----- Component ----- //

function PayPalContributionButton(props: PropTypes) {

  return (
    <Switchable
      status={props.switchStatus}
      component={() => <Button {...props} />}
      fallback={() => <PaymentError paymentMethod="PayPal" modifierClass="paypal" />}
    />
  );

}


// ----- Auxiliary Components ----- //

function Button(props: PropTypes) {
  return (
    <button
      id="qa-contribute-paypal-button"
      className={classNameWithModifiers('component-paypal-contribution-button', [props.additionalClass])}
      onClick={payWithPayPal(props)}
    >
      <span className="component-paypal-contribution-button__text">{props.buttonText}</span>
      <SvgArrowRightStraight />
    </button>
  );

}


// ----- Default Props ----- //

PayPalContributionButton.defaultProps = {
  canClick: true,
  buttonText: 'Pay with PayPal',
  additionalClass: '',
  onClick: null,
  switchStatus: 'On',
};


// ----- Exports ----- //

export default PayPalContributionButton;
