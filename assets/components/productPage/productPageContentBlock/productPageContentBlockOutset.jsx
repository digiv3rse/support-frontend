// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';


// ---- Types ----- //

type PropTypes = {|
  children: Node,
|};


// ----- Render ----- //

export const className = 'component-product-page-content-block__outset';

const ProductPageContentBlockOutset = ({
  children,
}: PropTypes) => (
  <div className={className}>
    {children}
  </div>
);

export default ProductPageContentBlockOutset;
