// @flow

import React from 'react';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { TextInput } from '@guardian/src-text-input';
import { Checkbox } from '@guardian/src-checkbox';
import { CheckboxGroup } from '@guardian/src-checkbox';
import { isValidIban } from 'helpers/forms/formValidation';

// -- Styles -- //

const containerStyles = css`
  padding-top: ${space[5]}px;
`;

const headerStyles = css`
  ${headline.xxxsmall({ fontWeight: 'bold' })}
`;

const fieldsContainerStyles = css`
  margin-top: ${space[4]}px;
  > * + * {
    margin-top: ${space[3]}px;
  }
`;

const checkboxContainerStyles = css`
  margin-top: ${space[5]}px;
`;

// -- Component -- //

type DirectDebitFormProps = {|
  iban: string | null,
  accountHolderName: string | null,
  accountHolderConfirmation: boolean,
  updateIban: (iban: string) => void,
  updateAccountHolderName: (accountHolderName: string) => void,
  updateAccountHolderConfirmation: (accountHolderConfirmation: boolean) => void,
  checkoutFormHasBeenSubmitted: boolean,
|};

export function SepaForm({
  iban,
  accountHolderName,
  accountHolderConfirmation,
  updateIban,
  updateAccountHolderName,
  updateAccountHolderConfirmation,
  checkoutFormHasBeenSubmitted,
}: DirectDebitFormProps) {

  return (
    <div css={containerStyles}>
      <h3 css={headerStyles}>Your account details</h3>

      <div css={fieldsContainerStyles}>
        <div>
          <TextInput
            label="Bank account holder name"
            maxLength="40"
            value={accountHolderName}
            onChange={e => updateAccountHolderName(e.target.value)}
            error={checkoutFormHasBeenSubmitted && !accountHolderName ? 'Please provide your account holder name' : null}
          />
        </div>

        <div />

        <div>
          <TextInput
            label="IBAN"
            pattern="[0-9A-Z]*"
            minLength="6"
            maxLength="34"
            value={iban}
            onChange={e => updateIban(e.target.value)}
            error={checkoutFormHasBeenSubmitted && !isValidIban(iban) ? 'Please provide a valid IBAN' : null}
          />
        </div>
      </div>

      <div css={checkboxContainerStyles}>
        <CheckboxGroup
          error={checkoutFormHasBeenSubmitted && !accountHolderConfirmation ? 'Please click the consent checkbox' : null}
        >
          <Checkbox
            supporting="By checking this box, you agree that you have read and understood the details of this mandate and that you append your signature to it"
            checked={accountHolderConfirmation}
            onChange={e => updateAccountHolderConfirmation(e.target.checked)}
          />
        </CheckboxGroup>
      </div>
    </div>
  );
}
