// @flow

import React from 'react';
import type {AmazonPayData, State} from "pages/contributions-landing/contributionsLandingReducer";
import {setAmazonPayWalletWidgetReady, setAmazonPayOrderReferenceId, setAmazonPayPaymentSelected} from "pages/contributions-landing/contributionsLandingActions";
import {connect} from "react-redux";
import './AmazonPay.scss';

type PropTypes = {|
  amazonPayData: AmazonPayData,
  setAmazonPayWalletWidgetReady: () => Action,
  setAmazonPayOrderReferenceId: string => Action,
  setAmazonPayPaymentSelected: boolean => Action,
  isTestUser: boolean,
|}

const mapStateToProps = (state: State) => ({
  amazonPayData: state.page.form.amazonPayData,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setAmazonPayWalletWidgetReady: () => dispatch(setAmazonPayWalletWidgetReady),
  setAmazonPayOrderReferenceId:
    (orderReferenceId: string) => dispatch(setAmazonPayOrderReferenceId(orderReferenceId)),
  setAmazonPayPaymentSelected: (paymentSelected: boolean) =>
    dispatch(setAmazonPayPaymentSelected(paymentSelected)),
});

const getSellerId = (isTestUser: boolean): string => isTestUser ?
  window.guardian.amazonPaySellerId.uat :
  window.guardian.amazonPaySellerId.default;

class AmazonPayWalletComponent extends React.Component<PropTypes, void> {
  createWidget(): void {
    this.props.setAmazonPayPaymentSelected(false);  //in case we've previously created a wallet

    new this.props.amazonPayData.amazonPayLibrary.amazonPaymentsObject.Widgets.Wallet({
      sellerId: getSellerId(this.props.isTestUser),
      design: {designMode: 'responsive'},
      onOrderReferenceCreate: (orderReference) => {
        this.props.setAmazonPayOrderReferenceId(orderReference.getAmazonOrderReferenceId())
      },
      onPaymentSelect: (orderReference: string) => {
        this.props.setAmazonPayPaymentSelected(true);
      },
      onError: (error) => {
        console.log("wallet error: ", error.getErrorMessage());
      },
    }).bind("WalletWidgetDiv");

    this.props.setAmazonPayWalletWidgetReady();
  }

  componentDidMount(): void {
    if (this.props.amazonPayData.amazonPayLibrary) {
      this.createWidget();
    }
  }

  componentDidUpdate(): void {
    if (this.props.amazonPayData.amazonPayLibrary && !this.props.amazonPayData.walletWidgetReady) {
      this.createWidget();
    }
  }

  render() {
    if (this.props.amazonPayData.amazonPayLibrary) {
      return (
        <div>
          <div className="walletWidgetDiv" id="WalletWidgetDiv" />
        </div>
      );
    } else {
      <div>
        Wallet not rendering:
      </div>
      //TODO - spinner?
      console.log("amazon wallet widget not ready")
      return null;
    }
  }
}

const AmazonPayWallet = connect(mapStateToProps, mapDispatchToProps)(AmazonPayWalletComponent);

export default AmazonPayWallet;
