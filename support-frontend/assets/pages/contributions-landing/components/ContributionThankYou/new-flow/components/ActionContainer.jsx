// @flow
import * as React from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { neutral } from '@guardian/src-foundations/palette';

const container = css`
  background: white;
  padding-top: ${space[2]}px;
  padding-bottom: ${space[5]}px;
  border-top: 1px solid ${neutral[86]};
  border-bottom: 1px solid ${neutral[86]};

  ${from.desktop} {
    padding-left: ${space[4]}px;
    padding-right: 72px;
    border: 1px solid ${neutral[86]};
  }

  display: grid;
  grid-column-gap: ${space[3]}px;
  grid-template-columns: min-content 1fr;
  grid-template-areas:
    "icon header"
    "body body";

  ${from.desktop} {
    grid-template-areas:
      "icon header"
      "---- body";
  }
`;

const iconContainer = css`
  grid-area: icon;

  svg {
    display: block;
  }
`;

const headerContainer = css`
  grid-area: header;

  display: flex;
  align-items: center;
`;
const bodyContainer = css`
  grid-area: body;
`;

type ActionContainerProps = {|
  icon: React.Node,
  header: React.Node,
  body: React.Node,
|};

const ActionContainer = ({ icon, header, body }: ActionContainerProps) => (
  <section css={container}>
    <div css={iconContainer}>{icon}</div>
    <div css={headerContainer}>{ header}</div>
    <div css={bodyContainer}>{body}</div>
  </section>
);

export default ActionContainer;
