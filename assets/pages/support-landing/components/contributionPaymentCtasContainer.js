// @flow

// ----- Imports ----- //

import { connect } from 'react-redux';

import ContributionPaymentCtas from 'components/contributionPaymentCtas/contributionPaymentCtas';
import { getAmount } from 'containerisableComponents/contributionSelection/contributionSelectionReducer';
import { payPalContributionButtonActionsFor } from 'containerisableComponents/payPalContributionButton/payPalContributionButtonActions';
import type { State } from '../supportLandingReducer';


// ----- State Maps ----- //

function mapStateToProps(state: State) {

  return {
    contributionType: state.page.selection.contributionType,
    amount: getAmount(state.page.selection),
    referrerAcquisitionData: state.common.referrerAcquisitionData,
    country: state.common.internationalisation.countryId,
    countryGroupId: state.common.internationalisation.countryGroupId,
    currencyId: state.common.internationalisation.currencyId,
    isDisabled: !!state.page.selection.error,
    error: state.page.payPal.error,
    newSignInFlowRebootVariant: state.common.abParticipations.newSignInFlowReboot,
  };

}

const mapDispatchToProps = {
  resetError: payPalContributionButtonActionsFor('CONTRIBUTE_SECTION').resetError,
};


// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(ContributionPaymentCtas);
