// @flow

// ----- Imports ----- //

import React from 'react';
import ReactDOM from 'react-dom';

import SimpleHeader from 'components/headers/simpleHeader/simpleHeader';
import SimpleFooter from 'components/footers/simpleFooter/simpleFooter';
import CtaLink from 'components/ctaLink/ctaLink';
import InfoSection from 'components/infoSection/infoSection';

import pageStartup from 'helpers/pageStartup';
import { routes } from 'helpers/routes';


// ----- Page Startup ----- //

pageStartup.start();


// ----- Render ----- //

const content = (
  <div className="gu-content">
    <SimpleHeader />
    <section className="existing gu-content-filler">
      <div className="existing__content gu-content-filler__inner">
        <div className="existing__wrapper">
          <h1 className="existing__heading">Whoops!</h1>
          <h2 className="existing__subheading">
            Looks like you are already making a regular contribution to the
            Guardian - thank you. If you&#39;re feeling generous, there is
            another way you can&nbsp;help.
          </h2>
          <CtaLink
            text="Make a one-off contribution"
            url={routes.oneOffContribCheckout}
          />
        </div>
        <InfoSection heading="Questions?" className="existing__questions">
          <p>
            If you have any questions about contributing to the Guardian,
            please <a href="mailto:contribution.support@theguardian.com">
            contact us</a>
          </p>
        </InfoSection>
      </div>
    </section>
    <SimpleFooter />
  </div>
);

ReactDOM.render(
  content,
  document.getElementById('monthly-contributions-existing-page'),
);
