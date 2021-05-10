import React from "react";
import { css } from "@emotion/core";
import { space } from "@guardian/src-foundations";
import { from } from "@guardian/src-foundations/mq";
import { body, headline } from "@guardian/src-foundations/typography";
import FlexContainer from "components/containers/flexContainer";
import PaymentSelection from "pages/digital-subscription-landing/components/paymentSelection/paymentSelection";
const pricesSection = css`
  padding: 0 ${space[3]}px ${space[12]}px;
`;
const priceBoxes = css`
  margin-top: ${space[6]}px;
  justify-content: flex-start;
  align-items: stretch;
  ${from.desktop} {
    margin-top: ${space[9]}px;
  }
`;
const pricesHeadline = css`
  ${headline.medium({
  fontWeight: 'bold'
})};
`;
const pricesSubHeadline = css`
  ${body.medium()}
  padding-bottom: ${space[2]}px;
`;
const ctaCopy = {
  standard: {
    title: 'Choose one of our special offers and subscribe today',
    paragraph: <>After your <strong>14-day free trial</strong>, your
      subscription will begin automatically and you can cancel any time</>
  },
  gift: {
    title: 'Choose one of our special gift offers',
    paragraph: 'Select a gift period'
  }
};

function Prices({
  orderIsAGift
}: {
  orderIsAGift: boolean;
}) {
  const copy = orderIsAGift ? ctaCopy.gift : ctaCopy.standard;
  return <section css={pricesSection} id="subscribe">
      <h2 css={pricesHeadline}>{copy.title}</h2>
      <p css={pricesSubHeadline}>{copy.paragraph}</p>
      <FlexContainer cssOverrides={priceBoxes}>
        <PaymentSelection />
      </FlexContainer>
    </section>;
}

export default Prices;