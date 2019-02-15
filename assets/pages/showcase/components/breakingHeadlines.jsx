// @flow

import React from 'react';

import ProductPageContentBlock from 'components/productPage/productPageContentBlock/productPageContentBlock';
import Text from 'components/text/text';
import BreakingTheHeadlines from 'components/svgs/breakingTheHeadlines';

export default function BreakingHeadlines() {
  return (
    <ProductPageContentBlock type="grey">
      <Text>
        <BreakingTheHeadlines />
        <p>
          We pride ourselves on our breaking news stories, in-depth analysis and thoughtful opinion pieces.
          But it&#39;s not just the news desk that works round the clock. Across the world, our sports writers,
          arts critics, interviewers and science reporters are dedicated to bringing you the quality coverage
          you have come to expect of the Guardian. Why settle for less?
        </p>
      </Text>
    </ProductPageContentBlock>
  );
}
