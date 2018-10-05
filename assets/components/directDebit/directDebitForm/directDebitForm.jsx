// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import ErrorMessage from 'components/errorMessage/errorMessage';
import SortCodeInput from 'components/directDebit/directDebitForm/sortCodeInput';
import DirectDebitGuarantee from 'components/directDebit/directDebitForm/directDebitGuarantee';
import {
  updateSortCode,
  updateAccountNumber,
  updateAccountHolderName,
  updateAccountHolderConfirmation,
  confirmDirectDebitClicked,
  openDirectDebitGuarantee,
  closeDirectDebitGuarantee,
  payDirectDebitClicked,
  setDirectDebitFormPhase,
} from 'components/directDebit/directDebitActions';
import type { SortCodeIndex, Phase, Action } from 'components/directDebit/directDebitActions';
import SvgDirectDebitSymbol from 'components/svgs/directDebitSymbol';
import SvgDirectDebitSymbolAndText from 'components/svgs/directDebitSymbolAndText';
import SvgArrowRightStraight from 'components/svgs/arrowRightStraight';
import SvgExclamationAlternate from 'components/svgs/exclamationAlternate';
import { contributionsEmail } from 'helpers/legal';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import type { PaymentAuthorisation } from 'helpers/paymentIntegrations/newPaymentFlow/readerRevenueApis';

// ---- Types ----- //

type PropTypes = {
  onPaymentAuthorisation: PaymentAuthorisation => void,
  isDDGuaranteeOpen: boolean,
  sortCodeArray: Array<string>,
  accountNumber: string,
  accountHolderName: string,
  accountHolderConfirmation: boolean,
  updateSortCode: (index: SortCodeIndex, event: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountNumber: (accountNumber: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountHolderName: (accountHolderName: SyntheticInputEvent<HTMLInputElement>) => void,
  updateAccountHolderConfirmation: (accountHolderConfirmation: SyntheticInputEvent<HTMLInputElement>) => void,
  openDDGuaranteeClicked: () => void,
  closeDDGuaranteeClicked: () => void,
  formError: string,
  phase: Phase,
  payDirectDebitClicked: () => void,
  editDirectDebitClicked: () => void,
  confirmDirectDebitClicked: (onPaymentAuthorisation: PaymentAuthorisation => void) => void,
  countryGroupId: CountryGroupId,
};


// ----- Map State/Props ----- //

function mapStateToProps(state) {
  return {
    isDDGuaranteeOpen: state.page.directDebit.isDDGuaranteeOpen,
    sortCodeArray: state.page.directDebit.sortCodeArray,
    accountNumber: state.page.directDebit.accountNumber,
    accountHolderName: state.page.directDebit.accountHolderName,
    accountHolderConfirmation: state.page.directDebit.accountHolderConfirmation,
    formError: state.page.directDebit.formError,
    phase: state.page.directDebit.phase,
    countryGroupId: state.common.internationalisation.countryGroupId,
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
    confirmDirectDebitClicked: (onPaymentAuthorisation: PaymentAuthorisation => void) => {
      dispatch(confirmDirectDebitClicked(onPaymentAuthorisation));
      return false;
    },
    openDDGuaranteeClicked: () => {
      dispatch(openDirectDebitGuarantee());
    },
    closeDDGuaranteeClicked: () => {
      dispatch(closeDirectDebitGuarantee());
    },
    updateSortCode: (index: SortCodeIndex, event: SyntheticInputEvent<HTMLInputElement>) => {
      dispatch(updateSortCode(index, event.target.value));
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

// ----- Component ----- //

const DirectDebitForm = (props: PropTypes) => (
  <div className="component-direct-debit-form">

    <AccountHolderNameInput
      phase={props.phase}
      onChange={props.updateAccountHolderName}
      value={props.accountHolderName}
    />

    <AccountNumberInput
      phase={props.phase}
      onChange={props.updateAccountNumber}
      value={props.accountNumber}
    />

    <SortCodeInput
      phase={props.phase}
      onChange={props.updateSortCode}
      sortCodeArray={props.sortCodeArray}
    />

    <ConfirmationInput
      phase={props.phase}
      onChange={props.updateAccountHolderConfirmation}
      checked={props.accountHolderConfirmation}
    />

    <PaymentButton
      phase={props.phase}
      onPayClick={() => props.payDirectDebitClicked()}
      onEditClick={() => props.editDirectDebitClicked()}
      onConfirmClick={() => props.confirmDirectDebitClicked(props.onPaymentAuthorisation)}
    />

    <ErrorMessage
      message={props.formError}
      svg={<SvgExclamationAlternate />}
    />

    <LegalNotice countryGroupId={props.countryGroupId} />

    <DirectDebitGuarantee
      isDDGuaranteeOpen={props.isDDGuaranteeOpen}
      openDDGuaranteeClicked={props.openDDGuaranteeClicked}
      closeDDGuaranteeClicked={props.closeDDGuaranteeClicked}
    />
  </div>
);


// ----- Auxiliary components ----- //

function AccountNumberInput(props: {phase: Phase, onChange: Function, value: string}) {
  const editable = (
    <input
      id="account-number-input"
      value={props.value}
      onChange={props.onChange}
      pattern="[0-9]*"
      minLength="6"
      maxLength="10"
      className="component-direct-debit-form__text-field focus-target"
    />
  );
  const locked = (
    <span>
      {props.value}
    </span>
  );
  return (
    <div className="component-direct-debit-form__account-number">
      <label htmlFor="account-number-input" className="component-direct-debit-form__field-label">
        Account number
      </label>
      {props.phase === 'entry' ? editable : locked}
    </div>
  );
}

/*
 * BACS requirement:
 "Name of the account holder, as known by the bank. Usually this is the
 same as the name stored with the linked creditor. This field will be
 transliterated, upcased and truncated to 18 characters."
 https://developer.gocardless.com/api-reference/
 * */
function AccountHolderNameInput(props: {phase: Phase, value: string, onChange: Function}) {
  const editable = (
    <input
      id="account-holder-name-input"
      value={props.value}
      onChange={props.onChange}
      maxLength="40"
      className="component-direct-debit-form__text-field focus-target"
    />
  );

  const locked = (
    <span>
      {props.value}
    </span>
  );

  return (
    <div className="component-direct-debit-form__account-holder-name">
      <label htmlFor="account-holder-name-input" className="component-direct-debit-form__field-label">
        Name
      </label>
      {props.phase === 'entry' ? editable : locked}
    </div>
  );
}

function ConfirmationInput(props: {phase: Phase, checked: boolean, onChange: Function }) {
  const editable = (
    <span>
      <div className="component-direct-debit-form__confirmation-css-checkbox">
        <input
          className="component-direct-debit-form__confirmation-input"
          id="confirmation-input"
          type="checkbox"
          onChange={props.onChange}
          checked={props.checked}
        />
        <label
          className="component-direct-debit-form__confirmation-label"
          htmlFor="confirmation-input"
        />
      </div>
      <span className="component-direct-debit-form__confirmation-text">
        I confirm that I am the account holder and I am solely able to authorise debit from
        the account
      </span>
    </span>
  );

  const locked = (
    <span>
      <label htmlFor="confirmation-text__locked" className="component-direct-debit-form__field-label">
        Declaration
      </label>
      <div id="confirmation-text__locked" className="component-direct-debit-form__confirmation-text__locked">
        I have confirmed that I am the account holder and that I am solely able to authorise debit
        from the account
      </div>
      <div className="component-direct-debit-form__confirmation-guidance">
        If the details above are correct press confirm to set up your direct debit, otherwise press
        back to make changes
      </div>
    </span>
  );

  return (
    <div className="component-direct-debit-form__account-holder-confirmation">
      <div>
        <label htmlFor="confirmation-input">
          {props.phase === 'entry' ? editable : locked}
        </label>
      </div>
    </div>
  );
}

function PaymentButton(props: {
  phase: Phase,
  onPayClick: Function,
  onEditClick: Function,
  onConfirmClick: Function
}) {
  if (props.phase === 'entry') {
    return (
      <button
        className="component-direct-debit-form__cta component-direct-debit-form__cta--pay-button focus-target"
        onClick={props.onPayClick}
      >
        <SvgDirectDebitSymbol />
        <span className="component-direct-debit-form__cta-text">
          Contribute with Direct Debit
        </span>
        <SvgArrowRightStraight />
      </button>
    );
  }
  if (props.phase === 'confirmation') {
    return (
      <span>
        <button
          className="component-direct-debit-form__cta component-direct-debit-form__cta--edit-button focus-target"
          onClick={props.onEditClick}
        >
          <SvgArrowRightStraight />
          <span className="component-direct-debit-form__cta-text component-direct-debit-form__cta-text--inverse">Back</span>
        </button>
        <button
          className="component-direct-debit-form__cta component-direct-debit-form__cta--confirm-button focus-target"
          onClick={props.onConfirmClick}
        >
          <span className="component-direct-debit-form__cta-text">Confirm</span>
          <SvgArrowRightStraight />
        </button>
      </span>
    );
  }
}

function LegalNotice(props: { countryGroupId: CountryGroupId }) {
  return (
    <div className="component-direct-debit-form__legal-notice">
      <p><strong>Advance notice</strong> The details of your Direct Debit instruction including
        payment schedule, due date, frequency and amount will be sent to you within three working
        days. All the normal Direct Debit safeguards and guarantees apply.
      </p>
      <strong>Direct Debit</strong>
      <p>
        The Guardian, Unit 16, Coalfield Way, Ashby Park, Ashby-De-La-Zouch,
        LE65 1JT United Kingdom<br />
        Tel: 0330 333 6767 (within UK). Lines are open 8am-8pm on weekdays,
        8am-6pm at weekends (GMT/BST)<br />
        <a href={contributionsEmail[props.countryGroupId]}>{contributionsEmail[props.countryGroupId].replace('mailto:', '')}</a>
      </p>
      <SvgDirectDebitSymbolAndText />
    </div>
  );
}

// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(DirectDebitForm);

