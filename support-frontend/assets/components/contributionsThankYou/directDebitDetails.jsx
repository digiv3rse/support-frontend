// @flow

// ----- Imports ----- //

import React from 'react';

import DirectDebitGuarantee from 'components/directDebit/directDebitForm/directDebitGuarantee';
import PageSection from 'components/pageSection/pageSection';

import DirectDebitPaymentMethodDetails from './directDebitPaymentMethodDetails';


// ----- Types ----- //

export type PropTypes = {
  isDDGuaranteeOpen: boolean,
  accountNumber: string,
  accountHolderName: string,
  sortCodeArray: string[],
  openDDGuaranteeClicked: () => void,
  closeDDGuaranteeClicked: () => void,
};


// ----- Component ----- //

export default function DirectDebitDetails(props: PropTypes) {
  return (
    <div className="component-direct-debit-details">
      <DirectDebitPaymentMethodDetails
        accountHolderName={props.accountHolderName}
        sortCodeArray={props.sortCodeArray}
        accountNumber={props.accountNumber}
      />
      <PageSection modifierClass="direct-debit-guarantee">
        <DirectDebitGuarantee
          isDDGuaranteeOpen={props.isDDGuaranteeOpen}
          openDDGuaranteeClicked={props.openDDGuaranteeClicked}
          closeDDGuaranteeClicked={props.closeDDGuaranteeClicked}
        />
      </PageSection>
    </div>
  );
}
