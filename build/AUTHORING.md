# Authoring guide: Level Up units (8-13)

Audience: 11-12 year olds who just learned `print`, `input`, `int`, `float`, variables, `+ - * /`, text vs numbers, and the four error names
(see `build/lessons.py` lessons 1-6 and `build/u4.py`, `build/u5.py` for the existing voice and format). They now continue to learn.
Voice: short sentences, concrete examples, no unexplained jargon, friendly but never babyish. Say "string (str)", "Boolean (bool)", "list".

## 1. The Python subset (the website's interpreter supports exactly this; stay inside it)
Statements: assignment (`x = 1`, `lst[0] = 5`), augmented assignment (`x += 1`, `lst[i] += 1`), `if / elif / else`, `while`, `for NAME in <range|list|string>`,
`break`, `continue`, `pass`, `def` (positional parameters, default values), `return`, `global NAME`, expression statements, comments.
Expressions: int/float/str/bool/None/list literals, `+ - * / // % **`, unary minus, comparisons `== != < > <= >=` (chained ok), `in`, `not in`,
`and`, `or`, `not`, calls, indexing `x[i]` (negative ok), slicing `x[a:b]` and `x[a:b:c]`, f-strings (`{x}`, `{x:.2f}`, `{n:,}`), method calls.
Builtins: `print` (with `sep=`/`end=`), `input`, `int`, `float`, `str`, `bool`, `len`, `range`, `sum`, `min`, `max`, `abs`, `round`, `sorted`, `list`, `type`.
String methods: `upper lower strip lstrip rstrip replace count find index startswith endswith isdigit isalpha title capitalize split join`.
List methods: `append insert remove pop sort(reverse=True ok) reverse index count extend copy`.
NOT allowed anywhere: tuples, dictionaries, sets, comprehensions, lambda, `import`/random, classes, try/except, `with`, `is`, `enumerate`, `zip`, `*args`, `del`, `str.format`, `%` string formatting,
conditional expressions (`a if c else b`), nested functions, recursion, `while True` + input loops that depend on randomness.
Everything must be DETERMINISTIC and finish in well under a second.

## 2. Item kinds (see `build/dsl.py` for signatures)
`out` (multiple choice: what does it print / what happens), `typed` (type the exact output, <= 5 lines), `ty` (name the type; for Level Up use `choices=['bool','int','str','list']` etc. - the correct type must be among the choices),
`line` (which line crashes), `fill` (one `___`), `fix` (find the bug, graded by hidden tests), `write` (write a program, graded by hidden tests), `know` (concept question).
Answer keys are computed by real CPython; you never type an answer. You supply the wrong options for `out` (2-3), choices for `fill`/`know` (the first one is the correct one; they are shuffled at runtime).

## 3. Quality bar (the checker enforces some of this, you enforce the rest)
- Every `why` explains the REASON using the actual values of this question (at least 40 characters). Not "Loops repeat." but "range(3) gives 0, 1, 2, so the body runs 3 times and prints 3 lines."
- Wrong options are plausible MISCONCEPTIONS a kid really has (off-by-one, `=` vs `==`, forgetting the colon, print vs return, 1-based indexing, int-vs-float...). Same length and style as the right one. Never silly.
- `out` items whose code needs input: use plain `input()` (no prompt text), because prompts are not part of what print shows.
- No ugly floats (nothing like 0.30000000000000004). Use values like 0.5, 2.5, 1.25 or integers.
- Programs with loops must be short enough to trace by hand (a kid can do it on paper): at most ~12 loop iterations in predict items.
- Vary difficulty: `level=1` quick recall, `level=2` normal, `level=3` needs careful tracing/combining. Roughly 45% / 35% / 20%.
- `fix` items: realistic kid bugs, one bug per task (two for level 3). Tests (hidden) must distinguish the buggy and fixed program.
- `write` items: give 3+ test inputs including an edge case (zero, equal values, empty text...). Add `alts=[...]` solutions for every other natural way a kid might solve it (loop vs formula, for vs while).
  Use `must=[[regex, message]]` when the task requires a construct (for example `r'\bfor\b'` with a friendly message) - otherwise a kid could hard-code the answers.
  Starters (`starter='...'`) are welcome for harder tasks (give the first line or two).
- Mix of kinds per unit of ~55 items: ~18 out, ~8 typed, ~6 ty/line, ~5 fill, ~5 fix, ~6 write, ~6 know. Include several `line` items (find the crash) and a few IndentationError / SyntaxError style `out` items where the correct answer is `Error: IndentationError` etc.
- `know` items: four options of SIMILAR LENGTH; the correct option must not be the longest (the checker flags it).
- Do not duplicate a question that already exists in units 1-7 (e.g. `print(10 / 2)`).

## 4. Lessons (`build/lN.py`)
```python
from lessons import L
L(8, 'Decisions: if / else', '🔀', 25, 'goal sentence', ['I can ...', 'I can ...'], [ ...blocks... ])
```
Block types: `('p', html)`, `('h', text)`, `('rule', title, html)` green key rule, `('trap', html)` amber warning, `('list', [html,...])`, `('table', [headers], [[cell,...],...])`,
`('try', code, [stdin...], 'instruction')` live editable runner (kids predict, then Run; use stdin suggestions for input()),
`('show', code, [stdin...])` static code + output computed by CPython (never type outputs yourself),
`('trace', code, [stdin...])` step-by-step table of line / variables (use for loops and function calls: 4-8 rows get shown),
`('branch', 'condition', 'what happens if True', 'what happens if False')` small decision diagram (for `if`),
`('quick', question, [options], correct_index, why)` inline check. HTML is allowed in text (`<code>`, `<b>`).
Shape of a lesson: hook problem -> new idea in the smallest example -> `try` -> rule -> trap -> second idea -> `try`/`trace` -> table of common mistakes (and the error each causes - verify with Python) -> 2-3 `quick`.
12-18 blocks, at least 3 `try`, at least 2 `show`/`trace`, 1-2 `rule`, 1-2 `trap`. 'cando' lists 3-4 "I can ..." statements.
Everything you claim in a table about what error a mistake causes must be verified by actually running it with `python3`.

## 5. Your files and checking
Write ONLY your own files: `build/uN.py` (questions) and `build/lN.py` (lesson). Start the question file with `from dsl import *` and `U = N`.
Check with:  `python3 build/check_unit.py uN --show`  (verifies with real CPython, prints computed keys so you can re-read every question with its answer)
Do NOT run `build/build.py` (other authors work in parallel and it writes shared output). Do not edit other files.
Skill codes to use (field `skill=`): unit 8 -> `bool`, `cond`; unit 9 -> `loops`; unit 10 -> `strings`; unit 11 -> `lists`; unit 12 -> `funcs`; unit 13 -> `project`.
Finish by re-reading every item with its computed key (`--show`), fixing anything a 12-year-old could find ambiguous, then reply with a SHORT summary: counts, any Python features you needed beyond section 1 (there should be none), and anything you want the integrator to know.
