// @flow

// ----- Imports ----- //

import React from 'react';
import { classNameWithModifiers } from 'helpers/utilities';
import SvgSubscribe from 'components/svgs/subscribe';
import SvgSubscribed from 'components/svgs/subscribed';
import SvgNewsletters from 'components/svgs/newsletters';
import SvgInformation from 'components/svgs/information';
import type { Csrf as CsrfState } from 'helpers/csrf/csrfReducer';
import GeneralErrorMessage from 'components/generalErrorMessage/generalErrorMessage';
import { checkEmail } from 'helpers/formValidation';
import { logException } from 'helpers/logger';


// ----- Types ----- //

type ButtonPropTypes = {|
  confirmOptIn: ?boolean,
  email: string,
  csrf: CsrfState,
  onClick: (?string, CsrfState) => void,
  requestPending: boolean,
|};

type PropTypes = {|
  ...ButtonPropTypes,
  error: boolean,
|};

// ----- Render ----- //

function Button(props: ButtonPropTypes) {
  if (props.confirmOptIn === true) {
    return (
      <button
        disabled="disabled"
        className={classNameWithModifiers('button', ['newsletter', 'newsletter__subscribed'])}
      >
        <SvgSubscribed />
        Signed up
      </button>
    );
  } else if (props.requestPending === true) {
    return (
      <button
        disabled="disabled"
        className={classNameWithModifiers('button', ['newsletter', 'newsletter__request-pending'])}
      >
        <SvgSubscribe />
        Pending...
      </button>
    );
  }
  return (
    <button
      className={classNameWithModifiers('button', ['newsletter'])}
      onClick={
          () => props.onClick(props.email, props.csrf)
        }
    >
      <SvgSubscribe />
        Sign me up
    </button>
  );

}

function MarketingConsent(props: PropTypes) {

  if (props.error) {
    return (<GeneralErrorMessage
      classModifiers={['marketing_consent_api_error']}
      errorHeading="Sorry, something went wrong"
      errorReason="marketing_consent_api_error"
    />);
  }

  if (checkEmail(props.email)) {
    return (
      <section className={classNameWithModifiers('marketing-permissions', ['newsletter'])}>
        <h3 className="marketing-permissions__title">Subscriptions, membership and contributions</h3>
        <p className="marketing-permissions__message">
          Get related news and offers – whether you are a subscriber, member,
          contributor or would like to become one.
        </p>

        {Button({
          confirmOptIn: props.confirmOptIn,
          email: props.email,
          csrf: props.csrf,
          onClick: props.onClick,
          requestPending: props.requestPending,
        })}

        <p className="confirmation__meta">
          <small>
            {props.confirmOptIn === true ?
              'We\'ll be in touch. Check your inbox for a confirmation link.' :
              <div>
                <SvgInformation />
                <span className="information__message">You can unsubscribe at any time</span>
              </div>
            }
          </small>
        </p>
        <SvgNewsletters />
      </section>
    );
  }

  logException('Unable to display marketing consent button due to not having a valid email address to send to the API');
  return null;
}

MarketingConsent.defaultProps = {
  error: false,
  requestPending: false,
};


// ----- Exports ----- //

export default MarketingConsent;
