// ----- Imports ----- //
import React from "react";
import { connect } from "react-redux";
import { sendTrackingEventsOnClick, GuardianWeekly } from "helpers/subscriptions";
import GridPicture from "components/gridPicture/gridPicture";
import OrderedList from "components/list/orderedList";
import Asyncronously from "components/asyncronously/asyncronously";
import Content from "components/content/content";
import Text, { LargeParagraph, SansParagraph } from "components/text/text";
import { HeroWrapper } from "components/productPage/productPageHero/productPageHero";
import HeadingBlock from "components/headingBlock/headingBlock";
import { homeDeliveryUrl, manageSubsUrl, helpCentreUrl } from "helpers/externalLinks";
type MarketingConsent = typeof import("components/subscriptionCheckouts/thankYou/marketingConsentContainer").default;
import styles from "components/subscriptionCheckouts/thankYou/thankYou.module.scss";
import { formatUserDate } from "helpers/dateConversions";
import { type FormFields, getFormFields } from "helpers/subscriptionsForms/formFields";
import type { Option } from "helpers/types/option";
import OptInCopy from "components/subscriptionCheckouts/thankYou/optInCopy";
import { SubscriptionsSurvey } from "components/subscriptionCheckouts/subscriptionsSurvey/SubscriptionsSurvey";
// ----- Types ----- //
type PropTypes = FormFields & {
  isPending: boolean;
  orderIsGift: boolean;
};

// ----- Helper ----- //
const getPackageTitle = billingPeriod => {
  switch (billingPeriod) {
    case 'Quarterly':
      return ' / quarterly package ';

    case 'Annual':
      return ' / annual package ';

    case 'SixWeekly':
      return ' / six for six package ';

    default:
      return '';
  }
};

const getHeading = (billingPeriod, isPending, orderIsGift) => {
  if (orderIsGift) {
    return isPending ? 'Your Guardian Weekly gift subscription is being processed' : 'Your purchase of a Guardian Weekly gift subscription is now complete';
  }

  const packageTitle = getPackageTitle(billingPeriod);
  return isPending ? `Your subscription to the Guardian Weekly ${packageTitle} is being processed` : `You have now subscribed to the Guardian Weekly ${packageTitle}`;
};

const StartDateCopy = ({
  startDate,
  orderIsGift
}: {
  startDate: Option<string>;
  orderIsGift: boolean;
}) => {
  if (startDate) {
    const title = orderIsGift ? 'The gift recipient\'s first issue will be published on' : 'Your first issue will be published on';
    return <Text title={title}>
        <LargeParagraph>{formatUserDate(new Date(startDate))}</LargeParagraph>
      </Text>;
  }

  return null;
};

const HeroImage = ({
  orderIsGift
}: {
  orderIsGift: boolean;
}) => <GridPicture sources={[{
  gridId: orderIsGift ? 'gwGiftingPackshot' : 'weeklyLandingHero',
  srcSizes: [500, 1000],
  imgType: 'png',
  sizes: '100vw',
  media: '(max-width: 739px)'
}, {
  gridId: orderIsGift ? 'gwGiftingPackshot' : 'weeklyLandingHero',
  srcSizes: [1000, 2000],
  imgType: 'png',
  sizes: '(min-width: 1000px) 2000px, 1000px',
  media: '(min-width: 740px)'
}]} fallback={orderIsGift ? 'gwGiftingPackshot' : 'weeklyLandingHero'} fallbackSize={1000} altText="A collection of Guardian Weekly magazines" fallbackImgType="png" />;

function ThankYouContent({
  billingPeriod,
  startDate,
  isPending,
  orderIsGift,
  product
}: PropTypes) {
  const whatHappensNextItems = orderIsGift ? [<span>
        Look out for an email from us confirming your subscription.
      </span>, <span>
        We&apos;re unable to contact the gift recipient directly - make sure to let them know the gift is on its way.
      </span>, <span>
        Each copy will be delivered to the gift recipient&apos;s door.{' '}
        <a className="thank-you-link" href={homeDeliveryUrl}>Here&apos;s a reminder of how home delivery works</a>.
      </span>] : [<span>
        Look out for an email from us confirming your subscription. It will contain everything you need to know.
      </span>, <span>
        Your magazine will be delivered to your door.
        Please allow 1 to 7 days after publication date for your magazine to arrive, depending on national
        post services.
      </span>];
  return <div className="thank-you-stage">
      <HeroWrapper appearance="custom" className={!orderIsGift ? styles.heroGuardianWeeklyNonGifting : styles.hero}>
        <HeroImage orderIsGift={orderIsGift} />
        <HeadingBlock overheadingClass="--thankyou" overheading="Thank you for supporting our journalism!">
          {getHeading(billingPeriod, isPending, orderIsGift)}
        </HeadingBlock>
      </HeroWrapper>
      <Content>
        {isPending && <Text>
              <LargeParagraph>
                Your subscription is being processed and you will
                receive an email when it goes live.
              </LargeParagraph>
            </Text>}
        <StartDateCopy orderIsGift={orderIsGift} startDate={startDate} />
        <Text title="What happens next?">
          <OrderedList items={whatHappensNextItems} />
        </Text>
      </Content>
      <Content>
        <Text>
          <SansParagraph>
          You can manage your subscription by visiting <a href={manageSubsUrl} onClick={sendTrackingEventsOnClick({
            id: 'checkout_my_account',
            product: 'Paper',
            componentType: 'ACQUISITIONS_BUTTON'
          })}>Manage My Account</a>. For any other queries please visit the <a href={helpCentreUrl} onClick={sendTrackingEventsOnClick({
            id: 'checkout_help_centre',
            product: 'Paper',
            componentType: 'ACQUISITIONS_BUTTON'
          })}>Help Centre</a>.
          </SansParagraph>
        </Text>
      </Content>
      <SubscriptionsSurvey product={product} />
      <Content>
        <Asyncronously loader={import('components/subscriptionCheckouts/thankYou/marketingConsentContainer')}>
          {(MktConsent: MarketingConsent) => <MktConsent />}
        </Asyncronously>
        <OptInCopy subscriptionProduct={GuardianWeekly} />
      </Content>
    </div>;
} // ----- Export ----- //


export default connect(state => ({ ...getFormFields(state)
}))(ThankYouContent);