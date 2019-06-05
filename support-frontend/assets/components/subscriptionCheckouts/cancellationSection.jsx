// @flow
import React from 'react';
import { FormSection } from 'components/checkoutForm/checkoutForm';
import Text from 'components/text/text';

export default function CancellationSection() {
  return (
    <FormSection>
      <Text>
        <p>
          <strong>Cancel at any point.</strong> There is no set time on your agreement with us so you can end
          your subscription whenever you wish
        </p>
      </Text>
    </FormSection>);
}
