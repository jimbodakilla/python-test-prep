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
