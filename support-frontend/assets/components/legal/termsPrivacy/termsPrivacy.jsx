// @flow

// ----- Imports ----- //

import React from 'react';

import { privacyLink, contributionsTermsLinks } from 'helpers/legal';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';

import type { ContributionType } from 'helpers/contributions';
import { type CampaignName, campaigns } from 'helpers/campaigns';

// ---- Types ----- //

type PropTypes = {|
  countryGroupId: CountryGroupId,
  contributionType: ContributionType,
  campaignName?: CampaignName,
|};


// ----- Component ----- //

function TermsPrivacy(props: PropTypes) {
  const terms = <a href={contributionsTermsLinks[props.countryGroupId]}>Terms and Conditions</a>;
  const privacy = <a href={privacyLink}>Privacy Policy</a>;

  if (props.campaignName && campaigns[props.campaignName].termsAndConditions) {
    return campaigns[props.campaignName].termsAndConditions(contributionsTermsLinks[props.countryGroupId]);
  }

  return (
    <div className="component-terms-privacy">
      {props.contributionType !== 'ONE_OFF' ?
        <div className="component-terms-privacy__change">
          Monthly contributions are billed each month and annual contributions are billed once a year.
          You can change how much you give or cancel your contributions at any time.
        </div>
        : null
      }
      <div className="component-terms-privacy__terms">
        By proceeding, you are agreeing to our {terms}. To find out what personal data we collect and how we use it,
        please visit our {privacy}.
      </div>
    </div>
  );

}


// ----- Exports ----- //

export default TermsPrivacy;
