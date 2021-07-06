// ----- Imports ----- //
import React from "react";
import { css } from "@emotion/core";
import { brandAlt } from "@guardian/src-foundations/palette";
import { OneOffContribution } from "helpers/customHooks/useLastOneOffContribution";
import { glyph } from "helpers/internationalisation/currency";
import { getLongMonth, getDateWithOrdinal } from "helpers/abTests/lpPreviousGiving";
// ----- Types ----- //
type PreviousGivingHeaderCopyProps = {
  userName: string | null;
};
type PreviousGivingBodyCopyProps = {
  lastOneOffContribution: OneOffContribution;
};
// ----- Styles ----- //
const bodyStyles = css`
  line-height: 1.35em;
`;
const highlightStyles = css`
  padding: 0 2px;
  background-color: ${brandAlt[400]};
`;
// ----- Components ----- //
export function PreviousGivingHeaderCopy({
  userName
}: PreviousGivingHeaderCopyProps) {
  if (userName) {
    return <>It's nice to see you again {userName}!</>;
  }

  return <>It's nice to see you again!</>;
}
export function PreviousGivingBodyCopy({
  lastOneOffContribution
}: PreviousGivingBodyCopyProps) {
  const month = getLongMonth(lastOneOffContribution.createdAt);
  const date = getDateWithOrdinal(lastOneOffContribution.createdAt);
  return <span css={bodyStyles}>
      On {month} {date}, you supported us with a{' '}
      <span css={highlightStyles}>
        {glyph(lastOneOffContribution.currency)}
        {lastOneOffContribution.amount} contribution.
      </span>{' '}
      We hope you’ll consider the same again today. Every contribution, however
      big or small, protects the Guardian’s independence, and keeps our
      high-impact journalism open for all. Thank you.
    </span>;
}