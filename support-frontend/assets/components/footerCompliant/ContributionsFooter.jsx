// @flow
import React from 'react';
import { css } from '@emotion/core';
import { from } from '@guardian/src-foundations/mq';
import { brandBackground } from '@guardian/src-foundations/palette';
import Footer from './Footer';

const containerStyles = css`
  width: 100%;
  background-color: ${brandBackground.primary};

  .component-left-margin-section {
    &:before {
      display: none;
    }
  }

  .component-content__content {
    max-width: 1060px;
  }
`;

const alignmentStyles = css`
  ${from.tablet} {
    margin-left: 25px;
    margin-right: 25px;
  }
  ${from.leftCol} {
    margin-left: 70px;
    margin-right: 150px;
  }
`;

function ContributionsFooter() {
  const faqsLink = 'https://www.theguardian.com/help/users/faq';
  const termsConditionsLink =
    'https://www.theguardian.com/info/2016/apr/04/contribution-terms-and-conditions';

  return (
    <div css={containerStyles}>
      <div css={alignmentStyles}>
        <Footer faqsLink={faqsLink} termsConditionsLink={termsConditionsLink}>
          <p>
            The ultimate owner of the Guardian is The Scott Trust Limited, whose
            role it is to secure the editorial and financial independence of the
            Guardian in perpetuity. Reader contributions support the Guardian’s
            journalism. Please note that your support of the Guardian’s
            journalism does not constitute a charitable donation, as such your
            contribution is not eligible for Gift Aid in the UK nor a
            tax-deduction elsewhere.
          </p>
        </Footer>
      </div>
    </div>
  );
}

export default ContributionsFooter;
