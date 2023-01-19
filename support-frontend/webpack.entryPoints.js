module.exports = {
  common: {
    favicons: 'images/favicons.ts',
    showcasePage: 'pages/showcase/showcase.tsx',
    subscriptionsLandingPage: 'pages/subscriptions-landing/subscriptionsLanding.tsx',
    supporterPlusLandingPage: 'pages/supporter-plus-landing/supporterPlusRouter.tsx',
    digitalSubscriptionLandingPage: 'pages/digital-subscription-landing/digitalSubscriptionLanding.tsx',
    digitalSubscriptionCheckoutPage: 'pages/digital-subscription-checkout/digitalSubscriptionCheckout.tsx',
    digitalSubscriptionCheckoutPageThankYouExisting: 'pages/digital-subscription-checkout/thankYouExisting.tsx',
    paperSubscriptionLandingPage: 'pages/paper-subscription-landing/paperSubscriptionLandingPage.tsx',
    paperSubscriptionCheckoutPage: 'pages/paper-subscription-checkout/paperSubscriptionCheckout.tsx',
    weeklySubscriptionLandingPage: 'pages/weekly-subscription-landing/weeklySubscriptionLanding.tsx',
    weeklySubscriptionCheckoutPage: 'pages/weekly-subscription-checkout/weeklySubscriptionCheckout.tsx',
    subscriptionsRedemptionPage: 'pages/subscriptions-redemption/subscriptionsRedemption.tsx',
    payPalErrorPage: 'pages/paypal-error/payPalError.tsx',
    payPalErrorPageStyles: 'pages/paypal-error/payPalError.scss',
    error404Page: 'pages/error/error404.tsx',
    error500Page: 'pages/error/error500.tsx',
    downForMaintenancePage: 'pages/error/maintenance.tsx',
    unsupportedBrowserStyles: 'stylesheets/fallback-pages/unsupportedBrowser.scss',
    contributionsRedirectStyles: 'stylesheets/fallback-pages/contributionsRedirect.scss',
    promotionTerms: 'pages/promotion-terms/promotionTerms.tsx',
    ausMomentMap: 'pages/aus-moment-map/ausMomentMap.tsx',
  },
  ssr: {
    ssrPages: 'helpers/rendering/ssrPages.ts',
  },
};
