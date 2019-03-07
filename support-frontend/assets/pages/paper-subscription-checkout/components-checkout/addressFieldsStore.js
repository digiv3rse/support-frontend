// @flow

// ----- Imports ----- //
import { combineReducers, type Dispatch } from 'redux';

import { fromString, type IsoCountry } from 'helpers/internationalisation/country';
import { setCountry, type Action as CommonAction } from 'helpers/page/commonActions';
import { formError, type FormError, nonEmptyString, notNull, validate } from 'helpers/subscriptionsForms/validation';
import { type RegularPaymentRequestAddress } from 'helpers/paymentIntegrations/readerRevenueApis';
import { type Scoped } from 'helpers/scoped';

import { type Address } from '../helpers/addresses';
import { postcodeFinderReducerFor, type PostcodeFinderState } from './postcodeFinderStore';


// ----- Types ----- //

export type FormFields = {|
  ...RegularPaymentRequestAddress
|};
export type FormField = $Keys<FormFields>;
export type FormErrors = FormError<FormField>[];

export type AddressFieldsState = {|
  ...FormFields,
  formErrors: FormErrors,
|}

export type State = {|
  fields: AddressFieldsState,
  postcode: PostcodeFinderState,
  countryList: IsoCountry[],
|};

export type Action =
  | { type: 'SET_ADDRESS_LINE_1', lineOne: string, ...Scoped<Address> }
  | { type: 'SET_ADDRESS_LINE_2', lineTwo: string, ...Scoped<Address> }
  | { type: 'SET_TOWN_CITY', city: string, ...Scoped<Address> }
  | { type: 'SET_COUNTRY_CHANGED', country: IsoCountry, ...Scoped<Address> }
  | { type: 'SET_ADDRESS_FORM_ERRORS', errors: FormError<FormField>[], ...Scoped<Address> }
  | { type: 'SET_POSTCODE', postCode: string, ...Scoped<Address> };


// ----- Selectors ----- //

const getPostcodeForm = (state: State): PostcodeFinderState => state.postcode;
const getStateFormErrors = (state: State): FormErrors => state.fields.formErrors;

const getFormFields = (state: State): FormFields => ({
  lineOne: state.fields.lineOne,
  lineTwo: state.fields.lineTwo,
  city: state.fields.city,
  country: state.fields.country,
  postCode: state.fields.postCode,
  state: null,
});


// ----- Functions ----- //

const setFormErrorsFor = (scope: Address) => (errors: Array<FormError<FormField>>): Action => ({
  scope,
  type: 'SET_ADDRESS_FORM_ERRORS',
  errors,
});
const getFormErrors = (fields: FormFields): FormError<FormField>[] => validate([
  {
    rule: nonEmptyString(fields.lineOne),
    error: formError('lineOne', 'Please enter an address'),
  },
  {
    rule: nonEmptyString(fields.city),
    error: formError('city', 'Please enter a city'),
  },
  {
    rule: nonEmptyString(fields.postCode),
    error: formError('postCode', 'Please enter a post code'),
  },
  {
    rule: notNull(fields.country),
    error: formError('country', 'Please select a country.'),
  },
]);

// ----- Action Creators ----- //

const addressActionCreatorsFor = (scope: Address) => ({
  setCountry: (countryRaw: string) => (dispatch: Dispatch<Action | CommonAction>) => {
    const country = fromString(countryRaw);
    if (country) {
      dispatch(setCountry(country));
      dispatch({
        type: 'SET_COUNTRY_CHANGED',
        country,
        scope,
      });
    }
  },
  setAddressLineOne: (lineOne: string): Action => ({
    scope,
    type: 'SET_ADDRESS_LINE_1',
    lineOne,
  }),
  setAddressLineTwo: (lineTwo: string): Action => ({
    scope,
    type: 'SET_ADDRESS_LINE_2',
    lineTwo,
  }),
  setTownCity: (city: string): Action => ({
    scope,
    type: 'SET_TOWN_CITY',
    city,
  }),
  setPostcode: (postCode: string): Action => ({
    type: 'SET_POSTCODE',
    postCode,
    scope,
  }),
});

export type ActionCreators = $Call<typeof addressActionCreatorsFor, Address>;

// ----- Reducer ----- //

function addressReducerFor(scope: Address, initialCountry: IsoCountry) {

  const initialState = {
    country: initialCountry,
    lineOne: null,
    lineTwo: null,
    city: null,
    postCode: null,
    state: null,
    formErrors: [],
  };

  const fields = (state: AddressFieldsState = initialState, action: Action): AddressFieldsState => {

    if (action.scope !== scope) {
      return state;
    }

    switch (action.type) {

      case 'SET_ADDRESS_LINE_1':
        return { ...state, lineOne: action.lineOne };

      case 'SET_ADDRESS_LINE_2':
        return { ...state, lineTwo: action.lineTwo };

      case 'SET_TOWN_CITY':
        return { ...state, city: action.city };

      case 'SET_POSTCODE':
        return { ...state, postCode: action.postCode };

      case 'SET_ADDRESS_FORM_ERRORS':
        return { ...state, formErrors: action.errors };

      case 'SET_COUNTRY_CHANGED':
        return { ...state, country: action.country };

      default:
        return state;
    }
  };

  return combineReducers({
    fields,
    postcode: postcodeFinderReducerFor(scope),
  });

}

// ----- Export ----- //

export {
  addressReducerFor,
  getFormFields,
  getStateFormErrors,
  getPostcodeForm,
  getFormErrors,
  setFormErrorsFor,
  addressActionCreatorsFor,
};
