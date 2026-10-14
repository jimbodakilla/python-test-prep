import sys, os, json, importlib, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import dsl, verify
UNIT_MODULES = [f'u{n}' for n in range(1, 14)]
LESSON_MODULES = [f'l{n}' for n in range(8, 14)]
loaded = []
for m in UNIT_MODULES:
    if os.path.exists(os.path.join(HERE, m + '.py')): importlib.import_module(m); loaded.append(m)
import lessons
for m in LESSON_MODULES:
    if os.path.exists(os.path.join(HERE, m + '.py')): importlib.import_module(m); loaded.append(m)
LESSONS = sorted(lessons.LESSONS, key=lambda l: l['n'])

items, problems = verify.process(dsl.ITEMS)

# lessons: compute every 'show' output with CPython
for les in LESSONS:
    blocks = []
    for b in les['blocks']:
        if b[0] == 'show':
            r = verify.run_py(b[1], b[2]); blocks.append(['show', b[1], b[2], verify.norm(r['out']), r['err']['type'] if r['err'] else None])
        else: blocks.append(list(b))
    les['blocks'] = blocks
    if les['n'] not in dsl.UNITS: problems.append(f"lesson {les['n']} has no UNITS entry in dsl.py")
    les['track'] = dsl.UNITS.get(les['n'], ('level', ''))[0]
for n in dsl.UNITS:
    if n in [l['n'] for l in LESSONS] and not any(i['unit'] == n for i in items): problems.append(f'unit {n} has a lesson but no questions')

if problems:
    print('\n'.join(problems)); print(f'\n{len(problems)} PROBLEMS'); sys.exit(1)

c = collections.Counter((i['unit'], i['kind']) for i in items)
print('modules:', ' '.join(loaded))
print('items:', len(items), '|', dict(collections.Counter(i['kind'] for i in items)))
for u in sorted(set(i['unit'] for i in items)): print(' unit', u, {k: v for (uu, k), v in sorted(c.items()) if uu == u})
data = {'items': items, 'lessons': LESSONS, 'skills': dsl.SKILLS, 'testSkills': dsl.TEST_SKILLS, 'levelSkills': dsl.LEVEL_SKILLS,
        'units': {str(k): {'track': v[0], 'title': v[1]} for k, v in dsl.UNITS.items()}}
open(os.path.join(ROOT, 'src', 'data.js'), 'w').write('window.PYDATA = ' + json.dumps(data, ensure_ascii=False) + ';\n')
print('wrote src/data.js', os.path.getsize(os.path.join(ROOT, 'src', 'data.js')) // 1024, 'KB')

# ---- assemble the single-file site ----
def rd(n): return open(os.path.join(ROOT, 'src', n), encoding='utf-8').read()
esc = lambda s: s.replace('</script', '<\\/script')
tpl = rd('template.html')
app_js = '\n'.join(rd(n) for n in ['core.js', 'runner.js', 'questions.js', 'sprints.js', 'views.js', 'app.js'])
import base64
font_b64 = base64.b64encode(open(os.path.join(ROOT, 'src', 'assets', 'fredoka-latin.woff2'), 'rb').read()).decode()
sprite = open(os.path.join(ROOT, 'src', 'sprite.svg'), encoding='utf-8').read()
html = tpl.replace('/*CSS*/', rd('style.css').replace('__FONT_B64__', font_b64)).replace('/*SPRITE*/', sprite).replace('/*INTERP*/', esc(rd('interp.js'))).replace('/*DATA*/', esc(rd('data.js'))).replace('/*APP*/', esc(app_js))
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
import hashlib
ver = hashlib.md5(html.encode('utf-8')).hexdigest()[:10]
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(open(os.path.join(HERE, '..', 'src', 'sw.template.js'), encoding='utf-8').read().replace('__VERSION__', ver))
print('wrote sw.js version', ver)
print('wrote index.html', len(html) // 1024, 'KB')
