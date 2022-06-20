import '__mocks__/stripeMock';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { fireEvent, screen } from '@testing-library/react';
import { mockFetch } from '__mocks__/fetchMock';
import { paperProducts } from '__mocks__/productInfoMocks';
import { renderWithStore } from '__test-utils__/render';
import { Monthly } from 'helpers/productPrice/billingPeriods';
import { Paper } from 'helpers/productPrice/subscriptions';
import { setInitialCommonState } from 'helpers/redux/commonState/actions';
import { commonReducer } from 'helpers/redux/commonState/reducer';
import type { WithDeliveryCheckoutState } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import { createWithDeliveryCheckoutReducer } from 'helpers/subscriptionsForms/subscriptionCheckoutReducer';
import { formatMachineDate } from 'helpers/utilities/dateConversions';
import PaperCheckoutForm from './paperCheckoutForm';

const pageReducer = (initialState: WithDeliveryCheckoutState) =>
	createWithDeliveryCheckoutReducer(
		initialState.common.internationalisation.countryId,
		Paper,
		Monthly,
		formatMachineDate(new Date()),
		initialState.page.checkout.productOption,
		initialState.page.checkout.fulfilmentOption,
	);

function setUpStore(initialState: WithDeliveryCheckoutState) {
	const store = configureStore({
		reducer: combineReducers({
			page: pageReducer(initialState),
			common: commonReducer,
		}),
		preloadedState: initialState,
	});
	store.dispatch(setInitialCommonState(initialState.common));
	return store;
}

describe('Newspaper checkout form', () => {
	// Suppress warnings related to our version of Redux and improper JSX
	console.warn = jest.fn();
	console.error = jest.fn();
	let initialState;
	beforeEach(() => {
		initialState = {
			page: {
				checkout: {
					product: 'Paper',
					billingPeriod: 'Monthly',
					productOption: 'Everyday',
					fulfilmentOption: 'Collection',
					productPrices: paperProducts,
					formErrors: [],
					billingAddressIsSame: true,
				},
				billingAddress: {
					fields: {
						country: 'GB',
						formErrors: [],
					},
				},
				deliveryAddress: {
					fields: {
						country: 'GB',
						formErrors: [],
					},
				},
			},
			common: {
				internationalisation: {
					countryGroupId: 'GBPCountries',
					countryId: 'GB',
					currencyId: 'GBP',
				},
				abParticipations: [],
			},
		};

		mockFetch({
			client_secret: 'super secret',
		});

		renderWithStore(<PaperCheckoutForm />, {
			// @ts-expect-error -- Type mismatch is unimportant for tests
			initialState,
			// @ts-expect-error -- Type mismatch is unimportant for tests
			store: setUpStore(initialState),
		});
	});
	describe('Payment methods', () => {
		// it('shows the direct debit option when the currency is GBP and the delivery address is in the UK', () => {
		// 	expect(screen.queryByText('Direct debit')).toBeInTheDocument();
		// });
		it('does not show the direct debit option when the delivery address is in the Isle of Man', async () => {
			const countrySelect = await screen.findByLabelText('Country');
			fireEvent.change(countrySelect, {
				target: {
					value: 'IM',
				},
			});
			expect(screen.queryByText('Direct debit')).not.toBeInTheDocument();
		});
		it('does not show the direct debit option when the billing address is in the Isle of Man', async () => {
			const addressIsNotSame = await screen.findByRole('radio', {
				name: 'No',
			});
			fireEvent.click(addressIsNotSame);
			const allCountrySelects = await screen.findAllByLabelText('Country');
			fireEvent.change(allCountrySelects[1], {
				target: {
					value: 'IM',
				},
			});
			expect(screen.queryByText('Direct debit')).not.toBeInTheDocument();
		});
	});
	describe('Validation', () => {
		it('should display an error if a silly character is entered into an input field', async () => {
			const firstNameInput = await screen.findByLabelText('First name');
			fireEvent.change(firstNameInput, {
				target: {
					value: 'jane✅',
				},
			});
			const creditDebit = await screen.findByLabelText('Credit/Debit card');
			fireEvent.click(creditDebit);
			const payNowButton = await screen.findByRole(
				'button',
				{
					name: 'Pay now',
				},
				{
					timeout: 2000,
				},
			);
			fireEvent.click(payNowButton);
			expect(
				screen.queryAllByText(
					'Please use only letters, numbers and punctuation.',
				),
			).toBeTruthy();
		});
	});
});
