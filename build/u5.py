from dsl import *
U = 5
# ---------- which error? ----------
out(U, 'print("Total: " + 5)', ['Total: 5', 'Total:  5', 'Error: ValueError'], 'You can not + text and a number: TypeError.', skill='errors')
out(U, 'x = 5\nprint("x is " + x)', ['x is 5', 'x is x', 'Error: NameError'], 'x holds a NUMBER; "x is " is TEXT. Text + number = TypeError.', skill='errors')
out(U, 'print("5" + 5)', ['10', '55', 'Error: ValueError'], 'Text + number: TypeError.', skill='errors')
out(U, 'print(5 + "5")', ['10', '55', 'Error: ValueError'], 'Number + text: TypeError.', skill='errors')
out(U, 'print("5" * "5")', ['25', '55555', 'Error: ValueError'], 'You can not multiply text by text. TypeError.', skill='errors')
out(U, 'print("a" - "b")', ['a-b', '0', 'Error: ValueError'], 'Text can not be subtracted. TypeError.', skill='errors')
out(U, 'print(int("five"))', ['5', 'five', 'Error: TypeError'], 'The VALUE of the text is the problem: ValueError.', skill='errors')
out(U, 'print(float("1,5"))', ['1.5', '15.0', 'Error: TypeError'], 'A comma is not a decimal point in Python: ValueError.', skill='errors')
out(U, 'x = 3\nprint(y)', ['3', '0', 'Error: SyntaxError'], 'y was never created: NameError.', skill='errors')
out(U, 'print(5 / 0)', ['0', 'inf', 'Error: ValueError'], 'You can not divide by zero. ZeroDivisionError.', skill='errors')
out(U, 'n = int(input())\nprint(n + 1)', ['4', '3 + 1', 'Error: TypeError'], 'The typed text "3 4" is not one whole number: ValueError.', stdin=['3 4'], skill='errors')
out(U, 'print(Print("Hi"))', ['Hi', 'None', 'Error: SyntaxError'], 'Print (capital P) does not exist: NameError.', skill='errors', level=2)
out(U, 'x = "ten"\nprint(x + 1)', ['11', 'ten1', 'Error: ValueError'], 'Text + number = TypeError.', skill='errors')
out(U, 'x = "ten"\nprint(int(x))', ['10', 'ten', 'Error: TypeError'], 'int() can not read the word ten: ValueError.', skill='errors')
out(U, 'name = input()\nprint("Hi" name)', ['Hi Ana', 'HiAna', 'Error: TypeError'], 'Missing a comma or + between the pieces. That is a SyntaxError (Python can not even read it).', stdin=['Ana'], skill='errors')
out(U, 'a = 5\nb = "5"\nprint(a + b)', ['10', '55', 'Error: ValueError'], 'int + text: TypeError.', skill='errors')
out(U, 'a = int("5")\nb = 5\nprint(a + b)', ['55', 'Error: TypeError', '10.0'], 'Both are numbers now: 10.', skill='errors')
out(U, 'x = 5\nprint(X)', ['5', 'X', 'Error: SyntaxError'], 'Capital X is a different name that was never created: NameError.', skill='errors')

# ---------- tricky outputs ----------
out(U, 'print(int(10 / 2))', ['5.0', '2', '20'], 'int() removes the .0: 5.', skill='types')
out(U, 'print(3 * "ab")', ['ab3', '6', 'ababab'], 'Text repeated 3 times.', skill='types')
out(U, 'print("3" * 2)', ['6', '3 3', '33'], 'The TEXT "3" repeated twice: 33.', skill='types')
out(U, 'print(0.5 + 0.5)', ['1', '0.10', '1.0'], 'Float + float = float: 1.0.', skill='types')
out(U, 'print(5 - 2.0)', ['3', '2.0', '3.0'], 'int - float = float: 3.0.', skill='types')
out(U, 'print(type(5))', ['int', "<class 'str'>", "<class 'int'>"], 'type() shows the type as <class \'int\'>.', skill='types')
out(U, 'print(type(5.0))', ["<class 'int'>", "<class 'float'>", 'float'], '5.0 has a decimal point, so float.', skill='types')
out(U, 'print(type("5"))', ["<class 'int'>", "<class 'str'>", 'str'], 'Quotes make text (str).', skill='types')
out(U, 'print(type(5 / 1))', ["<class 'int'>", "<class 'float'>", "<class 'str'>"], '/ always gives a float.', skill='types')
out(U, 'print(type(input()))', ["<class 'int'>", "<class 'float'>", "<class 'str'>"], 'input() is always text.', stdin=['42'], skill='types')
out(U, 'print(type(int("5")))', ["<class 'str'>", "<class 'float'>", "<class 'int'>"], 'int() makes an int.', skill='types')
out(U, 'x = 7\ny = 2.0\nprint(x * y)', ['14', '14.0', '72.0'], 'int * float = float: 14.0.', skill='types')
out(U, 'a = "7"\nb = "2"\nprint(a + b)', ['9', '14', '72'], 'Text + text = glued: 72.', skill='types')
out(U, 'a = 7\nb = 2\nprint(a + b)', ['72', '"9"', '9'], 'Numbers add.', skill='types')
out(U, 'print("7" * 2 + "1")', ['15', '141', '771'], 'Do "7" * 2 first = "77", then glue "1": 771.', skill='types', level=3)
out(U, 'print(2 + 3, "2" + "3")', ['5 5', '23 23', '5 23'], 'The first is number math (5). The second is text glued (23).', skill='types', level=2)
out(U, 'x = 2\nprint(x + x, "x" + "x")', ['4 xx', '22 xx', '4 4'], 'x + x is math: 4. "x" + "x" is text: xx.', skill='types', level=2)

# ---------- types ----------
for e, w in [('"5" + "5"', 'Both text: result is text (str) "55".'), ('5 + 5', 'int + int = int.'), ('"5" + 5', 'Text + number crashes: Error.'),
             ('5 * "5"', 'int times str repeats the text: str "55555".'), ('"5" * "5"', 'str * str is not allowed: Error.'), ('5 / 5', '/ ALWAYS gives a float.'),
             ('5.0 + 1', 'float + int = float.'), ('"5.0"', 'Anything in quotes is a str.'), ('5.0', 'A number with a decimal point is a float.'),
             ('float("x")', 'float() can not read "x": Error.'), ('int(5.0)', 'int() gives an int.'), ('int("5") + float("5")', 'int + float = float.'),
             ('-3', 'A negative whole number is an int.'), ('"hi" * 3', 'str * int = str.'), ('10 - 2.5', 'int - float = float.'), ('"a" - "b"', 'str - str is not allowed: Error.'),
             ('1 / 2', '/ always gives float.'), ('0.0', 'It has a decimal point: float.'), ('"5"', 'Quotes: str.'), ('int("2") * int("3")', 'int * int = int.')]:
    ty(U, e, w, skill='types')
ty(U, 'x', 'x holds the text typed.', setup='x = input()', stdin=['3'], skill='types')
ty(U, 'x', 'int() makes an int.', setup='x = int(input())', stdin=['3'], skill='types')
ty(U, 'x', 'float() makes a float.', setup='x = float(input())', stdin=['3'], skill='types')
ty(U, 'x + y', 'int + float = float.', setup='x = int(input())\ny = float(input())', stdin=['3', '4'], skill='types')
ty(U, 'x + y', 'Both text: glued, still a str.', setup='x = input()\ny = input()', stdin=['3', '4'], skill='types')
ty(U, 'x / y', '/ always gives a float.', setup='x = int(input())\ny = int(input())', stdin=['8', '2'], skill='types')

# ---------- which line crashes ----------
line(U, 'name = "Sam"\nage = 11\nprint("Name:", name)\nprint("Age: " + age)', 'Line 4 glues text and a number with +.')
line(U, 'a = input()\nb = input()\nprint(a + b)\nprint(a * b)', 'Line 3 glues two texts (fine). Line 4 multiplies text by text: crash.', stdin=['2', '3'])
line(U, 'x = int(input())\nprint("ok")\ny = int(input())\nprint(x + y)', 'The second input is "abc" and int("abc") crashes on line 3.', stdin=['5', 'abc'])
line(U, 'x = 10\ny = 0\nz = x / y\nprint("done")', 'Dividing by zero is on line 3.')
line(U, 'print("Start")\nprint(Hello)\nprint("End")', 'Line 2: Hello has no quotes so it is a missing variable.')
line(U, 'a = 4\nb = 5\nprint(a + b)\nprint("a + b")', 'Everything runs fine.')
line(U, 'a = float(input())\nb = float(input())\nprint(a * b)', 'Typed 2.5 and 4: everything is fine.', stdin=['2.5', '4'])
line(U, 'n = int(input())\nprint(n * 2)\nprint("Ready")', 'Typing 3.5 into int() crashes on line 1.', stdin=['3.5'])
line(U, 'x = 5\ny = "5"\nprint(x * 2)\nprint(y * 2)\nprint(x + y)', 'Lines 3 and 4 work (10 and 55). Line 5 mixes number + text.')

typed(U, 'print(10 / 2)', 'Division gives a float.', skill='types')
typed(U, 'print("3" * 3)', 'Text repeated.', skill='types')
typed(U, 'print(type(2.5))', "type() shows <class 'float'>.", skill='types')
typed(U, 'a = "2"\nb = 3\nprint(a * b)', 'Text * int repeats the text: 222.', skill='types')
typed(U, 'a = int("2")\nb = 3\nprint(a * b)', 'int * int = 6.', skill='types')
typed(U, 'x = 9\nprint(x / 3, x * 3)', '3.0 then 27.', skill='types')

fix(U, 'It crashes with TypeError. It should print: Age: 11', 'age = 11\nprint("Age: " + age)', 'age = 11\nprint("Age:", age)', [[]], 'Use a comma between text and a number.', skill='errors')
fix(U, 'It crashes with ValueError when the user types 4.5. Fix it so it prints 9.0.', 'n = int(input())\nprint(n * 2)', 'n = float(input())\nprint(n * 2)', [['4.5'], ['3']], 'Decimals need float().', skill='errors')
fix(U, 'It crashes with NameError. It should print 15.', 'a = 5\nb = 10\nprint(a + c)', 'a = 5\nb = 10\nprint(a + b)', [[]], 'c was never created. Use b.', skill='errors')
fix(U, 'It should print 3 (the typed number plus 1) but crashes on the second line.', 'n = input()\nprint(n + 1)', 'n = int(input())\nprint(n + 1)', [['2'], ['9']], 'Convert first.', skill='errors')
fix(U, 'The program should add the numbers, but prints them stuck together. Fix it.', 'a = input()\nb = input()\nprint(int(a + b))', 'a = int(input())\nb = int(input())\nprint(a + b)', [['3', '4'], ['10', '5']], 'Convert each BEFORE adding. int("3" + "4") is int("34") = 34.', skill='errors', level=3)

know(U, 'A TypeError usually means ...', ['You mixed types that can not go together (like text + number)', 'The text can not be turned into a number', 'A word was used that Python has never heard of', 'A bracket or quote was never closed in a line'], 'TypeError = wrong type for that operation.', skill='errors')
know(U, 'A ValueError usually means ...', ['The value can not be converted (like int("abc"))', 'You mixed text and a number with a + sign', 'A variable name was used before it was made', 'A bracket or a quote was never closed'], 'ValueError = right type of thing, but a bad value.', skill='errors')
know(U, 'A NameError usually means ...', ['Python does not know that name (typo or missing quotes)', 'You divided a number by zero somewhere in the code', 'You added text and a number using the + sign', 'A bracket or a quote was never closed in a line'], 'NameError = unknown name.', skill='errors')
know(U, 'A SyntaxError usually means ...', ['Python can not even read it (missing quote or bracket)', 'A value could not be converted by int()', 'You added text and a number with a + sign', 'A name was used before it was created'], 'Syntax = the grammar of the code is broken.', skill='errors')
know(U, 'Which of these crashes?', ['"7" + 3', '7 + 3', '"7" + "3"', '"7" * 3'], 'Text + number is the only one that crashes.', skill='errors')
know(U, 'What does "ZeroDivisionError" mean?', ['You divided by zero', 'You used zero as a variable', 'The answer was zero', 'You typed the number zero'], 'You can not divide by zero.', skill='errors')
know(U, 'Which is a float?', ['5.0', '5', '"5.0"', '"five"'], '5.0 has a decimal point and no quotes.', skill='types')
know(U, 'Which one is a str?', ['"7.5"', '7.5', '7.0', '-7.5'], 'Quotes make a str - even around digits.', skill='types')
know(U, 'What type is the result of 8 / 4 ?', ['float', 'int', 'str', 'error'], '/ always gives a float: 2.0.', skill='types')
know(U, 'Which makes sure you get a whole number from a decimal?', ['int(7.9)', 'float(7.9)', 'str(7.9)', 'input(7.9)'], 'int() chops to a whole number.', skill='types')
