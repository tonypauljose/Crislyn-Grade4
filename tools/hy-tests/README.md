# Half-Yearly module — verification suite

Run these after touching `js/hy-engine.js`, `js/hy-ui.js`, `js/hy-paper.js` or any
`data/hy-*.js` bank. They load the real source files, so nothing is mocked except
the browser.

    cd tools/hy-tests
    npm install        # once — pulls jsdom
    npm test           # run.js + ui2.js + ui.js + paper.js + hub.js

| script      | what it proves |
|-------------|----------------|
| `run.js`    | Every skill generates valid items at all 3 levels, 60 each. Checks each type's answer key: MCQ index in range and no duplicate options, `accept` lists contain their own answer, `order` answers are a permutation of the tiles, `build` chunks are distinct, `sort` items unique, `passage` sub-questions have model answers. Also asserts every generated triangle satisfies the triangle inequality. |
| `ui2.js`    | **The important one.** Force-renders every distinct (skill, type) pair in jsdom — 110 of them — solves each one *correctly and incorrectly*, and asserts the grading matches. Also opens and closes the "Show me" card on each. |
| `ui.js`     | Drives full sessions end to end: all-correct, every-3rd-wrong (proves the re-injection path), then each of the 55 skills drilled solo. |
| `paper.js`  | Renders all three printable papers 6× each; asserts no empty section and that question count equals answer-key count. |
| `hub.js`    | Loads `half-yearly.html`, checks the countdown, 3 subject cards, 55 skill buttons, the subject filters, and that every CTA opens the stage with a non-empty queue. |
| `sim.js`    | Not a pass/fail test — simulates 21 days of a learner (Hindi starts weaker, harder levels cost accuracy) and prints readiness per subject. Expect **89–97%** with the whole portion met by ~day 15. If a subject lags badly, the scheduler has regressed. |
| `sample.js` | Eyeball tool: `node sample.js M8,E6,H12` prints real generated questions with their answers for the skills you name. |

`npm test` exits non-zero on failure, so it is CI-safe.
