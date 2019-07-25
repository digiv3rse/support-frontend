// @flow

// ----- Imports ----- //

import React from 'react';
import { type ContributionType } from 'helpers/contributions';
import AnchorButton from 'components/button/anchorButton';

// ----- Component ----- //

/* **********************************************************
In order to display this component, a surveyLink must be
configured below and the prop 'isRunning' needs to be set to
`true` where the component is rendered (currently on the
`ContributionThankYou` and `ContributionThankYouPasswordSet`)
*********************************************************** */


type PropTypes = {|
  isRunning: boolean
|};

export default function ContributionsSurvey(props: PropTypes) {
  const surveyLink = 'https://www.surveymonkey.co.uk/r/T8HL7P2';

  return props.isRunning && surveyLink ? (
    <div className="contribution-thank-you-block">
      <h3 className="contribution-thank-you-block__title">Tell us about your contribution</h3>
      <p className="contribution-thank-you-block__message">
          Please fill out this short form to help us learn a little more about your support for The Guardian
      </p>
      <AnchorButton
        href={surveyLink}
        appearance="secondary"
        aria-label="Link to contribution survey"
      >
          Share your thoughts
      </AnchorButton>
    </div>
  ) : null;
}

