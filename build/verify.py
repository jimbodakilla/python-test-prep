"""Verify + compute answer keys for authored items using REAL CPython. Shared by build.py and check_unit.py."""
import sys, os, re, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from cpy import run_py

def norm(s):
    return '\n'.join(l.rstrip() for l in s.replace('\r', '').split('\n')).rstrip('\n')

LONGFLOAT = re.compile(r'\d\.\d{9,}')
DEFAULT_TY = ['int', 'float', 'str', 'Error']

def result_text(r):
    o = norm(r['out'])
    if r['err']:
        e = 'Error: ' + r['err']['type']
        return (o + '\n' + e) if o else e
    return o

def process(items, counters=None):
    """Mutates items in place (adds id + keys). Returns (items, problems)."""
    problems = []; counters = counters if counters is not None else collections.Counter()
    seen_sig = {}
    def bad(it, msg):
        src = it.get('code') or it.get('expr') or it.get('prompt') or it.get('q') or ''
        problems.append(f"[{it['id']}] {it['kind']} ({it['skill']}): {msg}\n      {src!r}"[:420])
    for it in items:
        counters[it['unit']] += 1
        it['id'] = f"{it['unit']}.{counters[it['unit']]}"
        k = it['kind']
        sig = (k, it.get('code') or it.get('expr') or it.get('q') or it.get('prompt'), it.get('setup', ''), tuple(it.get('stdin', [])), tuple(it.get('opts', [])[:1]) if k == 'fill' else ())
        if k not in ('fix', 'write') and sig in seen_sig and k != 'fill': bad(it, f'DUPLICATE of {seen_sig[sig]}')
        seen_sig[sig] = it['id']
        if len(it['why']) < 40 and it['unit'] >= 8: bad(it, f"explanation too thin ({len(it['why'])} chars): {it['why']!r}  -> say WHY, with the specific values")
        if k == 'out':
            r = run_py(it['code'], it['stdin']); key = result_text(r)
            if len(it['why']) < 40 and it['unit'] < 8:
                it['why'] += ' Python crashes with ' + key.split('Error: ')[-1] + '.' if 'Error: ' in key else ' Python prints: ' + key.replace('\n', ' / ') + '.'
            if r['err'] and r['err']['type'] == 'TimeoutError': bad(it, 'program does not finish')
            if not key and not r['err']: bad(it, 'prints nothing')
            wr = [norm(w) for w in it.pop('wrong')]
            wr = [w for w in wr if w != key]
            if len(set(wr)) != len(wr): bad(it, 'duplicate wrong options')
            if len(wr) < 2: bad(it, 'needs at least 2 distinct wrong options')
            if LONGFLOAT.search(key): bad(it, f'ugly float in answer {key!r}')
            it['options'] = [key] + wr
        elif k == 'typed':
            r = run_py(it['code'], it['stdin'])
            if r['err']: bad(it, f"typed item errors: {r['err']}")
            it['answer'] = norm(r['out'])
            if len(it['why']) < 40 and it['unit'] < 8: it['why'] += ' Python prints: ' + it['answer'].replace('\n', ' / ') + '.'
            if not it['answer']: bad(it, 'typed item prints nothing')
            if LONGFLOAT.search(it['answer']): bad(it, 'ugly float')
        elif k == 'ty':
            code = (it['setup'] + '\n' if it['setup'] else '') + f"__v = ({it['expr']})\nprint(type(__v).__name__)\nprint(repr(__v))"
            r = run_py(code, it['stdin'])
            ch = it.get('choices') or DEFAULT_TY
            if r['err']: a = 'Error'; val = '💥 ' + r['err']['type']
            else:
                tn, _, val = norm(r['out']).partition('\n'); a = tn
                if a not in ch: bad(it, f'type {a} is not among the choices {ch}')
            if a == 'Error' and 'Error' not in ch: bad(it, 'expression errors but Error is not a choice')
            it['answer'] = a; it['choices'] = ch if it.get('choices') else None
            if 'Error' in ch and a != 'Error' or a == 'Error': it['why'] = f"{it['expr']} gives {val}" + (f" ({a}). " if a != 'Error' else '. ') + it['why']
            if it.get('choices') and len(ch) != len(set(ch)): bad(it, 'duplicate choices')
        elif k == 'line':
            r = run_py(it['code'], it['stdin'])
            n = it['code'].count('\n') + 1
            if r['err'] and r['err'].get('line') is None: bad(it, 'no line')
            it['nlines'] = n; it['answer'] = (r['err']['line'] - 1) if r['err'] else -1
            it['errtype'] = r['err']['type'] if r['err'] else None
        elif k == 'fill':
            want = norm(it['want']); outs = []
            if it['code'].count('___') != 1: bad(it, 'fill code needs exactly one ___')
            for o in it['opts']:
                outs.append(result_text(run_py(it['code'].replace('___', o), it['stdin'])))
            if outs[0] != want: bad(it, f'correct fill gives {outs[0]!r} not {want!r}')
            for i in range(1, len(outs)):
                if outs[i] == want: bad(it, f'wrong fill {it["opts"][i]!r} also gives the wanted output')
            it['want'] = want
        elif k in ('fix', 'write'):
            sol = it['solution']; exp = []
            for t in it['tests']:
                r = run_py(sol, t)
                if r['err']: bad(it, f'solution errors on {t}: {r["err"]}')
                exp.append(norm(r['out']))
                if LONGFLOAT.search(exp[-1]): bad(it, f'ugly float in expected {exp[-1]!r}')
                for alt in it['alts']:
                    ra = run_py(alt, t)
                    if norm(ra['out']) != exp[-1] or ra['err']: bad(it, f'alt solution disagrees on {t}: {ra}')
            it['expect'] = exp
            it['tests'] = [{'stdin': t, 'expect': e} for t, e in zip(it['tests'], exp)]
            if k == 'fix':
                diffs = sum(1 for t in it['tests'] if result_text(run_py(it['buggy'], t['stdin'])) != t['expect'])
                if diffs == 0: bad(it, 'buggy code already passes every test')
                if it['buggy'].strip() == sol.strip(): bad(it, 'buggy == solution')
            if k == 'write':
                if not any(e for e in exp): bad(it, 'solution prints nothing')
                if len(it['tests']) < 2 and it['unit'] >= 8 and not it['must']: bad(it, 'write task with a single test can be hard-coded: give >=3 tests (different inputs) or a must= rule')
        elif k == 'know':
            if len(set(it['opts'])) != len(it['opts']): bad(it, 'duplicate options')
            ls = [len(x) for x in it['opts']]
            if ls[0] == max(ls) and ls.count(ls[0]) == 1 and len(it['opts']) >= 3 and ls[0] > 1.5 * sorted(ls)[-2]:
                bad(it, 'correct option is much longer than the others (a test-taking cue): lengthen the wrong ones')
    return items, problems

def summarize(items):
    c = collections.Counter(i['kind'] for i in items)
    return dict(c)
