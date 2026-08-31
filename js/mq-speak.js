/* ==========================================================================
   MEASUREQUEST — read aloud
   --------------------------------------------------------------------------
   The point of this module is understanding measurement, not reading speed.
   So every instruction and every story problem can be read out.

   It degrades in silence: where the browser has no speech synthesis the
   buttons simply do not appear, and nothing else changes. `available()` is
   the only thing the UI needs to ask.

   Two details that matter for a child listening rather than reading:
   - "cm²" is spoken as "square centimetres", not "cm two". Units are
     rewritten before they reach the speech engine.
   - The maths signs are spoken as words, so "2 x (9 + 4)" comes out as
     "2 times, open bracket, 9 plus 4, close bracket" rather than a string
     of punctuation names or nothing at all.
   ========================================================================== */

(function () {
  'use strict';

  const synth = window.speechSynthesis || null;
  let current = null;
  let lastText = '';
  let voice = null;
  let picked = false;

  function available() { return !!synth; }

  function chooseVoice() {
    if (picked || !synth) return voice;
    const all = synth.getVoices() || [];
    if (!all.length) return null;                 /* voices load late; try again next time */
    picked = true;
    voice = all.find(v => /en-GB/i.test(v.lang) && /female|Hazel|Sonia|Libby/i.test(v.name)) ||
            all.find(v => /en-GB/i.test(v.lang)) ||
            all.find(v => /^en/i.test(v.lang)) || all[0];
    return voice;
  }
  if (synth && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => { picked = false; chooseVoice(); });
  }

  /** Turn written maths into something worth listening to. */
  function speakable(text) {
    let t = String(text || '');
    t = t.replace(/<[^>]+>/g, ' ');                        /* strip any markup */
    t = t.replace(/&[a-z]+;/gi, ' ');
    t = t.replace(/(\d)\s*x\s*(\d|\()/g, '$1 times $2');
    t = t.replace(/\bx\b/g, 'times');
    t = t.replace(/(cm|m|km)²/g, (m, u) => 'square ' + long(u));
    t = t.replace(/(cm|m|km)2\b/g, (m, u) => 'square ' + long(u));
    t = t.replace(/\b(cm|km)\b/g, (m, u) => long(u));
    t = t.replace(/(\d)\s*m\b/g, '$1 metres');
    t = t.replace(/÷/g, ' divided by ');
    t = t.replace(/−|–/g, ' minus ');
    t = t.replace(/\+/g, ' plus ');
    t = t.replace(/\(/g, ', ').replace(/\)/g, ', ');
    t = t.replace(/□/g, ' what ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  }
  function long(u) {
    return { cm: 'centimetres', m: 'metres', km: 'kilometres' }[u] || u;
  }

  function stop() {
    if (!synth) return;
    try { synth.cancel(); } catch (e) { /* nothing to cancel */ }
    current = null;
  }

  function speak(text, opts) {
    if (!synth) return false;
    opts = opts || {};
    stop();
    const said = speakable(text);
    if (!said) return false;
    lastText = text;
    const u = new SpeechSynthesisUtterance(said);
    const v = chooseVoice();
    if (v) u.voice = v;
    u.lang = (v && v.lang) || 'en-GB';
    u.rate = opts.rate || 0.92;                  /* a little slower than default */
    u.pitch = opts.pitch || 1.05;
    u.onend = () => { current = null; if (opts.onend) opts.onend(); };
    current = u;
    try { synth.speak(u); } catch (e) { return false; }
    return true;
  }

  function repeat() { return lastText ? speak(lastText) : false; }
  function pause() { if (synth && synth.speaking && !synth.paused) { synth.pause(); return true; } return false; }
  function resume() { if (synth && synth.paused) { synth.resume(); return true; } return false; }
  function speaking() { return !!(synth && synth.speaking); }
  function paused() { return !!(synth && synth.paused); }

  window.MQSpeak = { available, speak, speakable, stop, repeat, pause, resume, speaking, paused };
})();
