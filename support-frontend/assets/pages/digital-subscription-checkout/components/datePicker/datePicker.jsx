// @flow

import React, { Component } from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { formatMachineDate } from 'helpers/dateConversions';
import calendarIcon from './calendarIcon.png';
import { monthText } from 'pages/paper-subscription-checkout/helpers/subsCardDays';
import { Input } from 'components/forms/input';
import { withLabel } from 'hocs/withLabel';
import { ThemeProvider } from 'emotion-theming';
import { Button, buttonDefault } from '@guardian/src-button';
import { Error } from 'components/forms/customFields/error';
import {
  getLatestAvailableDateText,
  getRange,
  dateIsPast,
  dateIsOutsideRange,
} from './helpers';

import './styles.scss';

const calendarIconContainer = css`
  padding: 0;
  border: none;
  width: 35px;
  height: 35px;
  align-self: flex-end;
  margin: 0 0 ${space[1]}px ${space[4]}px ;
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
`;

const inputLayout = css`
  width: 25%;
`;

const inputLayoutWithMargin = css`
  width: 25%;
  margin-right: ${space[3]}px;
`;

const validationButton = css`
  margin-top: ${space[5]}px;
`;

const marginTop = css`
  margin-top: ${space[5]}px;
`;

type PropTypes = {
  value: string | null,
  onChange: Function,
}

type StateTypes = {
  day: string,
  month: string,
  year: string,
  showCalendar: boolean,
  dateError: string | null,
  dateValidated: boolean | null,
}

const InputWithLabel = withLabel(Input);

class DatePickerFields extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      day: '',
      month: '',
      year: '',
      showCalendar: false,
      dateError: null,
      dateValidated: null,
    };
  }

  componentDidMount() {
    this.handleCalendarDate(new Date(Date.now()));
  }

  getDateString = () => `${this.state.year}-${this.state.month}-${this.state.day}`;

  checkDateIsValid = (e: Object) => {
    e.preventDefault();
    const date = new Date(this.getDateString());
    const dateIsNotADate = !DateUtils.isDate(date);
    const latestAvailableDate = getLatestAvailableDateText();

    this.setState({ dateValidated: true, dateError: '' });
    if (dateIsNotADate) {
      this.handleError('No date has been selected as the date is not valid. Please try again');
    } else if (dateIsOutsideRange(date)) {
      this.handleError(`No date has been recorded as the date entered was not available. Please enter a date up to ${latestAvailableDate}`);
    } else if (dateIsPast(date)) {
      this.handleError(`No date has been recorded as the date was in the past. Please enter a date between today and ${latestAvailableDate}`);
    }
  }

  handleError = (error: string) => {
    this.setState({
      dateError: error,
      day: '',
      month: '',
      year: '',
    });
    this.updateStartDate();
  }

  handleCalendarDate = (date: Date) => {
    if (dateIsPast(date) || dateIsOutsideRange(date)) {
      return;
    }
    const dateArray = formatMachineDate(date).split('-');
    this.setState({
      dateError: '',
      dateValidated: false,
      day: dateArray[2],
      month: dateArray[1],
      year: dateArray[0],
    }, this.updateStartDate);
  }

  handleInput = (value: string, field: string) => {
    if (/^[0-9]+$/.test(value) === true) {
      this.setState({ [field]: value, dateError: '', dateValidated: false }, this.updateStartDate);
    } else {
      this.setState({ [field]: '', dateError: '', dateValidated: false }, this.updateStartDate);
    }
  }

  updateStartDate = () => {
    const dateString = this.getDateString();
    if (DateUtils.isDate(new Date(dateString))) {
      return this.props.onChange(dateString);
    }
    return this.props.onChange('');
  }

  render() {
    const { state } = this;
    const { value } = this.props;
    const today = Date.now();
    const currentMonth = new Date(today);
    const threeMonthRange = DateUtils.addMonths(currentMonth, 3);
    const valueDate = value ? new Date(value) : null;

    return (
      <div>
        <fieldset css={startDateGroup} role="group" aria-describedby="date-hint">
          <legend id="date-hint">
            {`Please choose a date up to ${getLatestAvailableDateText()} for your gift to be emailed to the recipient.`}
          </legend>
          <div css={startDateFields}>
            <div css={inputLayoutWithMargin}>
              <InputWithLabel
                label="Day"
                value={state.day}
                onChange={e => this.handleInput(e.target.value, 'day')}
                minLength={1}
                maxLength={2}
                type="text"
              />
            </div>
            <div css={inputLayoutWithMargin}>
              <InputWithLabel
                label="Month"
                value={state.month}
                onChange={e => this.handleInput(e.target.value, 'month')}
                minLength={1}
                maxLength={2}
                type="text"
              />
            </div>
            <div css={inputLayout}>
              <InputWithLabel
                label="Year"
                value={state.year}
                onChange={e => this.handleInput(e.target.value, 'year')}
                minLength={4}
                maxLength={4}
                type="text"
              />
            </div>

            <button
              aria-hidden
              css={calendarIconContainer}
              onClick={(e) => {
                e.preventDefault();
                this.setState({ showCalendar: !this.state.showCalendar });
              }}
            >
              <img css={iconImage} src={calendarIcon} alt="calendar" />
            </button>
          </div>
        </fieldset>
        {state.showCalendar && (
          <DayPicker
            onDayClick={day => this.handleCalendarDate(day)}
            disabledDays={[{ before: new Date(today) }, { after: getRange() }]}
            weekdaysShort={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
            fromMonth={currentMonth}
            toMonth={threeMonthRange}
          />
        )}
        <ThemeProvider theme={buttonDefault}>
          <Button priority="tertiary" size="small" css={validationButton} onClick={e => this.checkDateIsValid(e)}>Check date</Button>
        </ThemeProvider>
        <span>{state.dateError && (
          <div role="status" aria-live="assertive" css={marginTop}><Error error={state.dateError} /></div>)}
        </span>
        <span>{!state.dateError && state.dateValidated && (
          <div role="status" aria-live="assertive" css={marginTop}>
            {`Your gift will be delivered on ${valueDate ? valueDate.getDate() : ''} ${valueDate ? monthText[valueDate.getMonth()] : ''} ${valueDate ? valueDate.getFullYear() : ''}`}
          </div>)}
        </span>
      </div>
    );
  }
}

export default DatePickerFields;
