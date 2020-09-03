import React from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import ActionContainer from './components/ActionContainer';
import ActionHeader from './components/ActionHeader';
import ActionBody from './components/ActionBody';
import SvgSpeechBubbleWithPlus from './components/SvgSpeechBubbleWithPlus';
import styles from './styles';

const buttonContainer = css`
  margin-top: ${space[6]}px;
`;

const ContributionThankYouSendYourThoughts = () => {
  const actionIcon = <SvgSpeechBubbleWithPlus />;
  const actionHeader = <ActionHeader title="Send us your thoughts" />;
  const actionBody = (
    <ActionBody>
      <p>
        <span css={styles.hideAfterDesktop}>
          Fill out this short form to tell us more about your experience of
          supporting us today.
        </span>
        <span css={styles.hideBeforeDesktop}>
          We would love to hear more about your experience of supporting the
          Guardian today. Please fill out this short form – it only takes a
          minute.
        </span>
      </p>
      <div css={buttonContainer}>
        <Button
          priority="primary"
          size="default"
          icon={<SvgArrowRightStraight />}
          iconSide="right"
          nudgeIcon
        >
          Provide feedback
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

export default ContributionThankYouSendYourThoughts;
