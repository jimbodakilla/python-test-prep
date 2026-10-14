from dsl import *
U = 7   # BONUS - only if your teacher taught these
out(U, 'age = 11\nprint("Age: " + str(age))', ['Age: 11.0', 'Age: age', 'Error: TypeError'], 'str() turns a number into text so + can glue it.', skill='bonus')
out(U, 'print(str(5) + str(5))', ['10', '5 5', 'Error: TypeError'], 'str() makes text, text + text glues: 55.', skill='bonus')
out(U, 'print(str(5.0))', ['5', '5.00', '"5.0"'], 'str(5.0) is the text 5.0.', skill='bonus')
out(U, 'name = input()\nprint(f"Hi {name}!")', ['Hi {name}!', 'Hi name!', 'Hi  Zoe !'], 'In an f-string, {name} is replaced by the variable value.', stdin=['Zoe'], skill='bonus')
out(U, 'x = 2.5\nprint(f"x is {x}")', ['x is {x}', 'x is x', 'x is 2'], 'The {x} is swapped for 2.5.', skill='bonus')
out(U, 'x = 3.14159\nprint(f"{x:.2f}")', ['3.14159', '3.1', '3.14'], '.2f means 2 digits after the decimal point.', skill='bonus')
out(U, 'print(7 // 2)', ['3.5', '4', '3'], '// divides and chops off the remainder.', skill='bonus')
out(U, 'print(7 % 2)', ['3', '1', '3.5'], '% gives the remainder: 7 = 3*2 + 1.', skill='bonus')
out(U, 'print(2 ** 3)', ['6', '8', '23'], '** means power: 2 * 2 * 2.', skill='bonus')
out(U, 'print(round(3.7))', ['3', '3.7', '4'], 'round() rounds to the nearest whole number (unlike int()).', skill='bonus')
out(U, 'print(round(2.567, 1))', ['2.6', '2.57', '2.5'], 'round(x, 1) keeps one decimal.', skill='bonus')
out(U, 'print(int(3.7), round(3.7))', ['4 4', '3 4', '3 3'], 'int() chops: 3. round() rounds: 4.', skill='bonus')
fill(U, 'age = 11\nprint("Age: " + ___(age))', ['str', 'int', 'float'], 'Age: 11', 'Number to text: str().', skill='bonus')
fix(U, 'It crashes. Use str() to fix it (should print Age: 11).', 'age = 11\nprint("Age: " + age)', 'age = 11\nprint("Age: " + str(age))', [[]], 'Number to text: str().', skill='bonus')
write(U, 'Use an <b>f-string</b> to print <b>Hello Ana, you are 11</b> from the name and age typed (name first, whole-number age).',
      'name = input()\nage = int(input())\nprint(f"Hello {name}, you are {age}")', [['Ana', '11'], ['Leo', '9']], ['print(f"... {name} ... {age}")'],
      'f-strings use {}.', skill='bonus', must=[[r'f["\']', 'Use an f-string.']])
know(U, 'What does str(25) give?', ['The text "25"', 'The number 25', '25.0', 'Error'], 'str() makes text from anything.', skill='bonus')

# ---------------- more Level Up 1 questions ----------------
out(U, 'price = 2.5\nprint(f"${price:.2f}")', ['$2.5', '$2.50.', 'Error: ValueError'], ':.2f means 2 digits after the point, so 2.5 becomes 2.50. The $ is just a normal character in the text.', skill='bonus')
out(U, 'print(f"{3 + 4} {3 * 4}")', ['3 + 4 3 * 4', '34 34', '7 7'], 'Inside { } Python works out the math first: 3 + 4 is 7 and 3 * 4 is 12, with a normal space between them.', skill='bonus')
out(U, 'x = 7\nprint("x = {x}")', ['x = 7', 'x = x', 'Error: NameError'], 'There is no f before the quote, so Python prints the curly brackets as plain text, exactly as typed.', skill='bonus')
out(U, 'x = 7\nprint(f"x = {x}")', ['x = {x}', 'x = x', 'x = 7.0'], 'The f before the quote turns { } into a slot, and {x} is replaced by the value of x, which is 7.', skill='bonus')
out(U, 'print(f"{1 / 3:.3f}")', ['0.3', '0.333333', '1/3'], '1 / 3 is 0.3333..., and :.3f keeps exactly 3 digits after the decimal point.', skill='bonus')
out(U, 'print(round(7 / 2))', ['3.5', '3', '7'], '7 / 2 is 3.5. Exactly .5 rounds to the nearest EVEN whole number, and 4 is even, so the answer is 4.', skill='bonus', level=3)
out(U, 'print(round(2.5), round(3.5))', ['3 4', '2 3', '2 2'], 'Python rounds a .5 to the nearest EVEN number: 2.5 goes to 2 and 3.5 goes to 4.', skill='bonus', level=3)
out(U, 'print(int(2.9), round(2.9))', ['3 3', '2 2', '2.0 3.0'], 'int() chops the decimals off, giving 2. round() goes to the nearest whole number, giving 3.', skill='bonus')
out(U, 'print(17 // 5, 17 % 5)', ['3.4 2', '2 3', '3 3'], '5 fits into 17 three times (3 * 5 = 15), and 17 - 15 leaves a remainder of 2.', skill='bonus')
out(U, 'print(2 ** 10)', ['20', '12', '210'], '** means power: 2 multiplied by itself 10 times is 1024.', skill='bonus')
out(U, 'print(str(12) + str(3))', ['15', '12 3', 'Error: TypeError'], 'str() turns both numbers into text, and + glues text, so "12" and "3" join to make 123 instead of adding.', skill='bonus')
out(U, 'print(len(str(12345)))', ['12345', 'Error: TypeError', '1'], 'str(12345) is the 5-character text "12345". len() counts characters, so the answer is 5.', skill='bonus')
out(U, 'print("5" * 2 + str(5 * 2))', ['20', '510', '55 10'], '"5" * 2 repeats the text to make "55". 5 * 2 is 10, str() makes it "10", and + glues: 5510.', skill='bonus', level=3)
out(U, 'print(-7 // 2, -7 % 2)', ['-3 -1', '-4 -1', '-3 1'], '// rounds DOWN (toward minus infinity), so -3.5 becomes -4, and the remainder is then 1 because -4 * 2 + 1 = -7.', skill='bonus', level=3)
typed(U, 'x = 3.14159\nprint(f"{x:.1f} {x:.3f}")', 'Python rounds to the number of digits after :., so 3.14159 gives 3.1 with one decimal and 3.142 with three. Expected output: 3.1 3.142.', skill='bonus')
typed(U, 'n = 47\nprint(n // 10, n % 10)', '47 divided by 10 fits 4 times with a remainder of 7. So // gives the tens digit (4) and % gives the ones digit (7).', skill='bonus')
typed(U, 'a = 9\nb = 4\nprint(f"{a} / {b} = {a / b}")', 'Inside { } the math happens, and / always gives a float. 9 / 4 is 2.25, and the plain text around it is copied exactly.', skill='bonus')
for e, w in [('str(5) + "1"', 'str() makes text, and text + text glues, so this is still text.'), ('round(2.6)', 'round() with one argument gives a whole number (int).'), ('round(2.567, 1)', 'round() with a number of decimals keeps a float.'),
             ('7 // 2', '// divides and keeps only the whole part, and int // int stays an int.'), ('2 ** 3', 'int ** positive int stays an int (8).'), ('f"{5}"', 'An f-string always produces text (str).')]:
    ty(U, e, w + ' So the type here is the one shown.', skill='bonus')
fill(U, 'price = 2.5\nprint(f"{price:___}")', ['.2f', '.2', '2f', 'f.2'], '2.50', ':.2f is the pattern for 2 digits after the decimal point; the others are different or invalid format codes.', skill='bonus')
fill(U, 'n = 17\nprint(n ___ 5)', ['%', '//', '**', '/'], '2', 'We want the remainder of 17 divided by 5, which is 2. That is the % operator.', skill='bonus')
fix(U, 'It should print: Total: 10, but crashes with a TypeError. Fix it with str().', 'qty = 5\nprint("Total: " + qty * 2)', 'qty = 5\nprint("Total: " + str(qty * 2))', [[]], 'qty * 2 is a number, and text + number crashes. str() turns the number into text so + can glue it.', skill='bonus')
fix(U, 'It should greet the user by name, but prints {name} on the screen. Fix it.', 'name = input()\nprint("Hello {name}!")', 'name = input()\nprint(f"Hello {name}!")', [['Ana'], ['Leo']], 'Without the f before the quote the curly brackets are just characters. The f makes { } work as a slot.', skill='bonus')
write(U, 'Ask for a price (decimal) and a quantity (whole number). Print the total with exactly two decimals and a dollar sign: typing 2.5 and 3 prints <b>Total: $7.50</b>',
      'price = float(input())\nqty = int(input())\nprint(f"Total: ${price * qty:.2f}")', [['2.5', '3'], ['10', '2'], ['0.75', '4']], ['An f-string can hold math, and :.2f fixes the decimals.', 'print(f"Total: ${price * qty:.2f}")'],
      'price * qty is worked out inside { }, and :.2f makes sure 20.0 shows as 20.00 and 7.5 as 7.50.', skill='bonus', must=[[r':\s*\.2f', 'Use :.2f inside the curly brackets to show two decimals.']])
write(U, 'Ask for a 2-digit number. Print its tens digit on one line and its ones digit on the next. Typing 47 prints 4 then 7.',
      'n = int(input())\nprint(n // 10)\nprint(n % 10)', [['47'], ['90'], ['10'], ['75']], ['// gives the tens, % gives the ones.', 'print(n // 10)'], '// 10 keeps the tens (47 // 10 is 4) and % 10 keeps the ones (47 % 10 is 7).', skill='bonus',
      alts=['n = int(input())\nprint(f"{n // 10}\\n{n % 10}")'])
write(U, 'Ask for a number of minutes. Print hours and minutes like: <b>2 hours 15 minutes</b> (for 135).', 'm = int(input())\nprint(m // 60, "hours", m % 60, "minutes")', [['135'], ['60'], ['59'], ['200']],
      ['Whole hours come from //, leftover minutes come from %.', 'print(m // 60, "hours", m % 60, "minutes")'], '135 // 60 is 2 whole hours and 135 % 60 is the 15 leftover minutes.', skill='bonus',
      alts=['m = int(input())\nprint(f"{m // 60} hours {m % 60} minutes")'])
know(U, 'What does the % operator give you?', ['The remainder after dividing', 'The percentage of a number', 'The whole-number part', 'The result as text'], '% is the remainder: 17 % 5 is 2 because 17 = 3 * 5 + 2. It does not calculate percentages.', skill='bonus')
know(U, 'Why does print("x is {x}") show the curly brackets?', ['There is no f before the quote', 'x was never created', 'Brackets cannot be printed', 'print() needs a comma'], 'Only an f-string (f before the opening quote) replaces {x} with the value. A normal string prints it as it is.', skill='bonus')
know(U, 'Which one always shows exactly two decimals?', ['f"{x:.2f}"', 'round(x, 2)', 'int(x * 100)', 'str(x)'], 'round(4.5, 2) prints 4.5 (it drops the trailing zero). Only the :.2f format forces 4.50.', skill='bonus')
know(U, 'When is str() needed?', ['To glue a number to text with +', 'To turn text into a number', 'Before every print()', 'To make input() work'], 'The + sign cannot join text with a number, so convert the number with str(). Commas and f-strings do not need it.', skill='bonus')
