/* =====================================================
   CRISLYN'S WORLD — Bible-of-Day
   Picks today's Bible story, manages the daily streak.

   Data shape: window.BIBLE_STORIES = { weekday: [...], friday: [...] }
   - Fridays draw from the catechism pool (Beatitudes, Lord's Prayer,
     Eucharist, Saints, Mass, Rosary).
   - All other days draw from the weekday pool (OT narrative, Gospels,
     Psalms, parables).
   ===================================================== */
(function () {
  'use strict';

  const LAST_READ_KEY = 'bible_last_read';
  const STREAK_KEY    = 'bible_streak';

  function dayOfYear(date) {
    const d = date || new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function dateKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  function offsetDateKey(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return dateKey(d);
  }

  function today() {
    const data = window.BIBLE_STORIES || {};
    const weekdayPool = Array.isArray(data.weekday) ? data.weekday : [];
    const fridayPool  = Array.isArray(data.friday)  ? data.friday  : [];
    const now = new Date();
    const isFriday = now.getDay() === 5;
    const doy = dayOfYear(now);

    if (isFriday && fridayPool.length > 0) {
      // Cycle through the Friday pool one entry per Friday.
      const fridayIndex = Math.floor(doy / 7);
      return fridayPool[fridayIndex % fridayPool.length];
    }
    if (weekdayPool.length === 0) return null;
    return weekdayPool[doy % weekdayPool.length];
  }

  function greeting() {
    return '📖 Today\'s Bible Story';
  }

  function isReadToday() {
    try { return localStorage.getItem(LAST_READ_KEY) === dateKey(); }
    catch (_) { return false; }
  }

  function streak() {
    try {
      const n = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
      const last = localStorage.getItem(LAST_READ_KEY);
      if (!last) return 0;
      // If the last read was today or yesterday, the streak is alive.
      if (last === dateKey() || last === offsetDateKey(1)) return isNaN(n) ? 0 : n;
      // Older than yesterday — streak has lapsed.
      return 0;
    } catch (_) { return 0; }
  }

  function markRead() {
    try {
      const today = dateKey();
      const last = localStorage.getItem(LAST_READ_KEY);
      if (last === today) {
        return { alreadyRead: true, streak: streak() };
      }

      // Compute the new streak.
      const yesterday = offsetDateKey(1);
      let n = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
      if (isNaN(n)) n = 0;
      if (last === yesterday) {
        n += 1;          // Continued streak.
      } else {
        n = 1;           // Either first read, or a day was skipped — restart at 1.
      }

      localStorage.setItem(LAST_READ_KEY, today);
      localStorage.setItem(STREAK_KEY, String(n));

      // Reward: stars + confetti, via the existing State / Confetti / AudioManager.
      if (window.State && State.addStars) {
        State.addStars(5, 'Read today\'s Bible story');
      }
      if (window.Confetti && Confetti.launch) Confetti.launch(80);
      if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('levelup');

      return { alreadyRead: false, streak: n };
    } catch (_) {
      return { alreadyRead: false, streak: 0 };
    }
  }

  // Public API
  window.BibleOfDay = {
    today: today,
    greeting: greeting,
    isReadToday: isReadToday,
    markRead: markRead,
    streak: streak
  };
})();
