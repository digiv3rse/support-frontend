// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { outsetClassName } from 'components/productPage/productPageContentBlock/productPageContentBlock';
import ProductPageTabs from 'components/productPage/productPageTabs/productPageTabs';
import { type PaperDeliveryMethod } from 'helpers/subscriptions';

import { type State } from '../paperSubscriptionLandingPageReducer';
import { setTab, type TabActions } from '../paperSubscriptionLandingPageActions';

// ----- Tabs ----- //

export const tabs: {[PaperDeliveryMethod]: {name: string}} = {
  collection: {
    name: 'Voucher',
  },
  delivery: {
    name: 'Home Delivery',
  },
};

export type Tab = PaperDeliveryMethod;

type StatePropTypes = {|
  selectedTab: number,
|};

type DispatchPropTypes = {|
  setTabAction: (Tab) => *,
|};

type PropTypes = {|
  ...StatePropTypes,
  ...DispatchPropTypes,
|};

// ----- Component ----- //

const Tabs = ({ selectedTab, setTabAction }: PropTypes) => (
  <div className={outsetClassName}>
    <ProductPageTabs
      active={selectedTab}
      onChange={(t) => { setTabAction(Object.keys(tabs)[t]); }}
      tabs={Object.keys(tabs).map(tab => ({ name: tabs[tab].name }))}
    />
  </div>
);

// ----- State/Props Maps ----- //

const mapStateToProps = (state: State) => ({
  selectedTab: Object.keys(tabs).indexOf(state.page.tabs.active),
});

const mapDispatchToProps = (dispatch: Dispatch<TabActions>) =>
  ({
    setTabAction: bindActionCreators(setTab, dispatch),
  });


// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
