// @flow

// ----- Imports ----- //

import React from 'react';
import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

import { ThemeProvider } from 'emotion-theming';
import { LinkButton, buttonReaderRevenueBrandAlt } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';

import {
  getIosAppUrl,
  androidAppUrl,
  androidDailyUrl,
  getDailyEditionUrl,
} from 'helpers/externalLinks';


import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';

import Text from 'components/text/text';

// ----- Types ----- //

type PropTypes = {
  countryGroupId: CountryGroupId,
};

const ctas = css`
  display: inline-flex;
  flex-direction: column;
`;

const smallFormatText = css`
  display: inline-block;
  ${from.desktop} {
    display: none;
  }
`;

const largerFormatText = css`
  display: none;
  ${from.desktop} {
    display: inline-block;
  }
`;

const marginForFirstButton = css`
  margin-bottom: ${space[3]}px;
`;


// ----- Component ----- //

const AppsSection = ({ countryGroupId }: PropTypes) => (
  <div>
    <Text title="Download The Guardian Editions app" headingSize={3}>
      <p>Each day&#39;s edition, in one simple, elegant app. Contains the UK Daily, Australia Weekend
        and other special editions.
      </p>
      <div css={ctas}>
        <ThemeProvider theme={buttonReaderRevenueBrandAlt}>
          <LinkButton
            css={marginForFirstButton}
            priority="tertiary"
            size="default"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
            nudgeIcon
            aria-label="Click to download the Guardian Daily app on the Apple App Store"
            href={getDailyEditionUrl(countryGroupId)}
            onClick={sendTrackingEventsOnClick('checkout_thankyou_daily_edition', 'DigitalPack', null)}
          >
            <span css={largerFormatText}>The Guardian Editions app for iOS</span>
            <span css={smallFormatText}>Editions app for iOS</span>
          </LinkButton>
          <LinkButton
            priority="tertiary"
            size="default"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
            nudgeIcon
            aria-label="Click to download the Guardian Daily app on Google Play"
            href={androidDailyUrl}
            onClick={sendTrackingEventsOnClick('checkout_thankyou_daily_edition', 'DigitalPack', null)}
          >
            <span css={largerFormatText}>The Guardian Editions app for Android</span>
            <span css={smallFormatText}>Editions app for Android</span>
          </LinkButton>
        </ThemeProvider>
      </div>
    </Text>
    <Text title="Download The Guardian Live app" headingSize={3}>
      <p>
        With premium access to The Guardian Live app get breaking news, as it happens.
      </p>
      <div css={ctas}>
        <ThemeProvider theme={buttonReaderRevenueBrandAlt}>
          <LinkButton
            css={marginForFirstButton}
            priority="tertiary"
            size="default"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
            nudgeIcon
            aria-label="Click to download the app on the Apple App Store"
            href={getIosAppUrl(countryGroupId)}
            onClick={sendTrackingEventsOnClick('checkout_thankyou_app_store', 'DigitalPack', null)}
          >
            <span css={largerFormatText}>The Guardian Live app for iOS</span>
            <span css={smallFormatText}>Live app for iOS</span>
          </LinkButton>
          <LinkButton
            priority="tertiary"
            size="default"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
            nudgeIcon
            aria-label="Click to download the app on the Google Play store"
            href={androidAppUrl}
            onClick={sendTrackingEventsOnClick('checkout_thankyou_play_store', 'DigitalPack', null)}
          >
            <span css={largerFormatText}>The Guardian Live app for Android</span>
            <span css={smallFormatText}>Live app for Android</span>
          </LinkButton>
        </ThemeProvider>
      </div>
    </Text>
  </div>
);


// ----- Export ----- //

export default AppsSection;
