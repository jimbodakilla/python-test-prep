import random, json, sys
sys.path.insert(0, 'tests')
from cpy import run_py
R = random.Random(int(sys.argv[2]) if len(sys.argv) > 2 else 1)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
STRS = ['"hello"', '"Python"', '"a b c"', '"  pad  "', '""', '"Hello World"', '"racecar"', '"x1y2"', '"MiXeD"', '"12345"', "'it'", '"banana"']
WORDS = ['"cat"', '"dog"', '"a"', '"ab"', '"zz"', '" "']
class G:
    def __init__(s):
        s.ints = ['n0']; s.strs = ['t0']; s.lists = ['L0']; s.funcs = []; s.depth = 0; s.inloop = 0; s.infunc = False; s.counter = 0
        s.lines = []
    def fresh(s, p): s.counter += 1; return f'{p}{s.counter}'
    # ---- expressions
    def ie(s, d=0):
        r = R.random()
        if d > 2 or r < .3: return R.choice(s.ints + [str(R.randint(-3, 12)), str(R.randint(0, 5))])
        if r < .5: return f'({s.ie(d+1)} {R.choice(["+","-","*"])} {s.ie(d+1)})'
        if r < .55: return f'({s.ie(d+1)} {R.choice(["//","%"])} {R.choice(["2","3","5","-2"])})'
        if r < .65: return f'len({R.choice([s.se(d+1), s.le(d+1)])})'
        if r < .7: return f'sum({s.le(d+1)})'
        if r < .75: return f'{R.choice(["min","max"])}({s.le(d+1)})' if R.random() < .3 else f'{R.choice(["min","max","abs"][:2])}({s.ie(d+1)}, {s.ie(d+1)})'
        if r < .8: return f'{s.se(d+1)}.{R.choice(["find","count"])}({R.choice(WORDS)})'
        if r < .85: return f'{s.le(d+1)}[{R.choice(["0","1","-1","2","-2"])}]'
        if r < .9: return f'int({R.choice(["\"7\"", "\"12\"", "t0"] if False else ["\"7\"", "\"12\"", "\"-4\""])})'
        if s.funcs: return s.call(d+1, 'int')
        return str(R.randint(0, 9))
    def se(s, d=0):
        r = R.random()
        if d > 2 or r < .35: return R.choice(s.strs + STRS)
        if r < .45: return f'({s.se(d+1)} + {s.se(d+1)})'
        if r < .5: return f'({s.se(d+1)} * {R.choice(["0","1","2","3"])})'
        if r < .65: return f'{s.se(d+1)}.{R.choice(["upper","lower","strip","title","capitalize"])}()'
        if r < .72: return f'{s.se(d+1)}.replace({R.choice(WORDS)}, {R.choice(WORDS)})'
        if r < .8: return f'{s.se(d+1)}[{R.choice(["0","1","-1","2","3","-3"])}]'
        if r < .88: return f'{s.se(d+1)}[{R.choice(["","1","-2","0"])}:{R.choice(["","2","4","-1","10"])}{R.choice(["",":2",":-1"])}]'
        if r < .92: return f'str({s.ie(d+1)})'
        if r < .96: return f'{R.choice(WORDS)}.join({s.se(d+1)}.split())' if False else f'" ".join({s.se(d+1)}.split())'
        inner = s.se(d+1).replace('"', "'")
        if 'f"' in inner or "f'" in inner or '{' in inner: inner = "'z'"
        return 'f"{' + s.ie(d+1).replace('"', "'") + '}-{' + inner + '}"'
    def le(s, d=0):
        r = R.random()
        if d > 2 or r < .35: return R.choice(s.lists)
        if r < .5: return '[' + ', '.join(str(R.randint(-2, 9)) for _ in range(R.randint(0, 4))) + ']'
        if r < .6: return f'({s.le(d+1)} + {s.le(d+1)})'
        if r < .65: return f'({s.le(d+1)} * {R.choice(["0","2"])})'
        if r < .75: return f'{s.le(d+1)}[{R.choice(["","1","-2"])}:{R.choice(["","3","-1"])}{R.choice(["",":2",":-1"])}]'
        if r < .82: return f'sorted({s.le(d+1)}{R.choice(["", ", reverse=True"])})'
        if r < .9: return f'list(range({R.choice(["3","0","5"])}))' if R.random() < .5 else f'list(range({R.randint(0,3)}, {R.randint(2,8)}{R.choice(["", ", 2", ", -1"])}))'
        return f'{s.se(d+1)}.split()'
    def be(s, d=0):
        r = R.random()
        if d > 1 or r < .35: return f'{s.ie(d+1)} {R.choice(["==","!=","<",">","<=",">="])} {s.ie(d+1)}'
        if r < .45: return f'{s.se(d+1)} {R.choice(["==","!=","<",">"])} {s.se(d+1)}'
        if r < .55: return f'{R.choice(WORDS)} {R.choice(["in","not in"])} {s.se(d+1)}'
        if r < .62: return f'{s.ie(d+1)} {R.choice(["in","not in"])} {s.le(d+1)}'
        if r < .72: return f'({s.be(d+1)}) {R.choice(["and","or"])} ({s.be(d+1)})'
        if r < .78: return f'not ({s.be(d+1)})'
        if r < .88: return f'{s.se(d+1)}.{R.choice(["isdigit","isalpha","isupper","islower","isalnum"])}()'
        if r < .93: return f'{s.se(d+1)}.{R.choice(["startswith","endswith"])}({R.choice(WORDS)})'
        return f'{s.ie(d+1)} {R.choice(["<",">"])} {s.ie(d+1)} {R.choice(["<","<=","!="])} {s.ie(d+1)}'
    def anyexpr(s):
        return R.choice([s.ie, s.se, s.le, s.be])()
    def call(s, d, kind=None):
        f = R.choice(s.funcs); args = ', '.join(s.ie(d+1) for _ in range(f[1]))
        if R.random() < .05: args = args + ', 1'
        return f'{f[0]}({args})'
    # ---- statements
    def emit(s, line): s.lines.append('    ' * s.depth + line)
    def stmt(s):
        r = R.random()
        if r < .12:
            v = R.choice(s.ints + [s.fresh('n')]); 
            s.emit(f'{v} = {s.ie()}'); 
            if v not in s.ints: s.ints.append(v)
        elif r < .2:
            v = R.choice(s.strs + [s.fresh('t')]); s.emit(f'{v} = {s.se()}')
            if v not in s.strs: s.strs.append(v)
        elif r < .28:
            v = R.choice(s.lists + [s.fresh('L')]); s.emit(f'{v} = {s.le()}')
            if v not in s.lists: s.lists.append(v)
        elif r < .4:
            args = ', '.join(s.anyexpr() for _ in range(R.randint(1, 3)))
            s.emit(f'print({args}{R.choice(["","","", ", sep=\"|\"", ", end=\"!\\n\""])})')
        elif r < .46:
            v = R.choice(s.ints); s.emit(f'{v} {R.choice(["+=","-=","*="])} {s.ie()}')
        elif r < .56:
            l = R.choice(s.lists); m = R.choice(['append', 'append', 'insert', 'pop', 'remove', 'sort', 'reverse', 'extend', 'index', 'count'])
            if m == 'append': s.emit(f'{l}.append({s.ie()})')
            elif m == 'insert': s.emit(f'{l}.insert({R.choice(["0","1","-1","9"])}, {s.ie()})')
            elif m == 'pop': s.emit(f'print({l}.pop({R.choice(["", "0", "-1", "5"])}))')
            elif m == 'remove': s.emit(f'{l}.remove({s.ie()})')
            elif m in ('sort', 'reverse'): s.emit(f'{l}.{m}()' if m == 'reverse' else f'{l}.sort({R.choice(["", "reverse=True"])})')
            elif m == 'extend': s.emit(f'{l}.extend({R.choice([s.le(), s.se()])})')
            else: s.emit(f'print({l}.{m}({s.ie()}))')
        elif r < .6:
            l = R.choice(s.lists); s.emit(f'{l}[{R.choice(["0","1","-1","3"])}] = {s.ie()}')
        elif r < .74 and s.depth < 3:
            s.emit(f'if {s.be()}:'); s.block()
            for _ in range(R.choice([0, 0, 1])): s.emit(f'elif {s.be()}:'); s.block()
            if R.random() < .5: s.emit('else:'); s.block()
        elif r < .84 and s.depth < 3:
            v = s.fresh('i'); it = R.choice([f'range({R.choice(["0","1","3"])}, {R.randint(1,6)})', f'range({R.randint(0,5)})', s.le(), s.se(), 'range(5, 0, -2)'])
            s.emit(f'for {v} in {it}:'); s.depth += 1; s.inloop += 1
            iv = it.startswith('range'); 
            (s.ints if iv else (s.strs if it in s.strs or it in STRS else s.ints)).append(v)
            s.emit(f'print({v}{R.choice(["", ", " + s.ie(), ""])})'); s.block_body(); 
            for lst in (s.ints, s.strs):
                if v in lst: lst.remove(v)
            s.inloop -= 1; s.depth -= 1
        elif r < .9 and s.depth < 3:
            c = s.fresh('c'); s.emit(f'{c} = 0'); s.ints.append(c)
            s.emit(f'while {c} < {R.randint(1,5)}:'); s.depth += 1; s.inloop += 1
            s.emit(f'{c} += 1'); s.block_body(); s.inloop -= 1; s.depth -= 1
        elif r < .93 and s.inloop and s.depth > 0:
            s.emit(f'if {s.be()}:'); s.depth += 1; s.emit(R.choice(['break', 'continue'])); s.depth -= 1
        elif r < .97 and s.depth == 0 and not s.infunc and len(s.funcs) < 3:
            name = s.fresh('f'); np_ = R.randint(0, 2); params = [f'p{k}' for k in range(np_)]
            dflt = R.random() < .3 and np_ > 0
            sig = ', '.join(params[:-1] + [params[-1] + '=' + str(R.randint(0, 4))] if dflt else params)
            s.emit(f'def {name}({sig}):'); s.depth += 1; s.infunc = True
            saved = (s.ints, s.strs, s.lists); s.ints = params + ['n0']; s.strs = ['t0']; s.lists = ['L0']
            s.block_body(); 
            if R.random() < .85: s.emit(f'return {s.ie()}')
            s.ints, s.strs, s.lists = saved; s.infunc = False; s.depth -= 1; s.funcs.append((name, np_))
        elif s.funcs and r >= .97:
            s.emit(f'print({s.call(0)})')
        else:
            s.emit(f'print({s.anyexpr()})')
    def block(s): s.depth += 1; s.block_body(); s.depth -= 1
    def block_body(s):
        for _ in range(R.randint(1, 3)): s.stmt()
    def program(s):
        s.emit('n0 = ' + str(R.randint(0, 7))); s.emit('t0 = ' + R.choice(STRS)); s.emit('L0 = [' + ', '.join(str(R.randint(0, 9)) for _ in range(R.randint(2, 5))) + ']')
        for _ in range(R.randint(3, 9)): s.stmt()
        return '\n'.join(s.lines) + '\n'
cases = []
for _ in range(N):
    g = G(); cases.append({'code': g.program(), 'stdin': []})
HAND = ['x = 5\ndef f():\n    x += 1\n    return x\nprint(f())', 'def f(a, b):\n    return a + b\nprint(f(1))', 'def f(a, b=2):\n    return a * b\nprint(f(3), f(3, 4), f(b=5, a=1))', 'def f(a):\n    return a\nprint(f(1, 2, 3))',
 'def f():\n    y = 5\nf()\nprint(y)', 'def f():\n    print("hi")\nx = f()\nprint(x)\nprint(x + 1)', 'print(f(2))\ndef f(n):\n    return n', 'def f(n):\n    return f(n + 1)\nprint(f(1))',
 'def f(a=1, b):\n    pass', 'count = 0\ndef inc():\n    global count\n    count += 1\ninc()\ninc()\nprint(count)', 'def f(x):\n    if x > 0:\n        return "pos"\n    elif x < 0:\n        return "neg"\nprint(f(1), f(-1), f(0))',
 'for i in range(3):\n    print(i)\nprint(i)', 'for i in range(0):\n    pass\nprint(i)', 'i = 10\nwhile i > 0:\n    i -= 3\n    if i < 5:\n        break\nprint(i)', 'for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)',
 'if 5 > 3:\nprint("x")', 'if 5 > 3\n    print("x")', 'if 5 = 3:\n    print("x")', 'x = 5\nif x > 3:\n    print("a")\n  print("b")', 'x = 5\n  print(x)', 'else:\n    print(1)', 'for i in range(3):\nprint(i)',
 'print("abc"[1], "abc"[-1], "abc"[1:], "abc"[:2], "abc"[::-1], "abc"[5:], "abc"[-10:2])', 'print("abc"[3])', 'x = "abc"\nx[0] = "z"', 'L = [1,2,3]\nL[3] = 4', 'L = [1,2,3]\nprint(L[3])', 'L = []\nprint(L[0])', 'L = []\nL.pop()', 'L = [1]\nL.remove(2)', 'L = [3,1,2]\nx = L.sort()\nprint(x, L)',
 'a = [1,2]\nb = a\nb.append(3)\nprint(a, b, a == b)', 'a = [1,2]\nb = a.copy()\nb.append(3)\nprint(a, b)', 'print([1,2] + [3], [0]*3, [1,2] == [1,2], [1,2] < [1,3], [] == [], not [])', 'print([1,2] + 3)', 'print("a" in "abc", "ac" in "abc", 2 in [1,2], 5 not in [1,2], 3 in range(5), 5 in range(5))',
 'print(5 in "abc")', 'print("a" in 5)', 'print(len(5))', 'print(len("héllo"), len([1,2]), len(range(4)))', 'print(sum([1,2,3]), sum([]), sum([0.5, 1]), max([1,5,2]), min("bca"), max(3, 7), sorted("cba"), sorted([3,1,2], reverse=True))', 'print(max([]))', 'print(sum(["a","b"]))', 'print(sorted([3,"a"]))',
 'print(list(range(2, 10, 3)), list(range(5, 0, -2)), list(range(0)), list("ab"), list(range(-3)))', 'range(1, 5, 0)', 'print(range(3), range(1, 4), range(0, 10, 2))', 'print("a,b,,c".split(","), " a  b ".split(), "abc".split("b"), "a b c".split(" ", 1), "".split(), "".split(","))',
 'print("-".join(["a","b"]), " ".join("abc"), "".join([]))', 'print("-".join([1,2]))', 'print("Hello World".title(), "hello".capitalize(), "HeLLo".swapcase())', 'print("hello world".title(), "they\'re".title(), "x1y".title())', 'print("abcabc".find("c"), "abc".find("z"), "abc".index("b"), "aaa".count("a"), "abc".count(""))', 'print("abc".index("z"))',
 'print("  x ".strip(), "xxhixx".strip("x"), "  x".lstrip(), "x  ".rstrip(), "a-b".replace("-", ""), "aaa".replace("a", "b", 2), "abc".replace("", "-"))', 'print("123".isdigit(), "12a".isdigit(), "".isdigit(), "abc".isalpha(), "AB".isupper(), "ab".islower(), "a1".isalnum())', 'x = "a".upper', 'print(5 > "3")', 'print("a" < "b", "B" < "a", "abc" <= "abd")',
 'print(1 < 2 < 3, 1 < 3 < 2, 1 == 1.0, "1" == 1, True == 1, None == None, 3 != 3)', 'x = 5\nprint(x > 3 and x < 10, x > 3 and "yes", 0 or "empty", "" or 0, not 0, not "a")', 'print(5 if True else 3)', 'n = 7\nprint("even" if n % 2 == 0 else "odd")', 'print(7 // 2, -7 // 2, 7 % 3, -7 % 3, 7 % -3, 2 ** 3, 2 ** -1)',
 'print(True + True, True * 5, int(True), bool(0), bool("a"), bool([]), bool([0]))', 'x = [1, 2, 3]\nfor v in x:\n    x.append(v)\n    if len(x) > 6:\n        break\nprint(x)', 'for ch in "hi":\n    print(ch, end="-")\nprint()', 'total = 0\nfor n in [1, 2, 3]:\n    total += n\nprint(total)',
 'L = [1,2,3]\nL[1] += 10\nL[-1] *= 2\nprint(L)', 'L = [1,2,3]\nL += [4]\nprint(L)', 'a = [1]\nb = [a, a]\nprint(b)', 'print([1, "a", 2.5, True, None, [1]])', 'print(type([]), type(range(2)), type(print), type(len))', 'for i in 5:\n    pass', 'for i in None:\n    pass', 'x = None\nx.append(1)', 'x = 5\nx.append(1)', 'x = [1]\nx.add(1)', 'x = "s"\nx.append(1)',
 'print(int("12") + len("ab"), str(5) + "a", float("1.5") * 2)', 'x = input()\nprint(x * 2)\nprint(int(x) * 2)', 'x = input()\nif x.isdigit():\n    print(int(x) + 1)\nelse:\n    print("nope")', 'print("a" * -1, [1] * -1)', 'print(f"{[1,2]}", f"{\'a\'!r}", f"{3:>4}|{2.5:6.2f}|")',
 'def f(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total\nprint(f(5), f(0))', 'def g(L):\n    L.append(1)\nx = []\ng(x)\ng(x)\nprint(x)', 'def f(x):\n    x = x + 1\n    return x\ny = 1\nprint(f(y), y)', 'def f():\n    return\nprint(f())', 'return 5', 'break', 'continue', 'def f():\n    break', 'x = 1\ndef f():\n    print(x)\nf()', 'def f():\n    print(x)\n    x = 1\nf()',
 'def f(a, b):\n    return a\nprint(f(b=1, a=2), f(1, b=3))', 'def f(a):\n    return a\nprint(f(a=1, a=2))', 'def f(a):\n    return a\nprint(f(1, a=2))', 'def f(a):\n    return a\nprint(f(z=1))', 'f = 5\nf()', 'print(print)', 'while 0:\n    pass\nprint("done")', 'if 0:\n    pass\nelif "":\n    pass\nelse:\n    print("else")', 'if True: print("one-line")', 'for i in range(2): print(i)',
 'x = 3;y = 4\nprint(x+y)', 'pass', 'print(1) ; print(2)', 'L = [1,2,3]\nprint(L[::-1], L[1:], L[:-1], L[::2], L[5:], L[-9:2])', 'L = [5,3,8]\nL.sort()\nL.reverse()\nprint(L, L.index(5), L.count(3))', 'L = [1,2,3,4]\nprint(L.pop(), L.pop(0), L)', 'L = [1,2]\nL.insert(0, 9)\nL.insert(-1, 7)\nL.insert(99, 5)\nprint(L)',
 'L = [1,2]\nL.extend("ab")\nL.extend([3])\nprint(L)', 'L = [1,2]\nL.extend(5)', 'print("abc"[True], [1,2][False])', 'print("abc"[1.0])', 'print([1][1.0])', 'x = 5\nprint(x[0])', 'print(None[0])', 'print(len(None))']
for h in HAND:
    cases.append({'code': h + '\n', 'stdin': ['42', ] if 'input' in h else []})
exp = [run_py(c['code'], c['stdin']) for c in cases]
keep = [i for i, e in enumerate(exp) if not (e['err'] and e['err']['type'] == 'TimeoutError')]
print('dropped non-terminating:', len(cases) - len(keep)); cases = [cases[i] for i in keep]; exp = [exp[i] for i in keep]
json.dump({'cases': cases, 'expected': exp}, open(sys.argv[3] if len(sys.argv) > 3 else 'tests/fuzz2.json', 'w'))
print(len(cases), 'cases;', sum(1 for e in exp if e['err']), 'end in an error;', sum(1 for e in exp if not e['err'] and e['out']), 'clean+printing')
