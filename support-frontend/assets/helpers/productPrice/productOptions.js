// @flow

// describes options relating to a product itself - only relevant for paper currently

const NoProductOptions: 'NoProductOptions' = 'NoProductOptions';
const Corporate: 'Corporate' = 'Corporate';
const Saturday: 'Saturday' = 'Saturday';
const SaturdayPlus: 'SaturdayPlus' = 'SaturdayPlus';
const Sunday: 'Sunday' = 'Sunday';
const SundayPlus: 'SundayPlus' = 'SundayPlus';
const Weekend: 'Weekend' = 'Weekend';
const WeekendPlus: 'WeekendPlus' = 'WeekendPlus';
const Sixday: 'Sixday' = 'Sixday';
const SixdayPlus: 'SixdayPlus' = 'SixdayPlus';
const Everyday: 'Everyday' = 'Everyday';
const EverydayPlus: 'EverydayPlus' = 'EverydayPlus';

export type ProductOptions =
  typeof NoProductOptions
  | typeof Corporate
  | typeof Saturday
  | typeof SaturdayPlus
  | typeof Sunday
  | typeof SundayPlus
  | typeof Weekend
  | typeof WeekendPlus
  | typeof Sixday
  | typeof SixdayPlus
  | typeof Everyday
  | typeof EverydayPlus;

export type PaperProductOptions =
  | typeof Saturday
  | typeof Sunday
  | typeof Weekend
  | typeof Sixday
  | typeof Everyday;

export type DigitalProductOptions =
  | typeof Corporate
  | typeof NoProductOptions


const ActivePaperProductTypes = [Everyday, Sixday, Weekend, Sunday];

export {
  NoProductOptions,
  Corporate,
  Saturday,
  SaturdayPlus,
  Sunday,
  SundayPlus,
  Weekend,
  WeekendPlus,
  Sixday,
  SixdayPlus,
  Everyday,
  EverydayPlus,
  ActivePaperProductTypes,
};
