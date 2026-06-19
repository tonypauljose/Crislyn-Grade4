/* ============================================================
   NUMBERS LAB — per-child config  (CRISLYN, Grade 4)
   Only this file + numbers-lab.html differ from Crispin's site.
   ============================================================ */
window.NLAB_CONFIG = {
  child: 'crislyn',
  name: 'Crislyn',
  grade: 4,
  age: 9,
  // accent theming — dusty rose + sky blue, to match Crislyn's site
  accent: '#F4A6BD',
  accent2: '#6EC6F0',
  // Grade 4 → start gentle
  defaultLevel: 'explorer',       // explorer | adventurer | champion
  storageKey: 'nlab_progress_v1',
  homeHref: 'maths.html',
  // Bridge target IF the host engine is loaded. Crislyn's state.js auto-runs
  // on load and would mutate her site data, so the Lab page does NOT load it —
  // this stays a safe no-op (the Lab keeps its own progress). Pixie likewise.
  hostXP: 'State',
  mascot: 'Pixie',
  welcome: "Hi Crislyn! I'm Digit, your lab buddy. Let's play with numbers — counting, lining them up, and the secret on/off code computers use. Ready? Tap a mission!"
};
