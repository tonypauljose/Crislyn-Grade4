/* ==========================================================================
   HALF-YEARLY 2026 — LESSONS ("Learn it" before "Prove it")
   --------------------------------------------------------------------------
   The drill engine is a testing machine: every turn asks her to produce an
   answer. That is exactly right for a skill she has already been taught, and
   exactly wrong for one she has not. This file is the missing first step —
   for every skill in the portion, the lesson she gets BEFORE she is ever
   asked a question about it.

   A lesson is deliberately small: two or three cards of method, then one
   example worked in front of her a step at a time, then the mistake to watch
   for. It is over in three or four minutes and then the drill takes over.

   Shape:
     goal    one line — what she will be able to do at the end
     cards   [{ t: title, h: html }]  shown one at a time, she taps through
     worked  { q, steps:[{ t, h }], ans }  the example, revealed step by step
     trap    the thing that goes wrong (defaults to the skill's own `watch`)
     recall  one sentence to carry into the exam

   Registered per subject in hy-lessons-{maths,english,hindi}.js.
   ========================================================================== */

(function () {
  'use strict';

  const LESSONS = {};

  window.HY_LESSONS = {
    add(id, lesson) { LESSONS[id] = lesson; },

    has(id) { return !!LESSONS[id]; },

    ids() { return Object.keys(LESSONS); },

    /**
     * Always returns something teachable. If a skill has no hand-written
     * lesson yet, its "Show me" card becomes the lesson — thin, but never a
     * blank screen, and never a cold quiz.
     */
    get(id) {
      const skill = window.HY_SKILLS.get(id);
      if (!skill) return null;
      const l = LESSONS[id] || {};
      const cards = (l.cards && l.cards.length)
        ? l.cards
        : [{ t: 'The method', h: skill.teach || '' }];
      return {
        id: id,
        skill: skill,
        lang: skill.lang || null,
        goal: l.goal || ('What you need to know for: ' + skill.name + '.'),
        cards: cards,
        worked: l.worked || null,
        trap: l.trap || skill.watch || null,
        /* When the lesson writes its own trap, her real mistake from the
           notebook is still shown underneath it rather than being replaced. */
        note: (l.trap && skill.watch && l.trap !== skill.watch) ? skill.watch : null,
        recall: l.recall || null,
        written: !!LESSONS[id]
      };
    }
  };
})();
