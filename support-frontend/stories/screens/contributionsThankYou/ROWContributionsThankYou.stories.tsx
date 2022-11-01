import '__mocks__/settingsMock';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStoreForContributions } from '__test-utils__/testStore';
import {
	AmazonPay,
	DirectDebit,
	ExistingCard,
	ExistingDirectDebit,
	PayPal,
	Sepa,
	Stripe,
} from 'helpers/forms/paymentMethods';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { countryGroups } from 'helpers/internationalisation/countryGroup';
import { setPaymentMethod } from 'helpers/redux/checkout/payment/paymentMethod/actions';
import {
	setEmail,
	setFirstName,
	setLastName,
	setUserTypeFromIdentityResponse,
} from 'helpers/redux/checkout/personalDetails/actions';
import {
	setProductType,
	setSelectedAmount,
} from 'helpers/redux/checkout/product/actions';
import { setCountryInternationalisation } from 'helpers/redux/commonState/actions';
import { defaultUserActionFunctions } from 'helpers/user/defaultUserActionFunctions';
import ContributionThankYouPage from 'pages/contributions-landing/components/ContributionThankYou/ContributionThankYouPage';
import { largeDonations } from 'pages/supporter-plus-thank-you/supporterPlusThankYou';
import type { ContributionsThankYouArgs } from './AusContributionsThankYou.stories';

export default {
	component: ContributionThankYouPage,
	title: 'Screens/Contributions Thank You Page/Rest Of World',
	decorators: [
		(Story: React.FC): JSX.Element => {
			return (
				<MemoryRouter>
					<Routes>
						<Route path="/*" element={<Story />} />
					</Routes>
				</MemoryRouter>
			);
		},
	],
	argTypes: {
		paymentMethod: {
			options: [
				Stripe,
				PayPal,
				DirectDebit,
				Sepa,
				ExistingCard,
				ExistingDirectDebit,
				AmazonPay,
			],
			control: { type: 'radio' },
			if: { arg: 'paymentMethod', exists: true },
		},
		nameIsOverTenCharacters: {
			options: [true, false],
			control: { type: 'radio' },
			if: { arg: 'nameIsOverTenCharacters', exists: true },
		},
		shouldShowLargeDonationMessage: {
			options: [true, false],
			control: { type: 'radio' },
			if: { arg: 'shouldShowLargeDonationMessage', exists: true },
		},
		contributionType: {
			options: ['MONTHLY', 'ANNUAL'],
			control: { type: 'radio' },
			if: { arg: 'contributionType', exists: true },
		},
		countryGroup: {
			options: (Object.keys(countryGroups) as CountryGroupId[]).filter(
				(countryGroup) => countryGroup !== 'AUDCountries',
			),
			control: { type: 'radio' },
			if: { arg: 'countryGroup', exists: true },
		},
	},
};

function Template(args: { countryGroup: CountryGroupId }) {
	return <ContributionThankYouPage countryGroupId={args.countryGroup} />;
}

Template.args = {} as Record<string, unknown>;
Template.parameters = {} as Record<string, unknown>;
Template.decorators = [] as unknown[];

export const OneOffNotSignedIn = Template.bind({});

OneOffNotSignedIn.args = {
	paymentMethod: Stripe,
	shouldShowLargeDonationMessage: true,
	countryGroup: 'GBPCountries',
};

OneOffNotSignedIn.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const { paymentMethod, shouldShowLargeDonationMessage, countryGroup } =
			args;

		const store = createTestStoreForContributions();

		store.dispatch(setProductType('ONE_OFF'));
		store.dispatch(setFirstName('Joe'));
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));

		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] + 5}`,
					  }
					: {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];

export const OneOffSignedIn = Template.bind({});

OneOffSignedIn.args = {
	paymentMethod: Stripe,
	shouldShowLargeDonationMessage: true,
	countryGroup: 'GBPCountries',
};

OneOffSignedIn.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const { paymentMethod, shouldShowLargeDonationMessage, countryGroup } =
			args;

		const store = createTestStoreForContributions();

		store.dispatch(defaultUserActionFunctions.setIsSignedIn(true));
		store.dispatch(setProductType('ONE_OFF'));
		store.dispatch(setFirstName('Joe'));
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));
		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] + 5}`,
					  }
					: {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];

export const OneOffSignUp = Template.bind({});

OneOffSignUp.args = {
	paymentMethod: Stripe,
	shouldShowLargeDonationMessage: true,
	countryGroup: 'GBPCountries',
};

OneOffSignUp.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const { paymentMethod, shouldShowLargeDonationMessage, countryGroup } =
			args;

		const store = createTestStoreForContributions();

		// is a new account
		store.dispatch(setUserTypeFromIdentityResponse('new'));
		store.dispatch(defaultUserActionFunctions.setIsSignedIn(true));
		store.dispatch(setProductType('ONE_OFF'));
		store.dispatch(setFirstName('Joe'));
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));
		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] + 5}`,
					  }
					: {
							contributionType: 'ONE_OFF',
							amount: `${largeDonations['ONE_OFF'] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];

export const RecurringNotSignedIn = Template.bind({});

RecurringNotSignedIn.args = {
	paymentMethod: Stripe,
	contributionType: 'MONTHLY',
	nameIsOverTenCharacters: true,
	shouldShowLargeDonationMessage: false,
	countryGroup: 'GBPCountries',
};

RecurringNotSignedIn.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const {
			contributionType,
			paymentMethod,
			nameIsOverTenCharacters,
			shouldShowLargeDonationMessage,
			countryGroup,
		} = args;

		const store = createTestStoreForContributions();

		store.dispatch(setProductType(contributionType));
		store.dispatch(
			setFirstName(nameIsOverTenCharacters ? 'NameIsOverTenCharacters' : 'Joe'),
		);
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));
		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] + 5}`,
					  }
					: {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];

export const RecurringSignedIn = Template.bind({});

RecurringSignedIn.args = {
	paymentMethod: Stripe,
	contributionType: 'MONTHLY',
	nameIsOverTenCharacters: true,
	shouldShowLargeDonationMessage: true,
	countryGroup: 'GBPCountries',
};

RecurringSignedIn.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const {
			contributionType,
			paymentMethod,
			nameIsOverTenCharacters,
			shouldShowLargeDonationMessage,
			countryGroup,
		} = args;

		const store = createTestStoreForContributions();

		store.dispatch(defaultUserActionFunctions.setIsSignedIn(true));
		store.dispatch(setProductType(contributionType));
		store.dispatch(
			setFirstName(nameIsOverTenCharacters ? 'NameIsOverTenCharacters' : 'Joe'),
		);
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));
		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] + 5}`,
					  }
					: {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];

export const RecurringSignUp = Template.bind({});

RecurringSignUp.args = {
	paymentMethod: Stripe,
	contributionType: 'MONTHLY',
	nameIsOverTenCharacters: true,
	shouldShowLargeDonationMessage: true,
	countryGroup: 'GBPCountries',
};

RecurringSignUp.decorators = [
	(
		Story: React.FC,
		{ args }: Record<string, ContributionsThankYouArgs>,
	): JSX.Element => {
		const {
			contributionType,
			paymentMethod,
			nameIsOverTenCharacters,
			shouldShowLargeDonationMessage,
			countryGroup,
		} = args;

		const store = createTestStoreForContributions();

		// is a new account
		store.dispatch(setUserTypeFromIdentityResponse('new'));
		store.dispatch(defaultUserActionFunctions.setIsSignedIn(true));
		store.dispatch(setProductType(contributionType));
		store.dispatch(
			setFirstName(nameIsOverTenCharacters ? 'NameIsOverTenCharacters' : 'Joe'),
		);
		store.dispatch(setLastName('Bloggs'));
		store.dispatch(setEmail('abcd@thegulocal.com'));
		store.dispatch(setPaymentMethod(paymentMethod));
		store.dispatch(
			setCountryInternationalisation(countryGroups[countryGroup].countries[0]),
		);

		store.dispatch(
			setSelectedAmount(
				shouldShowLargeDonationMessage
					? {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] + 5}`,
					  }
					: {
							contributionType: contributionType,
							amount: `${largeDonations[contributionType] - 5}`,
					  },
			),
		);

		return (
			<Provider store={store}>
				<Story />
			</Provider>
		);
	},
];
