module.exports = {
  common: {
    favicons: 'images/favicons.ts',
    subscriptionsLandingPage: 'pages/subscriptions-landing/subscriptionsLanding.tsx',
    supporterPlusLandingPage: 'pages/supporter-plus-landing/supporterPlusRouter.tsx',
    paperSubscriptionLandingPage: 'pages/paper-subscription-landing/paperSubscriptionLandingPage.tsx',
    paperSubscriptionCheckoutPage: 'pages/paper-subscription-checkout/paperSubscriptionCheckout.tsx',
    weeklySubscriptionLandingPage: 'pages/weekly-subscription-landing/weeklySubscriptionLanding.tsx',
    weeklySubscriptionCheckoutPage: 'pages/weekly-subscription-checkout/weeklySubscriptionCheckout.tsx',
    subscriptionsRedemptionPage: 'pages/subscriptions-redemption/subscriptionsRedemption.tsx',
    kindleSubscriptionLandingPage: 'pages/kindle-subscriber-checkout/kindleSubscriptionRouter.tsx',
    payPalErrorPage: 'pages/paypal-error/payPalError.tsx',
    payPalErrorPageStyles: 'pages/paypal-error/payPalError.scss',
    error404Page: 'pages/error/error404.tsx',
    error500Page: 'pages/error/error500.tsx',
    downForMaintenancePage: 'pages/error/maintenance.tsx',
    unsupportedBrowserStyles: 'stylesheets/fallback-pages/unsupportedBrowser.scss',
    contributionsRedirectStyles: 'stylesheets/fallback-pages/contributionsRedirect.scss',
    promotionTerms: 'pages/promotion-terms/promotionTerms.tsx',
  },
  ssr: {
    ssrPages: 'helpers/rendering/ssrPages.ts',
  },
};
