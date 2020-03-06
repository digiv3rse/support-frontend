// @flow

import { trackComponentLoad } from './tracking/behaviour';
import { logException } from './logger';

const publicKey = '6Le36d0UAAAAAJRqGjj8ADbrgr3diK1zUlu-7Qdm'; // ToDo make this come from param store
const isRecaptchaLoaded = () => window && window.grecaptcha && typeof window.grecaptcha.execute !== 'undefined';
const postToBackend = (token: string): Promise<boolean> =>
  fetch('/recaptcha', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
    }),
  }).then(response => response.json())
    .then((data) => {
      console.log(data);
      return data.allow;
    });

const execute = (action: string): Promise<boolean> => {
  if (isRecaptchaLoaded) {
    return window.grecaptcha.execute(publicKey, { action })
      .then((token) => {
        trackComponentLoad('contributions-recaptcha-client-token-received');
        return postToBackend(token);
      });
  }
  return Promise.reject(new Error('recaptcha not ready'));
};

const initRecaptchaV3 = () => {

  new Promise((resolve, reject) => {
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${publicKey}`;

    recaptchaScript.onerror = reject;
    recaptchaScript.onload = resolve;

    if (document.head) {
      document.head.appendChild(recaptchaScript);
    }
  }).then(() => {
    window.grecaptcha.ready(() => {
      console.log('grepcaptcha loaded');
      execute('loaded');
    });
  })
    .catch((error) => {
      logException('Error loading recaptcha', error);
    });
};

export { execute, isRecaptchaLoaded, initRecaptchaV3 };

