// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';
import { Content } from './Content';

type PropTypes = {|
  appearance: {
    centred?: boolean,
    border?: boolean,
    paddingTop?: boolean,
  },
  children: Node
|}

function FooterContent({
  appearance, children,
}: PropTypes) {
  return (
    <div className="component-left-margin-section">
      <div className="component-left-margin-section__content">
        <Content className="component-content__content" appearance={appearance}>
          {children}
        </Content>
      </div>
    </div>
  );
}

FooterContent.defaultProps = {
  appearance: {
    centred: false,
    border: false,
    paddingTop: false,
  },
};

export default FooterContent;
