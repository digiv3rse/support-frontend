// @flow

import uuidv4 from 'uuid';
import * as storage from 'helpers/storage';
import { getVariantsAsString } from 'helpers/abTests/abtest';
import { detect as detectCurrency } from 'helpers/internationalisation/currency';
import { getQueryParameter } from 'helpers/url';
import { detect as detectCountryGroup } from 'helpers/internationalisation/countryGroup';
import type { Participations } from 'helpers/abTests/abtest';


// ----- Types ----- //
type EventType = 'DataLayerReady' | 'SuccessfulConversion' | 'GAEvent' | 'AppStoreCtaClick';

type PaymentRequestAPIStatus =
  'PaymentRequestAPINotAvailable' |
  'CanMakePaymentNotAvailable' |
  'AvailableNotInUse' |
  'AvailableInUse' |
  'PaymentRequestAPIError' |
  'PromiseNotSupported' |
  'PromiseRejected' |
  'PaymentApiPromiseRejected';

type GaEventData = {
  category: string,
  action: string,
  label: ?string,
}

const gaPropertyId = 'UA-51507017-5';

// ----- Functions ----- //

function getOrderId() {
  let value = storage.getSession('orderId');
  if (value === null) {
    value = uuidv4();
    storage.setSession('orderId', value);
  }
  return value;
}

function getCurrency(): string {
  const currency = detectCurrency(detectCountryGroup());
  if (currency) {
    storage.setSession('currency', currency);
  }
  return storage.getSession('currency') || 'GBP';
}

function getContributionValue(): number {
  const param = getQueryParameter('contributionValue');
  if (param) {
    storage.setSession('contributionValue', String(parseFloat(param)));
  }
  return parseFloat(storage.getSession('contributionValue')) || 0;
}

function getPaymentAPIStatus(): Promise<PaymentRequestAPIStatus> {
  return new Promise((resolve) => {
    try {

      const { PaymentRequest } = window;

      if (typeof PaymentRequest !== 'function') {
        resolve('PaymentRequestAPINotAvailable');
      }

      const supportedInstruments = [
        {
          supportedMethods: 'basic-card',
          data: {
            supportedNetworks: ['visa', 'mastercard', 'amex', 'jcb',
              'diners', 'discover', 'mir', 'unionpay'],
            supportedTypes: ['credit', 'debit'],
          },
        },
      ];

      const details = {
        total: {
          label: 'tracking',
          amount:
            {
              value: '1',
              currency: getCurrency(),
            },
        },
      };

      const request = new PaymentRequest(supportedInstruments, details);
      if (request && !request.canMakePayment) {
        resolve('CanMakePaymentNotAvailable');
      }

      request
        .canMakePayment()
        .then((result) => {
          if (result) {
            resolve('AvailableInUse');
          } else {
            resolve('AvailableNotInUse');
          }
        })
        .catch(() => {
          resolve('PaymentApiPromiseRejected');
        });
    } catch (e) {
      resolve('PaymentRequestAPIError');
    }
  });
}

function sendData(
  event: EventType,
  participations: Participations,
  paymentRequestApiStatus?: PaymentRequestAPIStatus,
) {
  try {
    const orderId = getOrderId();
    const value = getContributionValue();
    const currency = getCurrency();
    window.googleTagManagerDataLayer.push({
      event,
      // orderId anonymously identifies this user in this session.
      // We need this to prevent page refreshes on conversion pages being
      // treated as new conversions
      orderId,
      currency,
      value,
      paymentMethod: storage.getSession('paymentMethod') || undefined,
      campaignCodeBusinessUnit: getQueryParameter('CMP_BUNIT') || undefined,
      campaignCodeTeam: getQueryParameter('CMP_TU') || undefined,
      internalCampaignCode: getQueryParameter('INTCMP') || undefined,
      experience: getVariantsAsString(participations),
      paymentRequestApiStatus,
    });
  } catch (e) {
    console.log(`Error in GTM tracking ${e}`);
  }
}


function pushToDataLayer(event: EventType, participations: Participations) {
  window.googleTagManagerDataLayer = window.googleTagManagerDataLayer || [];

  try {
    getPaymentAPIStatus()
      .then((paymentRequestApiStatus) => {
        sendData(event, participations, paymentRequestApiStatus);
      })
      .catch(() => {
        sendData(event, participations, 'PromiseRejected');
      });
  } catch (e) {
    sendData(event, participations, 'PromiseNotSupported');
  }

}

function init(participations: Participations) {
  pushToDataLayer('DataLayerReady', participations);
}

function gaEvent(gaEventData: GaEventData) {
  if (window.googleTagManagerDataLayer) {
    window.googleTagManagerDataLayer.push({
      event: 'GAEvent',
      eventCategory: gaEventData.category,
      eventAction: gaEventData.action,
      eventLabel: gaEventData.label,
    });
  }
}

function appStoreCtaClick() {
  sendData('AppStoreCtaClick', { TestName: '' });
}

// ----- Exports ---//

export {
  init,
  gaEvent,
  appStoreCtaClick,
  gaPropertyId,
};
