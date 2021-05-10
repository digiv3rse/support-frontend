import React, { type Node } from "react";
import HeroRoundel, { type RoundelTheme } from "./heroRoundel";
import { hero, heroRoundelContainer, heroImage, roundelOffset, roundelNudgeDown, roundelNudgeUp, roundelHidingPoints } from "./heroStyles";
// Options for moving the roundel position on mobile
type RoundelNudgeDirection = "up" | "down" | "none";
type PropTypes = {
  image: Node;
  children: Node;
  cssOverrides?: string;
  // You can pass either text content for the roundel, or a whole instance of a HeroRoundel component
  roundelElement?: Node;
  roundelText?: Node;
  roundelNudgeDirection?: RoundelNudgeDirection;
  hideRoundelBelow?: string;
  roundelTheme?: RoundelTheme;
};
const roundelNudges: Record<RoundelNudgeDirection, string> = {
  up: roundelNudgeUp,
  down: roundelNudgeDown,
  none: ''
};

function Hero({
  children,
  image,
  cssOverrides,
  roundelElement,
  roundelText,
  hideRoundelBelow,
  roundelNudgeDirection = 'up',
  roundelTheme = 'base'
}: PropTypes) {
  const useOffset = roundelText && roundelNudgeDirection === 'up';
  const nudgeCSS = roundelNudges[roundelNudgeDirection];
  const hideRoundel = hideRoundelBelow ? roundelHidingPoints[hideRoundelBelow] : '';
  return <div css={[hero, cssOverrides]}>
      {roundelText && !roundelElement && <div css={heroRoundelContainer}>
          <HeroRoundel cssOverrides={[nudgeCSS, hideRoundel]} theme={roundelTheme}>{roundelText}</HeroRoundel>
        </div>}
      {!roundelText && roundelElement && <div css={heroRoundelContainer}>
          {roundelElement}
        </div>}
      <div css={useOffset ? roundelOffset : ''}>
        {children}
      </div>
      <div css={heroImage}>
        {image}
      </div>
    </div>;
}

Hero.defaultProps = {
  cssOverrides: '',
  roundelElement: null,
  roundelText: null,
  roundelNudgeDirection: 'up',
  hideRoundelBelow: '',
  roundelTheme: 'base'
};
export default Hero;