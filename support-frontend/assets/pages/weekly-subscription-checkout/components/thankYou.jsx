// @flow

// ----- Imports ----- //

import React from 'react';

import { connect } from 'react-redux';

import { HeroImage } from 'pages/weekly-subscription-landing/components/hero/hero';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';

import OrderedList from 'components/list/orderedList';
import Asyncronously from 'components/asyncronously/asyncronously';
import Content from 'components/content/content';
import Text, { LargeParagraph, SansParagraph } from 'components/text/text';
import { HeroWrapper } from 'components/productPage/productPageHero/productPageHero';
import HeadingBlock from 'components/headingBlock/headingBlock';
import {
  homeDeliveryUrl,
  manageSubsUrl,
  myAccountUrl,
} from 'helpers/externalLinks';
import typeof MarketingConsent
  from 'components/subscriptionCheckouts/thankYou/marketingConsentContainer';
import styles
  from 'components/subscriptionCheckouts/thankYou/thankYou.module.scss';
import { formatUserDate } from 'helpers/dateConversions';

import {
  type FormFields,
  getFormFields,
} from 'helpers/subscriptionsForms/formFields';

// ----- Types ----- //

type PropTypes = {
    ...FormFields,
    isPending: boolean,
};


// ----- Helper ----- //

const getPackageTitle = (billingPeriod) => {
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


function ThankYouContent({
  billingPeriod, startDate, isPending,
}: PropTypes) {
  const packageTitle = getPackageTitle(billingPeriod);
  return (
    <div className="thank-you-stage">
      <HeroWrapper appearance="custom" className={styles.hero}>
        <HeroImage />
        <HeadingBlock
          overheading="Thank you for supporting our journalism!"
        >
          {isPending ?
          `Your subscription to the Guardian Weekly ${packageTitle} is being processed` :
          `You have now subscribed to the Guardian Weekly ${packageTitle}`
  }
        </HeadingBlock>
      </HeroWrapper>
      <Content>
        {
          isPending && (
            <Text>
              <LargeParagraph>
                Your subscription is being processed and you will
                receive an email when it goes live.
              </LargeParagraph>
            </Text>
          )
        }
        {startDate &&
          <Text title="You will receive your first issue on">
            <LargeParagraph>{formatUserDate(new Date(startDate))}</LargeParagraph>
          </Text>
        }
        <Text title="What happens next?">
          <OrderedList items={[
            <span>
              Look out for an email from us confirming your subscription.
              It has everything you need to know about how to manage it in the future.
            </span>,
            <span>
              Your magazine will be delivered to your door. <a className="thank-you-link" href={homeDeliveryUrl}>Here&apos;s a reminder of how home delivery works</a>.
            </span>,
            ]}
          />
        </Text>
      </Content>
      <Content>
        <Text>
          <SansParagraph>
            You can manage your subscription by visiting our <a href={manageSubsUrl} onClick={sendTrackingEventsOnClick('checkout_mma', 'Paper', null)}>Manage section</a> or accessing
            it via <a href={myAccountUrl} onClick={sendTrackingEventsOnClick('checkout_my_account', 'Paper', null)}>your Guardian account</a>.
          </SansParagraph>
        </Text>
      </Content>
      <Content>
        <Asyncronously loader={import('components/subscriptionCheckouts/thankYou/marketingConsentContainer')}>
          {(MktConsent: MarketingConsent) => (

            <MktConsent
              render={({ title, message }) => (
                <Text title={title}>{message}</Text>
              )}
            />)
          }
        </Asyncronously>
      </Content>
    </div>
  );

}

// ----- Export ----- //


export default connect(state => ({ ...getFormFields(state) }))(ThankYouContent);
