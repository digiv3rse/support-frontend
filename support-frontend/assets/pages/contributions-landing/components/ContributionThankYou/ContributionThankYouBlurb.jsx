// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import type { ThankYouPageStage } from 'pages/contributions-landing/contributionsLandingReducer';

// ----- Types ----- //

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  firstName: string,
  thankYouPageStage: ThankYouPageStage
|};
/* eslint-enable react/no-unused-prop-types */


// ----- State Maps ----- //

const mapStateToProps = state => ({
  firstName: state.page.form.formData.firstName,
  thankYouPageStage: state.page.form.thankYouPageStage,
});

// ----- Render ----- //

const ContributionThankYouBlurb = (props: PropTypes) => {
  const { firstName, thankYouPageStage } = props;
  const headerText = (firstName && firstName.length < 10 && firstName.trim() !== '') ?
    `Thank\xa0you\xa0${firstName}\nfor\xa0your\xa0valuable\ncontribution` : 'Thank\xa0you\xa0for\nyour\xa0valuable\ncontribution';

  return (
    <div className="gu-content__blurb gu-content__blurb--thank-you">
      <h1 className="gu-content__blurb-header">{headerText}</h1>
      {thankYouPageStage !== 'thankYouSetPassword' &&
      <p className="gu-content__blurb-blurb gu-content__blurb-blurb--thank-you">
        {'Here are some additional ways that you can support us, and improve your experience with the Guardian.'}
      </p>
    }
    </div>);
};

export default connect(mapStateToProps)(ContributionThankYouBlurb);
