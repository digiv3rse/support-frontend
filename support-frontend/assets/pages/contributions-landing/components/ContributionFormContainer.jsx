// @flow

// ----- Imports ----- //

import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { type CountryGroupId, countryGroups } from 'helpers/internationalisation/countryGroup';
import { type PaymentAuthorisation } from 'helpers/forms/paymentIntegrations/readerRevenueApis';
import DirectDebitPopUpForm from 'components/directDebit/directDebitPopUpForm/directDebitPopUpForm';
import ContributionTicker from 'components/ticker/contributionTicker';
import { getCampaignSettings } from 'helpers/campaigns/campaigns';
import { type State } from '../contributionsLandingReducer';
import ContributionForm from './ContributionForm';
import { ContributionFormBlurb } from './ContributionFormBlurb';
import { onThirdPartyPaymentAuthorised, paymentWaiting, setTickerGoalReached } from '../contributionsLandingActions';
import type { IsoCountry } from 'helpers/internationalisation/country';
import SecureTransactionIndicator from 'components/secureTransactionIndicator/secureTransactionIndicator';
import { useLastOneOffContribution } from 'helpers/customHooks/useLastOneOffContribution';
import { isInSupportAgainHeaderVariant } from 'helpers/abTests/lpPreviousGiving';
import { PreviousGivingBodyCopy, PreviousGivingHeaderCopy } from './ContributionsFormBlurbPreviousGiving';
import type { ReferrerAcquisitionData } from 'helpers/tracking/acquisitions';
import ProgressMessage from 'components/progressMessage/progressMessage';


// ----- Types ----- //
/* eslint-disable react/no-unused-prop-types */
type PropTypes = {|
  paymentComplete: boolean,
  countryGroupId: CountryGroupId,
  thankYouRoute: string,
  setPaymentIsWaiting: boolean => void,
  onThirdPartyPaymentAuthorised: PaymentAuthorisation => void,
  setTickerGoalReached: () => void,
  tickerGoalReached: boolean,
  campaignCodeParameter: ?string,
  isReturningContributor: boolean,
  countryId: IsoCountry,
  userName: string | null,
  referrerAcquisitionData: ReferrerAcquisitionData,
  canShowTicker: boolean,
|};

/* eslint-enable react/no-unused-prop-types */

const mapStateToProps = (state: State) => ({
  paymentComplete: state.page.form.paymentComplete,
  countryGroupId: state.common.internationalisation.countryGroupId,
  tickerGoalReached: state.page.form.tickerGoalReached,
  isReturningContributor: state.page.user.isReturningContributor,
  countryId: state.common.internationalisation.countryId,
  userName: state.page.user.firstName,
  referrerAcquisitionData: state.common.referrerAcquisitionData,
  canShowTicker: state.common.abParticipations.tickerTest === 'variant',
});

const mapDispatchToProps = (dispatch: Function) => ({
  setPaymentIsWaiting: (isWaiting) => { dispatch(paymentWaiting(isWaiting)); },
  setTickerGoalReached: () => { dispatch(setTickerGoalReached()); },
  onThirdPartyPaymentAuthorised: (token) => { dispatch(onThirdPartyPaymentAuthorised(token)); },
});

// ----- Functions ----- //

export type CountryMetaData = {
  headerCopy: string,
  contributeCopy?: React$Element<string>,
  // Optional message to display at the top of the form
  formMessage?: React$Element<string>,
};

const defaultHeaderCopy = 'Support\xa0our\njournalism\xa0with\na\xa0contribution\nof\xa0any\xa0size';
const defaultContributeCopy = (
  <span>
    Your support helps protect the Guardian’s independence and it means we
    can keep delivering quality journalism that’s open for everyone around the world.
    <span className="gu-content__blurb-blurb-last-sentence"> Every contribution, however big or small, is so valuable for our future.</span>
  </span>);

const defaultHeaderCopyAndContributeCopy: CountryMetaData = {
  headerCopy: defaultHeaderCopy,
  contributeCopy: defaultContributeCopy,
};

// ----- Render ----- //

function withProps(props: PropTypes) {
  const campaignSettings = getCampaignSettings();
  const campaignCopy = campaignSettings && campaignSettings.copy ?
    campaignSettings.copy(props.tickerGoalReached) :
    null;

  const onPaymentAuthorisation = (paymentAuthorisation: PaymentAuthorisation) => {
    props.setPaymentIsWaiting(true);
    props.onThirdPartyPaymentAuthorised(paymentAuthorisation);
  };

  const countryGroupDetails = {
    ...defaultHeaderCopyAndContributeCopy,
    ...campaignCopy || {},
  };

  if (props.paymentComplete) {
    // We deliberately allow the redirect to REPLACE rather than PUSH /thankyou onto the history stack.
    // This is because going 'back' to the /contribute page is not helpful, and the client-side routing would redirect
    // back to /thankyou given the current state of the redux store.
    // The effect is that clicking back in the browser will take the user to the page before they arrived at /contribute
    return (<Redirect to={props.thankYouRoute} push={false} />);
  }

  if (props.campaignCodeParameter && !campaignSettings) {
    // A campaign code was supplied in the url path, but it's not a valid campaign
    return (
      <Redirect
        to={`/${countryGroups[props.countryGroupId].supportInternationalisationId}/contribute`}
        push={false}
      />
    );
  }

  const showPreviousGiving = isInSupportAgainHeaderVariant(props.referrerAcquisitionData);
  const lastOneOffContribution = useLastOneOffContribution();

  return (
    <div className="gu-content__content gu-content__content-contributions gu-content__content--flex">
      { showPreviousGiving && lastOneOffContribution && (
        <ContributionFormBlurb
          headerCopy={<PreviousGivingHeaderCopy userName={props.userName} />}
          bodyCopy={<PreviousGivingBodyCopy lastOneOffContribution={lastOneOffContribution} />}
        />
      )}

      {!showPreviousGiving && (
        <ContributionFormBlurb
          headerCopy={countryGroupDetails.headerCopy}
          bodyCopy={countryGroupDetails.contributeCopy}
        />
      )}

      <div className="gu-content__form">
        <SecureTransactionIndicator modifierClasses={['top']} />

        {props.canShowTicker && campaignSettings && campaignSettings.tickerSettings ?
          <ContributionTicker
            {...campaignSettings.tickerSettings}
            onGoalReached={props.setTickerGoalReached}
          /> : null
        }
        {props.tickerGoalReached &&
         campaignSettings && campaignSettings.tickerSettings && campaignSettings.goalReachedCopy ?
          campaignSettings.goalReachedCopy :
          <div>
            {countryGroupDetails.formMessage ?
              <div className="form-message">{countryGroupDetails.formMessage}</div> : null
            }
            <ContributionForm
              onPaymentAuthorisation={onPaymentAuthorisation}
              campaignSettings={campaignSettings}
            />
          </div>
        }
      </div>
      {campaignSettings && campaignSettings.extraComponent}
      <DirectDebitPopUpForm
        buttonText="Contribute with Direct Debit"
        onPaymentAuthorisation={onPaymentAuthorisation}
      />
    </div>
  );
}

function withoutProps() {
  return (
    <div className="gu-content__content gu-content__content-contributions gu-content__content--flex">
      <ContributionFormBlurb
        headerCopy={defaultHeaderCopy}
        bodyCopy={defaultContributeCopy}
      />

      <div className="gu-content__form gu-content__form-ssr">
        <SecureTransactionIndicator modifierClasses={['top']} />
        <ProgressMessage message={['Loading the page']} />
      </div>
    </div>
  );
}

export const ContributionFormContainer = connect(mapStateToProps, mapDispatchToProps)(withProps);
export const EmptyContributionFormContainer = withoutProps;
