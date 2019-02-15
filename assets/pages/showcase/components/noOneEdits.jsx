// @flow

import React from 'react';

import ProductPageContentBlock from 'components/productPage/productPageContentBlock/productPageContentBlock';
import Text from 'components/text/text';
import NoOne from 'components/svgs/noOne';

export default function NoOneEdits() {
  return (
    <ProductPageContentBlock type="grey">
      <Text>
        <NoOne />
        <p>
          Our journalism is editorially independent, meaning we set our own agenda.
          No one edits our editor and no one steers our opinion.
          We are free from commercial bias and are not influenced by billionaire owners, politicians or shareholders.
          This independence matters because it enables us to challenge the powerful, and hold them to account.
        </p>
      </Text>
    </ProductPageContentBlock>
  );
}
