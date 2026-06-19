/* ============================================================
   NUMBERS LAB — "Digit" the guide
   A friendly little robot that explains and celebrates. On sites
   that have a mascot (Crislyn's Pixie), big moments also speak
   through it — feature-detected, never required.
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var U = NLAB.util;
  var CFG = window.NLAB_CONFIG || {};

  var BOT_SVG =
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<rect x="9" y="13" width="30" height="24" rx="8" fill="#fff" opacity=".95"/>' +
    '<circle cx="19" cy="25" r="4" fill="#15182B"/><circle cx="29" cy="25" r="4" fill="#15182B"/>' +
    '<circle cx="20.5" cy="23.5" r="1.3" fill="#fff"/><circle cx="30.5" cy="23.5" r="1.3" fill="#fff"/>' +
    '<rect x="20" y="31" width="8" height="2.4" rx="1.2" fill="#15182B"/>' +
    '<line x1="24" y1="13" x2="24" y2="7" stroke="#fff" stroke-width="2.2"/><circle cx="24" cy="6" r="2.6" fill="#fff"/>' +
    '</svg>';

  NLAB.guide = {
    bot: BOT_SVG,
    /* inline speech-bubble markup for teach slides */
    html: function (text) {
      return '<div class="nl-guide">' +
        '<div class="nl-guide__bot">' + BOT_SVG + '</div>' +
        '<div class="nl-guide__bubble"><span class="nl-guide__name">Digit</span>' + (text || '') + '</div>' +
        '</div>';
    },
    /* celebration line — also routed to a host mascot if one exists */
    cheer: function (text) {
      try {
        if (CFG.mascot && window.Pixie && typeof window.Pixie.say === 'function') window.Pixie.say(text);
      } catch (_) {}
      return text;
    }
  };
})();
