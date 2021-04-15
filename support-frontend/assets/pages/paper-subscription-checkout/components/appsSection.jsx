// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';
import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';
import { textSans, headline } from '@guardian/src-foundations/typography';

import { ThemeProvider } from 'emotion-theming';
import { LinkButton, buttonReaderRevenue } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import GridImage from 'components/gridImage/gridImage';

import {
  getIosAppUrl,
  androidAppUrl,
  androidDailyUrl,
  getDailyEditionUrl,
} from 'helpers/externalLinks';


import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';


// ----- Types ----- //

type PropTypes = {
  countryGroupId: CountryGroupId,
};

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

const marginForButton = css`
  margin: ${space[5]}px 0;
`;

const mainHeading = css`
  ${headline.small({ fontWeight: 'bold', lineHeight: 'tight' })};
  ${from.phablet} {
    ${headline.medium({ fontWeight: 'bold', lineHeight: 'normal' })};
  }
`;

const subHeading = css`
  margin: ${space[6]}px 0 ${space[1]}px;
  ${headline.xxsmall({ fontWeight: 'bold', lineHeight: 'tight' })};
  ${from.desktop} {
    margin: ${space[9]}px 0 ${space[1]}px;
    line-height: normal;
  }
`;

const sansText = css`
  ${textSans.medium({ lineHeight: 'regular' })}
  ${from.desktop} {
    ${textSans.medium({ lineHeight: 'loose' })}
  }
`;

const maxWidth = css`
  ${from.tablet} {
    max-width: 70%;
  }

  ${from.leftCol} {
    max-width: 60%;
  }
`;

const imageContainer = css`
  margin: ${space[4]}px 0 0;
  display: inline-block;
  width: 42%;
  :first-of-type {
      margin-right: ${space[4]}px;
    }
  img {
    width: 100%;
  }

  ${from.mobileMedium} {
    width: 42%;
  }

  ${from.mobileLandscape} {
    max-width: 170px;
  }

  ${from.desktop} {
    max-width: 170px;
  }
`;

const tinyMobileOnly = css`
  display: block;
  ${from.mobileLandscape} {
    display: none;
  }
`;

const AppStoreImage = (props: {store: string}) => (
  <div css={imageContainer}>
    <GridImage
      classModifiers={['']}
      gridId={props.store}
      srcSizes={[140, 500]}
      sizes="(max-width: 480px) 100px,
                (max-width: 740px) 100%,
                (max-width: 1067px) 100%,
                800px"
      imgType="png"
    />
  </div>
);

type AppStoreLinkPropTypes = {
  ariaLabel: string,
  storeLink: string,
  children: Node,
  onClick: Function,
}

const AppStoreLink = ({
  ariaLabel, storeLink, children, onClick,
}: AppStoreLinkPropTypes) => (
  <a href={storeLink} onClick={onClick} aria-label={ariaLabel}>
    {children}
  </a>
);


// ----- Component ----- //

const AppsSection = ({ countryGroupId }: PropTypes) => (
  <>
    <h2 css={mainHeading}>Make the most of your digital subscription</h2>
    <div css={maxWidth}>
      <h3 css={subHeading}>Download The Guardian<br css={tinyMobileOnly} /> Editions App</h3>
      <p css={sansText}>
        Each day&apos;s edition in one simple, elegant app. Contains the UK Daily,
        Australian Weekend and other special editions.
      </p>
      <AppStoreLink
        storeLink={getDailyEditionUrl(countryGroupId)}
        onClick={sendTrackingEventsOnClick({
            id: 'checkout_thankyou_daily_edition_apple',
            product: 'DigitalPack',
            componentType: 'ACQUISITIONS_BUTTON',
          })}
        ariaLabel="Click to download the Guardian Daily app on the Apple App Store"
      >
        <AppStoreImage store="appleStore" />
      </AppStoreLink>
      <AppStoreLink
        storeLink={androidDailyUrl}
        onClick={sendTrackingEventsOnClick({
            id: 'checkout_thankyou_daily_edition_android',
            product: 'DigitalPack',
            componentType: 'ACQUISITIONS_BUTTON',
          })}
        ariaLabel="Click to download the Guardian Daily app on Google Play"
      >
        <AppStoreImage store="googlePlay" />
      </AppStoreLink>
      <h3 css={subHeading}>Download The Guardian<br css={tinyMobileOnly} /> Live app</h3>
      <p css={sansText}>
        With premium access to The Guardian Live app, get breaking news, as it happens.
      </p>
      <AppStoreLink
        storeLink={getIosAppUrl(countryGroupId)}
        onClick={sendTrackingEventsOnClick({
            id: 'checkout_thankyou_live_app_apple',
            product: 'DigitalPack',
            componentType: 'ACQUISITIONS_BUTTON',
          })}
        ariaLabel="Click to download the Guardian Live app on the Apple App Store"
      >
        <AppStoreImage store="appleStore" />
      </AppStoreLink>
      <AppStoreLink
        storeLink={androidAppUrl}
        onClick={sendTrackingEventsOnClick({
            id: 'checkout_thankyou_live_app_android',
            product: 'DigitalPack',
            componentType: 'ACQUISITIONS_BUTTON',
          })}
        ariaLabel="Click to download the Guardian Live app on Google Play"
      >
        <AppStoreImage store="googlePlay" />
      </AppStoreLink>
      <h3 css={subHeading}>Sign into theguardian.com</h3>
      <p css={sansText}>
        Never be interrupted or distracted by ads again by signing in. Just use your subscriber email
        and password when you next visit.
      </p>
      <ThemeProvider theme={buttonReaderRevenue}>
        <LinkButton
          css={marginForButton}
          priority="tertiary"
          size="default"
          icon={<SvgArrowRightStraight />}
          iconSide="right"
          nudgeIcon
          aria-label="Click to sign in to the website"
          href="https://www.theguardian.com/"
          onClick={sendTrackingEventsOnClick({
            id: 'checkout_thankyou_sign_in',
            product: 'DigitalPack',
            componentType: 'ACQUISITIONS_BUTTON',
          })}
        >
          <span css={largerFormatText}>Sign into the website</span>
          <span css={smallFormatText}>Sign in</span>
        </LinkButton>
      </ThemeProvider>
    </div>
  </>
);


// ----- Export ----- //

export default AppsSection;
