// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';

import { usStates, caStates, type UsState, type CaState } from 'helpers/internationalisation/country';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { classNameWithModifiers } from 'helpers/utilities';
import { Canada, UnitedStates } from 'helpers/internationalisation/countryGroup';
import SvgGlobe from 'components/svgs/globe';

import { type State } from '../contributionsLandingReducer';

// ----- Types ----- //
type PropTypes = {|
  countryGroupId: CountryGroupId,
  selectedState: CaState | UsState | null,
  onChange: (Event => void) | false,
  isValid: boolean,
  formHasBeenSubmitted: boolean,
  showRequiredLabel: boolean,
|};

const mapStateToProps = (state: State) => ({
  countryGroupId: state.common.internationalisation.countryGroupId,
});

// ----- Render ----- //

const renderState = (selectedState: CaState | UsState | null) => ([stateValue, stateName]: [string, string]) => (
  <option value={stateValue} selected={selectedState === stateValue}>{stateName}</option>
);

const renderStatesField = (
  states: { [string]: string },
  selectedState: UsState | CaState | null,
  onChange: (Event => void) | false,
  showError: boolean,
  label: string,
  showRequiredLabel: boolean,
) => (
  <div className={classNameWithModifiers('form__field', ['contribution-state'])}>
    <label className="form__label" htmlFor="contributionState">
      {label}
      <span className={showRequiredLabel ? 'form__label__required' : 'hidden'}> required </span>
    </label>
    <span className="form__input-with-icon">
      <select id="contributionState" className={classNameWithModifiers('form__input', selectedState ? [] : ['placeholder'])} onChange={onChange} required>
        <option value="">Please select your {label.toLowerCase()}</option>
        {(Object.entries(states): any).map(renderState(selectedState))}
      </select>
      <span className="form__icon">
        <SvgGlobe />
      </span>
    </span>
    {showError ? (
      <div className="form__error">
        Please provide a {label.toLowerCase()}
      </div>
      ) : null}
  </div>
);

function ContributionState(props: PropTypes) {
  const showError = !props.isValid && props.formHasBeenSubmitted;
  switch (props.countryGroupId) {
    case UnitedStates:
      return renderStatesField(usStates, props.selectedState, props.onChange, showError, 'State', props.showRequiredLabel);
    case Canada:
      return renderStatesField(caStates, props.selectedState, props.onChange, showError, 'Province', props.showRequiredLabel);
    default:
      return null;
  }
}


ContributionState.defaultProps = {
  onChange: false,
};

export default connect(mapStateToProps)(ContributionState);
