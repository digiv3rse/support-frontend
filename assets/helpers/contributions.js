// @flow

// ----- Imports ----- //

import { roundDp } from 'helpers/utilities';

import type { Currency } from 'helpers/internationalisation/currency';


// ----- Types ----- //

export type Contrib = 'ANNUAL' | 'MONTHLY' | 'ONE_OFF';

export type BillingPeriod = 'Monthly' | 'Annual';

export type ContribError =
  | 'tooLittle'
  | 'tooMuch'
  | 'invalidEntry';

export type Amount = {
  value: string,
  userDefined: boolean,
};

export type Amounts = {
  annual: Amount,
  monthly: Amount,
  oneOff: Amount,
};

export type ParsedContrib = {
  amount: number,
  error: ?ContribError,
};

type Config = {
  [Contrib]: {
    min: number,
    minInWords: string,
    max: number,
    maxInWords: string,
    default: number,
  }
}


// ----- Setup ----- //

const config: Config = {
  ANNUAL: {
    min: 50,
    minInWords: 'fifty',
    max: 2000,
    maxInWords: 'two thousand',
    default: 75,
  },
  MONTHLY: {
    min: 2,
    minInWords: 'two',
    max: 166,
    maxInWords: 'one hundred and sixty six',
    default: 10,
  },
  ONE_OFF: {
    min: 1,
    minInWords: 'one',
    max: 2000,
    maxInWords: 'two thousand',
    default: 50,
  },
};


// ----- Functions ----- //

function parse(input: ?string, contrib: Contrib): ParsedContrib {

  let error = null;
  const numericAmount = Number(input);

  if (input === undefined || input === null || input === '' || Number.isNaN(numericAmount)) {
    error = 'invalidEntry';
  } else if (numericAmount < config[contrib].min) {
    error = 'tooLittle';
  } else if (numericAmount > config[contrib].max) {
    error = 'tooMuch';
  }

  const amount = error ? config[contrib].default : roundDp(numericAmount);

  return { error, amount };

}

function parseContrib(s: ?string, contrib: Contrib): Contrib {
  switch ((s || contrib).toUpperCase()) {
    case 'ANNUAL': return 'ANNUAL';
    case 'MONTHLY': return 'MONTHLY';
    case 'ONE_OFF': return 'ONE_OFF';
    default: return contrib;
  }
}

function billingPeriodFromContrib(contrib: Contrib): BillingPeriod {
  switch (contrib) {
    case 'ANNUAL': return 'Annual';
    default: return 'Monthly';
  }
}

function errorMessage(
  error: ContribError,
  currency: Currency,
  contributionType: Contrib,
): ?string {

  const minContrib = config[contributionType].min;
  const maxContrib = config[contributionType].max;

  switch (error) {
    case 'tooLittle':
      return `Please enter at least ${currency.glyph}${minContrib}`;
    case 'tooMuch':
      return `${currency.glyph}${maxContrib} is the maximum we can accept`;
    case 'invalidEntry':
      return 'Please enter a numeric amount';
    default:
      return null;
  }

}

function contribCamelCase(contrib: Contrib): string {

  switch (contrib) {
    case 'ANNUAL': return 'annual';
    case 'MONTHLY': return 'monthly';
    default: return 'oneOff';
  }

}


// ----- Exports ----- //

export {
  config,
  parse,
  parseContrib,
  billingPeriodFromContrib,
  errorMessage,
  contribCamelCase,
};
