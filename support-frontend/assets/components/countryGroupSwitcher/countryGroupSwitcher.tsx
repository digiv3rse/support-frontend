// ----- Imports ----- //
import React, { Component } from "react";
import SvgDropdownArrow from "components/svgs/dropdownArrow";
import Dialog from "components/dialog/dialog";
import { sendTrackingEventsOnClick } from "helpers/subscriptions";
import Menu, { LinkItem } from "components/menu/menu";
import { countryGroups, type CountryGroupId } from "helpers/internationalisation/countryGroup";
import { currencies } from "helpers/internationalisation/currency";
import "./countryGroupSwitcher.scss";
import styles from "./countryGroupSwitcher.module.scss";
// ----- Props ----- //
export type PropTypes = {
  countryGroupIds: CountryGroupId[];
  selectedCountryGroup: CountryGroupId;
  onCountryGroupSelect: (arg0: CountryGroupId) => void;
  subPath: string;
}; // ----- Component ----- //

class CountryGroupSwitcher extends Component<PropTypes, {
  menuOpen: boolean;
  bounds: {
    top: number;
    left: number;
  };
}> {
  state = {
    menuOpen: false,
    bounds: {
      top: 0,
      left: 0
    }
  };
  buttonRef: Element | null | undefined;

  render() {
    const {
      onCountryGroupSelect,
      subPath,
      selectedCountryGroup,
      countryGroupIds
    } = this.props;
    const {
      menuOpen,
      bounds: {
        top,
        left
      }
    } = this.state;
    return <div className="component-country-group-switcher">
        <button aria-label="Select a country" className={styles.button} ref={r => {
        this.buttonRef = r;
      }} onClick={() => {
        if (this.buttonRef) {
          this.setState({
            bounds: this.buttonRef.getBoundingClientRect()
          });
        }

        this.setState({
          menuOpen: true
        });
      }}>
          {countryGroups[selectedCountryGroup].name}
          {' '}
          <strong>{currencies[countryGroups[selectedCountryGroup].currency].extendedGlyph}</strong>
          <SvgDropdownArrow />
        </button>
        <Dialog aria-label="Select a country" open={menuOpen} blocking={false} styled={false} onStatusChange={status => {
        this.setState({
          menuOpen: status
        });

        if (status) {
          sendTrackingEventsOnClick({
            id: 'toggle_country',
            componentType: 'ACQUISITIONS_BUTTON'
          })();
        }
      }}>
          <Menu style={{
          top,
          left,
          position: 'absolute'
        }}>
            {countryGroupIds.map((countryGroupId: CountryGroupId) => <LinkItem href={`/${countryGroups[countryGroupId].supportInternationalisationId}${subPath}`} onClick={() => onCountryGroupSelect(countryGroupId)} isSelected={countryGroupId === selectedCountryGroup}>
                  {countryGroups[countryGroupId].name}
                  {' '}
                  {currencies[countryGroups[countryGroupId].currency].extendedGlyph}
                </LinkItem>)}
            <button className="visually-hidden" onClick={() => {
            this.setState({
              menuOpen: false
            });
          }}>
              Close
            </button>
          </Menu>
        </Dialog>
      </div>;
  }

} // ----- Exports ----- //


export default CountryGroupSwitcher;