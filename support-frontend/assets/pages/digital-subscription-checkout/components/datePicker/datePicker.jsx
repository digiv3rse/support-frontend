// @flow

import React, { Component } from 'react';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import calendarIcon from './calendar-icon.jpg';
import { TextInput } from '@guardian/src-text-input';
import { formatMachineDate } from 'helpers/dateConversions';

import './styles.scss';

const calendarIconContainer = css`
  padding: 0;
  margin: 0;
  /* outline: none; */
  border: none;
  width: 45px;
  height: 45px;
  align-self: flex-end;
  margin-left: ${space[3]}px;
`;

const iconImage = css`
  width: 100%;
  height: 100%;
`;

const startDateGroup = css`
  display: flex;
  flex-direction: column;
`;

const startDateFields = css`
  display: inline-flex;
  margin-top: ${space[3]}px;
`;

const marginRight = css`
  margin-right: ${space[3]}px;
`;

type PropTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  value: string | null,
  onChange: Function,
}

type StateTypes = {
  day: string,
  month: string,
  year: string,
  showCalendar: boolean,
}

class DatePickerFields extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      day: '',
      month: '',
      year: '',
      showCalendar: false,
    };
  }

  handleCalendarDate = (date: Date) => {
    const dateArray = formatMachineDate(date).split('-');
    this.setState({
      day: dateArray[2],
      month: dateArray[1],
      year: dateArray[0],
    }, this.updateStartDate);
  }

  handleDate = (e: Object, field: string) => {
    this.setState({ [field]: e.target.value }, this.updateStartDate);
  }

  updateStartDate = () => this.props.onChange(`${this.state.day}/${this.state.month}/${this.state.year}`)

  render() {
    const { state } = this;
    const today = Date.now();

    return (
      <div>
        <fieldset css={startDateGroup} role="group" aria-describedby="date-hint">
          <legend>
            <h3>
              When would you like your gift to start?
            </h3>
          </legend>
          <div id="date-hint">
          For example, 27 9 2020
          </div>
          <div css={startDateFields}>
            <div css={marginRight}>
              <TextInput
                label="Day"
                value={state.day}
                onChange={e => this.handleDate(e, 'day')}
                optional={false}
                width={4}
              />
            </div>
            <div css={marginRight}>
              <TextInput
                label="Month"
                value={state.month}
                onChange={e => this.handleDate(e, 'month')}
                optional={false}
                width={4}
              />
            </div>
            <TextInput
              label="Year"
              value={state.year}
              onChange={e => this.handleDate(e, 'year')}
              optional={false}
              width={4}
            />
            <button
              css={calendarIconContainer}
              onClick={() => this.setState({ showCalendar: !this.state.showCalendar })}
            >
              <img css={iconImage} src={calendarIcon} alt="calendar" />
            </button>
          </div>
        </fieldset>
        {state.showCalendar && <DayPicker
          onDayClick={day => this.handleCalendarDate(day)}
          disabledDays={[{ before: new Date(today) }]}
        />}
      </div>
    );
  }
}

export default DatePickerFields;
