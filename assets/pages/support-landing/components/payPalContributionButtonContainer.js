// @flow

// ----- Imports ----- //

import { connect } from 'react-redux';

import PayPalContributionButton from 'containerisableComponents/payPalContributionButton/payPalContributionButton';
import { payPalContributionButtonActionsFor } from 'containerisableComponents/payPalContributionButton/payPalContributionButtonActions';
import { getAmount } from 'containerisableComponents/contributionSelection/contributionSelectionReducer';

import type { State } from '../supportLandingReducer';


// ----- State Maps ----- //

function mapStateToProps(state: State) {
  return {
    amount: getAmount(state.page.selection),
    countryGroupId: state.common.countryGroup,
    referrerAcquisitionData: state.common.referrerAcquisitionData,
    abParticipations: state.common.abParticipations,
    isoCountry: state.common.country,
    canClick: !state.page.selection.error,
  };

}

const mapDispatchToProps = {
  errorHandler: payPalContributionButtonActionsFor('CONTRIBUTE_SECTION').setError,
};


// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(PayPalContributionButton);
