// ----- Imports ----- //
import React from "react";
import type { SubscriptionProduct } from "helpers/subscriptions";
import AnchorButton from "components/button/anchorButton";
import Text from "components/text/text";
import Content from "components/content/content";
import "./subscriptionsSurvey.scss";
type PropTypes = {
  product: SubscriptionProduct;
};
const surveyLinks: Record<SubscriptionProduct, string> = {
  DigitalPack: 'https://www.surveymonkey.com/r/PQMWMHW',
  GuardianWeekly: 'https://www.surveymonkey.co.uk/r/QFNYV5G',
  Paper: 'https://www.surveymonkey.co.uk/r/Q37XNTV'
};
export const SubscriptionsSurvey = ({
  product
}: PropTypes) => {
  const surveyLink = surveyLinks[product];
  const title = 'Tell us about your subscription';
  const message = 'Please take this short survey to tell us why you purchased your subscription';
  return surveyLink ? <Content>
      <section className="component-subscriptions-survey">
        <Text title={title}>{message}</Text>
        <AnchorButton href={surveyLink} appearance="secondary" aria-label="Link to subscription survey">
            Share your thoughts
        </AnchorButton>
      </section>
    </Content> : null;
};