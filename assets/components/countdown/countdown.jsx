// @flow

// ----- Imports ----- //
import React, { Component } from 'react';


// ---- Types ----- //
type CountdownTime = {
  unixTimeLeft: number,
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
}

type PropTypes = {
  to: number
};

type StateTypes = {
  time: CountdownTime
}


// ---- Helpers ----- //
const addLeadingZeros = (value: number, length: number = 2): string => {
  let valueStr = String(value);
  while (valueStr.length < length) {
    valueStr = `0${valueStr}`;
  }
  return valueStr;
};

const calculateCountdown = (endDate: number): CountdownTime => {
  const unixTimeLeft = endDate - Date.now();

  const seconds = Math.floor((unixTimeLeft / 1000) % 60);
  const minutes = Math.floor((unixTimeLeft / 1000 / 60) % 60);
  const hours = Math.floor((unixTimeLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(unixTimeLeft / (1000 * 60 * 60 * 24));

  return {
    unixTimeLeft, seconds, minutes, hours, days,
  };
};


// ----- Component ----- //
export default class Countdown extends Component<PropTypes, StateTypes> {

  constructor(props: PropTypes) {
    super(props);

    this.state = {
      time: calculateCountdown(this.props.to),
    };
  }

  componentDidMount(): void {
    this.interval = setInterval(() => {
      const time = calculateCountdown(this.props.to);
      if (time.unixTimeLeft >= 0) { this.setState({ time }); } else { this.stop(); }
    }, 1000);
  }

  componentWillUnmount(): void {
    this.stop();
  }

  interval: IntervalID;

  stop(): void {
    clearInterval(this.interval);
  }

  render() {
    const {
      days, hours, minutes, seconds,
    } = this.state.time;

    const units = days > 0 ? [days, hours, minutes] : [hours, minutes, seconds];

    return (
      <time>
        {units.map(addLeadingZeros).join(':')}
      </time>
    );
  }
}
