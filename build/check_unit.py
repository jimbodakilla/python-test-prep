"""Usage: python3 build/check_unit.py u8 [--show]   -> verifies ONLY that module's items with real CPython (writes nothing)."""
import sys, os, importlib, collections
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import dsl, verify
mod = sys.argv[1]
importlib.import_module(mod)
items, problems = verify.process(dsl.ITEMS)
if problems:
    print('\n'.join(problems)); print(f'\n{len(problems)} PROBLEMS in {mod}'); sys.exit(1)
print(f'{mod}: {len(items)} items OK |', verify.summarize(items))
print('skills:', dict(collections.Counter(i['skill'] for i in items)), '| levels:', dict(collections.Counter(i['level'] for i in items)))
if '--show' in sys.argv:
    for it in items:
        k = it['kind']
        key = it.get('options', [None])[0] if k == 'out' else it.get('answer') if k in ('typed', 'ty') else it.get('want') if k == 'fill' else it.get('opts', [None])[0] if k == 'know' else ''
        src = (it.get('code') or it.get('expr') or it.get('prompt') or it.get('q') or '').replace('\n', ' ⏎ ')[:80]
        print(f"{it['id']:6} {k:6} L{it['level']} {src!r:84} => {str(key)[:40]!r}")
