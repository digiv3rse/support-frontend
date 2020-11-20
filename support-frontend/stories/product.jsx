// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, withKnobs } from '@storybook/addon-knobs';
import { SvgInfo } from '@guardian/src-icons';

import ProductOption from 'components/product/productOption';
import ProductInfoChip from 'components/product/productInfoChip';

const stories = storiesOf('Product', module)
  .addDecorator(withKnobs);

stories.add('ProductOption', () => {
  const product = {
    title: text('Title', '6 for 6'),
    price: text('Price', '£6'),
    priceCopy: text('Price copy', 'for the first 6 issues'),
    href: '',
    buttonCopy: text('Button copy', 'Buy now'),
    onClick: () => {},
    label: text('Label', 'Save 10%'),
  };
  return (
    <div style={{
 width: '100%', height: '400px', display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#04204B',
}}
    >
      <ProductOption
        {...product}
      />
    </div>
  );
});

stories.add('ProductInfoChip', () => (
  <div style={{
      width: '100%', padding: '16px', backgroundColor: '#04204B', color: '#ffffff',
     }}
  >
    <ProductInfoChip icon={<SvgInfo />}>
      This can give some additional information about a product
    </ProductInfoChip>
    <ProductInfoChip>
      It can be used with or without an icon
    </ProductInfoChip>
  </div>
));
