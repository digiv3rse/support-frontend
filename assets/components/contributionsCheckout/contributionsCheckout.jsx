// @flow

// ----- Imports ----- //

import React, { type Node } from 'react';

import Page from 'components/page/page';
import TestUserBanner from 'components/testUserBanner/testUserBanner';
import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import Footer from 'components/footer/footer';
import CirclesIntroduction from 'components/introduction/circlesIntroduction';
import YourContribution from 'components/yourContribution/yourContribution';
import YourDetails from 'components/yourDetails/yourDetails';
import PageSection from 'components/pageSection/pageSection';
import LegalSectionContainer from 'components/legal/legalSection/legalSectionContainer';

import { type Contrib as ContributionType } from 'helpers/contributions';
import { type IsoCurrency } from 'helpers/internationalisation/currency';


// ----- Types ----- //

type PropTypes = {
  amount: number,
  currencyId: IsoCurrency,
  contributionType: ContributionType,
  name: string,
  isSignedIn: boolean,
  form: Node,
  payment: Node,
};


// ----- Functions ----- //

function getTitle(contributionType: ContributionType): string {

  switch (contributionType) {
    case 'ANNUAL':
      return 'Make an annual';
    case 'MONTHLY':
      return 'Make a monthly';
    case 'ONE_OFF':
    default:
      return 'Make a single';
  }

}


// ----- Component ----- //

export default function ContributionsCheckout(props: PropTypes) {

  return (
    <div className="component-contributions-checkout">
      <Page
        header={[<TestUserBanner />, <SimpleHeader />]}
        footer={<Footer />}
      >
        <CirclesIntroduction
          headings={[getTitle(props.contributionType), 'contribution']}
          modifierClasses={['compact']}
        />
        <YourContribution
          contributionType={props.contributionType}
          amount={props.amount}
          currencyId={props.currencyId}
        />
        <YourDetails name={props.name} isSignedIn={props.isSignedIn}>
          {props.form}
        </YourDetails>
        <PageSection heading="Payment methods" modifierClass="payment-methods">
          {props.payment}
        </PageSection>
        <LegalSectionContainer />
      </Page>
    </div>
  );

}
