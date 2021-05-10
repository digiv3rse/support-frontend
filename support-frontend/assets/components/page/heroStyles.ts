import { css } from "@emotion/core";
import { brand, neutral } from "@guardian/src-foundations/palette";
import { from, until } from "@guardian/src-foundations/mq";
import { space } from "@guardian/src-foundations";
import { headline, body } from "@guardian/src-foundations/typography";
import { roundelSizeMob } from "./heroRoundel";
export const hero = css`
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
  /* TODO: fix this when we port over the image components */
  .component-grid-picture {
    display: flex;
  }
`;
// On mobile the roundel can overlay and hide the h2 inside the hero
// This adds a little extra top margin if the roundel is present to keep the headline visible
export const roundelOffset = css`
  ${until.tablet} {
    margin-top: ${roundelSizeMob / 2 - space[6]}px;
  }
`;
export const heroImage = css`
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
export const heroRoundelContainer = css`
  position: absolute;
  top: 0;
  right: ${space[3]}px;

  ${from.tablet} {
  right: ${space[12]}px;
  }
`;
export const roundelNudgeUp = css`
  ${until.tablet} {
    transform: translateY(-67%);
  }
`;
export const roundelNudgeDown = css`
  ${until.tablet} {
    transform: translateY(-34%);
  }
`;

function hideUntilBreakpoint(breakpoint): string {
  return css`
    ${until[breakpoint]} {
      display: none;
    }
  `;
}

export const roundelHidingPoints: Record<string, string> = {
  mobile: hideUntilBreakpoint('mobile'),
  mobileMedium: hideUntilBreakpoint('mobileMedium'),
  mobileLandscape: hideUntilBreakpoint('mobileLandscape'),
  phablet: hideUntilBreakpoint('phablet'),
  tablet: hideUntilBreakpoint('tablet'),
  desktop: hideUntilBreakpoint('desktop'),
  leftCol: hideUntilBreakpoint('leftCol'),
  wide: hideUntilBreakpoint('wide')
};