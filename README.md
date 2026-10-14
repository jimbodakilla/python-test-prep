# Python Test Prep (6th grade)

An interactive, no-install website that gets 6th graders ready for a Python test on **print, input, int and float**.

**Live site:** https://jimbodakilla.github.io/python-test-prep/

## What is inside
Two tracks:
- **Test prep (lessons 1-6)**: `print`, variables and math, `input`, `int`/`float`, types and errors, whole programs. This is what the test covers.
- **Level Up (lessons 7-13)**: `str()`/f-strings/`round`, decisions (`if`/`elif`/`else`), loops (`for`, `while`, `range`), strings, lists, functions, and mini projects. Not on the test; for kids who want to keep going.

Both tracks have:
- **Live code boxes** with Run and **Step** (one line at a time with every variable, list boxes with indexes, and type badges), plus trace tables that follow loops and function calls line by line.
- **816 practice questions**: predict the output, type the output, name the type, find the crash, fill the blank, bug hunt, write the code.
- **Coding tasks graded by hidden tests**, with progressive hints.
- **Type Sprint** (60 s) and **Endless practice** (brand-new generated questions every time).
- **Mock test** (10 or 20 questions, timed, graded at the end with a question-by-question review).
- A 2-day study plan, skill meters, weak-spot rescue, plain-English error explanations and a printable cheat sheet.
- Works on phones, tablets and Chromebooks. Single file, works offline. Progress is saved on the device only.

## Design
A game-like, tactile design system built for 11-12 year olds ("Pip & Daylight"):
- Original mascot **Pip** (an SVG snake with five moods) who reacts to answers, scores and milestones.
- Fredoka display type (embedded, SIL OFL, see `src/assets/Fredoka-OFL.txt`), system UI for reading, mono for code; chunky buttons that physically press; one consistent SVG icon set.
- Levels (11 named ranks), 19 badges, a daily streak, XP and short celebrations. Everything respects `prefers-reduced-motion`.
- Focus mode on phones (bottom nav hides during a round, the action bar sits at thumb height), light / dark / auto theme.
- WCAG AA: 0 axe violations in light and dark on every page (`tests/audit_a11y.js`).

## How the answers are guaranteed correct
The page runs a small Python interpreter written for this course (`src/interp.js`). It is not trusted blindly:
- Every answer key is computed by **real CPython** at build time (`build/build.py`), never typed by hand. The build fails if a distractor equals the real answer, a buggy program already passes, or alternate solutions disagree.
- The interpreter was fuzz-tested against CPython on 90,000+ random programs, including loops, lists, slicing, string methods and functions (stdout and error messages must match).
- All 816 questions, every reference solution, every alternative solution and 3,000 generated questions are re-checked inside a real browser (`tests/bank_check.js`).
- Infinite loops are caught (time limit plus a working Stop button) and output is capped, so a mistake can never freeze a Chromebook.

## Build and test
```
python3 build/build.py          # verifies with CPython, writes src/data.js and index.html
python3 tests/gen_fuzz.py 6000 1 tests/fuzz.json && node tests/fuzz.js tests/fuzz.json
node tests/bank_check.js        # needs Google Chrome
node tests/e2e.js /tmp          # clicks through the app in headless Chrome
node tests/e2e_level.js /tmp    # Level Up lessons, editor, loop safety
```
Questions live in `build/u1.py` ... `build/u13.py`, lessons in `build/lessons.py` and `build/l8.py` ... `build/l13.py`. To add a unit, read `build/AUTHORING.md` and check it with `python3 build/check_unit.py uN --show`.
