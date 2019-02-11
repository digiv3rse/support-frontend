// @flow

import React from 'react';
import SubscriptionBundle from 'components/subscriptionBundle/subscriptionBundle';
import { gridImageProperties } from 'components/threeSubscriptions/helpers/gridImageProperties';
import type { ComponentAbTest } from 'helpers/subscriptions';
import { displayPrice, sendTrackingEventsOnClick } from 'helpers/subscriptions';
import { flashSaleIsActive, getFormattedFlashSalePrice, getSaleCopy } from 'helpers/flashSale';

// ----- Types ----- //

type PropTypes = {|
  url: string,
  abTest: ComponentAbTest | null,
  gridId: 'paperDigitalCirclePink' | 'paperDigitalCircleOrange',
  context: string,
|};


// ----- Component ----- //

function getCopy() {
  if (flashSaleIsActive('PaperAndDigital', 'GBPCountries')) {
    const flashSaleCopy = getSaleCopy('PaperAndDigital', 'GBPCountries');
    return {
      subHeading: `from £${getFormattedFlashSalePrice('PaperAndDigital', 'GBPCountries')}/Monthly`,
      description: `${flashSaleCopy.bundle.description}`,
    };
  }
  return {
    subHeading: `from ${displayPrice('PaperAndDigital', 'GBPCountries')}`,
    description: 'All the benefits of a paper subscription, plus access to the digital pack',
  };
}

export default function PaperDigital(props: PropTypes) {
  const copy = getCopy();
  return (

    <SubscriptionBundle
      modifierClass="paper-digital"
      heading="Paper+Digital"
      subheading={copy.subHeading}
      headingSize={3}
      benefits={{
        list: false,
        copy: copy.description,
      }}
      gridImage={{
        gridId: props.gridId,
        altText: 'paper + digital subscription',
        ...gridImageProperties,
      }}
      ctas={[
        {
          text: 'Choose a package',
          url: props.url,
          accessibilityHint: 'Proceed to choose which days you would like to regularly receive the newspaper in conjunction with a digital subscription',
          modifierClasses: ['border'],
          onClick: sendTrackingEventsOnClick('paper_digital_cta', 'PaperAndDigital', props.abTest, props.context),
        },
      ]}

    />
  );
}

PaperDigital.defaultProps = {
  context: 'paper-and-digital-subscription',
};
