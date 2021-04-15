// @flow

// ----- Imports ----- //

import React from 'react';

import { ThemeProvider } from 'emotion-theming';
import { LinkButton, buttonReaderRevenue } from '@guardian/src-button';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { SvgArrowRightStraight } from '@guardian/src-icons';

import { sendTrackingEventsOnClick } from 'helpers/subscriptions';

import Content, { Divider, NarrowContent } from 'components/content/content';
import type { SubscriptionProduct } from 'helpers/subscriptions';

const buttonStyles = css`
  ${from.desktop} {
    margin-left: ${space[2]}px;
  }
`;

type PropTypes = {
  subscriptionProduct: SubscriptionProduct,
}

// ----- Component ----- //

function ReturnSection(props: PropTypes) {

  return (
    <Content>
      <Divider />
      <NarrowContent>
        <div className="thank-you-stage__ctas">
          <ThemeProvider theme={buttonReaderRevenue}>
            <LinkButton
              css={buttonStyles}
              priority="tertiary"
              aria-label="Return to The Guardian home page"
              href="https://theguardian.com"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
              nudgeIcon
              onClick={sendTrackingEventsOnClick({
                id: 'checkout_return_home',
                product: props.subscriptionProduct,
                componentType: 'ACQUISITIONS_BUTTON',
              })}
            >
            Return to The Guardian
            </LinkButton>
          </ThemeProvider>
        </div>
      </NarrowContent>
    </Content>
  );

}


// ----- Exports ----- //

export default ReturnSection;
