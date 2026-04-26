/* ============================================
   Google Analytics 4 — crislyntony.com
   Measurement ID: G-MSQY7SLG7X
   ============================================
   This file loads GA4 (gtag.js) on every page.
   To view data: https://analytics.google.com
   Tracking is automatically skipped on localhost
   so testing doesn't pollute the real data.
*/

(function() {
  var GA_ID = 'G-MSQY7SLG7X';

  // Don't track local development
  if (location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.hostname === '') {
    return;
  }

  // Load Google's gtag library
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  // Initialise gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
})();
