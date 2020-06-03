// @flow

// ----- Imports ----- //

import React from 'react';
import { css } from '@emotion/core';
import { connect } from 'react-redux';

import { usStates, caStates, type StateProvince, auStates } from 'helpers/internationalisation/country';
import { type CountryGroupId, type CountryGroup, countryGroups, AUDCountries } from 'helpers/internationalisation/countryGroup';
import { classNameWithModifiers } from 'helpers/utilities';
import { Canada, UnitedStates } from 'helpers/internationalisation/countryGroup';
import SvgGlobe from 'components/svgs/globe';
import { InlineError } from '@guardian/src-inline-error';
import DownChevronDs from 'components/svgs/downChevronDs';
import { focusHalo } from '@guardian/src-foundations/accessibility';
import { space } from '@guardian/src-foundations';

import { type State } from '../contributionsLandingReducer';

// ----- Types ----- //
type PropTypes = {|
  countryGroupId: CountryGroupId,
  selectedState: StateProvince | null,
  onChange: (Event => void) | false,
  isValid: boolean,
  formHasBeenSubmitted: boolean,
  contributionType: string,
  isDesignSystemTest: boolean,
|};

const mapStateToProps = (state: State) => ({
  countryGroupId: state.common.internationalisation.countryGroupId,
  contributionType: state.page.form.contributionType,
});

// ----- Render ----- //

const selectCss = css`
  appearance: none !important;
  background: transparent;
  transition: box-shadow .2s ease-in-out;
  font-size: 17px;
  width: 100%;
  height: 48px;
  border: 2px solid #999;
  z-index: 1;
  margin: 0;
  padding: 0;
  outline: 0;
  box-sizing: border-box;

  &:active {
    border: 2px solid #007ABC;
  };

  &:focus {
    ${focusHalo};
  };
`;

const errorBorderCss = css`
  border: 4px solid #c70000;
  height: 52px;
  width: calc(100% + 3px);
`;

const chevronCss = css`
  float: right;
  z-index: 0;
  position: absolute;
  top: 12px;
  right: 16px;
  pointer-events: none;
`;

const chevronErrorCss = css`
  path {
    fill: #c70000;
  }
`;

const renderState = (selectedState: StateProvince | null) => (state: {abbreviation: string, name: string}) => (
  <option value={state.abbreviation} selected={selectedState === state.abbreviation}>{state.name}</option>
);

const renderStateDs = (selectedState: StateProvince | null) => (state: {abbreviation: string, name: string}) => (
  <option value={state.abbreviation} selected={selectedState === state.abbreviation}>&nbsp;&nbsp;{state.name}</option>
);

const renderStatesField = (
  states: {[string]: string},
  selectedState: StateProvince | null,
  onChange: (Event => void) | false,
  showError: boolean,
  label: string,
  isDesignSystemTest: boolean,
) => {

  const renderStatesFieldControl = (
    <div className={classNameWithModifiers('form__field', ['contribution-state'])}>
      <label className="form__label" htmlFor="contributionState">
        {label}
      </label>
      <span className="form__input-with-icon">
        <select id="contributionState" className={classNameWithModifiers('form__input', selectedState ? [] : ['placeholder'])} onChange={onChange} required>
          <option value="">Please select your {label.toLowerCase()}</option>
          {Object.keys(states)
            .map(key => ({ abbreviation: key, name: states[key] }))
            .map(renderState(selectedState))}
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

  const renderStatesFieldDs = (
    <div
      css={css`
        margin-top: 12px;
        margin-bottom: 4px;
        position: relative;
      `}
    >
      <label
        htmlFor="contributionState"
        css={css`
          font-family: $gu-text-sans-web;
          font-weight: 700;
          line-height: 1.5;
          font-size: 17px;
        `}
      >
        {label}
      </label>
      <div
        css={css`
          font-size: 15px;
          color: #767676;
          margin-bottom: ${space[1]}px;
        `}
      >Select your {label.toLowerCase()}
      </div>
      {showError ? (
        <InlineError
          cssOverrides={css`
            margin-bottom: 4px;
          `}
        >
          Please select your {label.toLowerCase()}
        </InlineError>
        ) : null}
      <div
        css={css`
          position: relative;
        `}
      >
        <select
          css={showError ? [selectCss, errorBorderCss] : selectCss}
          id="contributionState"
          onChange={onChange}
          required
        >
          <option value="">&nbsp;</option>
          {Object.keys(states)
              .map(key => ({ abbreviation: key, name: states[key] }))
              .map(renderStateDs(selectedState))}
        </select>
        <div
          css={showError ? [chevronErrorCss, chevronCss] : chevronCss}
        >
          <DownChevronDs />
        </div>
      </div>
    </div>
  );

  return (isDesignSystemTest ? renderStatesFieldDs : renderStatesFieldControl);
};

function ContributionState(props: PropTypes) {
  const showError = !props.isValid && props.formHasBeenSubmitted;
  if (props.contributionType !== 'ONE_OFF') {
    switch (props.countryGroupId) {
      case UnitedStates:
        return renderStatesField(usStates, props.selectedState, props.onChange, showError, 'State', props.isDesignSystemTest);
      case Canada:
        return renderStatesField(caStates, props.selectedState, props.onChange, showError, 'Province', props.isDesignSystemTest);
      case AUDCountries: {
        // Don't show states if the user is GEO-IP'd to one of the non AU countries that use AUD.
        if (window.guardian && window.guardian.geoip) {
          const AUDCountryGroup: CountryGroup = countryGroups[AUDCountries];
          const AUDCountriesWithNoStates = AUDCountryGroup.countries.filter(c => c !== 'AU');
          if (AUDCountriesWithNoStates.includes(window.guardian.geoip.countryCode)) {
            return null;
          }
        }
        return renderStatesField(auStates, props.selectedState, props.onChange, showError, 'State / Territory', props.isDesignSystemTest);
      }
      default:
        return null;
    }
  }

  return null;
}

ContributionState.defaultProps = {
  onChange: false,
};

export default connect(mapStateToProps)(ContributionState);
