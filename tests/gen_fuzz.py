import random, json, sys
sys.path.insert(0, 'tests')
from cpy import run_py
R = random.Random(int(sys.argv[2]) if len(sys.argv) > 2 else 1)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 5000

INTS = ['0','1','2','3','4','5','7','10','12','25','100','-3','-8','1000','99']
FLTS = ['0.5','2.5','3.0','1.25','0.1','0.2','7.75','10.0','100.5','1e3','2.','.5','3.14','0.001','1e-7','123456789.125','1e16','9.99','0.75']
STRS = ['"5"','"3.5"','"abc"','" 7 "','""','"hello"','"12"','"-4"','"2.0"','"1e3"',"'x'",'"it\'s"','"a b"','"007"','"+5"','"1_000"']

def lit():
    r = R.random()
    return R.choice(INTS) if r < .4 else R.choice(FLTS) if r < .65 else R.choice(STRS)

def expr(vars_, d=0):
    r = R.random()
    if d >= 3 or r < .3:
        if vars_ and R.random() < .5: return R.choice(vars_)
        return lit()
    if r < .6:
        op = R.choice(['+','-','*','/','//','%','**','+','*','-'])
        a, b = expr(vars_, d+1), expr(vars_, d+1)
        if op == '**':
            b = R.choice(['0','1','2','3','2.0','0.5','-1','-2','10'])
        return f'({a} {op} {b})' if R.random() < .5 else f'{a} {op} {b}'
    if r < .8:
        f = R.choice(['int','float','str','round','abs','len','int','float','int','float'])
        return f'{f}({expr(vars_, d+1)})'
    if r < .85:
        f = R.choice(['max','min'])
        return f'{f}({expr(vars_, d+1)}, {expr(vars_, d+1)})'
    if r < .9:
        return f'round({expr(vars_, d+1)}, {R.choice(["0","1","2","3","-1"])})'
    if r < .95:
        return '-' + expr(vars_, d+1)
    return f'{expr(vars_, d+1)} {R.choice(["==","!=","<",">","<=",">="])} {expr(vars_, d+1)}'

def fstr(vars_):
    parts = []
    for _ in range(R.randint(1, 3)):
        if R.random() < .5: parts.append(R.choice(['Total: ','x=','value is ',' ','']))
        e = expr(vars_, 2).replace('"', "'")
        spec = R.choice(['','','',':.2f',':.1f',':.0f',':,',':>8',':<6',':^7',':08.3f',':+d',':,.2f',':5',':.3f',':d',':s',':10.2f',':%',':.1%',':x','!r','!s'])
        parts.append('{' + e + spec + '}')
    return 'f"' + ''.join(parts) + '"'

def program():
    lines, stdin, vars_ = [], [], []
    for _ in range(R.randint(1, 5)):
        r = R.random()
        if r < .35:
            name = R.choice('abcxyz') + R.choice(['','1','_n'])
            if R.random() < .4:
                conv = R.choice(['int','float','str','int','float',''])
                val = R.choice(INTS + FLTS[:10] + ['"hi"','"4"','"2.5"', '"x"', ' 8 ', '3.7','-12'])
                stdin.append(val.strip('"'))
                lines.append(f'{name} = {conv}(input({R.choice(["", chr(34)+"Enter: "+chr(34)])}))' if conv else f'{name} = input()')
            else:
                lines.append(f'{name} = {expr(vars_, 1)}')
            vars_.append(name)
        elif r < .45 and vars_:
            lines.append(f'{R.choice(vars_)} {R.choice(["+=","-=","*=","/=","//=","%="])} {expr(vars_, 2)}')
        elif r < .55:
            lines.append(f'print({fstr(vars_)})')
        else:
            args = ', '.join(expr(vars_, 1) for _ in range(R.randint(0, 3)))
            kw = R.choice(['', '', '', ', sep="-"', ', end=""', ', sep=""', ', end="!\\n"']) if args else ''
            lines.append(f'print({args}{kw})')
    return '\n'.join(lines) + '\n', stdin

cases = []
for _ in range(N):
    code, stdin = program()
    cases.append({'code': code, 'stdin': stdin})
# hand-picked syntax/typo cases kids really make
for code in ['print("hi)', 'print("hi"', 'print("hi"))', '5 = x', 'x =', '1x = 5', 'print "hi"', 'Print("x")',
             'name = input("Name: "\nprint(name)', 'x = 007', 'print(Hello)', '  print(1)', 'print("a" "b")', 'print("a" 5)',
             'print(1,,2)', 'x = (1 + 2', 'x = 1 +', 'print(f"{}")', 'print(f"{x")', 'print(f"}")', 'print(2 +* 3)', 'x == 5', 'print(5 = 5)',
             'x = 5\nx = x +\nprint(x)', 'print("hi")\nprint("oops)\nprint("x")', 'y = int(input())\nprint(y)', 'print(1/0)', 'print(int("3.5"))',
             'print(float(""))', 'print(int(" 42 "))', 'print(-7 // 2, -7 % 3, 7 // -2, 7 % -3, -7.5 // 2, -7.5 % 2)', 'print(2 ** -1, 2 ** 100, (-2) ** 3, -2 ** 2)',
             'print(round(2.5), round(3.5), round(-2.5), round(0.5), round(1.5), round(2.675, 2), round(0.125, 2), round(0.375, 2))',
             'print(f"{0.125:.2f} {0.375:.2f} {2.5:.0f} {3.5:.0f} {1e21:.1f} {1234567.891:,.2f}")', 'print(10/4, 10//4, 10%4, 10/5, 7.0//2)',
             'print(0.1 + 0.2, 1/3, 2/3, 1e22, 1.5e-10, 123456789012345678.0)', 'print(type(5), type(5.0), type("5"), type(print))',
             'x = 5\nx += 2.5\nprint(x)', 'print(True + 1, False * 3, 5 > 3)', 'print("ab" * 3, 3 * "ab", "ab" * 0, "ab" * -1)', 'print("a" * 2.0)',
             'print(len("hello"), len(5))', 'print(abs(-5), abs(-2.5), abs("x"))', 'print(max(3, 7.5), min("a", "b"))', 'print(int(True), float(False), str(None))',
             'print(1_000 + 1)', 'print(5 // 0.0)', 'x = input()', 'print(float("inf"), float("-inf"), float("nan"), -float("inf"))',
             'print(str(5) + "5", str(5.0) + "x")', 'print(int(-3.9), int(3.9), int(-0.5))', 'print(1e16, 1e15, 12345678901234567890.0, 0.0001, 0.00001)',
             'a = b = 5\nprint(a, b)', 'print()', 'print("a", end="")\nprint("b")', 'print(1, 2, sep="\\n")', 'print("tab\\there", "nl\\\\n")',
             'x = 3\nprint(x+"1")', 'x = "3"\nprint(x+1)', 'x = "3"\nprint(x*"2")', 'print(5 + "5")', 'print("5" - 1)', 'print(-"5")', 'print("5" / 2)']:
    st = ['hello', '5'] if 'input' in code else []
    cases.append({'code': code if code.endswith('\n') else code + '\n', 'stdin': st})
exp = [run_py(c['code'], c['stdin']) for c in cases]
json.dump({'cases': cases, 'expected': exp}, open(sys.argv[3] if len(sys.argv) > 3 else 'tests/fuzz.json', 'w'))
print(len(cases), 'cases;', sum(1 for e in exp if e['err']), 'end in an error')
