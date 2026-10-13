"""Run programs under REAL CPython: the oracle for every answer key and for the JS interpreter."""
import io, sys, contextlib, json, traceback

def run_py(code, stdin=()):
    """-> dict(out=str, err=None | dict(type,msg)).  input() prompts are NOT printed (matches the site's graders)."""
    it = iter(stdin)
    def fake_input(prompt=''):
        try: return next(it)
        except StopIteration: raise EOFError('EOF when reading a line')
    buf = io.StringIO()
    g = {'__name__': '__main__', 'input': fake_input}
    err = None
    try:
        compiled = compile(code, 'main.py', 'exec')
        with contextlib.redirect_stdout(buf):
            exec(compiled, g)
    except SyntaxError as e:
        err = {'type': type(e).__name__, 'msg': e.msg, 'line': e.lineno}
    except BaseException as e:
        line = None
        for fs in traceback.extract_tb(e.__traceback__):
            if fs.filename == 'main.py': line = fs.lineno
        err = {'type': type(e).__name__, 'msg': str(e), 'line': line}
    return {'out': buf.getvalue(), 'err': err}

if __name__ == '__main__':
    cases = json.load(open(sys.argv[1]))
    res = [run_py(c['code'], c.get('stdin', [])) for c in cases]
    json.dump(res, open(sys.argv[2], 'w'))
