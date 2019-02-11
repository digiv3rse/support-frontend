// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Outset } from 'components/productPage/productPageContentBlock/productPageContentBlock';
import ProductPageTabs from 'components/productPage/productPageTabs/productPageTabs';
import { type PaperDeliveryMethod } from 'helpers/subscriptions';
import { paperSubsUrl } from 'helpers/routes';

import { type State } from '../paperSubscriptionLandingPageReducer';
import { setTab, type TabActions } from '../paperSubscriptionLandingPageActions';

// ----- Tabs ----- //

export const tabs: {[PaperDeliveryMethod]: {name: string, href: string}} = {
  collection: {
    name: 'Voucher Booklet',
    href: paperSubsUrl(false),
  },
  delivery: {
    name: 'Home Delivery',
    href: paperSubsUrl(true),
  },
};

type StatePropTypes = {|
  selectedTab: number,
|};

type DispatchPropTypes = {|
  setTabAction: (PaperDeliveryMethod) => TabActions,
|};

type PropTypes = {|
  ...StatePropTypes,
  ...DispatchPropTypes,
|};

// ----- Component ----- //

const Tabs = ({ selectedTab, setTabAction }: PropTypes) => (
  <Outset>
    <ProductPageTabs
      active={selectedTab}
      onChange={(t) => { setTabAction(Object.keys(tabs)[t]); }}
      tabs={Object.keys(tabs).map(k => ({
        name: tabs[k].name,
        href: tabs[k].href,
      }))}
    />
  </Outset>
);

// ----- State/Props Maps ----- //

const mapStateToProps = (state: State) => ({
  selectedTab: Object.keys(tabs).indexOf(state.page.tab),
});

const mapDispatchToProps = (dispatch: Dispatch<TabActions>) =>
  ({
    setTabAction: bindActionCreators(setTab, dispatch),
  });


// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
