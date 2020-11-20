// @flow
import React, { type Node } from 'react';
import cx from 'classnames';
import { css } from '@emotion/core';
import { neutral } from '@guardian/src-foundations/palette';
import { space } from '@guardian/src-foundations';
import { LinkButton, buttonReaderRevenue } from '@guardian/src-button';
import { ThemeProvider } from 'emotion-theming';

// components
import { type PropTypes } from 'components/button/anchorButton';
import { defaultProps } from 'components/button/_sharedButton';

// styles
import './productOption.scss';

type Props = {
  children: Node,
};
type WrappedProps = {
  ...PropTypes,
  salesCopy: Node,
}

type ProductOptionType = {
  children: Node,
  orderIsAGift?: boolean,
}

type ProductOptionOfferType = {
  children: Node,
}

const buttonStyles = css`
  color: ${neutral[7]};
  margin-top: ${space[2]}px;
`;

// hocs
const withProductOptionsStyle = WrappedComponent => (props: WrappedProps) => (
  <div className="product-option__button">
    <div className="product-option__sales-copy">{props.salesCopy}</div>
    <WrappedComponent {...props} />
  </div>
);

const LinkButtonPayment = (props: WrappedProps) => (
  <ThemeProvider theme={buttonReaderRevenue}>
    <LinkButton css={buttonStyles} {...props} />
  </ThemeProvider>
);

// presentation components
export const ProductOptionContent = ({ children }: { children: Node}) => (
  <div className="product-option__content">{ children }</div>
);

export const ProductOptionTitle = (props: Props) => (
  <div className="product-option__title">{ props.children }</div>
);

export const ProductOptionCopy = ({ children, bold }: { children: Node, bold?: boolean }) => (
  <span className={cx('product-option__copy', { 'product-option__copy--bold': bold })}>{ children }</span>
);

export const ProductOptionOffer = ({ children }: ProductOptionOfferType) => (
  <div className={children ? 'product-option__offer-container--with-children' : 'product-option__offer-container'}>
    <span className="product-option__offer">{ children }</span>
  </div>
);

export const ProductOptionPrice = ({ children }: { children: Node}) => (
  <p className="product-option__price">{ children }</p>
);

export const ProductOptionButton = withProductOptionsStyle(LinkButtonPayment);

const ProductOption = ({ children, orderIsAGift }: ProductOptionType) => (
  <div className={orderIsAGift ? 'product-option' : 'product-option--non-gift'}>
    { children }
  </div>
);

ProductOption.defaultProps = {
  orderIsAGift: false,
};

// default props
ProductOptionCopy.defaultProps = {
  bold: false,
};

ProductOptionButton.defaultProps = {
  ...defaultProps,
};

export default ProductOption;
