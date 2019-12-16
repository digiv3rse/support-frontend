// @flow

// ----- Imports ----- //

import React from 'react';

import Content from 'components/content/content';
import Text, { LargeParagraph } from 'components/text/text';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';

import AppsSection from './appsSection';

// ----- Types ----- //

type PropTypes = {
  countryGroupId: CountryGroupId,
};

// ----- Component ----- //

function ThankYouProducts({ countryGroupId }: PropTypes) {

  return (
    <div>
      <Content>
        <Text>
          <LargeParagraph>
            You have access to the following products:
          </LargeParagraph>
        </Text>
        <AppsSection countryGroupId={countryGroupId} />
      </Content>
    </div>
  );

}

// ----- Export ----- //

export default ThankYouProducts;
