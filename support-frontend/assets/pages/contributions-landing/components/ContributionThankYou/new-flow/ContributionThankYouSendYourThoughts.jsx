import React, { useState } from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import ActionContainer from './components/ActionContainer';
import ActionHeader from './components/ActionHeader';
import ActionBody from './components/ActionBody';
import SvgSpeechBubbleWithPlus from './components/SvgSpeechBubbleWithPlus';
import styles from './styles';

const buttonContainer = css`
  margin-top: ${space[6]}px;
`;

const SURVEY_LINK = 'https://www.surveymonkey.co.uk/r/8DTN7GS';

const ContributionThankYouSendYourThoughts = () => {
  const [hasBeenInteractedWith, setHasBeenInteractedWith] = useState(false);
  const actionIcon = <SvgSpeechBubbleWithPlus />;
  const actionHeader = (
    <ActionHeader
      title={
        hasBeenInteractedWith
          ? 'Thank you for sharing your thoughts'
          : 'Send us your thoughts'
      }
    />
  );
  const actionBody = (
    <ActionBody>
      {hasBeenInteractedWith ? (
        <p>Your feedback helps us better understand our readers.</p>
      ) : (
        <>
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
            <LinkButton
              onClick={() => setHasBeenInteractedWith(true)}
              href={SURVEY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              priority="primary"
              size="default"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
              nudgeIcon
            >
              Provide feedback
            </LinkButton>
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

export default ContributionThankYouSendYourThoughts;
