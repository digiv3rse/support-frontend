// @flow

// ----- Types ----- //

export type ImageType = 'jpg' | 'png';


// ----- Setup ----- //

export const GRID_DOMAIN = 'https://media.guim.co.uk';

export const imageCatalogue: {
  [string]: string,
} = {
  newsroom: '8caacf301dd036a2bbb1b458cf68b637d3c55e48/0_0_1140_683',
  digitalSubscriptionHeaderDesktop: 'f9665e14b5927ee8ed94cc92204831b4f792c6dc/1407_0_7856_4260',
  weeklyLandingHero: '87e6e2d907b9de594c73239bae0b49f2f811173c/738_0_6362_3008',
  paperLandingHero: 'c09bbbff7ba75ea91b0d9da4ed750ab437f364c3/0_0_2676_1316',
  paperLandingHeroMobile: '7a1f17792f748c139a22321440e1c9294df82349/0_0_922_656',
  paperVoucherFeature: '28c5d906226a50ee56a4046c628643a54f688dbd/0_0_750_694',
  showcase: 'b72ef7a4c8764a163fc604d7b8edcedfdd7682f4/0_0_7100_3500',
  showcaseSubscribe: '1174d922f64d951a4a860e4b91b8dd5c5eb8cc8c/0_0_1802_1190',
  weeklyCampaignHeroImg: 'd2baab9f40e198459a02c30d86c774e79096e43e/0_0_1158_954',
  weeklyCampaignBenefitsImg: '340db3a4561cbd502dc59b764ab8d93433511103/0_255_1972_1183',
  checkoutPackshotWeekly: 'd94fcbfe497545ef6256cbc923d13037db5e4273/68_71_548_329',
  checkoutPackshotWeeklyGifting: '0fb50b636e09f459470453a54951ac6a7095c9e6/0_0_696_400',
  showcaseAusProtest: 'b666c821d9b3e1085a2e07daeeb17fdeb82a077e/0_794_5472_2228',
  showcaseAusScottMorrison: 'd2d362b1aa48d477c3798ffe9d9c6954c3b1eea4/0_493_7173_2207',
  showcaseAusRuby: 'fc763dd8e3e7c8921fc2c593faa95f9f232435dd/288_0_3029_3031',
  showcaseAusAboriginal: 'b6e5c3e0d820e434a2907c4a89b8d52e13383435/0_44_3648_2188',
  showcaseUSTrump: '30512603929dd3bd4d493738dc8338e36e710619/1103_0_3010_3009',
  showcaseUSProtest: '4d515b7e2c8593a6a3ad2a465d246c7faf72fecd/842_0_2600_2600',
  showcaseUSCongresswomen: 'bb3a380f53a4892f6ea51c0b6b20180d742f5c5d/0_511_3840_1042',
  showcaseUSLiberty: 'e0533f914968b4645a985be89d35af9c9723957b/0_319_4467_1336',
  showcaseUKBrexit: '1806ede9cbb6b5b421f862b81a01bc1cb688ca48/6_1618_4250_927',
  showcaseUKProtest: '27533ba5ee9c8ca57e38e57b8bc588a7f455c98b/960_0_3840_3840',
  showcaseUKPPE: '3ac495c62288501c9e2e76a03a00e4ee5a80b5c3/0_294_5760_2022',
  showcaseUKWindrushGroup: '2ec9dab8f39d1e9b12b9c7625b5ad2b058f3420b/1175_287_3335_3335',
  subscriptionFeast: '4fac3988229d109512b4dfa0930b126e36985a2c/0_0_660_636',
  subscriptionPrint: '/0575f214ad20536c7731172e36f349778df168c7/0_0_877_1090',
  subscriptionG2: 'f1cafef5a6bda2835f050042b9336645a24228ff/0_0_756_645',
  subscriptionIpad: 'c2843d4ec6bc7644c62c8691b6c7e83e76c93e0e/0_0_1302_998',
  subscriptionIphone: '8850945f0003d2a7204050644db446d827dead95/0_0_578_1096',
  subscriptionPrintDigital: '476a8aadac1f3a971b9b1a9a023b04cb72c8f7ca/0_0_1366_1510',
  subscriptionGuardianWeeklyPackShot: 'd2baab9f40e198459a02c30d86c774e79096e43e/0_140_1158_814',
  subscriptionDailyPackshot: '773ead1bd414781052c0983858e6859993870dd3/34_72_1825_1084',
  subscriptionDailyMobile: '9b650a7dcc33e30d228ddec7bd27a0594b4ece41/0_0_568_1174',
  gwGiftingPackshot: '3d1cecfdc8c90b2005712e56669afe6e3b8c5e5a/762_0_4232_3184',
  printFeaturePackshot: '017a2f5c27394635b53c414962bbb775ce9b131d/5_39_1572_861',
  printCampaignHero: 'fff86e98dbe83b36892baf7942f30fd3bcbcaee6/286_215_714_285',
  printCampaignDigitalVoucher: 'cb1ccf0ec4d099e34dca2fc0402f8da0c65296af/0_0_562_337',
  printCampaignHDdigitalVoucher: 'e9240bf61e689bed9ff6d635c9db761a94da3fa6/0_0_562_337',
  printCampaignHD: '817936f0d1a2755c778b523b5ac5daa2d2f27449/10_0_716_694',
  printCampaignHeroHD: '89f065f86a1181d66cb35457e5810213df93241f/0_0_1055_633',
  editionsPackshot: '518e4f5b42c39218bf3fb0b00465d5f4abb3d93a/0_0_1280_988',
  editionsPackshotShort: 'fc03c0095c04c44d0c7bd3e55aa15eccd0d6a920/0_0_1800_1080',
  editionsPackshotAus: '9af0c459c507f67a21280789ce139594d13221e1/0_0_1000_815',
  editionsPackshotAusShort: '0457dee5a9e19b57f402b8cf19993e3ff723aa89/0_0_1800_1080',
  weekendPackshotMobile: '622d1b94173e9c711ff421d89cf9abddf3319197/0_0_1100_1100',
  weekendPackshotDesktop: 'dc1bb7218877d954a5841b24765e89f7c3aa6f95/0_0_1800_1080',
  liveAppMobile: '66deee17e0c59c254abdad9e1fa9b3605040f66b/0_0_1100_1100',
  liveAppDesktop: '7f6b52bd46bf801e7f55eeb1d6f2666727c0ddf9/0_0_1800_1080',
  editionsRowMobile: '307653cb535689ce12b93cf90cfb233cddaab3fd/0_0_1100_1100',
  editionsRowDesktop: 'a37e08fd9d3343eb629ae44b2b30127d7e31184b/0_0_1800_1080',
  editionsShortPackshot: '51b63b57ec163a262d30022d8b1ae47e6ba94897/0_7_2320_1392',
  googlePlay: '0a3eda7d719ad8ebe3a13a9bab8fd2b3348d1f20/0_0_554_160',
  appleStore: 'a0787d3b313f03ed87a16ced224ab4022f794bc5/0_0_554_160',
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
