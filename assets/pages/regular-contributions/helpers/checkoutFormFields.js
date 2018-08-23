// @flow
import { type PageState as State } from '../regularContributionsReducer'
import { formFieldIsValid } from 'helpers/checkoutForm/checkoutForm';

export function formFields(state: State) {

  const firstNameFromState = {
    value: state.page.user.firstName,
    ...state.page.checkoutForm.firstName,
  };

  const lastNameFromState = {
    value: state.page.user.lastName,
    ...state.page.checkoutForm.lastName,
  };

  const emailFromState = {
    value: state.page.user.email,
    ...state.page.checkoutForm.email,
  };

  const firstName =  {
    value: firstNameFromState.value,
    shouldValidate: firstNameFromState.shouldValidate,
    isValid: formFieldIsValid(firstNameFromState),
  };

  const lastName =  {
    value: lastNameFromState.value,
    shouldValidate: lastNameFromState.shouldValidate,
    isValid: formFieldIsValid(lastNameFromState),
  };

  const email = {
    value: emailFromState.value,
    shouldValidate: emailFromState.shouldValidate,
    isValid: formFieldIsValid(emailFromState),
  };

  return { firstName, lastName, email };
}
