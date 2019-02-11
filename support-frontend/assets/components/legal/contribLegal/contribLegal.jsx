// @flow

// ----- Imports ----- //

import React from 'react';

import { contributionsEmail } from 'helpers/legal';

import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';


// ---- Types ----- //

type PropTypes = {|
    countryGroupId: CountryGroupId,
|};


// ----- Component ----- //

export default function ContribLegal(props: PropTypes) {

  return (
    <p className="component-contrib-legal">
      The ultimate owner of the Guardian is The Scott Trust Limited,
      whose role it is to secure the editorial and financial independence
      of the Guardian in perpetuity. Reader contributions support the
      Guardian’s journalism. Please note that your support of the Guardian’s
      journalism does not constitute a charitable donation, as such your
      contribution is not eligible for Gift Aid in the UK nor a tax-deduction
      elsewhere. If you have any questions about contributing to the Guardian,
      please <a href={contributionsEmail[props.countryGroupId]}>contact us here</a>.
    </p>
  );

}
