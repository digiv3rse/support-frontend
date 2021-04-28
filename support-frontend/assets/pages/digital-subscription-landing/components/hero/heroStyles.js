// @flow

// ----- Imports ----- //

import { css } from '@emotion/core';
import { headline, body } from '@guardian/src-foundations/typography';
import { brandAlt } from '@guardian/src-foundations/palette';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

export const heroCopy = css`
  padding: 0 ${space[3]}px ${space[3]}px;
`;

export const heroTitle = css`
  ${headline.xsmall({ fontWeight: 'bold' })};
  margin-bottom: ${space[3]}px;

  ${from.tablet} {
    ${headline.large({ fontWeight: 'bold' })};
  }
`;

export const yellowHeading = css`
  color: ${brandAlt[400]};
`;

export const paragraph = css`
  ${body.small()};
  max-width: 100%;
  margin-bottom: ${space[6]}px;

  // This applies to paras coming from the promo tool
  & p:not(:last-of-type) {
    margin-bottom: ${space[5]}px;
  }

  // This applies to default paragraphs in the hero
  :not(:last-of-type) {
    margin-bottom: ${space[5]}px;
  }

  ${from.mobileMedium} {
    ${body.medium()};
  }

  ${from.phablet} {
    ${body.medium()};
    max-width: 85%;
    margin-bottom: ${space[9]}px;
  }

  ${from.desktop} {
    ${headline.xxsmall()};
    line-height: 135%;
    max-width: 90%;
  }
`;

export const heavyText = css`
  font-weight: 600;
`;

export const circleTextContainer = css`
  padding: ${space[2]}px;

  ${from.tablet} {
    padding: ${space[1]}px;
  }
`;

export const circleTextTop = css`
  ${headline.xsmall({ fontWeight: 'bold' })};

  ${from.mobileLandscape} {
    ${headline.medium({ fontWeight: 'bold' })};
  }
`;

export const circleTextBottom = css`
  ${headline.xxxsmall({ fontWeight: 'bold' })};

  ${from.mobileLandscape} {
    ${headline.xsmall({ fontWeight: 'bold' })};
  }
`;

export const circleTextGeneric = css`
  ${headline.xxsmall({ fontWeight: 'bold' })};
`;

export const spaceAfter = css`
  ${from.desktop} {
    margin-bottom: 70px;
  }

  ${from.leftCol} {
    margin-bottom: 80px;
  }
`;

export const mobileLineBreak = css`
  display: block;

  ${from.desktop} {
    display: none;
  }
`;

export const testRoundelOverrides = css`
  display: none;

  ${from.tablet} {
    display: flex;
    transform: translate(${space[6]}px, -75%);
  }
`;

export const testEmbeddedRoundel = css`
  transform: translateY(0);
`;
