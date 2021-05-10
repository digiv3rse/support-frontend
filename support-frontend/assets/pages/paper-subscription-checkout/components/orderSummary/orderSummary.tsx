import { $Call } from "utility-types";
import React from "react";
import { connect } from "react-redux";
type GridImageType = typeof import("components/gridImage/gridImage").default;
import { type GridImg } from "components/gridImage/gridImage";
import OrderSummary from "components/orderSummary/orderSummary";
import OrderSummaryProduct from "components/orderSummary/orderSummaryProduct";
import { paperProductsWithoutDigital, type ProductOptions } from "helpers/productPrice/productOptions";
import { Collection, type FulfilmentOptions } from "helpers/productPrice/fulfilmentOptions";
import type { ActivePaperProducts } from "helpers/productPrice/productOptions";
import type { WithDeliveryCheckoutState } from "helpers/subscriptionsForms/subscriptionCheckoutReducer";
import { getProductPrice } from "helpers/productPrice/paperProductPrices";
import { showPrice, type ProductPrices, type ProductPrice } from "helpers/productPrice/productPrices";
import type { BillingPeriod } from "helpers/billingPeriods";
import { getOrderSummaryTitle, getPriceSummary } from "pages/paper-subscription-checkout/helpers/orderSummaryText";
type PropTypes = {
  fulfilmentOption: FulfilmentOptions;
  productOption: ActivePaperProducts;
  billingPeriod: BillingPeriod;
  productPrices: ProductPrices;
  digiSubPrice: string;
  image: $Call<GridImageType, GridImg>;
  includesDigiSub: boolean;
  changeSubscription?: string | null;
  startDate?: string;
  total: ProductPrice;
};

function getMobileSummaryTitle(productOption: ProductOptions, fulfilmentOption: FulfilmentOptions, includesDigiSub: boolean | null | undefined = false) {
  return <>
    {getOrderSummaryTitle(productOption, fulfilmentOption)}
    {includesDigiSub && <> +&nbsp;digital</>}
  </>;
}

function mapStateToProps(state: WithDeliveryCheckoutState) {
  return {
    fulfilmentOption: state.page.checkout.fulfilmentOption,
    productOption: state.page.checkout.productOption,
    billingPeriod: state.page.checkout.billingPeriod,
    productPrices: state.page.checkout.productPrices,
    total: getProductPrice(state.page.checkout.productPrices, state.page.checkout.fulfilmentOption, state.page.checkout.productOption)
  };
}

function PaperOrderSummary(props: PropTypes) {
  const rawTotal = getPriceSummary(showPrice(props.total, false), props.billingPeriod);
  const cleanedTotal = rawTotal.replace(/\/(.*)/, ''); // removes anything after the /

  const total = `${cleanedTotal} per month`;
  // If the user has added a digi sub, we need to know the price of their selected base paper product separately
  const basePaperPrice = props.includesDigiSub ? getProductPrice(props.productPrices, props.fulfilmentOption, paperProductsWithoutDigital[props.productOption]) : props.total;
  const rawPrice = getPriceSummary(showPrice(basePaperPrice, false), props.billingPeriod);
  const cleanedPrice = rawPrice.replace(/\/(.*)/, ''); // removes anything after the /

  const accessiblePriceString = `${cleanedPrice} per month`;
  const productInfoHomeDelivery = [{
    content: `You'll pay ${accessiblePriceString}`
  }];
  const productInfoSubsCard = [...productInfoHomeDelivery, {
    content: props.startDate ? `Your first payment will be on ${props.startDate}` : '',
    subText: 'Your subscription card will arrive in the post before the payment date'
  }];
  const productInfoPaper = props.fulfilmentOption === Collection ? productInfoSubsCard : productInfoHomeDelivery;
  const productInfoDigiSub = [{
    content: `You'll pay ${props.digiSubPrice}`
  }];
  const mobileSummary = {
    title: getMobileSummaryTitle(props.productOption, props.fulfilmentOption, props.includesDigiSub),
    price: total
  };
  return <OrderSummary image={props.image} changeSubscription={props.changeSubscription} total={total} mobileSummary={mobileSummary}>
      <OrderSummaryProduct productName={getOrderSummaryTitle(props.productOption, props.fulfilmentOption)} productInfo={productInfoPaper} />
      {props.includesDigiSub && <OrderSummaryProduct productName="Digital subscription" productInfo={productInfoDigiSub} />}
    </OrderSummary>;
}

PaperOrderSummary.defaultProps = {
  changeSubscription: '',
  startDate: ''
};
export default connect(mapStateToProps)(PaperOrderSummary);