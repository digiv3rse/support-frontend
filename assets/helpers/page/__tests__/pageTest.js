// @flow

// ----- Imports ----- //

import type { IsoCountry } from 'helpers/internationalisation/country';

import { createCommonReducer } from '../page';


// ----- Tests ----- //

jest.mock('ophan', () => {});

describe('reducer tests', () => {

  beforeEach(() => {

    const initialState = {
      campaign: 'dummy_campaign',
      referrerAcquisitionData: {
        referrerPageviewId: null,
        campaignCode: null,
        componentId: null,
        componentType: null,
        source: null,
        abTests: [],
        queryParameters: [],
      },
      internationalisation: {
        countryId: 'GB',
        countryGroupId: 'GBPCountries',
        currencyId: 'GBP',
      },
      abParticipations: {},
      otherQueryParams: [],
      settings: {
        switches: {},
      },
      optimizeExperiments: {},
    };

    global.reducer = createCommonReducer(initialState);

  });

  it('should return the initial state', () => {
    expect(global.reducer(undefined, { type: 'SET_COUNTRY', country: 'GB' })).toMatchSnapshot();
  });

  it('should handle SET_COUNTRY to US', () => {

    const country: IsoCountry = 'US';
    const action = {
      type: 'SET_COUNTRY',
      country,
    };

    const newState = global.reducer(undefined, action);

    expect(newState && newState.internationalisation.countryId).toEqual(country);
    expect(newState && newState.referrerAcquisitionData.campaignCode).toMatchSnapshot();
    expect(newState && newState.campaign).toMatchSnapshot();
    expect(newState &&
      newState.referrerAcquisitionData &&
      newState.referrerAcquisitionData.campaignCode).toMatchSnapshot();
    expect(newState && newState.abParticipations).toMatchSnapshot();
  });

});
