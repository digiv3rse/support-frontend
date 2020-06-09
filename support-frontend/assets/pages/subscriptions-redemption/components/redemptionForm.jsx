// @flow

import React from 'react';
import { css } from '@emotion/core';
import CheckoutLayout, { Content } from 'components/subscriptionCheckouts/layout';
import Form, { FormSection } from 'components/checkoutForm/checkoutForm';
import { connect } from 'react-redux';
import type { Action, RedemptionPageState } from 'pages/subscriptions-redemption/subscriptionsRedemptionReducer';
import { Input } from 'components/forms/input';
import { compose, type Dispatch } from 'redux';
import { asControlled } from 'hocs/asControlled';
import Button from 'components/button/button';
import ProductSummary from 'pages/subscriptions-redemption/components/productSummary/productSummary';
import { validateUserCode } from 'pages/subscriptions-redemption/api';
import type { Option } from 'helpers/types/option';
import { doesUserAppearToBeSignedIn } from 'helpers/user/user';
import { withValidation } from 'hocs/withValidation';

type PropTypes = {
  userCode: Option<string>,
  error: Option<string>,
  setUserCode: string => void,
  validateCode: string => void,
}

function mapStateToProps(state: RedemptionPageState) {
  return {
    userCode: state.page.userCode,
    error: state.page.error,
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
  return {
    setUserCode: (userCode: string) => validateUserCode(userCode, dispatch),
    submit: () => submitForm(),
  };
}

const InputWithValidated = compose(asControlled, withValidation)(Input);

function RedemptionForm(props: PropTypes) {
  const formCss = css`
    min-height: 550px;
  `;
  const paraCss = css`
    margin-bottom: 16px;
  `;

  const validationText = props.error ? null : 'This code is valid';
  const signinInstructions = doesUserAppearToBeSignedIn() ? '' :
    'On the next screen you will be prompted to set up a Guardian user account';

  return (
    <div>
      <Content>
        <CheckoutLayout aside={(
          <ProductSummary />
        )}
        >
          <Form onSubmit={(ev) => {
            ev.preventDefault();
          }}
          >
            <FormSection title="Welcome to The Guardian Digital Subscriptions">
              <div css={formCss}>
                <p css={paraCss}>
                  Activate your offer with the unique access code provided
                </p>
                <InputWithValidated
                  id="redemption-code"
                  type="text"
                  autoComplete="off"
                  value={props.userCode}
                  setValue={props.setUserCode}
                  error={props.error}
                  valid={validationText}
                />
                <p css={paraCss}>
                  {signinInstructions}
                </p>
                <Button id="submit-button" onClick={() => props.validateCode(props.userCode || '')}>
                  Activate
                </Button>
              </div>
            </FormSection>
          </Form>
        </CheckoutLayout>
      </Content>
    </div>
  );
}

// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(RedemptionForm);
