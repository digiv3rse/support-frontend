// @flow

// ----- Imports ----- //

import React from 'react';

import { FlashSaleCountdownInHero } from 'components/flashSaleCountdown/flashSaleCountdown';
import LeftMarginSection from 'components/leftMarginSection/leftMarginSection';
import GridPicture, {
  type GridImage,
  type GridSlot,
  type PropTypes as GridPictureProps,
  type Source as GridSource,
} from 'components/gridPicture/gridPicture';
import { type ImageId as GridId } from 'helpers/theGrid';
import HeadingBlock from 'components/headingBlock/headingBlock';

import SvgChevron from 'components/svgs/chevron';
import { CirclesLeft, CirclesRight } from 'components/svgs/digitalSubscriptionLandingHeaderCircles';
import AnchorButton from 'components/button/anchorButton';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { sendTrackingEventsOnClick, type SubscriptionProduct } from 'helpers/subscriptions';
import { flashSaleIsActive, getSaleCopy } from 'helpers/flashSale';
import { HeroHanger } from 'components/productPage/productPageHero/productPageHero';

import { showUpgradeMessage } from '../helpers/upgradePromotion';
import { showCountdownTimer } from '../../../helpers/flashSale';

// ----- Types ----- //

type PropTypes = {|
  countryGroupId: CountryGroupId,
|};

type GridImages = {
  breakpoints: {
    mobile: GridImage,
    tablet: GridImage,
    desktop: GridImage,
  },
  fallback: GridId,
};

type GridSlots = {
  mobile: GridSlot,
  tablet: GridSlot,
  desktop: GridSlot,
};


// ----- Setup ----- //

const defaultImages: GridImages = {
  breakpoints: {
    mobile: {
      gridId: 'digitalSubscriptionHeaderMobile',
      srcSizes: [342, 684, 1200],
      imgType: 'png',
    },
    tablet: {
      gridId: 'digitalSubscriptionHeaderTablet',
      srcSizes: [500, 1000, 2000],
      imgType: 'png',
    },
    desktop: {
      gridId: 'digitalSubscriptionHeaderDesktop',
      srcSizes: [500, 1000, 2000, 4045],
      imgType: 'png',
    },
  },
  fallback: 'digitalSubscriptionHeaderDesktop',
};

const gridImagesByCountry: {
  [CountryGroupId]: GridImages,
} = {
  GBPCountries: defaultImages,
  UnitedStates: defaultImages,
  International: defaultImages,
  EURCountries: defaultImages,
  NZDCountries: defaultImages,
  Canada: defaultImages,
  AUDCountries: {
    breakpoints: {
      mobile: {
        gridId: 'digitalSubscriptionHeaderMobileAU',
        srcSizes: [310, 620, 1088],
        imgType: 'png',
      },
      tablet: {
        gridId: 'digitalSubscriptionHeaderTabletAU',
        srcSizes: [500, 1000, 2000],
        imgType: 'png',
      },
      desktop: {
        gridId: 'digitalSubscriptionHeaderDesktopAU',
        srcSizes: [500, 1000, 2000, 4045],
        imgType: 'png',
      },
    },
    fallback: 'digitalSubscriptionHeaderDesktopAU',
  },
};

const gridSlots: GridSlots = {
  mobile: {
    sizes: '240px',
    media: '(max-width: 739px)',
  },
  tablet: {
    sizes: '407px',
    media: '(min-width: 740px) and (max-width: 1139px)',
  },
  desktop: {
    sizes: '809px',
    media: '(min-width: 1140px)',
  },
};


// ----- Functions ----- //

function gridPicture(cgId: CountryGroupId): GridPictureProps {

  const gridImages: GridImages = gridImagesByCountry[cgId];
  const sources: GridSource[] = [
    { ...gridSlots.mobile, ...gridImages.breakpoints.mobile },
    { ...gridSlots.tablet, ...gridImages.breakpoints.tablet },
    { ...gridSlots.desktop, ...gridImages.breakpoints.desktop },
  ];

  return {
    sources,
    fallback: gridImages.fallback,
    fallbackSize: 500,
    altText: 'digital subscription',
    fallbackImgType: 'png',
  };

}

function getCopy(product: SubscriptionProduct, country: CountryGroupId) {
  if (showUpgradeMessage()) {
    return {
      heading: 'Digital Pack',
      subHeading: 'Upgrade your subscription to Paper+Digital now',
    };
  }
  if (flashSaleIsActive(product, country)) {
    const saleCopy = getSaleCopy(product, country);
    return {
      heading: `${saleCopy.landingPage.heading}`,
      subHeading: `${saleCopy.landingPage.subHeading}`,
    };
  }
  return {
    heading: 'Digital Pack',
    subHeading: 'Award-winning, independent journalism, ad-free on all devices',
  };
}

// ----- Component ----- //

export default function DigitalSubscriptionLandingHeader(props: PropTypes) {
  const product: SubscriptionProduct = 'DigitalPack';
  const copy = getCopy(product, props.countryGroupId);
  return (
    <div className="digital-subscription-landing-header">
      <LeftMarginSection modifierClasses={['header-block', 'grey']}>
        <CirclesLeft />
        <CirclesRight />
        <div className="digital-subscription-landing-header__picture">
          <GridPicture {...gridPicture(props.countryGroupId)} />
        </div>
        <HeadingBlock overheading={copy.heading}>{copy.subHeading}</HeadingBlock>
        {showCountdownTimer(product, props.countryGroupId) &&
          <FlashSaleCountdownInHero
            product={product}
            countryGroupId={props.countryGroupId}
          />
        }
        <div className="digital-subscription-landing-header__cta" />
      </LeftMarginSection>
      <HeroHanger>
        <AnchorButton aria-label="See Subscription options for Digital Pack" onClick={sendTrackingEventsOnClick('options_cta_click', 'DigitalPack', null)} icon={<SvgChevron />} href="#subscribe">See Subscription options</AnchorButton>
      </HeroHanger>
    </div>
  );
}
