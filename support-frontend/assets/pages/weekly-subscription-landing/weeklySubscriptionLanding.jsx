// @flow

// ----- Imports ----- //

import * as React from 'react';
import type { Element } from 'react';
import { Provider } from 'react-redux';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';

import Page from 'components/page/page';
import headerWithCountrySwitcherContainer
  from 'components/headers/header/headerWithCountrySwitcher';
import WeeklyFooter from 'components/footerCompliant/WeeklyFooter';

import {
  AUDCountries,
  Canada,
  type CountryGroupId,
  detect,
  EURCountries,
  GBPCountries,
  International,
  NZDCountries,
  UnitedStates,
} from 'helpers/internationalisation/countryGroup';
import { init as pageInit } from 'helpers/page/page';
import { renderPage } from 'helpers/render';
import Text, { LargeParagraph } from 'components/text/text';

import FullWidthContainer from 'components/containers/FullWidthContainer';
import CentredContainer from 'components/containers/CentredContainer';
import Block from 'components/page/Block';

import 'stylesheets/skeleton/skeleton.scss';

import { WeeklyHero } from './components/hero/hero';
import Benefits from './components/content/Benefits';
import GiftBenefits from './components/content/GiftBenefits';

import WeeklyPrices from './components/weeklyProductPrices';
import reducer from './weeklySubscriptionLandingReducer';
import { pricesSection, giftOrPersonalSection, giftOrPersonalCopy, paddedSection } from './weeklySubscriptionLandingStyles';

import './weeklySubscriptionLanding.scss';
import type { PromotionCopy } from 'helpers/productPrice/promotions';
import { promoQueryParam } from 'helpers/productPrice/promotions';
import { promotionTermsUrl, routes } from 'helpers/routes';
import { getQueryParameter } from 'helpers/url';

type PageCopy = {|
  title: string | React.Node,
  firstParagraph: React.Node,
  priceCardSubHeading: string,
|};

// ----- Redux Store ----- //

const store = pageInit(() => reducer, true);
const { orderIsAGift } = store.getState().page;

// ----- Internationalisation ----- //

const countryGroupId: CountryGroupId = detect();

const reactElementId: {
  [CountryGroupId]: string,
} = {
  GBPCountries: 'weekly-landing-page-uk',
  UnitedStates: 'weekly-landing-page-us',
  AUDCountries: 'weekly-landing-page-au',
  NZDCountries: 'weekly-landing-page-nz',
  EURCountries: 'weekly-landing-page-eu',
  Canada: 'weekly-landing-page-ca',
  International: 'weekly-landing-page-int',
};

const path = orderIsAGift ? '/subscribe/weekly/gift' : '/subscribe/weekly';

const Header = headerWithCountrySwitcherContainer({
  path,
  countryGroupId,
  listOfCountryGroups: [
    GBPCountries,
    UnitedStates,
    AUDCountries,
    EURCountries,
    Canada,
    NZDCountries,
    International,
  ],
  trackProduct: 'GuardianWeekly',
});

const getSanitisedHtml = (description: string) =>
  // ensure we don't accidentally inject dangerous html into the page
  DOMPurify.sanitize(
    marked(description),
    { ALLOWED_TAGS: ['em', 'strong', 'ul', 'li', 'a', 'p'] },
  );

const getFirstParagraph = (promotionCopy: ?PromotionCopy) => {
  if (promotionCopy && promotionCopy.description) {
    const sanitised = getSanitisedHtml(promotionCopy.description);
    return (
    /* eslint-disable react/no-danger */
      <>
        <span
          className="promotion-description"
          dangerouslySetInnerHTML={
          { __html: sanitised }
        }
        />
      </>);
    /* eslint-enable react/no-danger */
  }
  return (
    <>
      <h3><strong>Catch up on issues that matter</strong></h3>
      The Guardian Weekly magazine is a round-up of the world news, opinion and long reads that have shaped the week.
      Inside, the past seven days' most memorable stories are reframed with striking photography and insightful
      companion pieces, all handpicked from The Guardian and The Observer.
    </>);
};

const getRegionalCopyFor = (region: CountryGroupId): Element<'span'> => (region === GBPCountries ?
  <span>Find clarity with The Guardian&apos;s global magazine.<br /> Subscribe today</span> :
  <span>Read The Guardian in print. Subscribe to<br className="gw-temp-break" />The Guardian Weekly today</span>);

const getCopy = (promotionCopy: Object): PageCopy => {
  const currentRegion = detect();
  const defaultTitle = orderIsAGift ?
    <>
      To: You<br />
      From: Me
    </>
    : getRegionalCopyFor(currentRegion);
  return {
    title: promotionCopy && promotionCopy.title ? promotionCopy.title : defaultTitle,
    firstParagraph: getFirstParagraph(promotionCopy),
    priceCardSubHeading: orderIsAGift ? 'Select a gift period' : 'Choose how you\'d like to pay',
  };
};

// ----- Render ----- //

const { promotionCopy, orderIsAGift } = store.getState().page;
const { internationalisation } = store.getState().common;
const copy = getCopy(promotionCopy, orderIsAGift);
const defaultPromo = orderIsAGift ? 'GW20GIFT1Y' : '10ANNUAL';
const promoTermsLink = promotionTermsUrl(getQueryParameter(promoQueryParam) || defaultPromo);

const content = (
  <Provider store={store}>
    <Page
      header={<Header />}
      footer={<WeeklyFooter centred promoTermsLink={promoTermsLink} />}
    >
      <WeeklyHero
        orderIsAGift={orderIsAGift}
        currencyId={internationalisation.currencyId}
        copy={{
          title: copy.title,
          paragraph: copy.firstParagraph,
        }}
      />
      <FullWidthContainer>
        <CentredContainer>
          <Block>
            {orderIsAGift ? <GiftBenefits /> : <Benefits />}
          </Block>
        </CentredContainer>
      </FullWidthContainer>
      <FullWidthContainer cssOverrides={pricesSection}>
        <CentredContainer>
          <WeeklyPrices />
        </CentredContainer>
      </FullWidthContainer>
      <FullWidthContainer cssOverrides={giftOrPersonalSection}>
        <CentredContainer>
          <section css={paddedSection}>
            <div css={giftOrPersonalCopy}>
              <Text title={orderIsAGift ? 'Looking for a subscription for yourself?' : 'Gift subscriptions'}>
                {!orderIsAGift && <LargeParagraph>A Guardian Weekly subscription makes a great gift.</LargeParagraph>}
              </Text>
            </div>
            <LinkButton
              icon={<SvgArrowRightStraight />}
              iconSide="right"
              priority="tertiary"
              href={orderIsAGift ?
              routes.guardianWeeklySubscriptionLanding : routes.guardianWeeklySubscriptionLandingGift}
            >
              {orderIsAGift ? 'See personal subscriptions' : 'See gift subscriptions'}
            </LinkButton>
          </section>
        </CentredContainer>
      </FullWidthContainer>
    </Page>
  </Provider>
);

renderPage(content, reactElementId[countryGroupId]);
