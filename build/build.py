import sys, os, json, re, importlib, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tests'))
from cpy import run_py
import dsl
for m in ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7']: importlib.import_module(m)
from lessons import LESSONS

def norm(s):
    lines = [l.rstrip() for l in s.replace('\r', '').split('\n')]
    return '\n'.join(lines).rstrip('\n')

problems = []
def bad(it, msg): problems.append(f"[{it['id']}] {it['kind']} ({it['skill']}): {msg}\n      {it.get('code') or it.get('expr') or it.get('prompt') or it.get('q')!r}"[:400])

def result_text(r):
    o = norm(r['out'])
    if r['err']:
        e = 'Error: ' + r['err']['type']
        return (o + '\n' + e) if o else e
    return o

LONGFLOAT = re.compile(r'\d\.\d{9,}')
counters = collections.Counter(); items = []
for it in dsl.ITEMS:
    counters[it['unit']] += 1
    it['id'] = f"{it['unit']}.{counters[it['unit']]}"
    k = it['kind']
    if k == 'out':
        r = run_py(it['code'], it['stdin']); key = result_text(r)
        if not key and not r['err']: bad(it, 'prints nothing')
        wr = [norm(w) for w in it.pop('wrong')]
        wr = [w for w in wr if w != key]          # the key is computed by CPython: it can never be a distractor
        if len(set(wr)) != len(wr): bad(it, 'duplicate wrong options')
        if len(wr) < 2: bad(it, 'needs at least 2 wrong options')
        if len(wr) < 3: counters['few-options'] += 1
        if LONGFLOAT.search(key): bad(it, f'ugly float in answer {key!r}')
        # a wrong option whose text only differs by whitespace from key is confusing
        it['options'] = [key] + wr
    elif k == 'typed':
        r = run_py(it['code'], it['stdin'])
        if r['err']: bad(it, f"typed item errors: {r['err']}")
        it['answer'] = norm(r['out'])
        if LONGFLOAT.search(it['answer']): bad(it, 'ugly float')
    elif k == 'ty':
        code = (it['setup'] + '\n' if it['setup'] else '') + f"__v = ({it['expr']})\nprint(type(__v).__name__)"
        r = run_py(code, it['stdin'])
        a = 'Error' if r['err'] else norm(r['out'])
        if a not in ('int', 'float', 'str', 'Error'): bad(it, f'unexpected type {a}')
        it['answer'] = a
    elif k == 'line':
        r = run_py(it['code'], it['stdin'])
        n = it['code'].count('\n') + 1
        if r['err'] and r['err'].get('line') is None: bad(it, 'no line')
        it['nlines'] = n; it['answer'] = (r['err']['line'] - 1) if r['err'] else -1
        it['errtype'] = r['err']['type'] if r['err'] else None
    elif k == 'fill':
        want = norm(it['want']); outs = []
        for i, o in enumerate(it['opts']):
            r = run_py(it['code'].replace('___', o), it['stdin']); outs.append(result_text(r))
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
            diffs = 0
            for t in it['tests']:
                r = run_py(it['buggy'], t['stdin'])
                if result_text(r) != t['expect']: diffs += 1
            if diffs == 0: bad(it, 'buggy code already passes every test')
            if it['buggy'].strip() == sol.strip(): bad(it, 'buggy == solution')
        if k == 'write' and not any(e for e in exp): bad(it, 'solution prints nothing')
        it.pop('alts')
    elif k == 'know':
        if len(set(it['opts'])) != len(it['opts']): bad(it, 'duplicate options')
    items.append(it)

# lessons: compute every 'show' output with CPython
for les in LESSONS:
    blocks = []
    for b in les['blocks']:
        if b[0] == 'show':
            r = run_py(b[1], b[2]); blocks.append(['show', b[1], b[2], norm(r['out']), r['err']['type'] if r['err'] else None])
        else: blocks.append(list(b))
    les['blocks'] = blocks

if problems:
    print('\n'.join(problems)); print(f'\n{len(problems)} PROBLEMS'); sys.exit(1)

# summary
c = collections.Counter((i['unit'], i['kind']) for i in items)
print('items:', len(items), '|', dict(collections.Counter(i['kind'] for i in items)))
for u in range(1, 8): print(' unit', u, {k: v for (uu, k), v in sorted(c.items()) if uu == u})
print('skills:', dict(collections.Counter(i['skill'] for i in items)))
data = {'items': items, 'lessons': LESSONS, 'skills': dsl.SKILLS}
open(os.path.join(ROOT, 'src', 'data.js'), 'w').write('window.PYDATA = ' + json.dumps(data, ensure_ascii=False) + ';\n')
print('wrote src/data.js', os.path.getsize(os.path.join(ROOT, 'src', 'data.js')) // 1024, 'KB')

# ---- assemble the single-file site ----
def rd(n): return open(os.path.join(ROOT, 'src', n), encoding='utf-8').read()
tpl = rd('template.html')
app_js = '\n'.join(rd(n) for n in ['core.js', 'runner.js', 'questions.js', 'sprints.js', 'views.js', 'app.js'])
html = (tpl.replace('/*CSS*/', rd('style.css')).replace('/*INTERP*/', rd('interp.js').replace('</script', '<\\/script')).replace('/*DATA*/', rd('data.js').replace('</script', '<\\/script'))
        .replace('/*APP*/', app_js.replace('</script', '<\\/script')))
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
print('wrote index.html', len(html) // 1024, 'KB')
