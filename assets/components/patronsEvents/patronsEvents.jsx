// @flow

// ----- Imports ----- //

import React from 'react';

import PageSection from 'components/pageSection/pageSection';
import OtherProduct from 'components/otherProduct/otherProduct';

import { getMemLink, getPatronsLink } from 'helpers/externalLinks';
import type { ImageType } from 'helpers/theGrid';


// ----- Types ----- //

type PropTypes = {
  campaignCode?: ?string,
};


// ----- Component ----- //

export default function PatronsEvents(props: PropTypes) {

  return (
    <PageSection heading="Other ways you can support us" modifierClass="patrons-events">
      <OtherProduct
        modifierClass="patrons"
        gridImg="windrushGreyscale"
        imgAlt="passengers aboard windrush ship"
        heading="Patrons"
        copy="Patrons support is crucial to ensuring that generations to come will be able to enjoy The Guardian."
        ctaText="Find out more"
        ctaUrl={getPatronsLink(props.campaignCode)}
        ctaAccessibilityHint="Find out more about becoming a Patron"
        imgType='png'
      />
      <OtherProduct
        modifierClass="live-events"
        gridImg="liveEvent"
        imgAlt="live event"
        heading="Live events"
        copy="Meet Guardian journalists and readers at our events, debates, interviews and festivals"
        ctaText="Find out more"
        ctaUrl={getMemLink('events', props.campaignCode)}
        ctaAccessibilityHint="Find out more about Guardian live events"
      />
    </PageSection>
  );

}


// ----- Default Props ----- //

PatronsEvents.defaultProps = {
  campaignCode: null,
};
