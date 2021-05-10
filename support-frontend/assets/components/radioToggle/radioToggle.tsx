// ----- Imports ----- //
import React from "react";
import uuidv4 from "uuid";
import { classNameWithModifiers } from "helpers/utilities";
import type { CountryGroupId } from "helpers/internationalisation/countryGroup";
import { sendTrackingEventsOnClick } from "helpers/subscriptions";
// ----- Types ----- //
export type Radio = {
  id?: string;
  value: string;
  text: string;
  accessibilityHint?: string | null | undefined;
};
// Disabling the linter here because it's just buggy...

/* eslint-disable react/no-unused-prop-types */
type PropTypes = {
  name: string;
  radios: Radio[];
  checked: string | null | undefined;
  toggleAction: (arg0: string, arg1: CountryGroupId) => void;
  modifierClass?: string | null | undefined;
  accessibilityHint?: string | null | undefined;
  countryGroupId: CountryGroupId;
};

/* eslint-enable react/no-unused-prop-types */
// ----- Functions ----- //
// Returns a list of the radio button elements.
function getRadioButtons(props: PropTypes) {
  return props.radios.map((radio: Radio, idx: number) => {
    const radioId = `${props.name}-${idx}`;
    const a11yHintId = `accessibility-hint-${radioId}`;
    const radioChecked = radio.value === props.checked;
    const labelModifier = radioChecked ? 'checked' : null;
    return <span id={radio.id} className={classNameWithModifiers('component-radio-toggle__button', [props.modifierClass])} key={radioId}>
        <A11yHint id={a11yHintId} hint={radio.accessibilityHint} />
        <input className="component-radio-toggle__input" type="radio" name={props.name} value={radio.value} id={radioId} onChange={() => {
        sendTrackingEventsOnClick({
          id: `opf-${props.name}-${props.countryGroupId}-${radio.value}`,
          componentType: 'ACQUISITIONS_OTHER'
        })();
        props.toggleAction(radio.value, props.countryGroupId);
      }} checked={radioChecked} tabIndex="0" aria-describedby={a11yHintId} />
        <label htmlFor={radioId} className={classNameWithModifiers('component-radio-toggle__label', [labelModifier])}>
          {radio.text}
        </label>
      </span>;
  });
} // ----- Component ----- //


export default function RadioToggle(props: PropTypes) {
  const radioButtons = getRadioButtons(props);
  const radioGroupId = uuidv4();
  return <div className="component-radio-toggle" aria-describedby={radioGroupId}>
      {radioButtons}
      <p id={radioGroupId} className="visually-hidden">{props.accessibilityHint}</p>
    </div>;
} // ----- Auxiliary Components ----- //

function A11yHint(props: {
  id: string;
  hint: string | null | undefined;
}) {
  return <p id={props.id} className="visually-hidden">
      {props.hint}
    </p>;
}

// ----- Default Props ----- //
RadioToggle.defaultProps = {
  accessibilityHint: '',
  modifierClass: null
};