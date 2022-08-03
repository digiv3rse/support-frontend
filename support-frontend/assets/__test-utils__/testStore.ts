import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import type { BillingPeriod } from 'helpers/productPrice/billingPeriods';
import type { FulfilmentOptions } from 'helpers/productPrice/fulfilmentOptions';
import type { ProductOptions } from 'helpers/productPrice/productOptions';
import type { SubscriptionProduct } from 'helpers/productPrice/subscriptions';
import { commonReducer } from 'helpers/redux/commonState/reducer';
import type {
	ContributionsStartListening,
	ContributionsStore,
} from 'helpers/redux/contributionsStore';
import { initReduxForContributions } from 'helpers/redux/contributionsStore';
import type {
	SubscriptionsStartListening,
	SubscriptionsStore,
} from 'helpers/redux/subscriptionsStore';
import { initReduxForSubscriptions } from 'helpers/redux/subscriptionsStore';
import { createReducer } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import type { DateYMDString } from 'helpers/types/DateString';
import { initReducer } from 'pages/contributions-landing/contributionsLandingReducer';

export function createTestStoreForSubscriptions(
	product: SubscriptionProduct,
	initialBillingPeriod: BillingPeriod,
	startDate?: DateYMDString,
	productOption?: ProductOptions,
	getFulfilmentOptionForCountry?: (country: string) => FulfilmentOptions,
): SubscriptionsStore {
	const subscriptionsPageReducer = createReducer();

	const baseReducer = {
		common: commonReducer,
		page: subscriptionsPageReducer,
	};

	const listenerMiddleware = createListenerMiddleware();

	const testStartListening =
		listenerMiddleware.startListening as SubscriptionsStartListening;

	const testSubscriptionsStore = configureStore({
		reducer: baseReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().prepend(listenerMiddleware.middleware),
	});

	return initReduxForSubscriptions(
		product,
		initialBillingPeriod,
		startDate,
		productOption,
		getFulfilmentOptionForCountry,
		testSubscriptionsStore,
		testStartListening,
	);
}

export function createTestStoreForContributions(): ContributionsStore {
	const baseReducer = {
		common: commonReducer,
		page: initReducer(),
	};

	const listenerMiddleware = createListenerMiddleware();

	const testStartListening =
		listenerMiddleware.startListening as ContributionsStartListening;

	const testContributionsStore = configureStore({
		reducer: baseReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().prepend(listenerMiddleware.middleware),
	});

	return initReduxForContributions(testContributionsStore, testStartListening);
}
