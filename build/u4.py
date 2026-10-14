from dsl import *
U = 4
out(U, 'x = int("5")\nprint(x + 1)', ['51', '5 + 1', 'Error: TypeError'], 'int("5") turns the text into the number 5. Then 5 + 1 = 6.', skill='convert')
out(U, 'print(int(7.9))', ['8', '7.9', '7.0'], 'int() CHOPS OFF the decimal part. It does NOT round.', skill='convert')
out(U, 'print(int(-7.9))', ['-8', '-7.9', '7'], 'Chopping off the decimal moves toward zero: -7.', skill='convert', level=2)
out(U, 'print(int(3.0))', ['3.0', '3', '30'], 'int makes a whole number with no .0.', skill='convert')
out(U, 'print(float(4))', ['4', '4.0', '0.4'], 'float() always shows a decimal point: 4.0.', skill='convert')
out(U, 'print(float("2.5"))', ['25', '"2.5"', '2.5'], 'The text "2.5" becomes the decimal number 2.5.', skill='convert')
out(U, 'print(float("3") + 1)', ['4', '4.0', '31'], 'float("3") is 3.0, plus 1 gives 4.0.', skill='convert')
out(U, 'a = int(input())\nb = int(input())\nprint(a + b)', ['34', '3 + 4', 'Error: TypeError'], 'int() turns each typed text into a real number, so + ADDS.', stdin=['3', '4'], skill='convert')
out(U, 'a = int(input())\nprint(a * 3)', ['555', '5 * 3', '15.0'], 'a is the number 5, so 5 * 3 = 15.', stdin=['5'], skill='convert')
out(U, 'a = float(input())\nprint(a * 2)', ['8', '44', '8.0'], 'float() makes 4.0, times 2 = 8.0.', stdin=['4'], skill='convert')
out(U, 'a = float(input())\nprint(a * 2)', ['5', '2.52.5', '5.0'], '2.5 * 2 = 5.0 (always shows .0 when whole).', stdin=['2.5'], skill='convert')
out(U, 'x = int(input())\nprint(x)', ['3.5', '3', 'Error: ValueError'], 'int() cannot read "3.5" as a whole number. It crashes with a ValueError. Use float() for decimals.', stdin=['3.5'], skill='convert')
out(U, 'x = int("hello")', ['0', 'hello', 'Error: TypeError'], '"hello" is not a number, so int() raises a ValueError.', skill='convert')
out(U, 'print(int("3.5"))', ['3', '3.5', 'Error: TypeError'], 'int() on text only works for whole-number text like "3". "3.5" has a dot: ValueError.', skill='convert')
out(U, 'print(float("abc"))', ['0.0', 'abc', 'Error: TypeError'], 'float() needs text that looks like a number. ValueError.', skill='convert')
out(U, 'print(float("5"))', ['5', '"5"', '5.0'], 'float turns "5" into 5.0.', skill='convert')
out(U, 'print(int("12") + int("8"))', ['128', '20.0', '12 + 8'], 'Both converted to numbers, then added: 20.', skill='convert')
out(U, 'print("12" + "8")', ['20', '128', 'Error: TypeError'], 'No int() here, so it is text glued to text.', skill='convert')
out(U, 'a = int(input())\nb = int(input())\nprint(a / b)', ['3', '93', '3.0'], '/ always gives a float, so 9 / 3 is 3.0.', stdin=['9', '3'], skill='convert')
out(U, 'print(5 + float("2.5"))', ['7', '7.5', '52.5'], '5 + 2.5 = 7.5', skill='convert')
out(U, 'x = float(input())\nprint(x)', ['7', '"7"', '7.0'], 'float() always shows the decimal point: 7.0.', stdin=['7'], skill='convert')
out(U, 'x = int(input())\nprint(x / 2)', ['5', '2.5', '5.0'], '/ always gives a float: 10 / 2 = 5.0.', stdin=['10'], skill='convert')
out(U, 'print(int(5.5) + int(2.5))', ['8', '7', '7.5'], 'int(5.5)=5 and int(2.5)=2. 5+2 = 7.', skill='convert')
out(U, 'n = int(input())\nprint(n + n)', ['2121', '42.0', '42'], 'n is the number 21, so 21 + 21 = 42.', stdin=['21'], skill='convert')
out(U, 'n = input()\nprint(int(n) + 1)', ['91', '10', '10.0'], 'int(n) converts the text 9 to number 9 for the math.', stdin=['9'], skill='convert')
out(U, 'n = int(input())\nprint("Double:", n * 2)', ['Double: 66', 'Double: 12.0', 'Double: 12'], 'n is a number: 6 * 2 = 12.', stdin=['6'], skill='convert')
out(U, 'print(float(7) / 2)', ['3', '3.5', '3.0'], '7.0 / 2 = 3.5', skill='convert')
out(U, 'print(int(9.99))', ['10', '9.99', '9'], 'int chops, it does not round up.', skill='convert')
out(U, 'print(int(float("3.9")))', ['4', '3.9', '3'], 'float("3.9") = 3.9, then int chops it to 3.', skill='convert', level=2)
out(U, 'a = int("4")\nb = float("1.5")\nprint(a + b)', ['5', '5.5', '41.5'], 'int + float = float.', skill='convert')
out(U, 'a = int(input())\nb = int(input())\nprint(a, b, a + b)', ['3 4 34', '3 4 7', '34 7'], 'Three values, spaces between: 3, 4, and the sum 7.', stdin=['3', '4'], skill='convert')
out(U, 'age = int(input())\nprint("In 5 years:", age + 5)', ['In 5 years: 115', 'In 5 years: 16.0', 'In 5 years: 16'], '11 + 5 = 16', stdin=['11'], skill='convert')
out(U, 'x = float(input())\nprint(x + 1)', ['3', '3.0', '3.5'], '2.0 + 1 = 3.0 (still a float).', stdin=['2'], skill='convert', level=2)
out(U, 'x = int(input())\ny = float(input())\nprint(x * y)', ['10', '10.0', '2.5'], '4 * 2.5 = 10.0 - int times float is a float.', stdin=['4', '2.5'], skill='convert', level=2)
out(U, 'a = input()\nprint(int(a) * 2)', ['55', '10.0', '10'], 'Convert first, then double.', stdin=['5'], skill='convert')
out(U, 'a = int(input())\nprint(a)', ['5', 'Error: NameError', 'Error: TypeError'], 'The user typed "five" in words - int() needs digits. ValueError.', stdin=['five'], skill='convert')
out(U, 'a = int(input())\nprint(a)', ['10', '1,0', 'Error: TypeError'], 'A comma is not part of a number. int("1,0") is a ValueError.', stdin=['1,0'], skill='convert', level=2)

for e, w in [('int("5")', 'int() makes an int.'), ('float(5)', 'float() makes a float, even from a whole number.'), ('int(5.9)', 'int() chops and gives an int.'),
             ('float("1.5") + 1', 'float + int = float.'), ('int("4") * 2', 'int * int = int.'), ('float(3) * 2', 'float * int = float.'),
             ('int("8") / int("2")', '/ ALWAYS makes a float.'), ('int(7.0)', 'int() always gives an int.'), ('str(5)', 'str() makes text.'),
             ('float("2") + float("3")', 'float + float = float.'), ('int(5.5) + 1', 'int + int = int.'), ('int("3") + float("3")', 'int + float = float.')]:
    ty(U, e, w, skill='convert')

typed(U, 'a = int(input())\nb = int(input())\nprint(a + b)', 'int makes them numbers: 12 + 30 = 42.', stdin=['12', '30'], skill='convert')
typed(U, 'x = float(input())\nprint(x * 2)', '2.5 * 2 = 5.0 - a float.', stdin=['2.5'], skill='convert')
typed(U, 'x = int(input())\nprint(x / 2)', 'Even dividing evenly with / gives a float: 4.0.', stdin=['8'], skill='convert')
typed(U, 'x = float(input())\nprint(x)', 'float() always shows a decimal point.', stdin=['9'], skill='convert')
typed(U, 'x = int(input())\nprint(int(x / 2))', 'x / 2 = 3.5, int chops to 3.', stdin=['7'], skill='convert', level=3)
typed(U, 'a = int(input())\nprint("Next:", a + 1)', 'Next: 10', stdin=['9'], skill='convert')

fill(U, 'x = ___(input())\nprint(x + 1)', ['int', 'str', 'print'], '8', 'int() makes the typed text into a number so we can add.', stdin=['7'], skill='convert')
fill(U, 'x = ___(input())\nprint(x * 2)', ['float', 'str', 'input'], '5.0', 'The user types a decimal (2.5), so use float().', stdin=['2.5'], skill='convert')
fill(U, 'age = ___(input("Age: "))\nprint("Next year:", age + 1)', ['int', 'float', 'str'], 'Next year: 12', 'Age is a whole number; int() prints 12 (float would print 12.0).', stdin=['11'], skill='convert')
fill(U, 'price = ___(input())\nprint(price * 2)', ['float', 'int', 'print'], '5.0', 'A price can have cents, so use float().', stdin=['2.5'], skill='convert')
fill(U, 'a = int(input())\nb = int(input())\nprint(a ___ b)', ['+', ',', '"+"'], '7', 'To ADD the numbers use +. (A comma would print them as 3 4.)', stdin=['3', '4'], skill='convert')
fill(U, 'n = input()\nprint(___(n) + 10)', ['int', 'str', 'print'], '15', 'Convert the text to a number inside the print.', stdin=['5'], skill='convert')

fix(U, 'It should ADD the two numbers (typing 3 and 4 should print 7). Fix it.', 'a = input("First: ")\nb = input("Second: ")\nprint(a + b)',
    'a = int(input("First: "))\nb = int(input("Second: "))\nprint(a + b)', [['3', '4'], ['10', '25']], 'input() gives text. Wrap in int() to get numbers.', skill='convert')
fix(U, 'The program crashes when the user types 2.5. Make it print double the number (5.0).', 'x = int(input())\nprint(x * 2)',
    'x = float(input())\nprint(x * 2)', [['2.5'], ['4']], 'int() cannot read decimals. Use float().', skill='convert')
fix(U, 'It should double the number (typing 4 prints 8) but prints 44. Fix it.', 'n = input("Number: ")\nprint(n * 2)',
    'n = int(input("Number: "))\nprint(n * 2)', [['4'], ['7']], 'Text * 2 repeats it. Convert to a number first.', skill='convert')
fix(U, 'It should print 2.5 but crashes. Fix it.', 'x = int("2.5")\nprint(x)', 'x = float("2.5")\nprint(x)', [[]], 'int() cannot convert text with a decimal point.', skill='convert')
fix(U, 'It should print: Half of 9 is 4.5. Fix it.', 'print("Half of 9 is", int(9 / 2))', 'print("Half of 9 is", 9 / 2)', [[]], 'int() chops the .5 off.', skill='convert', level=3)
fix(U, 'The user types a whole number and the program should print it plus 100. It crashes with TypeError.', 'n = input()\nprint(n + 100)',
    'n = int(input())\nprint(n + 100)', [['5'], ['40']], 'Text + number crashes. Convert with int().', skill='convert')
fix(U, 'The area must print as a decimal (e.g. 10.0). Fix the conversion.', 'w = int(input())\nh = int(input())\nprint(w * h * 1.0)',
    'w = float(input())\nh = float(input())\nprint(w * h)', [['2.5', '4'], ['3', '3']], 'Use float() when the user might type decimals.', skill='convert', level=3)

write(U, 'Ask for two whole numbers (two inputs). Print their <b>sum</b> (just the number).', 'a = int(input())\nb = int(input())\nprint(a + b)',
      [['3', '4'], ['10', '25'], ['0', '0']], ['Convert both inputs with int().', 'a = int(input())'], 'int() first, then +.', skill='convert',
      must=[[r'int\s*\(', 'Use int() to turn the text into numbers.']])
write(U, 'Ask for a decimal number and print <b>double</b> it. (Typing 2.5 prints 5.0)', 'x = float(input())\nprint(x * 2)', [['2.5'], ['10'], ['0.5']],
      ['Decimals need float().', 'x = float(input())'], 'float handles decimals.', skill='convert', must=[[r'float\s*\(', 'Use float().']])
write(U, 'Ask for two whole numbers and print their <b>product</b>.', 'a = int(input())\nb = int(input())\nprint(a * b)', [['3', '4'], ['7', '8'], ['0', '9']],
      ['int() both inputs.', 'print(a * b)'], 'Convert, then multiply.', skill='convert')
write(U, 'Ask for two decimals and print their <b>average</b> ((a+b)/2). Typing 2.5 and 3.5 prints 3.0', 'a = float(input())\nb = float(input())\nprint((a + b) / 2)',
      [['2.5', '3.5'], ['10', '20'], ['1', '2']], ['Use brackets so the add happens first.', 'print((a + b) / 2)'], 'Brackets change the order.', skill='convert',
      alts=['a = float(input())\nb = float(input())\nprint((a + b) * 0.5)', 'a = float(input())\nb = float(input())\nprint(a / 2 + b / 2)'])
write(U, 'Ask for the user\'s age (whole number) and print how many <b>months</b> that is (age times 12). Typing 11 prints 132.', 'age = int(input())\nprint(age * 12)',
      [['11'], ['8'], ['30']], ['Convert, multiply by 12, print.', 'age = int(input())'], 'int() then math.', skill='convert')
write(U, 'Ask for length and width (decimals allowed) and print the <b>area</b>. 2.5 and 4 prints 10.0', 'l = float(input())\nw = float(input())\nprint(l * w)',
      [['2.5', '4'], ['3', '3'], ['0.5', '8']], ['Use float() for both.', 'print(l * w)'], 'Rectangle area = length times width.', skill='convert', must=[[r'float\s*\(', 'Use float().']])

know(U, 'What does int(8.9) give?', ['8', '9', '8.9', 'Error'], 'int() chops off the decimals. It never rounds.', skill='convert')
know(U, 'What does float("4") give?', ['4.0', '4', '"4"', 'Error'], 'A float always prints with a decimal point.', skill='convert')
know(U, 'Which command should you use if the user might type 3.75?', ['x = float(input())', 'x = int(input())', 'x = str(input())', 'x = input()'], 'int() crashes on decimals; float() handles them.', skill='convert')
know(U, 'Which command is right for "How many apples?" (a whole number)', ['int(input())', 'float(input())', 'input()', 'print(input())'], 'Whole number answers -> int().', skill='convert')
know(U, 'What does int("3.5") do?', ['Crashes with a ValueError', 'Gives the whole number 3', 'Rounds up and gives 4', 'Gives the decimal 3.5'], 'The text "3.5" is not a whole number. Convert it with float() first (or float then int).', skill='convert')
know(U, 'Why do we write int(input()) ?', ['input() gives text; int() turns it into a number', 'It makes input() run faster on big numbers', 'It prints whatever the user typed in', 'int() is the part that asks the question'], 'Text can not be added/multiplied like numbers.', skill='convert')
