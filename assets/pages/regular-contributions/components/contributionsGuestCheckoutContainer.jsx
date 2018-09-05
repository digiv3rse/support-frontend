// @flow

// ----- Imports ----- //

import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { type UserFormFieldAttribute } from 'helpers/checkoutForm/checkoutForm';
import ContributionsGuestCheckout from './contributionsGuestCheckout';
import { type State } from '../regularContributionsReducer';
import { getFormFields } from '../helpers/checkoutForm/checkoutFormFieldsSelector';
import {
  setEmailShouldValidate,
  setFirstNameShouldValidate,
  setLastNameShouldValidate,
  setStage,
} from '../helpers/checkoutForm/checkoutFormActions';
import { type Action as CheckoutAction } from '../helpers/checkoutForm/checkoutFormActions';


// ----- Functions ----- //

const setShouldValidateFunctions = [
  setFirstNameShouldValidate,
  setLastNameShouldValidate,
  setEmailShouldValidate,
];

const submitYourDetailsForm = (dispatch: Dispatch<CheckoutAction>, formFields: Array<UserFormFieldAttribute>) => {
  const formIsValid = formFields.every(el => el.isValid);
  if (formIsValid) {
    dispatch(setStage('payment'));
  } else {
    setShouldValidateFunctions.forEach(f => dispatch(f()));
  }
};

// ----- State Maps ----- //

function mapStateToProps(state: State) {

  const { firstName, lastName, email } = getFormFields(state);


  return {
    amount: state.page.regularContrib.amount,
    currencyId: state.common.internationalisation.currencyId,
    country: state.common.internationalisation.countryId,
    displayName: state.page.user.displayName,
    isSignedIn: state.page.user.isSignedIn,
    stage: state.page.checkoutForm.stage,
    firstName,
    lastName,
    email,
  };
}

const mapDispatchToProps = (dispatch: Dispatch<CheckoutAction>) => ({
  dispatch,
  onBackClick: () => {
    dispatch(setStage('checkout'));
  },
});


function mergeProps(stateProps, dispatchProps, ownProps) {

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onNextButtonClick:
      () => submitYourDetailsForm(
        dispatchProps.dispatch,
        [stateProps.firstName, stateProps.lastName, stateProps.email],
      ),
  };
}


// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ContributionsGuestCheckout);
