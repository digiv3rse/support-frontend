// @flow
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';

const recaptchaEnabled = (countryGroupId: CountryGroupId): boolean =>
  window.guardian.recaptchaV2 && countryGroupId === 'AUDCountries';

const loadRecaptchaV2 = () =>
  new Promise<void>((resolve, reject) => {
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js?onload=v2OnloadCallback&render=explicit';

    recaptchaScript.onerror = reject;
    recaptchaScript.onload = resolve;

    if (document.head) {
      document.head.appendChild(recaptchaScript);
    }
  });

export { loadRecaptchaV2, recaptchaEnabled };

