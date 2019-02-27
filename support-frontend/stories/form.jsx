// @flow

import React from 'react';

import { storiesOf } from '@storybook/react';

import Rows from 'components/base/rows';
import { Input } from 'components/forms/standardFields/input';
import { Label as FormLabel } from 'components/forms/standardFields/label';
import { Fieldset } from 'components/forms/standardFields/fieldset';
import { Select } from 'components/forms/standardFields/select';
import { RadioInput } from 'components/forms/customFields/radioInput';
import { withLabel } from 'components/forms/formHOCs/withLabel';
import { withError } from 'components/forms/formHOCs/withError';
import { withCenterAlignment } from '../.storybook/decorators/withCenterAlignment';

const stories = storiesOf('Forms', module).addDecorator(withCenterAlignment);

const InputWithLabel = withLabel(Input);
const SelectWithLabel = withLabel(Select);
const InputWithLabelAndError = withError(InputWithLabel);

stories.add('Forms', () => (
  <Rows style={{ width: '30em' }} gap="large">
    <InputWithLabel id="1" label="What is your name?" />
    <InputWithLabel id="2" label="This one has a footer" footer="Some explanation about this input" />
    <InputWithLabelAndError id="3" label="This one is always wrong" error="like this" />
    <InputWithLabel id="4" label="What is the coolest pokemon?" value="Lycanroc" disabled />
    <SelectWithLabel id="5" label="How do you feel about buttons?">
      <option>Indifferent</option>
      <option>Hate them</option>
      <option>Weirdly emotional</option>
    </SelectWithLabel>
    <FormLabel label="Select your fav" htmlFor={null}>
      <Fieldset legend="Select your fav">
        <Rows gap="small">
          <RadioInput appearance="group" id="fruits" text="Banana" name="chonkyBois" />
          <RadioInput appearance="group" id="fruits" text="Pear" name="chonkyBois" />
          <RadioInput appearance="group" id="fruits" text="Apple" name="chonkyBois" />
        </Rows>
      </Fieldset>
    </FormLabel>
    <FormLabel label="Do you consent to the usage of your data under GDPR rules" htmlFor={null}>
      <Fieldset legend="Select your fav">
        <Rows gap="small">
          <RadioInput id="gdpr" text="Yes" name="gdpr" />
          <RadioInput id="gdpr" text="No" name="gdpr" />
        </Rows>
      </Fieldset>
    </FormLabel>
  </Rows>
));
