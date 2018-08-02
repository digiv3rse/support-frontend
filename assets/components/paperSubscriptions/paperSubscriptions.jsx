// @flow

// ----- Imports ----- //

import React from 'react';

import { getSubsLinks } from 'helpers/externalLinks';
import { getCampaign } from 'helpers/tracking/acquisitions';
import { getPrice } from 'helpers/flashSale';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';

import PageSection from 'components/pageSection/pageSection';
import SubscriptionBundle from 'components/subscriptionBundle/subscriptionBundle';
import { type HeadingSize } from 'components/heading/heading';


// ----- Types ----- //

type ClickEvent = () => void;

type PropTypes = {
  referrerAcquisitionData: ReferrerAcquisitionData,
  headingSize: HeadingSize,
  clickEvents: {
    paper: ClickEvent,
    paperDigital: ClickEvent,
    weekly: ClickEvent,
  },
};


// ----- Setup ----- //

const gridImageProperties = {
  srcSizes: [825, 500, 140],
  sizes: '(max-width: 660px) 165px, (max-width: 740px) 174px, (max-width: 980px) 196px, (max-width: 1140px) 205px, 165px',
  imgType: 'png',
};


// ----- Component ----- //

export default function PaperSubscriptions(props: PropTypes) {

  const subsLinks = getSubsLinks(
    props.referrerAcquisitionData.campaignCode,
    getCampaign(props.referrerAcquisitionData),
    [],
    props.referrerAcquisitionData,
  );

  return (
    <div className="component-paper-subscriptions">
      <PageSection heading="Print Subscriptions" modifierClass="paper-subscriptions">
        <PaperBundle
          url={subsLinks.paper}
          headingSize={props.headingSize}
          onClick={props.clickEvents.paper}
        />
        <PaperDigitalBundle
          url={subsLinks.paperDig}
          headingSize={props.headingSize}
          onClick={props.clickEvents.paperDigital}
        />
        <WeeklyBundle
          url={subsLinks.weekly}
          headingSize={props.headingSize}
          onClick={props.clickEvents.weekly}
        />
      </PageSection>
    </div>
  );

}


// ----- Auxiliary Components ----- //

function PaperBundle(props: {
  url: string,
  headingSize: HeadingSize,
  onClick: ClickEvent,
}) {

  return (
    <SubscriptionBundle
      modifierClass="paper"
      heading="Paper"
      subheading={`from £${getPrice('paper', '10.36')}/month`}
      headingSize={props.headingSize}
      benefits={[
        {
          text: 'The Guardian and The Observer\'s newspaper subscription options',
        },
      ]}
      gridImage={{
        gridId: 'paperCircle',
        altText: 'paper subscription',
        ...gridImageProperties,
      }}
      ctas={[
        {
          text: 'Choose a package',
          url: props.url,
          accessibilityHint: 'Proceed to paper subscription options',
          modifierClasses: ['paper', 'border'],
          onClick: props.onClick,
        },
      ]}
    />
  );

}

function PaperDigitalBundle(props: {
  url: string,
  headingSize: HeadingSize,
  onClick: ClickEvent,
}) {

  return (
    <SubscriptionBundle
      modifierClass="paper-digital"
      heading="Paper+Digital"
      subheading={`from £${getPrice('paperAndDigital', '21.62')}/month`}
      headingSize={props.headingSize}
      benefits={[
        {
          text: 'All the benefits of a paper subscription, plus access to the digital pack',
        },
      ]}
      gridImage={{
        gridId: 'paperDigitalCircleAlt',
        altText: 'paper + digital subscription',
        ...gridImageProperties,
      }}
      ctas={[
        {
          text: 'Choose a package',
          url: props.url,
          accessibilityHint: 'Proceed to choose which days you would like to regularly receive the newspaper in conjunction with a digital subscription',
          modifierClasses: ['paper-digital', 'border'],
          onClick: props.onClick,
        },
      ]}
    />
  );

}

function WeeklyBundle(props: {
  url: string,
  headingSize: HeadingSize,
  onClick: ClickEvent,
}) {

  return (
    <SubscriptionBundle
      modifierClass="weekly"
      heading="Guardian Weekly"
      subheading="£30/quarter"
      headingSize={props.headingSize}
      benefits={[
        {
          text: 'A weekly global newspaper delivered to your door',
        },
      ]}
      gridImage={{
        gridId: 'weeklyCircle',
        altText: 'weekly subscription',
        ...gridImageProperties,
      }}
      ctas={[
        {
          text: 'Find out more',
          url: props.url,
          accessibilityHint: 'Proceed to buy a subscription to The Guardian Weekly',
          modifierClasses: ['weekly', 'border'],
          onClick: props.onClick,
        },
      ]}
    />
  );

}
