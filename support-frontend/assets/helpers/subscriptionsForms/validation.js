// @flow

// ----- Imports ----- //
import { type Node } from 'react';
import { headOption, type Option } from 'helpers/types/option';


// ----- Types ----- //

export type ErrorMessage = string | Node;

type Rule<Err> = { rule: boolean, error: Err };

export type FormError<FieldType> = {
  field: FieldType,
  message: ErrorMessage,
};


// ----- Rules ----- //

const nonEmptyString: ?string => boolean = s => (s || '').trim() !== '';

function notNull<A>(value: A): boolean {
  return value !== null;
}

function nonSillyCharacters(s: ?string): boolean {
  const nonAsciiRegex = (/[^\x20-\x7E]/g);
  if (!s) {
    return true;
  }
  return !nonAsciiRegex.test(s);
}

// ----- Functions ----- //

function firstError<FieldType>(field: FieldType, errors: FormError<FieldType>[]): Option<ErrorMessage> {
  const msgs = errors.filter(err => err.field === field).map(err => err.message);
  return headOption(msgs);
}

function removeError<FieldType>(field: FieldType, formErrors: FormError<FieldType>[]): FormError<FieldType>[] {
  return formErrors.filter(error => error.field !== field);
}

function formError<FieldType>(field: FieldType, message: ErrorMessage): FormError<FieldType> {
  return { field, message };
}

function validate<Err>(rules: Rule<Err>[]): Err[] {
  return rules.reduce((errors, { rule, error }) => (rule ? errors : [...errors, error]), []);
}

// -------- Forms------------ //


// ----- Exports ----- //

export {
  nonEmptyString,
  notNull,
  firstError,
  formError,
  removeError,
  validate,
  nonSillyCharacters,
};
