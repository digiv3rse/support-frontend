// Google Tag Manager
/* eslint-disable */
import { doNotTrack } from 'helpers/page/page';
if(!doNotTrack()) {
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
      'gtm.start':
        new Date().getTime(),
      event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src =
      // $FlowFixMe
      'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'googleTagManagerDataLayer', 'GTM-W6GJ68L');
}
/* eslint-enable */
// End Google Tag Manager
