# Python Test Prep (6th grade)

An interactive, no-install website that gets 6th graders ready for a Python test on **print, input, int and float**.

**Live site:** https://jimbodakilla.github.io/python-test-prep/

## What is inside
- **6 lessons + 1 bonus** with live code boxes. Run, or **Step** line-by-line and watch each variable and its type.
- **388 practice questions**: predict the output, type the output, name the type, find the crash, fill the blank, bug hunt, write the code.
- **Coding tasks graded by hidden tests**, with progressive hints.
- **Type Sprint** (60 s) and **Endless practice** (brand-new generated questions every time).
- **Mock test** (10 or 20 questions, timed, graded at the end with a question-by-question review).
- A 2-day study plan, skill meters, weak-spot rescue, plain-English error explanations and a printable cheat sheet.
- Works on phones, tablets and Chromebooks. Single file, works offline. Progress is saved on the device only.

## How the answers are guaranteed correct
The page runs a small Python interpreter written for this course (`src/interp.js`). It is not trusted blindly:
- Every answer key is computed by **real CPython** at build time (`build/build.py`), never typed by hand. The build fails if a distractor equals the real answer, a buggy program already passes, or alternate solutions disagree.
- The interpreter was fuzz-tested against CPython on 60,000+ random programs (stdout and error messages must match).
- All 388 questions, every reference solution and 3,000 generated questions are re-checked inside a real browser (`tests/bank_check.js`).

## Build and test
```
python3 build/build.py          # verifies with CPython, writes src/data.js and index.html
python3 tests/gen_fuzz.py 6000 1 tests/fuzz.json && node tests/fuzz.js tests/fuzz.json
node tests/bank_check.js        # needs Google Chrome
node tests/e2e.js /tmp          # clicks through the app in headless Chrome
```
Questions live in `build/u1.py` ... `build/u7.py`, lessons in `build/lessons.py`.
