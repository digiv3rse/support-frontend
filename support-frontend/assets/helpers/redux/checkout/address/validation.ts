import type { Participations } from 'helpers/abTests/abtest';
import {
	M25_POSTCODE_PREFIXES,
	postcodeIsWithinDeliveryArea,
} from 'helpers/forms/deliveryCheck';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { FulfilmentOptions } from 'helpers/productPrice/fulfilmentOptions';
import type { ProductOptions } from 'helpers/productPrice/productOptions';
import type { AddressType } from 'helpers/subscriptionsForms/addressType';
import type { Rule } from 'helpers/subscriptionsForms/validation';
import {
	deliveryAgentsAreAvailable,
	formError,
	nonEmptyString,
	notLongerThan,
	notNull,
	validate,
	zuoraCompatibleString,
} from 'helpers/subscriptionsForms/validation';
import type { Option } from 'helpers/types/option';
import type { DeliveryAgentState } from '../addressMeta/state';
import type { AddressFields, AddressFormFieldError } from './state';

// ---- Validators ---- //

export function applyBillingAddressRules(
	fields: AddressFields,
): AddressFormFieldError[] {
	return validate(getGenericRules(fields, 'billing'));
}

export function applyDeliveryAddressRules(
	fulfilmentOption: Option<FulfilmentOptions>,
	fields: AddressFields,
	deliveryAgent: DeliveryAgentState,
	productOption: ProductOptions,
	abParticipations: Participations,
): AddressFormFieldError[] {
	return validate([
		...getGenericRules(fields, 'delivery'),
		...getDeliveryOnlyRules(
			fulfilmentOption,
			fields,
			deliveryAgent,
			productOption,
			abParticipations,
		),
	]);
}

// ---- Rules ---- //

// Gets a list of rules that should be applied to both billing and delivery addresses
function getGenericRules(
	fields: AddressFields,
	addressType: AddressType,
): Array<Rule<AddressFormFieldError>> {
	return [
		{
			rule: nonEmptyString(fields.lineOne),
			error: formError('lineOne', `Please enter a ${addressType} address.`),
		},
		{
			rule: notLongerThan(fields.lineOne, 100),
			error: formError(
				'lineOne',
				'Value cannot be longer than 100 characters.',
			),
		},
		{
			rule: zuoraCompatibleString(fields.lineOne),
			error: formError(
				'lineOne',
				'Please use only letters, numbers and punctuation.',
			),
		},
		{
			rule: notLongerThan(fields.lineTwo, 100),
			error: formError(
				'lineTwo',
				'Value cannot be longer than 100 characters.',
			),
		},
		{
			rule: zuoraCompatibleString(fields.lineTwo),
			error: formError(
				'lineTwo',
				'Please use only letters, numbers and punctuation.',
			),
		},
		{
			rule: nonEmptyString(fields.city),
			error: formError('city', `Please enter a ${addressType} city.`),
		},
		{
			rule: zuoraCompatibleString(fields.city),
			error: formError(
				'city',
				'Please use only letters, numbers and punctuation.',
			),
		},
		{
			rule:
				isStateNullable(fields.country) ||
				(notNull(fields.state) && nonEmptyString(fields.state)),
			error: formError(
				'state',
				fields.country === 'CA'
					? `Please select a ${addressType} province/territory.`
					: `Please select a ${addressType} state.`,
			),
		},
		{
			rule: checkLength(fields.state, 40),
			error: formError(
				'state',
				fields.country === 'CA'
					? `Please enter a ${addressType} province/territory no longer than 40 characters`
					: `Please enter a ${addressType} state name no longer than 40 characters`,
			),
		},
		{
			rule: nonEmptyString(fields.country),
			error: formError('country', `Please select a ${addressType} country.`),
		},
		{
			rule:
				isPostcodeOptional(fields.country) ||
				(nonEmptyString(fields.postCode) &&
					zuoraCompatibleString(fields.postCode)),
			error: formError('postCode', `Please enter a ${addressType} postcode.`),
		},
		{
			rule: checkLength(fields.postCode, 20),
			error: formError(
				'postCode',
				`Please enter a ${addressType} postcode no longer than 20 characters.`,
			),
		},
		{
			rule: zuoraCompatibleString(fields.postCode),
			error: formError(
				'postCode',
				'Please use only letters, numbers and punctuation.',
			),
		},
	];
}

function getDeliveryOnlyRules(
	fulfilmentOption: Option<FulfilmentOptions>,
	fields: AddressFields,
	deliveryAgent: DeliveryAgentState,
	productOption: ProductOptions,
	abParticipations: Participations,
): Array<Rule<AddressFormFieldError>> {
	return [
		{
			rule:
				abParticipations.nationalDelivery === 'variant'
					? isHomeDeliveryAvailable(
							fulfilmentOption,
							fields.postCode,
							deliveryAgent,
					  )
					: isHomeDeliveryInM25(fulfilmentOption, fields.postCode),
			error: formError(
				'postCode',
				'The address and postcode you entered is outside of our delivery area. Please go back to purchase a voucher subscription instead.',
			),
		},
		{
			rule:
				abParticipations.nationalDelivery === 'variant' &&
				isSaturdayOrSundayDeliveryAvailable(
					fulfilmentOption,
					fields.postCode,
					productOption,
				),
			error: formError(
				'postCode',
				'Saturday or Sunday delivery is available for Greater London only',
			),
		},
	];
}

// ---- Helpers --- //

export const isHomeDeliveryInM25 = (
	fulfilmentOption: Option<FulfilmentOptions>,
	postcode: Option<string>,
	allowedPrefixes: string[] = M25_POSTCODE_PREFIXES,
): boolean => {
	if (fulfilmentOption === 'HomeDelivery' && postcode !== null) {
		return postcodeIsWithinDeliveryArea(postcode, allowedPrefixes);
	}

	return true;
};

export const isHomeDeliveryAvailable = (
	fulfilmentOption: FulfilmentOptions | null,
	postcode: string | null,
	deliveryAgent: DeliveryAgentState,
	allowedPrefixes: string[] = M25_POSTCODE_PREFIXES,
): boolean => {
	if (fulfilmentOption === 'HomeDelivery' && postcode !== null) {
		if (!postcodeIsWithinDeliveryArea(postcode, allowedPrefixes)) {
			return deliveryAgentsAreAvailable(deliveryAgent);
		}
	}

	return true;
};

export const isSaturdayOrSundayDeliveryAvailable = (
	fulfilmentOption: FulfilmentOptions | null,
	postcode: string | null,
	productOption: ProductOptions,
	allowedPrefixes: string[] = M25_POSTCODE_PREFIXES,
): boolean => {
	// For financial reasons Saturday or Sunday only papers are not available for delivery outside M25
	if (productOption === 'Saturday' || productOption === 'Sunday') {
		if (fulfilmentOption === 'HomeDelivery' && postcode !== null) {
			return postcodeIsWithinDeliveryArea(postcode, allowedPrefixes);
		}
	}

	return true;
};

export const isPostcodeOptional = (country: IsoCountry | null): boolean =>
	country !== 'GB' && country !== 'AU' && country !== 'US' && country !== 'CA';

const checkLength = (input: string | null, maxLength: number): boolean =>
	input == null || input.length <= maxLength;

export const isStateNullable = (country: Option<IsoCountry>): boolean =>
	country !== 'AU' && country !== 'US' && country !== 'CA';
