// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';

import TextInput from 'components/textInput/textInput';
import SelectInput from 'components/selectInput/selectInput';

import {
  setFirstName,
  setLastName,
  setStateField,
} from 'helpers/user/userActions';

import { setCountry } from 'helpers/page/pageActions';

import { usStates } from 'helpers/internationalisation/country';
import { countries } from 'helpers/internationalisation/country';
import { countryGroups } from 'helpers/internationalisation/countryGroup';

import type { IsoCountry, UsState } from 'helpers/internationalisation/country';
import type { SelectOption } from 'components/selectInput/selectInput';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';


// ----- Types ----- //

type PropTypes = {
  firstNameUpdate: (name: string) => void,
  lastNameUpdate: (name: string) => void,
  stateUpdate: (value: UsState) => void,
  countryUpdate: (value: string) => void,
  firstName: string,
  lastName: string,
  countryGroup: CountryGroupId,
  country: IsoCountry,
};

// ----- Map State/Props ----- //

function mapStateToProps(state) {

  return {
    firstName: state.page.user.firstName,
    lastName: state.page.user.lastName,
    countryGroup: state.common.countryGroup,
    country: state.common.country,
  };

}

function mapDispatchToProps(dispatch) {

  return {
    firstNameUpdate: (name: string) => {
      dispatch(setFirstName(name));
    },
    lastNameUpdate: (name: string) => {
      dispatch(setLastName(name));
    },
    stateUpdate: (value: UsState) => {
      dispatch(setStateField(value));
    },
    countryUpdate: (value: IsoCountry) => {
      dispatch(setCountry(value));
    },
  };

}


// ----- Functions ----- //

function stateDropdown(countryGroup: CountryGroupId, stateUpdate: UsState => void) {

  if (countryGroup !== 'UnitedStates') {
    return null;
  }

  const options: SelectOption[] = Object.keys(usStates).map((stateCode: UsState) =>
    ({ value: stateCode, text: usStates[stateCode] }));

  // Sets the initial state to the first in the dropdown.
  stateUpdate(options[0].value);

  return <SelectInput id="qa-state-dropdown" onChange={stateUpdate} options={options} />;
}

function countriesDropdown(
  countryGroup: CountryGroupId,
  countryUpdate: string => void,
  country: IsoCountry,
) {

  if (countryGroup !== 'EURCountries' && countryGroup !== 'International') {
    return null;
  }

  const options: SelectOption[] =
    countryGroups[countryGroup].countries.map((countryCode: IsoCountry) =>
      ({
        value: countryCode,
        text: countries[countryCode],
        selected: countryCode === country,
      }));

  return <SelectInput id="qa-country-dropdown" onChange={countryUpdate} options={options} />;
}


// ----- Component ----- //

function NameForm(props: PropTypes) {

  return (
    <form className="regular-contrib__name-form">
      <TextInput
        id="first-name"
        placeholder="First name"
        value={props.firstName}
        onChange={props.firstNameUpdate}
        required
      />
      <TextInput
        id="last-name"
        placeholder="Last name"
        value={props.lastName}
        onChange={props.lastNameUpdate}
        required
      />
      {stateDropdown(props.countryGroup, props.stateUpdate)}
      {countriesDropdown(props.countryGroup, props.countryUpdate, props.country)}
    </form>
  );
}

// ----- Exports ----- //

export default connect(mapStateToProps, mapDispatchToProps)(NameForm);
