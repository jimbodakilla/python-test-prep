from dsl import *
U = 12
S = 'funcs'

# ---------------------------------------------------------------- out: predict the result
out(U, 'def hello():\n    print("Hello!")\nprint("Start")', ['Hello!\nStart', 'Start\nHello!', 'Hello!'],
    'The def only teaches Python what hello() means. Nothing calls hello(), so "Hello!" is never printed. Only print("Start") runs.', skill=S, level=1)
out(U, 'def cheer():\n    print("Go team!")\ncheer()\ncheer()', ['Go team!', 'Go team!\nGo team!\nGo team!', 'Error: NameError'],
    'The def runs nothing. Each call cheer() runs the body once. Two calls means "Go team!" printed twice.', skill=S, level=1)
out(U, 'hello()\ndef hello():\n    print("Hi!")', ['Hi!', 'Error: SyntaxError', 'Error: TypeError'],
    'Python reads from the top. When it reaches hello() on line 1, the def on line 2 has not run yet, so the name hello does not exist: NameError.', skill=S, level=1)
out(U, 'def greet(name):\n    print("Hello,", name)\ngreet("Ana")\ngreet("Leo")', ['Hello, name\nHello, name', 'Hello, Ana', 'Hello, Leo\nHello, Ana'],
    'name is a parameter. Each call fills it in: first name = "Ana", then name = "Leo". So the body prints a different name each time.', skill=S, level=1)
out(U, 'def show(a, b):\n    print(a - b)\nshow(10, 4)\nshow(4, 10)', ['6\n6', '-6\n6', '14\n14'],
    'Arguments go to the parameters IN ORDER. show(10, 4) makes a=10, b=4, so 10 - 4 = 6. show(4, 10) makes a=4, b=10, so 4 - 10 = -6.', skill=S, level=1)
out(U, 'def add(a, b):\n    return a + b\nx = add(2, 3)\nprint(x)', ['None', '2 3', 'a + b'],
    'return hands the answer 5 back to the line that called add. So x = 5 and print(x) shows 5.', skill=S, level=1)
out(U, 'def add(a, b):\n    print(a + b)\nx = add(2, 3)\nprint(x)', ['5', 'None', '5\n5'],
    'add(2, 3) PRINTS 5 while it runs, but it has no return, so it gives back None. Then x = None and print(x) shows None. Two lines: 5 and None.', skill=S, level=2)
out(U, 'def f():\n    x = 5\nprint(f())', ['5', '0', 'Error: NameError'],
    'f() has no return, so it gives back None. print(f()) prints that None. (The x = 5 is local and is not given back.)', skill=S, level=1)
out(U, 'def test():\n    return "A"\n    print("B")\nprint(test())', ['A\nB', 'B', 'None'],
    'return ends the function at once. The line print("B") comes after it and never runs. test() gives back "A" and print shows A.', skill=S, level=2)
out(U, 'def power(base, exp=2):\n    return base ** exp\nprint(power(5))\nprint(power(2, 3))', ['10\n6', '25\n25', 'Error: TypeError'],
    'power(5) uses the default exp=2, so 5 ** 2 = 25. power(2, 3) replaces the default: 2 ** 3 = 8.', skill=S, level=2)
out(U, 'def hello(name="friend"):\n    print("Hi", name)\nhello()\nhello("Mia")', ['Hi name\nHi Mia', 'Hi\nHi Mia', 'Hi friend\nHi friend'],
    'hello() gives no argument, so name keeps its default "friend". hello("Mia") replaces the default with "Mia".', skill=S, level=1)
out(U, 'def add(a, b):\n    return a + b\nprint(add(5))', ['5', 'None', 'Error: NameError'],
    'add needs 2 arguments but the call gives only 1. b gets no value, so Python raises a TypeError (missing 1 required positional argument).', skill=S, level=1)
out(U, 'def make():\n    secret = 42\nmake()\nprint(secret)', ['42', 'None', 'Error: TypeError'],
    'secret is made INSIDE make(), so it only exists while make() runs. Outside the function the name secret does not exist: NameError.', skill=S, level=1)
out(U, 'x = 10\ndef change():\n    x = 99\nchange()\nprint(x)', ['99', 'None', 'Error: UnboundLocalError'],
    'Assigning x = 99 inside the function makes a NEW local x. The outside x is a different variable and stays 10.', skill=S, level=2)
out(U, 'count = 0\ndef add_one():\n    count += 1\nadd_one()\nprint(count)', ['1', '0', 'Error: NameError'],
    'count += 1 means count = count + 1. Because the function assigns count, Python treats it as a local variable that has no value yet: UnboundLocalError.', skill=S, level=2)
out(U, 'def shout(word):\n    word = word + "!"\nshout("hey")\nprint(word)', ['hey!', 'hey', 'None'],
    'word is a parameter, so it is local to shout. It does not exist outside the function. print(word) fails with NameError.', skill=S, level=2)
out(U, 'rate = 3\ndef triple_it(n):\n    return n * rate\nprint(triple_it(4))', ['4', '7', 'Error: NameError'],
    'A function may READ a global variable. rate is 3, so it returns 4 * 3 = 12.', skill=S, level=2)
out(U, 'def grade(score):\n    if score >= 90:\n        return "A"\n    if score >= 80:\n        return "B"\n    return "C"\nprint(grade(95), grade(85), grade(10))',
    ['A\nB\nC', 'A B', 'A A C'],
    'grade(95) hits the first return: "A". grade(85) fails the first test, passes the second: "B". grade(10) falls to the last return: "C". A comma in print separates with spaces: A B C.', skill=S, level=3)
out(U, 'def square(n):\n    print(n * n)\nprint(square(3) + 1)', ['10', '9', '9\n10'],
    'square(3) PRINTS 9 first. But it returns None, so None + 1 fails with TypeError. The output is 9 and then the error.', skill=S, level=3)
out(U, 'def hi():\nprint("Hi")\nhi()', ['Hi', 'Error: SyntaxError', 'Error: NameError'],
    'The body of a def must be indented. print("Hi") is not indented, so Python stops with an IndentationError before running anything.', skill=S, level=1)
out(U, 'def hi()\n    print("Hi")\nhi()', ['Hi', 'Error: IndentationError', 'Error: NameError'],
    'The def line must end with a colon. Without it Python cannot read the program at all: SyntaxError.', skill=S, level=1)

# ---------------------------------------------------------------- typed
typed(U, 'def welcome():\n    print("Welcome!")\nwelcome\nprint("Done")', 'welcome without brackets only NAMES the function, it does not call it. So only print("Done") runs.', skill=S, level=2)
typed(U, 'def take(a, b):\n    return a - b\nprint(take(b=1, a=10))', 'Keyword arguments match by NAME, not by position: a=10, b=1, so 10 - 1 = 9.', skill=S, level=2)
typed(U, 'def welcome(name):\n    return "Hello, " + name + "!"\nprint(welcome(input()))', 'The function returns the text "Hello, Mia!" and print shows it.', stdin=['Mia'], skill=S, level=1)
typed(U, 'def area(w, h):\n    return w * h\na = int(input())\nb = int(input())\nprint(area(a, b))', 'a=3 and b=5 go to w and h in order. The function returns 3 * 5 = 15.', stdin=['3', '5'], skill=S, level=1)
typed(U, 'def tip(bill, percent=10):\n    return bill * percent / 100\nprint(tip(50))\nprint(tip(50, 20))', 'tip(50) uses percent=10: 50 * 10 / 100 = 5.0. tip(50, 20): 50 * 20 / 100 = 10.0. The / always gives a float.', skill=S, level=2)
typed(U, 'def inc(n):\n    return n + 1\ndef twice(n):\n    return inc(inc(n))\nx = twice(5)\nprint(x, twice(x))', 'twice(5): inc(5) = 6, inc(6) = 7, so x = 7. twice(7) = 9. print with a comma shows 7 9.', skill=S, level=3)
typed(U, 'def total(nums):\n    t = 0\n    for n in nums:\n        t += n\n    return t\nprint(total([2, 4, 6]))', 'The loop adds 2, then 4, then 6 into t: 2, 6, 12. The function returns 12.', skill=S, level=3)

# ---------------------------------------------------------------- ty
TC = ['int', 'str', 'NoneType', 'Error']
ty(U, 'add(2, 3)', 'The function RETURNS a + b, which is the whole number 5, so you get an int.', setup='def add(a, b):\n    return a + b', skill=S, level=1, choices=TC)
ty(U, 'shout("hi")', 'The function returns the text "hi!" so the type is str.', setup='def shout(word):\n    return word + "!"', skill=S, level=1, choices=TC)
ty(U, 'nothing(4)', 'nothing() has no return statement, so it gives back None. The type of None is NoneType.', setup='def nothing(n):\n    x = n + 1', skill=S, level=1, choices=TC)
ty(U, 'add(2)', 'add needs two arguments and only one is given: TypeError, so there is no value at all.', setup='def add(a, b):\n    return a + b', skill=S, level=2, choices=TC)
ty(U, 'average(4, 6)', 'The / operator always gives a float, so (4 + 6) / 2 = 5.0 is a float, even though it looks whole.', setup='def average(a, b):\n    return (a + b) / 2', skill=S, level=2, choices=['int', 'float', 'str', 'NoneType'])
ty(U, 'is_even(4)', 'n % 2 == 0 is a comparison, so the function returns True or False: a bool.', setup='def is_even(n):\n    return n % 2 == 0', skill=S, level=2, choices=['bool', 'int', 'str', 'NoneType'])

# ---------------------------------------------------------------- line
line(U, 'def double(n):\n    return n * 2\nprint(double(4))\nprint(double())\nprint("done")', 'Line 4 calls double() with no argument, but double needs one: TypeError (missing argument). Line 3 is fine and prints 8.', skill=S, level=1)
line(U, 'def make():\n    box = 5\n    return box\nprint(make())\nprint(box)\nprint("end")', 'make() works on line 4 and prints 5. But box lives only inside make, so line 5 raises NameError.', skill=S, level=2)
line(U, 'print("Start")\nprint(square(4))\ndef square(n):\n    return n * n\nprint("End")', 'Line 2 calls square before the def on line 3 has run: NameError.', skill=S, level=2)
line(U, 'def show(n):\n    print(n * 2)\na = show(4)\nb = a + 1\nprint("done")', 'show(4) prints 8 and returns None, so a is None. Line 4 tries None + 1: TypeError. Line 3 itself works.', skill=S, level=3)
line(U, 'total = 0\ndef add(n):\n    total += n\nadd(5)\nprint(total)', 'The call on line 4 starts it, but Python points at line 3, inside the function: total += n reads a local total that has no value yet (UnboundLocalError).', skill=S, level=3)

# ---------------------------------------------------------------- fill
fill(U, 'def greet(name):\n    print("Hi,", ___)\ngreet("Zoe")', ['name', '"name"', 'Zoe'], 'Hi, Zoe',
     'Inside the function, name is the variable holding "Zoe". With quotes it would print the word name.', skill=S, level=1)
fill(U, 'def add(a, b):\n    ___ a + b\nprint(add(2, 3))', ['return', 'print', 'input'], '5',
     'return hands the 5 back to print(add(2, 3)). With print inside, 5 would show and then print(None) would show None.', skill=S, level=1)
fill(U, 'def square(n):\n    return n * n\nprint(___(7))', ['square', 'def square', 'n'], '49',
     'To use a function, write its name and brackets: square(7). The word def is only for making it.', skill=S, level=1)
fill(U, 'def hello()___\n    print("Hi")\nhello()', [':', ';', '.'], 'Hi',
     'Every def line ends with a colon, just like if and for.', skill=S, level=1)
fill(U, 'def hi(name___):\n    print("Hi", name)\nhi()\nhi("Ann")', ['="friend"', '(friend)', ' = friend'], 'Hi friend\nHi Ann',
     'A default value is written name="friend" in the def line. Then hi() works with no argument and hi("Ann") replaces it.', skill=S, level=2)

# ---------------------------------------------------------------- fix
fix(U, 'It should print double the number (typing 4 prints 8) but it prints None. Fix it.',
    'def double(n):\n    n * 2\nx = int(input())\nprint(double(x))',
    'def double(n):\n    return n * 2\nx = int(input())\nprint(double(x))',
    [['4'], ['10']], 'The function calculates n * 2 but throws the answer away. It needs return to hand it back.', skill=S, level=1)
fix(U, 'Typing 4 should print 9 (double plus 1) but the program crashes with a TypeError. Fix it.',
    'def double(n):\n    print(n * 2)\nx = int(input())\ntotal = double(x) + 1\nprint(total)',
    'def double(n):\n    return n * 2\nx = int(input())\ntotal = double(x) + 1\nprint(total)',
    [['4'], ['0'], ['10']], 'print only SHOWS the value; the call gives back None, and None + 1 crashes. Use return so the value can be used.', skill=S, level=2)
fix(U, 'The area function crashes before running anything. Fix the def line.',
    'def area(w, h)\n    return w * h\nprint(area(int(input()), int(input())))',
    'def area(w, h):\n    return w * h\nprint(area(int(input()), int(input())))',
    [['3', '4'], ['10', '2']], 'The line def area(w, h) has no colon at the end. Python cannot read it at all (SyntaxError). With the colon added, area(3, 4) returns 12.', skill=S, level=1)
fix(U, 'The program should greet you but shows nothing. Fix it.',
    'def welcome():\n    print("Welcome!")\nwelcome',
    'def welcome():\n    print("Welcome!")\nwelcome()',
    [[]], 'welcome without brackets only names the function. Add () to CALL it.', skill=S, level=1,
    alts=['def welcome():\n    print("Welcome!")\nwelcome( )'])
fix(U, 'Typing 10 and then 2 should print 5.0 (10 divided by 2), but it prints 0.2. Fix it.',
    'def divide(a, b):\n    return a / b\nx = int(input())\ny = int(input())\nprint(divide(y, x))',
    'def divide(a, b):\n    return a / b\nx = int(input())\ny = int(input())\nprint(divide(x, y))',
    [['10', '2'], ['9', '3']], 'The arguments go in order: the first one is a (the top). divide(y, x) swapped them.', skill=S, level=2,
    alts=['def divide(a, b):\n    return a / b\nx = int(input())\ny = int(input())\nprint(divide(a=x, b=y))'])
fix(U, 'It crashes with a NameError. Fix it by moving one line.',
    'print(square(int(input())))\ndef square(n):\n    return n * n',
    'def square(n):\n    return n * n\nprint(square(int(input())))',
    [['5'], ['9']], 'A function must be DEFINED before the line that calls it. Move the def to the top.', skill=S, level=2)
fix(U, 'Typing 7 should print 21. Two bugs: the program crashes, and then it would print the wrong thing. Fix both.',
    'def triple(n)\n    n * 3\nx = int(input())\nprint(triple(x))',
    'def triple(n):\n    return n * 3\nx = int(input())\nprint(triple(x))',
    [['7'], ['0'], ['12']], 'Bug 1: the def line needs a colon. Bug 2: n * 3 needs return, or the function gives back None.', skill=S, level=3)

# ---------------------------------------------------------------- write
write(U, 'Write a function <code>area(w, h)</code> that <b>returns</b> the area of a rectangle. Then ask for the width and the height (whole numbers) and print the area using your function. Typing 3 and 4 prints 12.',
      'def area(w, h):\n    return w * h\nw = int(input())\nh = int(input())\nprint(area(w, h))',
      [['3', '4'], ['10', '10'], ['0', '5'], ['7', '1']],
      ['Start with def area(w, h):', 'return w * h', 'Then read two numbers with int(input()) and print(area(w, h)).'],
      'The function returns w * h and the main part prints what comes back.', skill=S, level=2,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the area.']],
      alts=['def area(w, h):\n    return w * h\nprint(area(int(input()), int(input())))'],
      starter='def area(w, h):\n    ')
write(U, 'Write a function <code>is_even(n)</code> that returns <b>True</b> when n is even and <b>False</b> when it is odd. Ask for a whole number and print the result of your function. Typing 4 prints True.',
      'def is_even(n):\n    return n % 2 == 0\nn = int(input())\nprint(is_even(n))',
      [['4'], ['7'], ['0'], ['13']],
      ['Even numbers have remainder 0 when divided by 2.', 'return n % 2 == 0'],
      'n % 2 is 0 for even numbers, so the comparison is True; the function returns that bool.', skill=S, level=2,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the answer.']],
      alts=['def is_even(n):\n    if n % 2 == 0:\n        return True\n    return False\nn = int(input())\nprint(is_even(n))',
            'def is_even(n):\n    if n % 2 == 0:\n        return True\n    else:\n        return False\nprint(is_even(int(input())))',
            'def is_even(n):\n    return n % 2 == 0\nprint(is_even(int(input())))'])
write(U, 'Write a function <code>max_of_three(a, b, c)</code> that returns the biggest of three numbers. Ask for three whole numbers and print the biggest. Typing 3, 9 and 5 prints 9.',
      'def max_of_three(a, b, c):\n    return max(a, b, c)\nx = int(input())\ny = int(input())\nz = int(input())\nprint(max_of_three(x, y, z))',
      [['3', '9', '5'], ['7', '7', '7'], ['10', '2', '1'], ['-1', '-5', '-3']],
      ['The built-in max() can take three values.', 'Or compare with if / elif inside the function.'],
      'Whatever the order, the function returns the biggest of the three; equal numbers are fine.', skill=S, level=3,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the biggest number.']],
      alts=['def max_of_three(a, b, c):\n    biggest = a\n    if b > biggest:\n        biggest = b\n    if c > biggest:\n        biggest = c\n    return biggest\nx = int(input())\ny = int(input())\nz = int(input())\nprint(max_of_three(x, y, z))',
            'def max_of_three(a, b, c):\n    if a >= b and a >= c:\n        return a\n    elif b >= c:\n        return b\n    else:\n        return c\nx = int(input())\ny = int(input())\nz = int(input())\nprint(max_of_three(x, y, z))',
            'def max_of_three(a, b, c):\n    return max(a, b, c)\nprint(max_of_three(int(input()), int(input()), int(input())))'])
write(U, 'Write a function <code>to_fahrenheit(c)</code> that converts Celsius to Fahrenheit: multiply by 9, divide by 5, add 32. Ask for a whole number of degrees Celsius and print the result. Typing 100 prints 212.0.',
      'def to_fahrenheit(c):\n    return c * 9 / 5 + 32\nc = int(input())\nprint(to_fahrenheit(c))',
      [['100'], ['0'], ['20'], ['-40']],
      ['F = C * 9 / 5 + 32', 'Return the formula, then print the call.'],
      'The / makes a float, so the answers show .0 (100 gives 212.0).', skill=S, level=2,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the answer.']],
      alts=['def to_fahrenheit(c):\n    return c * 1.8 + 32\nc = int(input())\nprint(to_fahrenheit(c))',
            'def to_fahrenheit(c):\n    f = c * 9 / 5 + 32\n    return f\nprint(to_fahrenheit(int(input())))',
            'def to_fahrenheit(c):\n    return (c * 9) / 5 + 32\nprint(to_fahrenheit(int(input())))'])
write(U, 'Write a function <code>count_vowels(text)</code> that returns how many of the letters a, e, i, o, u are in the text (the test words are all lowercase). Ask for a word and print the count. Typing banana prints 3.',
      'def count_vowels(text):\n    count = 0\n    for ch in text:\n        if ch in "aeiou":\n            count += 1\n    return count\nprint(count_vowels(input()))',
      [['banana'], ['sky'], ['education'], ['a'], ['rhythm']],
      ['Make count = 0, then loop over every letter of text.', 'if the letter is in "aeiou", add 1.', 'return count AFTER the loop.'],
      'The loop looks at each letter and counts the vowels; return gives the total back after the loop ends.', skill=S, level=3,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the count.']],
      alts=['def count_vowels(text):\n    n = 0\n    i = 0\n    while i < len(text):\n        if text[i] in "aeiou":\n            n += 1\n        i += 1\n    return n\nprint(count_vowels(input()))',
            'def count_vowels(text):\n    return text.count("a") + text.count("e") + text.count("i") + text.count("o") + text.count("u")\nprint(count_vowels(input()))',
            'def count_vowels(text):\n    count = 0\n    for ch in text:\n        if ch == "a" or ch == "e" or ch == "i" or ch == "o" or ch == "u":\n            count += 1\n    return count\nword = input()\nprint(count_vowels(word))'],
      starter='def count_vowels(text):\n    count = 0\n    ')
write(U, 'Write a function <code>average3(a, b, c)</code> that returns the average of three numbers. Ask for three whole numbers and print the average. Typing 3, 4 and 5 prints 4.0.',
      'def average3(a, b, c):\n    return (a + b + c) / 3\nx = int(input())\ny = int(input())\nz = int(input())\nprint(average3(x, y, z))',
      [['3', '4', '5'], ['10', '20', '30'], ['1', '1', '1'], ['0', '0', '3']],
      ['Add all three, THEN divide by 3. Use brackets.', 'return (a + b + c) / 3'],
      'Brackets make the adding happen first: (3 + 4 + 5) / 3 = 4.0.', skill=S, level=2,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the average.']],
      alts=['def average3(a, b, c):\n    total = a + b + c\n    return total / 3\nprint(average3(int(input()), int(input()), int(input())))',
            'def average3(a, b, c):\n    return (a + b + c) / 3\nprint(average3(int(input()), int(input()), int(input())))'])
write(U, 'Write a function <code>greet(name="friend")</code> that prints <code>Hello, NAME!</code>. Read a name from the user and call greet with it. Then call greet again with NO argument, to show the default. Typing Mia prints two lines: Hello, Mia! and Hello, friend!',
      'def greet(name="friend"):\n    print("Hello, " + name + "!")\nn = input()\ngreet(n)\ngreet()',
      [['Mia'], ['Leo'], ['Zoe']],
      ['The default goes in the def line: name="friend"', 'First call: greet(n). Second call: greet() with empty brackets.'],
      'The first call passes the typed name; the second uses the default "friend".', skill=S, level=2,
      must=[[r'\bdef\s+greet\s*\(\s*name\s*=', 'Give the parameter a default value in the def line.']],
      alts=['def greet(name="friend"):\n    print("Hello,", name + "!")\ngreet(input())\ngreet()',
            'def greet(name="friend"):\n    print(f"Hello, {name}!")\ngreet(input())\ngreet()',
            'def greet(name="friend"):\n    print("Hello, " + name + "!")\ngreet(name=input())\ngreet()'])
write(U, 'Write a function <code>clamp(score)</code> that keeps a score between 0 and 100: below 0 gives 0, above 100 gives 100, otherwise the score itself. Ask for a whole number and print clamp of it. Typing 150 prints 100.',
      'def clamp(score):\n    if score < 0:\n        return 0\n    if score > 100:\n        return 100\n    return score\nn = int(input())\nprint(clamp(n))',
      [['150'], ['-5'], ['72'], ['100'], ['0']],
      ['Use if inside the function.', 'Check score < 0 first, then score > 100, and finally return score.'],
      'Each if returns early for a score that is too low or too high; any score in range reaches the last return.', skill=S, level=3,
      must=[[r'\bdef\b', 'Define a function with def.'], [r'\breturn\b', 'Your function should return the clamped score.']],
      alts=['def clamp(score):\n    return max(0, min(100, score))\nprint(clamp(int(input())))',
            'def clamp(score):\n    if score < 0:\n        return 0\n    elif score > 100:\n        return 100\n    else:\n        return score\nprint(clamp(int(input())))',
            'def clamp(score):\n    if score < 0:\n        score = 0\n    if score > 100:\n        score = 100\n    return score\nprint(clamp(int(input())))'])

# ---------------------------------------------------------------- know
know(U, 'What does the word def do?', ['Creates a function but does not run it', 'Runs the function right away', 'Prints the name of the function', 'Deletes the function afterwards'],
    'def only teaches Python what the name means. The body runs later, each time you CALL the function with brackets.', skill=S)
know(U, 'What is the difference between return and print inside a function?', ['return hands a value back to the caller; print only shows it', 'print hands a value back; return only shows it', 'return works for numbers and print works for text', 'They do the same thing, just with different words'],
    'return gives the caller a value it can store (x = add(2, 3)). print shows text on the screen but the function still gives back None.', skill=S)
know(U, 'A function has no return statement. What does a call to it give back?', ['None', '0', 'Its last line', 'An error'],
    'Every function gives something back. Without a return, that something is the special value None.', skill=S)
know(U, 'A variable is created inside a function. Where can you use it?', ['Only inside that function', 'Anywhere in the program', 'Only after the function ends', 'In every function in the file'],
    'A variable made inside a function is local. When the function finishes it disappears, so using it outside gives NameError.', skill=S)
know(U, 'In def greet(name): what is name?', ['A parameter that receives the passed value', 'The value that the function returns', 'The name of the function itself', 'A text that always gets printed'],
    'name is a parameter: a variable inside the function that is filled in by the argument you give in the call, like greet("Ana").', skill=S)
know(U, 'A function is defined with two parameters, def f(a, b). You call f(1). What happens?', ['TypeError: b is missing', 'b becomes 0 on its own', 'b becomes None on its own', 'a is used for both'],
    'Python does not guess missing values. Unless b has a default, the call is missing an argument: TypeError.', skill=S, level=2)
