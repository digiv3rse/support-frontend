// @flow

// ----- Imports ----- //

import React, { Component, type Node } from 'react';

import { type Option } from 'helpers/types/option';
import { classNameWithModifiers } from 'helpers/utilities';
import SvgGuardianLogo from 'components/svgs/guardianLogo';

import './simpleHeader.scss';

export type PropTypes = {|
  utility: Option<Node>,
|};
export type State = {|
  fitsLinksInOneRow: boolean,
|};

const links = [
  {
    href: '/subscribe/digital',
    text: 'Subscriptions',
  },
  {
    href: '/subscribe/digital',
    text: 'Bananas',
  },
  {
    href: '/subscribe/digital',
    text: 'Donuts',
  },
  {
    href: '/subscribe/digital',
    text: 'Pretzels',
  },
  {
    href: '/subscribe/digital',
    text: 'Pears',
  },
  {
    href: '/subscribe/digital',
    text: 'Apples',
  },
];

// ----- Component ----- //

export default class SimpleHeader extends Component<PropTypes, State> {
  static defaultProps = {
    utility: null,
  };

  state = {
    fitsLinksInOneRow: true,
  };

  componentDidMount() {
    this.observer = new ResizeObserver(() => {
      if (this.menuRef && this.logoRef && this.containerRef) {
        const [logoWidth, menuWidth, containerWidth] = [
          // $FlowIgnore
          this.logoRef.getBoundingClientRect().width,
          // $FlowIgnore
          this.menuRef.getBoundingClientRect().width,
          // $FlowIgnore
          this.containerRef.getBoundingClientRect().width,
        ];
        this.setState({
          fitsLinksInOneRow: containerWidth - logoWidth - menuWidth > 0,
        });
      }
    });
    if (this.logoRef && this.menuRef && this.containerRef) {
      this.observer.observe(this.logoRef);
      this.observer.observe(this.menuRef);
      this.observer.observe(this.containerRef);
    }
  }

  logoRef: ?Element;
  menuRef: ?Element;
  containerRef: ?Element;
  observer: any;

  render() {
    const { utility } = this.props;
    const { fitsLinksInOneRow } = this.state;
    return (
      <header className={
      classNameWithModifiers('component-simple-header', [fitsLinksInOneRow ? 'oneRow' : null])
    }
      >
        <div className="component-simple-header__content" ref={(d) => { this.containerRef = d; }}>
          <div className="component-simple-header__logo" ref={(d) => { this.logoRef = d; }}>
            <div className="component-simple-header__utility">{utility}</div>
            <a className="component-simple-header__link" href="https://www.theguardian.com">
              <div className="accessibility-hint">The Guardian logo</div>
              <SvgGuardianLogo />
            </a>
          </div>
          <nav className="component-simple-header-nav">
            <ul className="component-simple-header-nav__ul" ref={(d) => { this.menuRef = d; }}>
              {links.map(({ href, text }) => (
                <li className="component-simple-header-nav__li">
                  <a className="component-simple-header-nav__link" href={href}>{text}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    );
  }
}
