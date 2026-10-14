"""Authoring DSL. Every answer key is computed by running REAL CPython at build time (tests/cpy.py)."""
ITEMS = []
SKILLS = {
    'print':   'print() basics',
    'join':    'Joining text (comma & +)',
    'math':    'Variables & math',
    'input':   'input() is always text',
    'convert': 'int() & float()',
    'types':   'Types: int / float / str',
    'errors':  'Reading errors',
    'programs':'Whole programs',
    'bonus':   'Text tools: str() & f-strings',
    # ---- Level Up track ----
    'bool':    'Booleans & comparisons',
    'cond':    'if / elif / else',
    'loops':   'Loops: while & for',
    'strings': 'String tools',
    'lists':   'Lists',
    'funcs':   'Functions',
    'project': 'Mini projects',
}
TEST_SKILLS = ['print', 'join', 'math', 'input', 'convert', 'types', 'errors', 'programs']
LEVEL_SKILLS = ['bonus', 'bool', 'cond', 'loops', 'strings', 'lists', 'funcs', 'project']
# unit -> (track, short title). Units 1-6 = the test; 7+ = Level Up
UNITS = {1: ('test', 'print()'), 2: ('test', 'Variables & math'), 3: ('test', 'input()'), 4: ('test', 'int() & float()'), 5: ('test', 'Types & errors'),
         6: ('test', 'Whole programs'), 7: ('level', 'str() & f-strings'), 8: ('level', 'Decisions: if / else'), 9: ('level', 'Loops'),
         10: ('level', 'Strings'), 11: ('level', 'Lists'), 12: ('level', 'Functions'), 13: ('level', 'Mini projects')}
def _add(kind, unit, **kw):
    d = dict(kind=kind, unit=unit); d.update(kw); ITEMS.append(d); return d

def out(unit, code, wrong, why, stdin=(), skill='print', level=1):
    """Multiple choice: what does it print?  (correct answer computed; wrong = list of strings)"""
    return _add('out', unit, code=code.strip('\n'), wrong=list(wrong), why=why, stdin=list(stdin), skill=skill, level=level)

def typed(unit, code, why, stdin=(), skill='print', level=2):
    """Type the exact output."""
    return _add('typed', unit, code=code.strip('\n'), why=why, stdin=list(stdin), skill=skill, level=level)

def ty(unit, expr, why, setup='', stdin=(), skill='types', level=1, choices=None):
    """What type does expr produce?  default choices int / float / str / Error; pass choices=['bool','int','str','list'] etc."""
    return _add('ty', unit, expr=expr, setup=setup.strip('\n'), why=why, stdin=list(stdin), skill=skill, level=level, choices=list(choices) if choices else None)

def line(unit, code, why, stdin=(), skill='errors', level=2):
    """Which line crashes?"""
    return _add('line', unit, code=code.strip('\n'), why=why, stdin=list(stdin), skill=skill, level=level)

def fill(unit, code, opts, want, why, stdin=(), skill='convert', level=1):
    """Fill the blank ___ . opts[0] is correct. want = what the program should print with the right choice."""
    return _add('fill', unit, code=code.strip('\n'), opts=list(opts), want=want, why=why, stdin=list(stdin), skill=skill, level=level)

def fix(unit, prompt, buggy, solution, tests, why, skill='convert', level=2, alts=(), stdin_note=''):
    """Fix the bug.  tests = list of stdin lists.  Student passes if output matches solution on every test."""
    return _add('fix', unit, prompt=prompt, buggy=buggy.strip('\n'), solution=solution.strip('\n'),
                tests=[list(t) for t in tests], why=why, skill=skill, level=level, alts=[a.strip('\n') for a in alts])

def write(unit, prompt, solution, tests, hints, why, skill='programs', level=3, alts=(), must=(), starter=''):
    """Write a program.  tests = list of stdin lists (first one is shown as the example)."""
    return _add('write', unit, prompt=prompt, solution=solution.strip('\n'), tests=[list(t) for t in tests],
                hints=list(hints), why=why, skill=skill, level=level, alts=[a.strip('\n') for a in alts],
                must=[list(m) for m in must], starter=starter)

def know(unit, q, opts, why, skill='types', code=None, level=1):
    """Concept question, no code to run. opts[0] is correct."""
    return _add('know', unit, q=q, opts=list(opts), why=why, skill=skill, code=(code or '').strip('\n'), level=level)
