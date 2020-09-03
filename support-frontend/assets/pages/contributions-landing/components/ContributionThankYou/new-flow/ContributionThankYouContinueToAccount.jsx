import React, { useState } from 'react';
import { css } from '@emotion/core';
import { body } from '@guardian/src-foundations/typography';
import { space } from '@guardian/src-foundations';
import { Button } from '@guardian/src-button';
import { ButtonLink } from '@guardian/src-link';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import ActionContainer from './components/ActionContainer';
import ActionHeader from './components/ActionHeader';
import ActionBody from './components/ActionBody';
import ExpandableContainer from './components/ExpandableContainer';
import BulletPointedList from './components/BulletPointedList';
import styles from './styles';

const bodyText = css`
  ${body.small()};
`;

const expandableContainer = css`
  margin-top: ${space[4]}px;

  & > * + * {
    margin-top: ${space[4]}px;
  }
`;

const buttonContainer = css`
  margin-top: ${space[6]}px;
`;

const SvgPersonWithTick = () => (
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
      d="M17.4733 16.4666C19.785 16.4666 22.5083 13.8699 22.5083 10.7033C22.5083 7.53661 20.64 5.69995 17.4733 5.69995C14.3067 5.69995 12.47 7.53661 12.47 10.7033C12.47 13.8699 15.415 16.4666 17.4733 16.4666ZM24.7566 18.9999L26.1183 17.6699L27.5116 19.0949L31.6599 14.9466L32.9899 16.3082L27.5116 21.7866L26.1816 20.4249L24.7566 18.9999ZM17.4733 18.9999C18.835 18.9999 20.1333 19.0949 21.305 19.3166C21.6533 22.6099 24.25 25.2699 27.48 25.8399L28.8733 31.0332L27.575 32.2999H7.30836L6.07336 31.0332L8.57502 21.5332L9.87335 20.2349C12.4067 19.3799 14.6867 18.9999 17.4733 18.9999Z"
      fill="#121212"
    />
  </svg>
);

const ContributionThankYouContinueToAccount = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const actionIcon = <SvgPersonWithTick />;
  const actionHeader = <ActionHeader title="Continue to your account" />;

  const expandableContent = (
    <div css={expandableContainer}>
      <p css={styles.hideAfterDesktop}>Stay signed in across all your devices, to:</p>
      <BulletPointedList
        items={[
          'Remove unnecessary messages asking you for financial support',
          'Let you easily manage your recurring contributions, subscriptions and newsletters in one place',
        ]}
      />
      <p>
        Make sure you sign in on each of the devices you use to read our
        journalism – either today or next time you use them.
      </p>
    </div>
  );
  const actionBody = (
    <ActionBody>
      <p>
        <span css={styles.hideAfterDesktop}>
          We’ll show you fewer requests for support and improve your Guardian
          reading experience.{' '}
          {!isExpanded && (
            <ButtonLink
              css={bodyText}
              priority="secondary"
              onClick={() => setIsExpanded(true)}
            >
              Read more
            </ButtonLink>
          )}
        </span>
        <span css={styles.hideBeforeDesktop}>
          By signing in, you enable us to recognise you as a supporter across
          our website and apps. This means we will:
        </span>
      </p>
      <div css={styles.hideAfterDesktop}>
        <ExpandableContainer isExpanded={isExpanded} maxHeight={500}>
          {expandableContent}
        </ExpandableContainer>
      </div>
      <div css={styles.hideBeforeDesktop}>
        {expandableContent}
      </div>
      <div css={buttonContainer}>
        <Button
          priority="primary"
          size="default"
          icon={<SvgArrowRightStraight />}
          iconSide="right"
          nudgeIcon
        >
          Continue
        </Button>
      </div>
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

export default ContributionThankYouContinueToAccount;
