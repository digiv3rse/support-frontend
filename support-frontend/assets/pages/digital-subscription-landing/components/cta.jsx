// @flow
import React from 'react';

import PaymentSelection
  from 'pages/digital-subscription-landing/components/paymentSelection/paymentSelection';

import './digitalSubscriptionLanding.scss';

const CallToAction = () => (
  <div className="call-to-action__container">
    <div className="hope-is-power--centered">
      <h2>Choose one of our special offers and subscribe today</h2>
      <h3>After your <strong>14-day free trial</strong>, your
      subscription will begin automatically and you can cancel any time
      </h3>
      <PaymentSelection />
    </div>
  </div>
);

export default CallToAction;
