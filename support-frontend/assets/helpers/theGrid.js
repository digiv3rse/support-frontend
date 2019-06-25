// @flow

// ----- Types ----- //

export type ImageType = 'jpg' | 'png';


// ----- Setup ----- //

export const GRID_DOMAIN = 'https://media.guim.co.uk';

export const imageCatalogue: {
  [string]: string,
} = {
  newsroom: '8caacf301dd036a2bbb1b458cf68b637d3c55e48/0_0_1140_683',
  guardianObserverOffice: '137d6b217a27acddf85512657d04f6490b9e0bb1/1638_0_3571_2009',
  liveEvent: '5f18c6428e9f31394b14215fe3c395b8f7b4238a/500_386_2373_1335',
  digitalBundle: '7c7b9580924281914e82dc163bf716ede52daa8b/0_0_600_360',
  paperBundle: '4d0851394ce3c100649800733f230a78c0d38555/0_0_600_360',
  paperDigitalBundle: '1199912112859eecf3f2d94edc6fdd73843d10e9/0_0_600_360',
  protestorsWide: 'bce7d14f7f837a4f6c854d95efc4b1eab93a8c65/0_0_5200_720',
  protestorsNarrow: 'd1a7088f8f2a367b0321528f081777c9b5618412/0_0_3578_2013',
  premiumTierCircle: '3e3b59228c3467b01dd09b9f79de28c586fe0ea6/0_0_825_825',
  dailyEditionCircle: '9e992e4ebca7a837976fe55d091e0f38e7e595c2/0_0_3260_3260',
  digitalCircleOrange: 'd7d1820af432c48329d214d0cff7c6fe9cd21101/0_0_3260_3260',
  digitalCirclePink: '7d404c1920f065c1b7e71b903cc3899f388acb22/0_0_825_825',
  paperCircle: 'c462d60f2962b745b1e206d5ede998dfb166a8ed/0_0_825_825',
  paperDigitalCircleOrange: 'd94c0f9bade09487b9afca5ee8149efb33f34ccf/0_0_825_825',
  paperDigitalCirclePink: '69d90e5d6fca261a227e47b311f80807b123c87b/0_0_825_825',
  weeklyCircle: '8815acf2956182a72063ad82fdca93a366dfc0a0/0_0_2210_2210',
  premiumTier: 'fb0c788ddee28f8e0e66d814595cf81d6aa21ec6/0_0_644_448',
  premiumTierAU: '4b6fd9805c7d0a88b4b71a683c4b46279a410b9d/0_0_1610_1120',
  dailyEdition: '6c6bf7598935803cd9922af05bb35b435552d239/0_0_6440_4486',
  windrush: '4addd475d3af57d908fa87124e556ab96fddb2e7/0_0_370_370',
  windrushGreyscale: '8637bed472263161e35de986b463ed0c3675987d/0_0_830_830',
  zuck: 'e6142101bc909caee866be05ced677c54e9d3b4e/0_0_374_374',
  digitalSubscriptionHeaderDesktop: 'f9665e14b5927ee8ed94cc92204831b4f792c6dc/1407_0_7856_4260',
  digitalSubscriptionHeaderDesktopAU: 'f46b1e2c498ac4f1ebec1b2620b6e80583e4348f/0_0_4045_1945',
  digitalSubscriptionHeaderTablet: '4d588918cae445d7ded1e68960286fd91217434b/0_0_2035_1660',
  digitalSubscriptionHeaderTabletAU: 'dbe3974508706a41e710f198b1da02f44e6141a1/0_0_2035_1660',
  digitalSubscriptionHeaderMobile: 'ed4028ccd5abd85b330114e3ef48660358f63969/0_0_1200_1755',
  digitalSubscriptionHeaderMobileAU: 'dbe3974508706a41e710f198b1da02f44e6141a1/945_0_1088_1755',
  digitalSubscriptionPromotionPopUpHeader: 'd0322e698dc8b30337feefd3294c8b82882c353b/0_0_2770_1410',
  digitalPackBenefitsMobile: 'bd335622063afd12463bf286a2058008b5f05efc/0_0_1729_1505',
  digitalPackBenefitsDesktop: 'cb3028a5f9aaf0a1b46ba1594e90b9d3a0b2ad3e/0_0_3750_2000',
  investHeaderMobile: '91edfca98faf743fed826a1efc03ed0bf133625b/0_0_1875_1560',
  investHeaderDesktop: '60c2488def35887fe1d786fcb7cd9c8ff4c48735/0_0_7200_2645',
  adFreePromotionCircles: 'c95a636dd5388d9fd81a487c5929812e6f6962a1/0_0_1815_705',
  digitalPackFlashSaleDesktop: '496362ba165e8291991d6ec75725a4a57254adf1/0_0_1388_949',
  digitalPackFlashSaleMobile: '2dfb17d45d092baefa3301db8be0634815462941/0_0_717_470',
  guardianWeeklyHeroDesktop: 'e6cef2392beddf317d5c33574283b6cb08d20cc8/0_0_1000_738',
  guardianWeeklyHeroMobile: '25524d39392a5e66058f029e2e54bad42a315999/0_0_1998_1332',
  paperHeroDesktop: 'f1040916a71642c924a52c61dc7c4aae2b8dd88d/0_0_1080_784',
  paperHeroMobile: '9b8d348e9ba521c388e3482ece4037e3f0fb3864/0_0_1000_666',
  weeklyLandingHero: '04d26adc380c2d13015ba3b2bebf3cb8a7fe83a3/0_0_7100_3500',
  paperLandingHero: 'c09bbbff7ba75ea91b0d9da4ed750ab437f364c3/0_0_2676_1316',
  paperLandingHeroMobile: '7a1f17792f748c139a22321440e1c9294df82349/0_0_922_656',
  paperDeliveryFeature: 'e7527a726b840eeb1f94cfc6fdd004a31b90df20/0_0_920_820',
  paperVoucherFeature: '28c5d906226a50ee56a4046c628643a54f688dbd/0_0_750_694',
  UsCampaignLanding: '56fbd07b8e3b7090853dce5aa47c7153bd5c6e05/0_0_1500_1454',
  showcase: 'b72ef7a4c8764a163fc604d7b8edcedfdd7682f4/0_0_7100_3500',
  showcaseSubscribe: '1174d922f64d951a4a860e4b91b8dd5c5eb8cc8c/0_0_1802_1190',
  paperLandingSale: '6179a30718dab98e96230e39195f3aa2a2784a1d/0_0_800_858',
  showcaseNix: '9a9762f17474b2c58859eb62912ca5b856adafb9/0_517_7360_2594',
  showcaseZuckGlass: 'dcae174dfb72ab54cdc726c464b077a857a1ed9c/0_0_3000_1230',
  showcaseChris: 'a4bdbc721484d1ee3db785b9b469910ba6612112/299_10_4744_2846',
  showcaseBrit: 'e1134ec267edf4a3bbd18271ee271069bbbcec06/0_151_6350_3809',
  theMomentDigiHero: 'a57b0a878d77c8a89517e0f2be34772cd6327d4c/0_0_486_772',
  theMomentDigiHero2: 'e3d9430189ee850a49edeed8554a11a38761cdff/0_0_486_772',
  theMomentDigiHero3: 'f73e9336a0fb62916921c2956d12dd29a0f43d30/0_0_486_772',
  weeklyCampaignHeroImg: '3d4bf412afdf3c91faed55c9507a6d741575e3c5/0_0_1358_954',
  checkoutPackshotPaperGraunVoucher: '5aa8702d1de22589ec5dd1a20a6cf4bc4b7c9674/0_0_696_400',
  checkoutPackshotDigitalPack: 'd68d6e6f276eae28d18851548e59bd7918a23ffc/0_0_1392_800',
  checkoutPackshotWeekly: '0fb50b636e09f459470453a54951ac6a7095c9e6/0_0_696_400',
  editionsProductBlock: '6101859a35f6b9657ff6a0a1aecc225aae6b8d43/0_0_3176_2000',
  noMoreAds: 'df9cbdeb0c45bdfcef4edb1466163eed0f020091/0_0_482_304',
};

// Utility type: https://flow.org/en/docs/types/utilities/#toc-keys
export type ImageId = $Keys<typeof imageCatalogue>;


// ----- Functions ----- //

// Builds a grid url from and id and an image size.
// Example: https://media.guim.co.uk/g65756g5/300.jpg
export function gridUrl(
  gridId: ImageId,
  size: number,
  imgType?: ImageType = 'jpg',
): string {

  const path = `${imageCatalogue[gridId]}/${size}.${imgType}`;
  const url = new URL(path, GRID_DOMAIN);

  return url.toString();

}

// Returns a series of grid urls and their corresponding sizes.
// Example:
//   "https://media.guim.co.uk/g65756g5/300.jpg 300w,
//    https://media.guim.co.uk/g65756g5/500.jpg 500w,
//    https://media.guim.co.uk/g65756g5/700.jpg 700w"
export function gridSrcset(
  gridId: ImageId,
  sizes: number[],
  imgType?: ImageType,
): string {

  const sources = sizes.map(size => `${gridUrl(gridId, size, imgType)} ${size}w`);
  return sources.join(', ');

}
