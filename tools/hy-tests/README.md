# Half-Yearly module — verification suite

Run these after touching `js/hy-engine.js`, `js/hy-ui.js`, `js/hy-learn.js`, `js/hy-paper.js`
or any `data/hy-*.js` bank or lesson file. They load the real source files, so nothing is
mocked except the browser.

    cd tools/hy-tests
    npm install        # once — pulls jsdom
    npm test           # run.js + ui2.js + learn.js + ui.js + paper.js + hub.js

| script      | what it proves |
|-------------|----------------|
| `run.js`    | Every skill generates valid items at all 3 levels, 60 each. Checks each type's answer key: MCQ index in range and no duplicate options, `accept` lists contain their own answer, `order` answers are a permutation of the tiles, `build` chunks are distinct, `sort` items unique, `passage` sub-questions have model answers. Asserts every generated triangle satisfies the triangle inequality. Then checks the lessons as data: every skill has a written one, with a goal, cards that actually contain something, a worked example of at least two steps with an answer, a recall line, and the skill's `watch` note carried through as its trap. |
| `ui2.js`    | **The important one.** Force-renders every distinct (skill, type) pair in jsdom — 110 of them — solves each one *correctly and incorrectly*, and asserts the grading matches. Also opens and closes the "Show me" card on each. |
| `learn.js`  | Opens all 55 lessons and taps through every screen. No empty screen, no screen without a way forward, no unresolved value in the HTML; the worked example reveals one step per tap and ends on its answer; हिंदी lessons render in the Devanagari card. Also proves that finishing a lesson marks the skill taught, that closing one early does **not**, and that the drill would still teach it afterwards. |
| `ui.js`     | Drives full sessions end to end: all-correct, every-3rd-wrong (proves the re-injection path), then each of the 55 skills drilled solo. Clicks through the lesson that now precedes an untaught skill, and asserts no skill was ever quizzed without being taught first. |
| `paper.js`  | Renders all three printable papers 6× each; asserts no empty section and that question count equals answer-key count. |
| `hub.js`    | Loads `half-yearly.html`, checks the countdown, 3 subject cards, 55 skill buttons, 55 lesson buttons, both sets of subject filters, that an untaught skill on the map opens its lesson instead of a cold quiz (and drills once taught), and that every CTA opens the stage with a non-empty queue. |
| `sim.js`    | Not a pass/fail test — simulates 21 days of a learner (Hindi starts weaker, harder levels cost accuracy) and prints readiness per subject. Expect **89–97%** with the whole portion met by ~day 15. If a subject lags badly, the scheduler has regressed. |
| `sample.js` | Eyeball tool: `node sample.js M8,E6,H12` prints real generated questions with their answers for the skills you name. |

`npm test` exits non-zero on failure, so it is CI-safe.
