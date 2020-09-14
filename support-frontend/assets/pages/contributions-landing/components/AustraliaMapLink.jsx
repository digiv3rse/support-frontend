// @flow

import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { LinkButton, buttonBrandAlt } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { trackComponentClick } from 'helpers/tracking/behaviour';

const AustraliaMapLink = () => (
  <section className="contribution-thank-you-block">
    <h3 className="contribution-thank-you-block__title">Hear from supporters across Australia</h3>
    <p className="contribution-thank-you-block__message">
      Open up our interactive map to see messages from readers in every state. Learn why others chose to support
      Guardian Australia, and you can send us your thoughts too.
    </p>
    <ThemeProvider theme={buttonBrandAlt}>
      <LinkButton
        target="_blank"
        icon={<SvgArrowRightStraight />}
        iconSide="right"
        nudgeIcon
        href="https://support.theguardian.com/aus-2020-map?INTCMP=thankyou-page-aus-map-cta"
        onClick={() => trackComponentClick('contribution-thankyou-aus-map')}
      >
        View the map
      </LinkButton>
    </ThemeProvider>
  </section>
);

export default AustraliaMapLink;
