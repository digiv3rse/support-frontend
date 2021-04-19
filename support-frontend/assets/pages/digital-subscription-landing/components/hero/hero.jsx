// @flow

// ----- Imports ----- //

import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { LinkButton, buttonBrand } from '@guardian/src-button';
import { SvgArrowDownStraight } from '@guardian/src-icons';
import CentredContainer from 'components/containers/centredContainer';
import GridImage from 'components/gridImage/gridImage';
import PageTitle from 'components/page/pageTitle';
import Hero from 'components/page/hero';
// import GiftHeadingAnimation from 'components/animations/giftHeadingAnimation';

import {
  AUDCountries,
  type CountryGroupId,
} from 'helpers/internationalisation/countryGroup';
import { promotionHTML, type PromotionCopy } from 'helpers/productPrice/promotions';
import { sendTrackingEventsOnClick } from 'helpers/subscriptions';
import {
  heroCopy,
  heroTitle,
  paragraph,
  heavyText,
  yellowHeading,
  circleTextTop,
  circleTextBottom,
  circleTextGeneric,
  spaceAfter,
} from './heroStyles';

type PropTypes = {
  promotionCopy: PromotionCopy,
  countryGroupId: CountryGroupId,
  showPriceCards: boolean,
}

const HeroCopy = () => (
  <>
    <p css={paragraph}>
      We’re free to give voice to the voiceless. The unheard. The powerless.
      Become a digital subscriber today and help to fund our vital work.
    </p>
    <p css={paragraph}>
      With two innovative apps and ad-free reading, a digital subscription gives
      you the richest experience of Guardian journalism. Plus, for a limited time,
      you can read our latest special edition - The books of&nbsp;2021
    </p>
  </>
);

const HeroCopyAus = () => (
  <>
    <p css={paragraph}>
      With two innovative apps and ad-free reading, a digital subscription gives you the richest experience
      of Guardian Australia journalism. It also sustains the independent reporting you love.
    </p>
    <p css={paragraph}>
      You&apos;ll gain exclusive access to <span css={heavyText}>Australia Weekend</span>, the new digital
      edition, providing you with a curated view of the week&apos;s biggest stories, plus early access to
      essential weekend news.
    </p>
  </>);

const defaultRoundel = (
  <div>
    <div css={circleTextTop}>14 day</div>
    <div css={circleTextBottom}>free trial</div>
  </div>
);


function DigitalHero({ promotionCopy, countryGroupId, showPriceCards }: PropTypes) {
  const title = promotionCopy.title || <>Subscribe for stories<br />
    <span css={yellowHeading}>that must be told</span></>;

  const promoCopy = promotionHTML(promotionCopy.description, { css: paragraph, tag: 'div' });

  const roundelText = promotionHTML(promotionCopy.roundel, { css: circleTextGeneric }) || defaultRoundel;

  const defaultCopy = countryGroupId === AUDCountries ? <HeroCopyAus /> : <HeroCopy />;
  const copy = promoCopy || defaultCopy;

  return (
    <PageTitle
      title="Digital subscription"
      theme="digital"
    >
      <CentredContainer>
        <Hero
          image={<GridImage
            gridId={countryGroupId === AUDCountries ? 'editionsPackshotAus' : 'editionsPackshot'}
            srcSizes={[1000, 500, 140]}
            sizes="(max-width: 480px) 200px,
            (max-width: 740px) 100%,
            (max-width: 1067px) 150%,
            500px"
            altText="Digital subscriptions"
            imgType="png"
          />}
          roundelText={roundelText}
        >
          <section css={heroCopy}>
            <h2 css={heroTitle}>{title}</h2>
            <div>
              {copy}
            </div>
            <div css={countryGroupId === AUDCountries ? '' : spaceAfter}>
              <ThemeProvider theme={buttonBrand}>
                <LinkButton
                  href="#subscribe"
                  priority="tertiary"
                  size="default"
                  icon={<SvgArrowDownStraight />}
                  iconSide="right"
                  onClick={() => {
                    sendTrackingEventsOnClick({
                      id: 'options_cta_click',
                      product: 'DigitalPack',
                      componentType: 'ACQUISITIONS_BUTTON',
                    })();
                }}
                >
                  See pricing options
                </LinkButton>
              </ThemeProvider>
            </div>
          </section>
        </Hero>
      </CentredContainer>
    </PageTitle>
  );
}

export { DigitalHero };
