// @flow

// ----- Imports ----- //

import React from 'react';
import { subscriptionsTermsLinks } from 'helpers/legal';
import type { SubscriptionProduct } from 'helpers/subscriptions';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';

import './subscriptionFaq.scss';

// ----- Props ----- //

type PropTypes = {|
  subscriptionProduct: SubscriptionProduct,
|};

// ----- Functions ----- //

function faqLink(props: PropTypes) {
  if (props.subscriptionProduct === 'GuardianWeekly') {
    return 'https://www.theguardian.com/help/2012/jan/19/guardian-weekly-faqs';
  }

  return 'https://www.theguardian.com/subscriber-direct/subscription-frequently-asked-questions';
}

// ----- Component ----- //

function SubscriptionFaq(props: PropTypes) {

  switch (props.subscriptionProduct) {
    case 'DigitalPack':
      return (
        <div className="component-subscription-faq">
          <div className="component-subscription-faq__text">
            You may also find help in our
            <a className="component-subscription-faq__href" href={faqLink(props)} onClick={sendTrackingEventsOnClick('onward_faq', 'DigitalPack', null)}> Frequently Asked Questions</a> and
            in the&nbsp;
            <a className="component-subscription-faq__href" href={subscriptionsTermsLinks.DigitalPack} onClick={sendTrackingEventsOnClick('onward_tos', 'DigitalPack', null)}>
            Digital Pack terms and conditions
            </a>.
          </div>
        </div>
      );

    default:
      return (
        <div className="component-subscription-faq">
          <div className="component-subscription-faq__text">
            You may also find help in our
            <a className="component-subscription-faq__href" href={faqLink(props)} onClick={sendTrackingEventsOnClick('onward_faq', props.subscriptionProduct, null)}> Frequently Asked Questions</a>.
          </div>
        </div>
      );
  }
}


// ----- Exports ----- //

export default SubscriptionFaq;
