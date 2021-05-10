// ----- Imports ----- //
import React from "react";
import { Provider } from "react-redux";
import { renderPage } from "helpers/render";
import { init as pageInit } from "helpers/page/page";
import Page from "components/page/page";
import DigitalFooter from "components/footerCompliant/DigitalFooter";
import ThankYouContent from "pages/digital-subscription-checkout/thankYouContainer";
import ThankYouGift from "pages/digital-subscription-checkout/thankYouGift";
import ThankYouPendingContent from "./thankYouPendingContent";
import CheckoutForm from "pages/digital-subscription-checkout/components/digitalCheckoutForm";
import CheckoutFormGift from "pages/digital-subscription-checkout/components/digitalCheckoutFormGift";
import "stylesheets/skeleton/skeleton.scss";
import CheckoutStage from "components/subscriptionCheckouts/stage";
import "./digitalSubscriptionCheckout.scss";
import { getQueryParameter } from "helpers/url";
import type { DigitalBillingPeriod, DigitalGiftBillingPeriod } from "helpers/billingPeriods";
import { Monthly, Annual, Quarterly } from "helpers/billingPeriods";
import { createCheckoutReducer } from "helpers/subscriptionsForms/subscriptionCheckoutReducer";
import type { CommonState } from "helpers/page/commonReducer";
import { DigitalPack } from "helpers/subscriptions";
import HeaderWrapper from "components/subscriptionCheckouts/headerWrapper";
import MarketingConsent from "components/subscriptionCheckouts/thankYou/marketingConsentContainer";
import MarketingConsentGift from "components/subscriptionCheckouts/thankYou/marketingConsentContainerGift";
import { FocusStyleManager } from "@guardian/src-utilities";

// ----- Redux Store ----- //
function getInitialBillingPeriod(periodInUrl?: string): DigitalBillingPeriod | DigitalGiftBillingPeriod {
  const {
    orderIsAGift
  } = window.guardian;

  switch (periodInUrl) {
    case 'Monthly':
      return Monthly;

    case 'Quarterly':
      return Quarterly;

    case 'Annual':
      return Annual;

    default:
      if (orderIsAGift) {
        return Quarterly;
      }

      return Monthly;
  }
}

const billingPeriodInUrl = getQueryParameter('period');
const initialBillingPeriod = getInitialBillingPeriod(billingPeriodInUrl || '');

const reducer = (commonState: CommonState) => createCheckoutReducer(commonState.internationalisation.countryId, DigitalPack, initialBillingPeriod, null, null, null);

const store = pageInit(reducer, true);
const {
  countryGroupId
} = store.getState().common.internationalisation;
const {
  orderIsAGift
} = store.getState().page.checkout;
const thankyouProps = {
  countryGroupId,
  marketingConsent: orderIsAGift ? <MarketingConsentGift /> : <MarketingConsent />
};
FocusStyleManager.onlyShowFocusOnTabs();
// ----- Render ----- //
const content = orderIsAGift ? <Provider store={store}>
      <Page header={<HeaderWrapper />} footer={<DigitalFooter orderIsAGift />}>
        <CheckoutStage checkoutForm={<CheckoutFormGift />} thankYouContentPending={<ThankYouGift {...thankyouProps} pending />} thankYouContent={<ThankYouGift {...thankyouProps} />} subscriptionProduct="DigitalPack" />
      </Page>
    </Provider> : <Provider store={store}>
      <Page header={<HeaderWrapper />} footer={<DigitalFooter orderIsAGift={false} />}>
        <CheckoutStage checkoutForm={<CheckoutForm />} thankYouContentPending={<ThankYouPendingContent includePaymentCopy {...thankyouProps} />} thankYouContent={<ThankYouContent {...thankyouProps} />} subscriptionProduct="DigitalPack" />
      </Page>
    </Provider>;
renderPage(content, 'digital-subscription-checkout-page');