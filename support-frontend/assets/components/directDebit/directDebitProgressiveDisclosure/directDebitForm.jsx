// @flow

// ----- Imports ----- //

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { type Dispatch } from 'redux';
import {
  type Action,
  type Phase,
  payDirectDebitClicked,
  setDirectDebitFormPhase,
  updateAccountHolderName,
  updateAccountNumber,
  updateSortCodeString,
  updateAccountHolderConfirmation,
} from 'components/directDebit/directDebitActions';
import Form from './components/form';
import Playback from './components/playback';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { type ErrorReason } from 'helpers/forms/errorReasons';


// ---- Types ----- //

type PropTypes = {|
  buttonText: string,
  submissionErrorHeading: string,
  submissionError: ErrorReason | null,
  allErrors: Array<Object>,
  sortCodeString: string,
  accountNumber: string,
  accountHolderName: string,
  accountHolderConfirmation: boolean,
  updateSortCodeString: (event: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountNumber: (accountNumber: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountHolderName: (accountHolderName: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountHolderConfirmation: (accountHolderConfirmation: SyntheticInputEvent<HTMLInputElement>) => void,
  submitForm: Function,
  payDirectDebitClicked: () => void,
  editDirectDebitClicked: () => void,
  countryGroupId: CountryGroupId,
  phase: Phase,
  formError: ErrorReason | null,
|};

type Error ={
  error: string,
  message: string,
  rule: Function,
}

type StateTypes = {
  accountHolderName: Error,
  sortCodeString: Error,
  accountNumber: Error,
  accountHolderConfirmation: Error,
  accountErrorsLength: number,
  allErrors: Array<Object>,
  allErrorsLength: number,
  canSubmit: boolean,
}


// ----- Map State/Props ----- //

function mapStateToProps(state) {
  return {
    sortCodeString: state.page.directDebit.sortCodeString,
    accountNumber: state.page.directDebit.accountNumber,
    accountHolderName: state.page.directDebit.accountHolderName,
    accountHolderConfirmation: state.page.directDebit.accountHolderConfirmation,
    formError: state.page.directDebit.formError,
    countryGroupId: state.common.internationalisation.countryGroupId,
    phase: state.page.directDebit.phase,
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {

  return {
    payDirectDebitClicked: () => {
      dispatch(payDirectDebitClicked());
      return false;
    },
    editDirectDebitClicked: () => {
      dispatch(setDirectDebitFormPhase('entry'));
    },
    updateSortCodeString: (event: SyntheticInputEvent<HTMLInputElement>) => {
      dispatch(updateSortCodeString(event.target.value));
    },
    updateAccountNumber: (event: SyntheticInputEvent<HTMLInputElement>) => {
      const accountNumber: string = event.target.value;
      dispatch(updateAccountNumber(accountNumber));
    },
    updateAccountHolderName: (event: SyntheticInputEvent<HTMLInputElement>) => {
      const accountHolderName: string = event.target.value;
      dispatch(updateAccountHolderName(accountHolderName));
    },
    updateAccountHolderConfirmation: (event: SyntheticInputEvent<HTMLInputElement>) => {
      const accountHolderConfirmation: boolean = event.target.checked;
      dispatch(updateAccountHolderConfirmation(accountHolderConfirmation));
    },
  };

}

const fieldNames = [
  'accountHolderName',
  'sortCodeString',
  'accountNumber',
  'accountHolderConfirmation',
];


// ----- Component ----- //

class DirectDebitForm extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      accountHolderName: {
        error: '',
        message: 'Please enter a valid account name',
        // Regex matches a string with any character that is not a digit
        rule: accountHolderName => accountHolderName.match(/^\D+$/),
      },
      sortCodeString: {
        error: '',
        message: 'Please enter a valid sort code',
        // Regex matches a string with exactly 6 digits
        rule: sortCodeString => sortCodeString.match(/^\d{6}$/),
      },
      accountNumber: {
        error: '',
        message: 'Please enter a valid account number',
        // Regex matches a string with between 6 and 8 digits
        rule: accountNumber => accountNumber.match(/^\d{6,8}$/),
      },
      accountHolderConfirmation: {
        error: '',
        message: 'Please confirm you are the account holder',
        rule: accountHolderConfirmation => accountHolderConfirmation === true,
      },
      allErrors: [],
      accountErrorsLength: 0,
      allErrorsLength: 0,
      canSubmit: false,
    };
  }

  onChange = (field, dispatchUpdate, event) => {
    this.setState({
      [field]: {
        ...this.state[field],
        error: '',
      },
    }, this.getAccountErrors);
    dispatchUpdate(event);
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.submitForm();
  }

  getAccountErrors = () => {
    const cardErrors = [];
    fieldNames.forEach((field) => {
      if (this.state[field].error.length > 0) {
        cardErrors.push({ message: this.state[field].error });
      }
    });
    this.setState({
      allErrors: cardErrors,
    });
  }

  getAccountErrorsLength = () => {
    let accum = 0;
    this.state.allErrors.forEach((item) => {
      if ((item.message).length > 0) {
        accum += 1;
      }
    });
    return accum;
  }

  handleErrorsAndCheckAccount = (event) => {
    event.preventDefault();
    const { props } = this;

    // Build up a new state for the fields and the error count
    const updatedStateWithErrors = fieldNames.reduce((updatedState, fieldName) => {
      const hasError = !this.state[fieldName].rule(props[fieldName]);

      if (hasError) {
        return {
          ...updatedState,
          accountErrorsLength: updatedState.accountErrorsLength + 1,
          [fieldName]: {
            ...this.state[fieldName],
            error: this.state[fieldName].message,
          },
        };
      }
      return {
        ...updatedState,
        [fieldName]: {
          ...this.state[fieldName],
        },
      };
    }, { accountErrorsLength: 0 });

    this.setState(
      updatedStateWithErrors,
      () => {
        if (this.state.accountErrorsLength === 0) {
          props.payDirectDebitClicked();
        }
      },
    );
  }

  render() {
    const { props, state } = this;
    const accountErrorsLength = this.getAccountErrorsLength();
    const showGeneralError = props.allErrors.length === 0 && accountErrorsLength === 0 &&
    (props.submissionError !== null || (props.formError !== null && props.formError.length > 0));

    return (
      <span>
        {props.phase === 'entry' && (
          <Form
            {...props}
            showGeneralError={showGeneralError}
            accountErrors={this.state.allErrors}
            accountErrorsLength={accountErrorsLength}
            accountHolderNameError={state.accountHolderName.error}
            accountNumberError={state.accountNumber.error}
            sortCodeError={state.sortCodeString.error}
            accountHolderConfirmationError={state.accountHolderConfirmation.error}
            onChange={this.onChange}
            onSubmit={this.handleErrorsAndCheckAccount}
          />
        )}
        {props.phase === 'confirmation' && (
          <Playback
            editDirectDebitClicked={props.editDirectDebitClicked}
            onSubmit={this.onSubmit}
            accountHolderName={props.accountHolderName}
            accountNumber={props.accountNumber}
            sortCodeString={props.sortCodeString}
            buttonText={props.buttonText}
            allErrors={props.allErrors}
          />
        )}
      </span>
    );
  }
}

// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(DirectDebitForm);
