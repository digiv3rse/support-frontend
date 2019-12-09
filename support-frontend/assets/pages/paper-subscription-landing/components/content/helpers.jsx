// @flow

// ----- Imports ----- //

import React, { type Element, type Node } from 'react';

import { type Option } from 'helpers/types/option';
import Content from 'components/content/content';
import Text, { SansParagraph, Callout } from 'components/text/text';
import ProductPageInfoChip from 'components/productPage/productPageInfoChip/productPageInfoChip';
import { paperSubsUrl } from 'helpers/routes';
import { flashSaleIsActive, getDiscount, getDuration, getPromoCode } from 'helpers/flashSale';

import { type ActiveTabState } from '../../paperSubscriptionLandingPageReducer';
import { setTab } from '../../paperSubscriptionLandingPageActions';

import Form from './form';
import { Collection, HomeDelivery } from 'helpers/productPrice/fulfilmentOptions';
import { paperHasDeliveryEnabled } from 'helpers/subscriptions';
import { GBPCountries } from 'helpers/internationalisation/countryGroup';

import { promoQueryParam } from 'helpers/productPrice/promotions';
import { promotionTermsUrl } from 'helpers/routes';
import { getQueryParameter } from 'helpers/url';

// Types
export type ContentPropTypes = {|
  selectedTab: ActiveTabState,
  setTabAction: typeof setTab
|};

export type ContentTabPropTypes = {|
  ...ContentPropTypes,
  getRef: (?HTMLElement)=> void
|};

const promoTermsUrl = promotionTermsUrl(getQueryParameter(promoQueryParam) || getPromoCode('Paper', GBPCountries, 'GE19SUBS'));

// Helper functions
const getPageInfoChip = (): string => {
  if (flashSaleIsActive('Paper', 'GBPCountries')) {
    return 'You can cancel your subscription at any time. Offer is for the first year. Standard subscription rates apply thereafter.';
  }
  return 'You can cancel your subscription at any time.';
};

const DiscountCalloutMaybe = () => {
  if (!flashSaleIsActive('Paper', 'GBPCountries')) { return null; }
  const [discount, duration] = [
    getDiscount('Paper', 'GBPCountries'),
    getDuration('Paper', 'GBPCountries'),
  ];
  if (discount && duration) {
    return <Callout>Save up to {Math.round(discount * 100)}% for {duration}</Callout>;
  } else if (discount) {
    return <Callout>Save up to {Math.round(discount * 100)}% </Callout>;
  }
  return null;

};


// ----- Auxiliary Components ----- //
const ContentHelpBlock = ({
  faqLink, telephoneLink,
}: {|
  faqLink: Element<string>,
  telephoneLink: Element<string>
|}) => (
  <Content appearance="feature" modifierClasses={['faqs']}>
    {flashSaleIsActive('Paper', GBPCountries) &&
      <Text title="Promotion terms and conditions">
        <SansParagraph>
          Offer subject to availability. Guardian News and Media Limited (&ldquo;GNM&rdquo;) reserves the right to withdraw this promotion at any time. For full promotion terms and conditions, see <a target="_blank" rel="noopener noreferrer" href={promoTermsUrl}>here</a>.
        </SansParagraph>
      </Text>
    }
    <Text title="FAQ and help">
      <SansParagraph>
        If you’ve got any more questions, you might well find the answers in the {faqLink}.
      </SansParagraph>
      <SansParagraph>
        If you can’t find the answer to your question here, please call our customer services team on {telephoneLink}.
      </SansParagraph>
    </Text>
  </Content>
);

const LinkTo = ({
  setTabAction, tab, children,
}: {|
  setTabAction: typeof setTab,
  tab: ActiveTabState,
  children: Node
|}) => (
  <a
    href={paperSubsUrl(tab === 'delivery')}
    onClick={(ev) => {
      ev.preventDefault();
      setTabAction(tab);
    }}
  >
    {children}
  </a>
);

const ContentForm = ({
  title, text, setTabAction, selectedTab,
}: {|
  title: string,
  text?: Option<string>,
  selectedTab: ActiveTabState,
  setTabAction: typeof setTab,
|}) => (
  <Content appearance="feature" id="subscribe">
    <Text
      title={title}
    >
      <DiscountCalloutMaybe />
      {text &&
      <p>{text}</p>
      }
    </Text>
    <Form />
    {paperHasDeliveryEnabled() &&
      <Text>
        <SansParagraph>
          {
            selectedTab === Collection
              ? <LinkTo tab={HomeDelivery} setTabAction={setTabAction}>Switch to Delivery</LinkTo>
              : <LinkTo tab={Collection} setTabAction={setTabAction}>Switch to Vouchers</LinkTo>
          }
        </SansParagraph>
      </Text>
    }
    <ProductPageInfoChip>
      {getPageInfoChip()}
    </ProductPageInfoChip>
  </Content>
);
ContentForm.defaultProps = { text: null };

export { ContentHelpBlock, LinkTo, ContentForm };
