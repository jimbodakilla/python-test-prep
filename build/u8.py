from dsl import *
U = 8   # LEVEL UP - Decisions: booleans, comparisons, if / elif / else

# ---------------------------------------------------------------- out: comparisons & Booleans (skill bool)
out(U, 'print(5 > 3)', ['False', '1', '5 > 3'], '5 is bigger than 3, so the question "is 5 > 3?" is answered with the Boolean True.', skill='bool')
out(U, 'print(4 == 4.0)', ['False', '4', 'Error: TypeError'], 'An int and a float can be compared. 4 and 4.0 have the same value, so == gives True.', skill='bool', level=2)
out(U, 'print("5" == 5)', ['True', '5', 'Error: TypeError'], 'The text "5" and the number 5 are different kinds of things, so == says False (no crash).', skill='bool')
out(U, 'print("Apple" == "apple")', ['True', 'Apple', 'Error: ValueError'], 'Capital A and small a are different letters, so the two texts are not equal: False.', skill='bool', level=2)
out(U, 'print("10" < "9")', ['False', 'Error: TypeError', '1'], 'Text is compared one character at a time. "1" comes before "9", so "10" < "9" is True (even though 10 > 9 as numbers).', skill='bool', level=3)
out(U, 'age = input()\nprint(age >= 18)', ['True', 'False', '18'], 'input() gave the TEXT "20". Text cannot be compared with the number 18 using >=, so Python crashes with a TypeError.', stdin=['20'], skill='bool', level=2)
out(U, 'age = int(input())\nprint(age >= 18)', ['False', '18', 'Error: TypeError'], 'int() makes the number 18. 18 >= 18 is True because >= also accepts "equal".', stdin=['18'], skill='bool')
out(U, 'x = 4\nx == 5\nprint(x)', ['5', 'False', 'True'], 'x == 5 only ASKS a question and throws the answer away. It does not store anything, so x is still 4.', skill='bool', level=2)
out(U, 'print(not True)', ['True', 'not True', 'Error: NameError'], 'not flips a Boolean to its opposite. The opposite of True is False.', skill='bool')
out(U, 'print(True and False)', ['True', 'TrueFalse', '0'], 'and needs BOTH sides to be True. One side is False, so the answer is False.', skill='bool')
out(U, 'print(True or False)', ['False', 'TrueFalse', 'None'], 'or needs only ONE side to be True. The left side is True, so the answer is True.', skill='bool')
out(U, 'x = 5\nprint(x > 1 and x < 10)', ['False', '5', 'Error: SyntaxError'], '5 > 1 is True and 5 < 10 is True. True and True gives True.', skill='bool')
out(U, 'print(10 % 3)', ['3', '1.0', '0'], '% gives the REMAINDER. 10 = 3 + 3 + 3 + 1, so there is 1 left over.', skill='bool')
out(U, 'print(10 // 3)', ['1', '3.0', '4'], '// is division that keeps only the whole part. 3 fits into 10 three times, so the answer is 3 (an int).', skill='bool')
out(U, 'print(2 % 5)', ['0', '2.5', '5'], '5 does not fit into 2 even once, so all of 2 is left over: the remainder is 2.', skill='bool', level=3)

# ---------------------------------------------------------------- out: if / elif / else (skill cond)
out(U, 'x = 7\nif x > 5:\n    print("big")\nprint("done")', ['big', 'done', 'done\nbig'], 'x > 5 is True, so the indented print runs. The last print is not indented, so it always runs: big then done.', skill='cond')
out(U, 'x = 3\nif x > 5:\n    print("big")\nprint("done")', ['big\ndone', 'big', 'Error: IndentationError'], 'x > 5 is False, so the indented line is skipped. Only the un-indented print("done") runs.', skill='cond')
out(U, 'age = int(input())\nif age > 18:\n    print("adult")\nelse:\n    print("minor")', ['adult', 'adult\nminor', 'Error: SyntaxError'], '18 > 18 is False because 18 is not MORE than 18. So the else part runs: minor.', stdin=['18'], skill='cond', level=2)
out(U, 'temp = 25\nif temp > 30:\n    print("hot")\nelif temp > 20:\n    print("warm")\nelse:\n    print("cold")', ['hot', 'cold', 'warm\ncold'], '25 > 30 is False, so Python moves on. 25 > 20 is True, so it prints warm and skips the else.', skill='cond')
out(U, 'score = 95\nif score >= 60:\n    print("C")\nelif score >= 90:\n    print("A")', ['A', 'C\nA', 'Error: SyntaxError'], '95 >= 60 is True, so C is printed and the elif is never even checked. Only the FIRST true branch runs.', skill='cond', level=3)
out(U, 'x = 10\nif x > 5:\n    print("A")\nif x > 8:\n    print("B")', ['A', 'B', 'Error: IndentationError'], 'These are two separate ifs, so each one is checked. Both tests are True: A and then B.', skill='cond', level=2)
out(U, 'x = 10\nif x > 5:\n    print("A")\nelif x > 8:\n    print("B")', ['A\nB', 'B', 'Error: SyntaxError'], 'With elif, once the first test is True the rest are skipped. x > 5 is True, so only A prints.', skill='cond', level=2)
out(U, 'n = int(input())\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")', ['even', 'odd\neven', 'Error: TypeError'], '7 % 2 is 1, not 0. The test is False, so the else part prints odd.', stdin=['7'], skill='cond')
out(U, 'pw = input()\nif pw == "open":\n    print("Welcome")\nelse:\n    print("Denied")', ['Welcome', 'Denied\nWelcome', 'Error: SyntaxError'], 'The user typed "Open" with a capital O. That is not equal to "open", so the else part runs: Denied.', stdin=['Open'], skill='cond', level=2)
out(U, 'n = input()\nif n == 5:\n    print("five")\nelse:\n    print("not five")', ['five', 'Error: TypeError', '5'], 'n is the TEXT "5" and 5 is a number. Text == number is just False (no crash), so else runs.', stdin=['5'], skill='cond', level=3)
out(U, 'score = 90\nif score > 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")', ['A', 'C', 'A\nB'], 'score > 90 is False because 90 is not MORE than 90. Next, 90 >= 80 is True, so B prints.', skill='cond', level=3)
out(U, 'n = 15\nif n > 10:\n    print("over 10")\n    if n > 20:\n        print("over 20")\nprint("end")', ['over 10\nover 20\nend', 'end', 'over 10'], '15 > 10 is True, so "over 10" prints. The inner test 15 > 20 is False, so it is skipped. "end" always runs.', skill='cond', level=3)

# ---- Errors that are visible BEFORE running: what does Python say?
out(U, 'x = 5\nif x > 3:\nprint("big")', ['big', 'Error: SyntaxError', 'Error: NameError'], 'The line after if ...: must be indented. No indent means Python stops with an IndentationError and runs nothing.', skill='cond')
out(U, 'x = 5\nif x > 3\n    print("big")', ['big', 'Error: IndentationError', 'Error: NameError'], 'The if line has no colon at the end. Python cannot read it: SyntaxError.', skill='cond')
out(U, 'x = 5\nif x = 5:\n    print("five")', ['five', 'Error: TypeError', 'Error: NameError'], 'A single = stores. A question needs ==. Python cannot read "if x = 5": SyntaxError.', skill='cond', level=2)
out(U, 'x = 5\nelse:\n    print("small")', ['small', 'Error: IndentationError', 'Error: NameError'], 'An else must come right after an if (or elif). Here there is no if, so Python cannot read it: SyntaxError.', skill='cond', level=2)
out(U, 'x = 5\n    print(x)', ['5', 'Error: SyntaxError', 'Error: TypeError'], 'Indenting a line that is not inside an if (or other block) is unexpected: IndentationError.', skill='cond')
out(U, 'x = 5\nif x > 1:\n    print("a")\n  print("b")', ['a\nb', 'Error: SyntaxError', 'a'], 'The two print lines are indented by different amounts (4 spaces and 2 spaces). Python cannot match them: IndentationError.', skill='cond', level=3)

# ---------------------------------------------------------------- typed
typed(U, 'print(5 > 3, 5 < 3)', 'The first question is True and the second is False. print with a comma puts one space between them.', skill='bool', level=1)
typed(U, 'print(17 % 5, 17 // 5)', '5 fits into 17 three times (3, from //) with 2 left over (2, from %).', skill='bool', level=2)
typed(U, 'a = 4\nprint(a > 2 and a < 4, a > 2 or a < 4, not a > 2)', 'a > 2 is True and a < 4 is False. and: False. or: True. not (a > 2): False.', skill='bool', level=3)
typed(U, 't = int(input())\nif t >= 30:\n    print("hot")\nelif t >= 20:\n    print("warm")\nelse:\n    print("cold")\nprint("Done")', '20 >= 30 is False, 20 >= 20 is True: prints warm. Done is not indented, so it always prints.', stdin=['20'], skill='cond')
typed(U, 'n = int(input())\nif n > 0:\n    print("positive")\nelif n < 0:\n    print("negative")\nelse:\n    print("zero")\nprint("checked")', 'n is 0. 0 > 0 is False and 0 < 0 is False, so else runs: zero. Then checked.', stdin=['0'], skill='cond')
typed(U, 'n = int(input())\nif n > 0:\n    print("positive")\n    if n % 2 == 0:\n        print("even")\n    else:\n        print("odd")\nprint("bye")', '7 > 0 is True: positive. Inside, 7 % 2 is 1, so the inner else prints odd. bye always runs.', stdin=['7'], skill='cond', level=3)

# ---------------------------------------------------------------- ty
B = ['bool', 'int', 'str', 'Error']
ty(U, '5 > 3', 'A comparison always answers yes or no, so its type is bool.', skill='bool', choices=B)
ty(U, '10 % 3', '% gives a remainder, which is a number: int.', skill='bool', choices=B)
ty(U, '5 > "3"', 'A number cannot be compared with > to a text. That is a TypeError.', skill='bool', choices=B, level=2)
ty(U, '"7" == 7', '== never crashes. It just answers False, which is a bool.', skill='bool', choices=B, level=2)
ty(U, 'age >= 18', 'age is the text "20" (from input), so comparing it with the number 18 crashes.', setup='age = input()', stdin=['20'], skill='bool', choices=B, level=3)

# ---------------------------------------------------------------- line
line(U, 'age = input()\nprint("Checking")\nif age >= 18:\n    print("adult")', 'age is the text "20". The comparison age >= 18 on line 3 mixes text and a number: TypeError.', stdin=['20'], skill='cond')
line(U, 'total = 10\nlimit = int(input())\nif total > limit:\n    print("over")\nelse:\n    print("Left: " + (limit - total))', 'limit is 20, so total > limit is False and the else part runs. Line 6 glues text and a number with +: TypeError.', stdin=['20'], skill='cond', level=3)
line(U, 'n = int(input())\nprint("start")\nif n % 2 == 0:\n    print(100 // (n - 4))\nelse:\n    print("odd")', 'n is 4, which is even, so line 4 runs. n - 4 is 0 and dividing by zero crashes: ZeroDivisionError.', stdin=['4'], skill='cond', level=3)
line(U, 'x = int(input())\nif x > 5:\n    print(x / 0)\nelse:\n    print("small")', 'x is 3, so x > 5 is False and the crashy line is skipped. The else part prints small. No line crashes.', stdin=['3'], skill='cond', level=2)
line(U, 'a = "10"\nb = "9"\nprint(a < b)\nprint(a < 9)', 'Line 3 compares text with text, which is fine (and gives True). Line 4 compares text with a number: TypeError.', skill='bool', level=2)

# ---------------------------------------------------------------- fill
fill(U, 'age = int(input())\nif age ___ 18:\n    print("adult")\nelse:\n    print("minor")', ['>=', '>', '=', '=>'], 'adult', 'Exactly 18 must count as adult, so we need >= ("bigger or equal"). > would say minor, and = or => are not valid operators in an if.', stdin=['18'], skill='cond')
fill(U, 'x = input()\nif x ___ "yes":\n    print("OK")\nelse:\n    print("no")', ['==', '=', '!='], 'OK', 'To ASK if two things are equal use ==. A single = tries to store and is a SyntaxError here. != would print no.', stdin=['yes'], skill='cond')
fill(U, 'n = int(input())\nif n ___ 2 == 0:\n    print("even")\nelse:\n    print("odd")', ['%', '//', '/'], 'even', 'n % 2 is the remainder after dividing by 2. For 8 it is 0, so it is even. // gives 4 and / gives 4.0, neither is 0.', stdin=['8'], skill='bool')
fill(U, 'age = 30\nif age >= 13 ___ age <= 19:\n    print("teen")\nelse:\n    print("not a teen")', ['and', 'or', 'not'], 'not a teen', 'A teen must be at least 13 AND at most 19. With and, 30 <= 19 is False, so the whole test is False. With or, 30 >= 13 alone would be enough (wrong).', skill='bool', level=2)
fill(U, 'x = 12\nif x > 10:\n    print("big")\n___ x > 5:\n    print("medium")\nelse:\n    print("small")', ['elif', 'else', 'if', 'elseif'], 'big', 'elif means "otherwise, if". After "big" runs, the elif and else are skipped. A plain if would also print medium.', skill='cond', level=2)

# ---------------------------------------------------------------- fix
fix(U, 'It should print adult for 18 or older and minor otherwise, but Python reports a SyntaxError. Fix it.',
    'age = int(input())\nif age >= 18\n    print("adult")\nelse:\n    print("minor")',
    'age = int(input())\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")', [['20'], ['10'], ['18']], 'An if line must end with a colon. Without it Python cannot read the line.', skill='cond', level=1)
fix(U, 'It should greet Sam and say "Who are you?" to anyone else, but it crashes before running. Fix it.',
    'name = input()\nif name = "Sam":\n    print("Hi Sam")\nelse:\n    print("Who are you?")',
    'name = input()\nif name == "Sam":\n    print("Hi Sam")\nelse:\n    print("Who are you?")', [['Sam'], ['Ana']], 'In a test you must ASK with ==. A single = means store, which is a SyntaxError inside an if.', skill='cond', level=1)
fix(U, 'Kids aged 12 and under get in for free. Age 12 should print free, but it prints pay. Fix it.',
    'age = int(input())\nif age < 12:\n    print("free")\nelse:\n    print("pay")',
    'age = int(input())\nif age <= 12:\n    print("free")\nelse:\n    print("pay")', [['12'], ['5'], ['13']], 'Exactly 12 must count as free. < leaves 12 out; <= includes it.', skill='cond', level=2,
    alts=['age = int(input())\nif age < 13:\n    print("free")\nelse:\n    print("pay")'])
fix(U, 'It should print A for 90+, B for 80-89, C for 60-79 and F below 60, but it prints C for almost everything. Fix it.',
    'score = int(input())\nif score >= 60:\n    print("C")\nelif score >= 80:\n    print("B")\nelif score >= 90:\n    print("A")\nelse:\n    print("F")',
    'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 60:\n    print("C")\nelse:\n    print("F")', [['95'], ['85'], ['70'], ['30'], ['90']], 'Python runs the FIRST true branch only. Any score of 60 or more is caught by the first test. Put the hardest test (>= 90) first.', skill='cond', level=3,
    alts=['score = int(input())\nif score < 60:\n    print("F")\nelif score < 80:\n    print("C")\nelif score < 90:\n    print("B")\nelse:\n    print("A")'])
fix(U, 'It should print big for numbers above 10 and small otherwise, but it crashes with a TypeError. Fix it.',
    'n = input()\nif n > 10:\n    print("big")\nelse:\n    print("small")',
    'n = int(input())\nif n > 10:\n    print("big")\nelse:\n    print("small")', [['15'], ['3'], ['10']], 'input() gives text. Comparing text with the number 10 crashes. Convert with int() first.', skill='cond', level=2,
    alts=['n = float(input())\nif n > 10:\n    print("big")\nelse:\n    print("small")'])
fix(U, 'It should say even or odd, but Python reports an IndentationError. Fix it.',
    'n = int(input())\nif n % 2 == 0:\nprint("even")\nelse:\n    print("odd")',
    'n = int(input())\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")', [['4'], ['7']], 'The line under if (and under else) must be indented by 4 spaces. That is how Python knows what belongs to the if.', skill='cond', level=1)
fix(U, 'Kids under 5 and adults over 65 get in free (print free). Everyone else pays (print full). It prints full for everybody. Fix it.',
    'age = int(input())\nif age < 5 and age > 65:\n    print("free")\nelse:\n    print("full")',
    'age = int(input())\nif age < 5 or age > 65:\n    print("free")\nelse:\n    print("full")', [['3'], ['70'], ['30'], ['5'], ['65']], 'No age is both under 5 AND over 65, so "and" is never True. Either group qualifies, so use "or".', skill='bool', level=2)
fix(U, 'It should print the bigger of two whole numbers. For 10 and 9 it prints 9, which is wrong. Fix it.',
    'a = input()\nb = input()\nif a > b:\n    print(a)\nelse:\n    print(b)',
    'a = int(input())\nb = int(input())\nif a > b:\n    print(a)\nelse:\n    print(b)', [['10', '9'], ['3', '8'], ['5', '5'], ['100', '25']], 'Text is compared one character at a time: "10" < "9" because "1" comes before "9". Convert with int() to compare as numbers.', skill='bool', level=3,
    alts=['a = float(input())\nb = float(input())\nif a > b:\n    print(int(a))\nelse:\n    print(int(b))'])

# ---------------------------------------------------------------- write
write(U, 'Ask for an age (whole number). Print <b>adult</b> if it is 18 or more, otherwise print <b>minor</b>.',
      'age = int(input())\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")', [['20'], ['18'], ['17'], ['5']],
      ['Convert the input with int() first.', 'The test is age >= 18 (18 itself is an adult).'], 'Exactly 18 is the boundary: >= includes it.', skill='cond', level=1,
      alts=['age = int(input())\nif age < 18:\n    print("minor")\nelse:\n    print("adult")', 'age = int(input())\nif age > 17:\n    print("adult")\nelse:\n    print("minor")'],
      must=[[r'\bif\b', 'Use an if to decide.'], [r'int\s*\(', 'Convert the input with int() before comparing.']])
write(U, 'Ask for a test score (whole number). Print <b>A</b> for 90 or more, <b>B</b> for 80 to 89, <b>C</b> for 70 to 79, and <b>Try again</b> for anything lower.',
      'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("Try again")',
      [['95'], ['90'], ['89'], ['80'], ['70'], ['69'], ['12']],
      ['Check the highest score first.', 'if score >= 90: ... elif score >= 80: ... elif ... else'], 'Python runs the first true branch, so test the hardest condition first.', skill='cond', level=2,
      alts=['score = int(input())\nif score < 70:\n    print("Try again")\nelif score < 80:\n    print("C")\nelif score < 90:\n    print("B")\nelse:\n    print("A")'],
      must=[[r'\bif\b', 'Use if / elif / else.']])
write(U, 'Ask for two whole numbers. Print the <b>bigger</b> one. If they are equal, print <b>same</b>.',
      'a = int(input())\nb = int(input())\nif a > b:\n    print(a)\nelif b > a:\n    print(b)\nelse:\n    print("same")',
      [['3', '8'], ['9', '2'], ['5', '5'], ['10', '9'], ['-4', '-7']],
      ['Three cases: a bigger, b bigger, or equal.', 'if a > b: ... elif b > a: ... else: ...'], 'Three outcomes need an if / elif / else.', skill='cond', level=2,
      alts=['a = int(input())\nb = int(input())\nif a == b:\n    print("same")\nelif a > b:\n    print(a)\nelse:\n    print(b)'],
      must=[[r'\bif\b', 'Use if to decide.'], [r'int\s*\(', 'Convert both inputs with int() so 10 beats 9.']])
write(U, 'Ask for a whole number. Print <b>even</b> if it is even, otherwise print <b>odd</b>. (0 counts as even.)',
      'n = int(input())\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")', [['4'], ['7'], ['0'], ['10'], ['1']],
      ['An even number leaves remainder 0 when divided by 2.', 'if n % 2 == 0:'], 'n % 2 is the remainder after dividing by 2: 0 for even, 1 for odd.', skill='bool', level=2,
      alts=['n = int(input())\nif n % 2 == 1:\n    print("odd")\nelse:\n    print("even")', 'n = int(input())\nif n % 2 != 0:\n    print("odd")\nelse:\n    print("even")'],
      must=[[r'%', 'Use the remainder operator % to test for even.'], [r'\bif\b', 'Use an if to decide.']])
write(U, 'Ask for an age. Print <b>Free</b> if the age is under 3 <b>or</b> over 70. Print <b>$6</b> if the age is from 3 to 12 (both included). Otherwise print <b>$12</b>.',
      'age = int(input())\nif age < 3 or age > 70:\n    print("Free")\nelif age >= 3 and age <= 12:\n    print("$6")\nelse:\n    print("$12")',
      [['2'], ['3'], ['12'], ['13'], ['70'], ['71'], ['40']],
      ['Use or for the two Free groups.', 'The child group needs both age >= 3 and age <= 12.'], 'Free uses OR (either group is enough). Child price needs AND (both limits at once). Check the borders 3, 12, 70.', skill='bool', level=3,
      alts=['age = int(input())\nif age < 3 or age > 70:\n    print("Free")\nelif age <= 12:\n    print("$6")\nelse:\n    print("$12")', 'age = int(input())\nif 3 <= age <= 12:\n    print("$6")\nelif age < 3 or age > 70:\n    print("Free")\nelse:\n    print("$12")'],
      must=[[r'\bor\b', 'Use "or" to combine the two Free groups.'], [r'\bif\b', 'Use if / elif / else.']])
write(U, 'Leap-year-lite. Ask for a year. It is a leap year if it is divisible by 4 <b>and</b> not divisible by 100. Print <b>leap</b> or <b>not leap</b>.',
      'y = int(input())\nif y % 4 == 0 and y % 100 != 0:\n    print("leap")\nelse:\n    print("not leap")', [['2024'], ['2023'], ['1900'], ['2028'], ['2100'], ['2026']],
      ['Divisible by 4 means year % 4 == 0.', 'Join the two tests with and.'], '1900 is divisible by 4 but also by 100, so it is not leap. The and needs both parts True.', skill='bool', level=3,
      alts=['y = int(input())\nif y % 4 == 0:\n    if y % 100 == 0:\n        print("not leap")\n    else:\n        print("leap")\nelse:\n    print("not leap")', 'y = int(input())\nif y % 4 != 0 or y % 100 == 0:\n    print("not leap")\nelse:\n    print("leap")'],
      must=[[r'%', 'Use % to test if the year divides evenly.'], [r'\bif\b', 'Use an if to decide.']])
write(U, 'Login check. Ask for a username, then a password (two inputs). Print <b>Welcome</b> only if the username is <b>admin</b> and the password is <b>1234</b>. Otherwise print <b>Access denied</b>.',
      'user = input()\npw = input()\nif user == "admin" and pw == "1234":\n    print("Welcome")\nelse:\n    print("Access denied")',
      [['admin', '1234'], ['admin', '0000'], ['bob', '1234'], ['Admin', '1234'], ['bob', 'abc']],
      ['Both tests must be True at once: use and.', 'Compare text with ==, in quotes.'], 'and needs both checks True. Capital A in Admin is a different letter, so it is denied.', skill='cond', level=2,
      alts=['user = input()\npw = input()\nif user == "admin":\n    if pw == "1234":\n        print("Welcome")\n    else:\n        print("Access denied")\nelse:\n    print("Access denied")'],
      must=[[r'\bif\b', 'Use an if to decide.'], [r'==', 'Compare with == (two equal signs).']])
write(U, 'Ask for a whole number n. Print <b>FizzBuzz</b> if it is divisible by both 3 and 5, <b>Fizz</b> if only by 3, <b>Buzz</b> if only by 5, otherwise print the number itself.',
      'n = int(input())\nif n % 3 == 0 and n % 5 == 0:\n    print("FizzBuzz")\nelif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)',
      [['15'], ['9'], ['10'], ['7'], ['30'], ['1']],
      ['Check the "both" case FIRST.', 'Divisible by 3 means n % 3 == 0.'], '15 is divisible by 3 AND 5. If you checked 3 first it would print Fizz. Order matters: the combined case goes first.', skill='cond', level=3,
      alts=['n = int(input())\nif n % 3 == 0:\n    if n % 5 == 0:\n        print("FizzBuzz")\n    else:\n        print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)', 'n = int(input())\nif n % 15 == 0:\n    print("FizzBuzz")\nelif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)'],
      must=[[r'%', 'Use % to test divisibility.'], [r'\bif\b', 'Use if / elif / else.']], starter='n = int(input())\n')

# ---------------------------------------------------------------- know
know(U, 'What is the difference between = and == ?', ['= stores a value, == asks if two values are equal', '= asks if two values are equal, == stores a value', 'They are the same, == is just a longer way', 'Both of them ask if two values are equal'], 'One = puts a value into a name. Two == compare and answer True or False. Mixing them up inside an if is a SyntaxError.', skill='bool')
know(U, 'What must the line  if age >= 18  end with?', ['A colon :', 'A semicolon ;', 'A full stop .', 'Nothing at all'], 'Every if, elif and else line ends with a colon. Leaving it off is a SyntaxError.', skill='cond')
know(U, 'How does Python know which lines belong inside an if?', ['They are indented by 4 spaces', 'They are wrapped in curly brackets', 'They are written in capital letters', 'They come before the if line'], 'Indentation (4 spaces) shows what is inside the if. Lines that are not indented always run.', skill='cond')
know(U, 'In an if / elif / else chain, how many branches run?', ['Only the first one whose test is True', 'Every branch whose test is True', 'Always the last branch in the chain', 'Always the else branch at the end'], 'Python checks from the top and runs the first True branch, then skips the rest. That is why the order of tests matters.', skill='cond', level=2)
know(U, 'What does the test  n % 2 == 0  check?', ['That n is an even number', 'That n is an odd number', 'That n is equal to zero', 'That n is exactly half of 2'], 'n % 2 is the remainder after dividing by 2. A remainder of 0 means n splits into two equal parts: n is even.', skill='bool', level=2)
know(U, 'Why is "10" < "9" True when both are text?', ['Text is compared one character at a time, and "1" comes before "9"', 'Python reads the quotes as a minus sign', 'Text always counts as smaller than a number', 'Python cuts a text to 1 letter before it compares'], 'Strings are compared character by character, first "1" vs "9". Convert with int() first to compare real sizes: 10 < 9 is False.', skill='bool', level=3)
