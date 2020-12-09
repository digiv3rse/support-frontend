// @flow

import React, { type Node } from 'react';
import { css } from '@emotion/core';
import { brand, brandAlt, neutral } from '@guardian/src-foundations/palette';
import { from, until } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';
import { headline, body } from '@guardian/src-foundations/typography';

const roundelSizeMob = 120;
const roundelSize = 180;

// Options for moving the roundel position on mobile
type RoundelNudgeDirection = 'up' | 'down' | 'none';
type PropTypes = {|
  image: Node,
  children: Node,
  cssOverrides?: string,
  roundelText?: Node,
  roundelNudgeDirection?: RoundelNudgeDirection,
|}

const hero = css`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${neutral[100]};
  border: none;
  padding-top: ${space[3]}px;
  background-color: ${brand[400]};
  width: 100%;

  ${from.tablet} {
    flex-direction: row;
  }

  /* Typography defaults */
  ${body.small()};

  ${from.mobileMedium} {
    ${body.medium()};
  }

  ${from.desktop} {
    ${headline.xxsmall()};
    line-height: 135%;
  }
`;

// Keep the content below the roundel on mobile if present
const roundelOffset = css`
  ${until.tablet} {
    margin-top: ${(roundelSizeMob / 2) - space[6]}px;
  }
`;

const heroImage = css`
  align-self: flex-end;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 100%;

  ${from.tablet} {
    width: 40%;
  }

  & img {
    max-width: 100%;
  }
`;

const heroRoundel = css`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  top: 0;
  right: ${space[3]}px;
  transform: translateY(-67%);
  width: ${roundelSizeMob}px;
  height: ${roundelSizeMob}px;
  border-radius: 50%;
  background-color: ${brandAlt[400]};
  color: ${neutral[7]};
  ${headline.xxsmall({ fontWeight: 'bold' })};
  z-index: 20;

  ${from.tablet} {
    width: ${roundelSize}px;
    height: ${roundelSize}px;
    right: ${space[12]}px;
    transform: translateY(-50%);
    ${headline.small({ fontWeight: 'bold' })};
  }
`;

const roundelNudgeUp = css`
  ${until.tablet} {
    transform: translateY(-67%);
  }
`;

const roundelNudgeDown = css`
  ${until.tablet} {
    transform: translateY(-34%);
  }
`;

const roundelNudges: { [RoundelNudgeDirection]: string } = {
  up: roundelNudgeUp,
  down: roundelNudgeDown,
  none: '',
};

function Hero({
  children, image, cssOverrides, roundelText, roundelNudgeDirection = 'up',
}: PropTypes) {
  const useOffset = roundelText && roundelNudgeDirection === 'up';
  const nudgeCSS = roundelNudges[roundelNudgeDirection];
  return (
    <div css={[hero, cssOverrides]}>
      {roundelText && <div css={[heroRoundel, nudgeCSS]}>{roundelText}</div>}
      <div css={useOffset ? roundelOffset : ''}>
        {children}
      </div>
      <div css={heroImage}>
        {image}
      </div>
    </div>
  );
}

Hero.defaultProps = {
  cssOverrides: '',
  roundelText: null,
  roundelNudgeDirection: 'up',
};

export default Hero;
