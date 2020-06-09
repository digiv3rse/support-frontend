// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';
import { connect } from 'react-redux';

import ProgressMessage from 'components/progressMessage/progressMessage';

import ReturnSection from 'components/subscriptionCheckouts/thankYou/returnSection';
import type {
  Action,
  CorporateCustomer,
  RedemptionPageState,
  Stage,
} from 'pages/subscriptions-redemption/subscriptionsRedemptionReducer';
import { DigitalPack } from 'helpers/subscriptions';
import { type Dispatch } from 'redux';
import type { User } from 'helpers/subscriptionsForms/user';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { Participations } from 'helpers/abTests/abtest';
import { createSubscription } from 'pages/subscriptions-redemption/api';
import type { Option } from 'helpers/types/option';
import type { Csrf } from 'helpers/csrf/csrfReducer';

// ----- Types ----- //

type PropTypes = {|
  stage: Stage,
  checkoutForm: Node,
  thankYouContentPending: Node,
  thankYouContent: Node,
  corporateCustomer: CorporateCustomer,
  user: User,
  currencyId: IsoCurrency,
  countryId: IsoCountry,
  participations: Participations,
  processingFunction: PropTypes => void,
  csrf: Option<Csrf>,
|};

// ----- State/Props Maps ----- //

function mapStateToProps(state: RedemptionPageState) {
  return {
    stage: state.page.stage,
    corporateCustomer: state.page.corporateCustomer,
    user: state.page.user,
    currencyId: state.common.internationalisation.currencyId,
    countryId: state.common.internationalisation.countryId,
    participations: state.common.abParticipations,
    csrf: state.page.csrf,
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
  return {
    processingFunction: (props: PropTypes) => createSubscription(
      props.corporateCustomer,
      props.user,
      props.currencyId,
      props.countryId,
      props.participations,
      props.csrf || { token: '' },
      dispatch,
    ),
  };
}

// ----- Component ----- //

function CheckoutStage(props: PropTypes) {
  switch (props.stage) {
    case 'thankyou':
      return (
        <div>
          {props.thankYouContent}
          <ReturnSection subscriptionProduct={DigitalPack} />
        </div>
      );

    case 'thankyou-pending':
      return (
        <div>
          {props.thankYouContentPending}
          <ReturnSection subscriptionProduct={DigitalPack} />
        </div>
      );

    case 'processing':
      props.processingFunction(props);
      return (
        <div className="checkout-content">
          {props.checkoutForm}
          <ProgressMessage message={['Processing transaction', 'Please wait']} />
        </div>
      );

    default:
      return (
        <div className="checkout-content">
          {props.checkoutForm}
        </div>
      );
  }
}

// ----- Export ----- //

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutStage);
