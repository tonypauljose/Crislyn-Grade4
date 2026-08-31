# MeasureQuest — verification suite

Run these after touching `js/mq-engine.js`, `js/mq-activities.js`, `js/mq-ui.js`, `js/mq-speak.js`,
`data/mq-content.js`, `data/mq-bank.js` or `worksheets/mq-worksheet.html`. They load the real
source files, so nothing is mocked except the browser.

    cd tools/mq-tests
    npm test

jsdom is shared with `../hy-tests`, so if that one has been installed there is nothing to install
here. If it has not: `cd tools/hy-tests && npm install`.

| script          | what it proves |
|-----------------|----------------|
| `engine.js`     | The maths (perimeter, area, missing dimensions, squares as a special case), units in both directions, cell-set shapes and closed boundary loops. Then generation: same seed → identical question, 6800 questions across every generator with none invalid, no fractional or negative dimensions, and **no diagram that disagrees with its own numbers**. Then evaluation: right answers accepted, wrong ones diagnosed by misconception, a right number with the wrong *kind* of unit still caught. Then mastery (4 of the last 5 across 2 formats), weak-skill detection, badges, unlock gates, and persistence — including that a corrupted or future-version save starts clean instead of throwing. |
| `content.js`    | The words rather than the code. 76 curated activities, every one through the same validator the generators use; three hints that genuinely escalate and a third that always works the answer out; **no formula before mission 3 and neither the word "perimeter" nor "area" before the reveal in mission 1**; every misconception has real teaching and a real visual to return to; no emoji doing an icon's job; no sentence too long for a nine-year-old; nothing suggesting ability is fixed. |
| `activities.js` | **The important one.** Renders all 15 interaction types in a real DOM and *plays* each one — 76 curated activities and 102 generated questions, each solved correctly and then incorrectly, asserting the grading agrees both times. Also checks the tracing refuses to skip and only closes when it returns to the start, that tiling covers every cell, that the number pad builds and clears, that a square is drawn square and every rectangle keeps its true proportions, and that inputs and diagrams carry accessible labels. |
| `journey.js`    | The end-to-end path through the real `measurequest.html`: open, start a mission, get one wrong and be taught the specific misconception, retry and have the *recovery* praised, miss twice and be sent back to the visual model with a similar (not harder) question, finish a session, watch a skill become secure, reload and find the progress still there, then the whole Grown-up Corner. Also opens **every mission** and asserts none of them throws or renders a blank screen. |
| `worksheet.js`  | Every sheet kind fills 12 questions with an answer for each; the same seed prints the same sheet twice so the key can never drift from the questions; no printed question asks for an area in a linear unit; and the page itself renders 12 items, 12 key rows, two pages, and an A4 print stylesheet. |
| `sample.js`     | Eyeball tool, not a test. `node sample.js perim-rect,area-missing 3` prints real generated questions with their answers, hints and the diagnosis for each wrong value. |

`npm test` exits non-zero on failure, so it is CI-safe.

## Things these tests were written because of

Each of these was a real bug found during the build, and each has a check now:

- **The Shape Lab rendered a completely blank page.** An activity called `onProgress()` while the
  screen was still being constructed, and the `let checkBtn` it touched was still in its temporal
  dead zone. Nothing caught it until the page was actually looked at in a browser, because the
  unit tests pass their own no-op `onProgress`. `journey.js` now opens every mission and asserts
  the stage is not empty.
- **Trace and tile activities drew the diagram twice**, because they nest the number renderer,
  which drew the shape again. `activities.js` counts the cells.
- **A square was drawn as a wide rectangle**, with equal-side ticks on sides that were visibly not
  equal. `activities.js` now checks the drawn proportions against the numbers.
- **A retry was not counted as a recovery**, because re-rendering the question reset the attempt
  counter — so the Great Recovery badge could never be earned. `journey.js` checks the praise.
- **An area question answered in cm** used to pass if the number was right. `engine.js` checks
  both directions.
- **"How many tiles are needed?" was answered with an area in m².** The question asked for a count
  and was given a surface. Countable materials are now asked about by their measurement.
