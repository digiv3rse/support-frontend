// @flow

// ----- Imports ----- //

import type { Campaign } from 'helpers/tracking/acquisitions';
import type { Participations } from 'helpers/abtest';

// ----- Types ----- //

type SubsProduct = 'paper' | 'digital' | 'paperDig';
export type MemProduct = 'patrons' | 'events';

type PromoCodes = {
  [SubsProduct]: string,
};

export type SubsUrls = {
  [SubsProduct]: string,
};


// ----- Setup ----- //

const subsUrl = 'https://subscribe.theguardian.com';
const defaultIntCmp = 'gdnwb_copts_bundles_landing_default';

const memUrls: {
  [MemProduct]: string,
} = {
  patrons: 'https://membership.theguardian.com/patrons',
  events: 'https://membership.theguardian.com/events',
};

const defaultPromos: PromoCodes = {
  digital: 'p/DXX83X',
  paper: 'p/GXX83P',
  paperDig: 'p/GXX83X',
};

const customPromos : {
  [Campaign]: PromoCodes,
} = {
  seven_fifty_middle: {
    digital: 'p/D750MIDDLE',
    paper: 'p/N750MIDDLE',
    paperDig: 'p/ND750MIDDLE',
  },
  seven_fifty_end: {
    digital: 'p/D750END',
    paper: 'p/N750END',
    paperDig: 'p/ND750END',
  },
  seven_fifty_email: {
    digital: 'p/D750EMAIL',
    paper: 'p/N750EMAIL',
    paperDig: 'p/ND750EMAIL',
  },
  epic_paradise_paradise_highlight: {
    digital: 'p/DPARAHIGH',
    paper: 'p/NPARAHIGH',
    paperDig: 'p/NDPARAHIGH',
  },
  epic_paradise_control: {
    digital: 'p/DPARACON',
    paper: 'p/NPARACON',
    paperDig: 'p/NDPARACON',
  },
  epic_paradise_different_highlight: {
    digital: 'p/DPARADIFF',
    paper: 'p/NPARADIFF',
    paperDig: 'p/NDPARADIFF',
  },
  epic_paradise_standfirst: {
    digital: 'p/DPARASTAND',
    paper: 'p/NPARASTAND',
    paperDig: 'p/NDPARASTAND',
  },
  banner_just_one_control: {
    digital: 'p/DBANJUSTCON',
    paper: 'p/NBANJUSTCON',
    paperDig: 'p/NDBANJUSTCON',
  },
  banner_just_one_just_one: {
    digital: 'p/DBANJUSTONE',
    paper: 'p/NBANJUSTONE',
    paperDig: 'p/NDBANJUSTONE',
  },
};


// ----- Functions ----- //

// Creates URLs for the membership site from promo codes and intCmp.
function getMemLink(product: MemProduct, intCmp: ?string): string {

  const params = new URLSearchParams();
  params.append('INTCMP', intCmp || defaultIntCmp);

  return `${memUrls[product]}?${params.toString()}`;

}

function getDigiPackLink(digipackTest, params, promoCodes): string {
  if (digipackTest === 'control') {
    return `${subsUrl}/p/DFLOWCON?${params.toString()}`;
  } else if (digipackTest === 'variant') {
    params.append('promoCode', 'DFLOWVAR');
    return `${subsUrl}/checkout?${params.toString()}`;
  }
  return `${subsUrl}/${promoCodes.digital}?${params.toString()}`;
}

// Creates URLs for the subs site from promo codes and intCmp.
function buildSubsUrls(
  promoCodes: PromoCodes,
  intCmp: ?string,
  otherQueryParams: Array<[string, string]>,
  abTests: Participations,
): SubsUrls {

  const params = new URLSearchParams();
  params.append('INTCMP', intCmp || defaultIntCmp);
  otherQueryParams.forEach(p => params.append(p[0], p[1]));

  const paper = `${subsUrl}/${promoCodes.paper}?${params.toString()}`;
  const paperDig = `${subsUrl}/${promoCodes.paperDig}?${params.toString()}`;
  const digital = getDigiPackLink(abTests.digipackFlowOptimisationTest, params, promoCodes);

  return {
    digital,
    paper,
    paperDig,
  };

}

// Creates links to subscriptions, tailored to the user's campaign.
function getSubsLinks(
  intCmp: ?string,
  campaign: ?Campaign,
  otherQueryParams: Array<[string, string]>,
  abTests: Participations,
): SubsUrls {

  if (campaign && customPromos[campaign]) {
    return buildSubsUrls(customPromos[campaign], intCmp, otherQueryParams, abTests);
  }

  return buildSubsUrls(defaultPromos, intCmp, otherQueryParams, abTests);

}


// ----- Exports ----- //

export {
  getSubsLinks,
  getMemLink,
};
