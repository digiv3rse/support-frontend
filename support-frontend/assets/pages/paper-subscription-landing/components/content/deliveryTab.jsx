// @flow

// ----- Imports ----- //

import React from 'react';
import FlexContainer from 'components/containers/flexContainer';
import GridImage from 'components/gridImage/gridImage';
import { setTab } from '../../paperSubscriptionLandingPageActions';
import {
  ContentForm,
  type ContentTabPropTypes,
  LinkTo,
} from './helpers';
import { Collection } from 'helpers/productPrice/fulfilmentOptions';
import { paperHasDeliveryEnabled } from 'helpers/subscriptions';
import { Accordion, AccordionRow } from '@guardian/src-accordion';
import { css } from '@emotion/core';
import { neutral } from '@guardian/src-foundations/palette';
import { textSans } from '@guardian/src-foundations/typography';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { type Option } from 'helpers/types/option';

const flexContainerOverride = css`
  align-items: flex-start;
  justify-content: space-between;
`;

const faqsContainer = css`
  ${from.tablet} {
    max-width: 50%;
  }
`;

const paragraph = css`
  margin-bottom: ${space[6]}px;
  a {
    color: inherit;
  }
`;


export const accordionContainer = css`
  background-color: ${neutral['97']};

  p, a {
    ${textSans.small()};
    margin-bottom: ${space[3]}px;
  }

  p, button {
    padding-right: ${space[2]}px;
    padding-left: ${space[2]}px;
  }
`;

// ----- Content ----- //
export const ContentDeliveryFaqBlock = ({
  useDigitalVoucher,
  setTabAction,
}: {useDigitalVoucher?: Option<boolean>, setTabAction: typeof setTab,
}) => (
  <FlexContainer cssOverrides={flexContainerOverride}>
    <div css={faqsContainer}>
      <p css={paragraph}>
        If you live in Greater London (within the M25), you can use The Guardian’s home delivery
        service. If not, you can use our <LinkTo tab={Collection} setTabAction={setTabAction}>{useDigitalVoucher ? 'subscription cards' : 'voucher scheme'}</LinkTo>.
      </p>
      <p css={paragraph}>
        Select your subscription below and checkout. You&apos;ll receive your first newspaper
        as quickly as five days from subscribing.
      </p>
      <div css={accordionContainer}>
        <Accordion>
          <AccordionRow label="Delivery details">
            <p>
              Your paper will arrive before 8am from Monday to Saturday and before 8.30am on Sunday.
            </p>
            <p>
              We can’t deliver to individual flats, or apartments within blocks because we need
              access to your post box to deliver your paper.
            </p>
            <p>
              You can pause your subscription for up to 36 days a year. So if you’re going away
              anywhere, you won’t have to pay for the papers that you miss.
            </p>
          </AccordionRow>
        </Accordion>
      </div>
    </div>
    <GridImage
      gridId="printCampaignHDdigitalVoucher"
      srcSizes={[562, 500, 140]}
      sizes="(max-width: 740px) 100vw, 500px"
      imgType="png"
    />
  </FlexContainer>

);

ContentDeliveryFaqBlock.defaultProps = {
  useDigitalVoucher: null,
};

const DeliveryTab = ({
  getRef, setTabAction, selectedTab, useDigitalVoucher,
}: ContentTabPropTypes) => (
  <div
    className="paper-subscription-landing-content__focusable"
    tabIndex={-1}
    ref={(r) => { getRef(r); }}
  >
    <ContentDeliveryFaqBlock setTabAction={setTabAction} useDigitalVoucher={useDigitalVoucher} />
    <ContentForm
      selectedTab={selectedTab}
      setTabAction={setTabAction}
      title="Pick your home delivery subscription package below"
      useDigitalVoucher={useDigitalVoucher}
    />
  </div>
);

export default DeliveryTab;
