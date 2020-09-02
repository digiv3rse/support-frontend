import React, { useState } from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { Checkbox } from '@guardian/src-checkbox';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import ActionContainer from './components/ActionContainer';
import ActionHeader from './components/ActionHeader';
import ActionBody from './components/ActionBody';

const checkboxContainer = css`
  margin-top: ${space[2]}px;

  ${from.desktop} {
    margin-top: ${space[5]}px;
  }
`;

const buttonContainer = css`
  margin-top: ${space[6]}px;
`;

const hideAfterDesktop = css`
  display: block;

  ${from.desktop} {
    display: none;
  }
`;

const hideBeforeDesktop = css`
  display: none;

  ${from.desktop} {
    display: block;
  }
`;

const SvgNotification = () => (
  <svg
    width="39"
    height="38"
    viewBox="0 0 39 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.19996 19C6.19996 22.42 7.40329 25.555 9.33495 28.0883L8.66995 28.7533C5.85162 26.4416 4.04663 22.9583 4.04663 19C4.04663 15.0417 5.85162 11.5584 8.66995 9.2467L9.33495 9.9117C7.40329 12.445 6.19996 15.58 6.19996 19ZM32.7365 19C32.7365 15.58 31.6282 12.445 29.6015 9.9117L30.3299 9.2467C33.1482 11.5584 34.9532 15.0417 34.9532 19C34.9532 22.9583 33.1482 26.4416 30.3299 28.7533L29.6015 28.0883C31.6282 25.555 32.7365 22.42 32.7365 19ZM10.7283 19C10.7283 21.0267 11.3299 22.8317 12.3749 24.32L11.5199 25.1433C9.90494 23.5283 8.98661 21.4067 8.98661 19C8.98661 16.5933 9.90494 14.3767 11.5199 12.8567L12.3749 13.6484C11.3299 15.1684 10.7283 16.9733 10.7283 19ZM28.2715 19C28.2715 16.9733 27.6699 15.1684 26.6566 13.6484L27.4482 12.8567C29.0632 14.3767 30.0132 16.5933 30.0132 19C30.0132 21.4067 29.0632 23.5283 27.4482 25.1433L26.6566 24.32C27.6699 22.8317 28.2715 21.0267 28.2715 19ZM24.5666 19C24.5666 16.1817 22.3182 13.9334 19.4999 13.9334C16.6816 13.9334 14.4333 16.1817 14.4333 19C14.4333 21.8183 16.6816 24.0667 19.4999 24.0667C22.3182 24.0667 24.5666 21.8183 24.5666 19Z"
      fill="#121212"
    />
  </svg>
);

const ContributionThankYouHearFromOurNewsroom = () => {
  const [hasBeenInteractedWith, setHasBeenInteractedWith] = useState(false);
  const actionIcon = <SvgNotification />;
  const actionHeader = (
    <ActionHeader
      title={
        hasBeenInteractedWith ? 'You\'re signed up' : 'Hear from our newsroom'
      }
    />
  );
  const actionBody = (
    <ActionBody>
      {hasBeenInteractedWith ? (
        <p>
          Please check your inbox for a confirmation link. Soon after, you’ll
          receive your first email from the Guardian newsroom. You can
          unsubscribe at any time.
        </p>
      ) : (
        <>
          <p>
            <span css={hideAfterDesktop}>
              Opt in to receive a regular newsletter from inside the Guardian.
            </span>
            <span css={hideBeforeDesktop}>
              Our membership editor and others will discuss the most important
              recent news stories and suggest compelling articles to read. Opt
              in to receive their regular newsletter.
            </span>
          </p>
          <div css={checkboxContainer}>
            <div css={hideAfterDesktop}>
              <Checkbox supporting="Get related news and offers - whether you are a contributor, subscriber, memember or would like to become one." />
            </div>
            <div css={hideBeforeDesktop}>
              <Checkbox supporting="Contributions, subscriptions and membership: get related news and offers – whether you are a contributor, subscriber, member or would like to become one." />
            </div>
          </div>
          <div css={buttonContainer}>
            <Button
              onClick={() => setHasBeenInteractedWith(true)}
              priority="primary"
              size="default"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
              nudgeIcon
            >
              Subscribe
            </Button>
          </div>
        </>
      )}
    </ActionBody>
  );

  return (
    <ActionContainer
      icon={actionIcon}
      header={actionHeader}
      body={actionBody}
    />
  );
};

export default ContributionThankYouHearFromOurNewsroom;
