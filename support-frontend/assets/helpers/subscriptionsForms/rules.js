// @flow

import { formError, nonEmptyString, notNull, validate } from './validation';
import type { FormField, FormFields } from './formFields';
import type { FormError } from './validation';
import { checkOptionalEmail, checkEmail, checkGiftStartDate } from 'helpers/formValidation';

function applyCheckoutRules(fields: FormFields): FormError<FormField>[] {
  const { orderIsAGift, product } = fields;
  const userFormFields = [
    {
      rule: nonEmptyString(fields.firstName),
      error: formError('firstName', 'Please enter a first name.'),
    },
    {
      rule: nonEmptyString(fields.lastName),
      error: formError('lastName', 'Please enter a last name.'),
    },
    {
      rule: notNull(fields.paymentMethod),
      error: formError('paymentMethod', 'Please select a payment method.'),
    },
  ];
  const giftFormFields = product === 'DigitalPack' ?
    [
      {
        rule: nonEmptyString(fields.firstNameGiftRecipient),
        error: formError('firstNameGiftRecipient', 'Please enter the recipient\'s first name.'),
      },
      {
        rule: nonEmptyString(fields.lastNameGiftRecipient),
        error: formError('lastNameGiftRecipient', 'Please enter the recipient\'s last name.'),
      },
      {
        rule: checkEmail(fields.emailGiftRecipient),
        error: formError('emailGiftRecipient', 'Please use a valid email address for the recipient.'),
      },
      {
        rule: checkGiftStartDate(fields.giftDeliveryDate),
        error: formError('giftDeliveryDate', 'Please enter a valid delivery date for your gift.'),
      },
    ] :
    [
      {
        rule: nonEmptyString(fields.firstNameGiftRecipient),
        error: formError('firstNameGiftRecipient', 'Please enter the recipient\'s first name.'),
      },
      {
        rule: nonEmptyString(fields.lastNameGiftRecipient),
        error: formError('lastNameGiftRecipient', 'Please enter the recipient\'s last name.'),
      },
      {
        rule: checkOptionalEmail(fields.emailGiftRecipient),
        error: formError('emailGiftRecipient', 'Please use a valid email address for the recipient.'),
      },
    ];
  const formFieldsToCheck = orderIsAGift ?
    [...userFormFields, ...giftFormFields]
    : userFormFields;

  return validate(formFieldsToCheck);
}

function applyDeliveryRules(fields: FormFields): FormError<FormField>[] {
  return validate([
    {
      rule: notNull(fields.startDate),
      error: formError('startDate', 'Please select a start date'),
    },
    {
      rule: notNull(fields.billingAddressIsSame),
      error: formError(
        'billingAddressIsSame',
        'Please indicate whether the billing address is the same as the delivery address',
      ),
    },
  ]).concat(applyCheckoutRules(fields));
}

export { applyCheckoutRules, applyDeliveryRules };
