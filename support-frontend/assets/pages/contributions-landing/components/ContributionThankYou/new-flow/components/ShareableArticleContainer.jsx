// @flow
import React from 'react';
import { css } from '@emotion/core';
import { neutral, news } from '@guardian/src-foundations/palette';
import { LinkButton } from '@guardian/src-button';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import { SvgFacebook, SvgTwitter, SvgEnvelope } from '@guardian/src-icons';
import SvgLinkedIn from '../components/SvgLinkedIn';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getLinkedInShareLink,
  getEmailShareLink,
} from '../../utils/social';
import {
  OPHAN_COMPONENT_ID_SOCIAL_FACEBOOK,
  OPHAN_COMPONENT_ID_SOCIAL_TWITTER,
  OPHAN_COMPONENT_ID_SOCIAL_LINKED_IN,
  OPHAN_COMPONENT_ID_SOCIAL_EMAIL,
} from '../../utils/ophan';
import { headline } from '@guardian/src-foundations/typography';
import { space } from '@guardian/src-foundations';
import { from, until } from '@guardian/src-foundations/mq';

// Styles ///////////////////////////////////////////////////////////

const outerContainer = css`
  display: flex;
  flex-direction: column;
  margin-top: ${space[6]}px;
`;

const innerContainer = css`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${news[400]};
  background-color: ${neutral[97]};
`;

const genericButtonContainer = css`
  margin-top: ${space[4]}px;
  margin-left: ${space[2]}px;

  & > * {
    margin-bottom: ${space[2]}px;
    margin-right: ${space[2]}px;
  }
`

const wideButtonsContainer = css`
  ${genericButtonContainer}
  display: block;

  ${until.phablet} {
    display: none;
  }
`;

const narrowButtonsContainer = css`
  ${genericButtonContainer}
  display: none;

  ${until.phablet} {
    display: block;
  }
`;

const headlineText = css`
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  color: ${neutral[7]};
  ${headline.xxxsmall({ lineHeight: 'tight' })};
  font-weight: 600 !important;
`;

const button = css`
  border: 1px solid ${neutral[86]};
  color: ${news[400]};
`;

const imageContainer = css`
  max-width: 45%;
  padding: ${space[2]}px;

  ${until.phablet} {
    padding: ${space[1]}px;
  }
`;

const image = css`
  width: 100% !important;
  width: 100% !important;
`;

const headlineAndButtonsContainer = css`
  padding: ${space[2]}px ${space[2]}px ${space[2]}px 0;

  ${until.phablet} {
    padding: ${space[1]}px ${space[1]}px ${space[1]}px 0;
  }
`;

// Types ////////////////////////////////////////////////////////////

type PropTypes = {
  articleUrl: String,
  headline: String,
  imageUrl: String,
  imageAltText: String,
}

// Component ////////////////////////////////////////////////////////

const shareButtonsContainer = (css: String) => (
  <div css={css}>
    <LinkButton
      href={getFacebookShareLink()}
      onClick={() =>
        trackComponentClick(OPHAN_COMPONENT_ID_SOCIAL_FACEBOOK)
      }
      target="_blank"
      rel="noopener noreferrer"
      priority="tertiary"
      size="default"
      icon={<SvgFacebook />}
      css={button}
      hideLabel
    />
    <LinkButton
      href={getTwitterShareLink()}
      onClick={() => trackComponentClick(OPHAN_COMPONENT_ID_SOCIAL_TWITTER)}
      target="_blank"
      rel="noopener noreferrer"
      priority="tertiary"
      size="default"
      icon={<SvgTwitter />}
      css={button}
      hideLabel
    />
    <LinkButton
      href={getLinkedInShareLink()}
      onClick={() =>
        trackComponentClick(OPHAN_COMPONENT_ID_SOCIAL_LINKED_IN)
      }
      target="_blank"
      rel="noopener noreferrer"
      priority="tertiary"
      size="default"
      icon={<SvgLinkedIn />}
      css={button}
      hideLabel
    />
    <LinkButton
      href={getEmailShareLink()}
      onClick={() => trackComponentClick(OPHAN_COMPONENT_ID_SOCIAL_EMAIL)}
      target="_blank"
      rel="noopener noreferrer"
      priority="tertiary"
      size="default"
      icon={<SvgEnvelope />}
      css={button}
      hideLabel
    />
  </div>
)

const ShareableArticleContainer = (props: PropTypes) => (
  <div css={outerContainer}>
    <div css={innerContainer}>
      <div css={imageContainer}>
        <a
          href={props.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img css={image} src={props.imageUrl} alt={props.imageAltText} />
        </a>
      </div>
      <div css={headlineAndButtonsContainer}>
        <a
          href={props.articleUrl}
          css={headlineText}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.headline}
        </a>
        {shareButtonsContainer(wideButtonsContainer)}
      </div>
    </div>
    {shareButtonsContainer(narrowButtonsContainer)}
  </div>
);

export default ShareableArticleContainer;
