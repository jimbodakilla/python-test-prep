from dsl import *
U = 2
out(U, 'x = 5\nprint(x)', ['x', '"5"', 'Error: NameError'], 'x is a name tag on the value 5. print(x) shows what x holds.', skill='math')
out(U, 'x = 5\nprint("x")', ['5', 'Error: NameError', '"x"'], 'In quotes it is just the letter x. Without quotes it would be the variable.', skill='math')
out(U, 'name = "Ana"\nprint(name)', ['name', '"Ana"', 'Error: NameError'], 'print(name) shows what is stored in name.', skill='math')
out(U, 'name = "Ana"\nprint("name")', ['Ana', 'Error: NameError', '"name"'], 'The quotes turn name into plain text.', skill='math')
out(U, 'a = 3\nb = 4\nprint(a + b)', ['34', 'a + b', '3 + 4'], 'a is 3, b is 4, numbers add: 7.', skill='math')
out(U, 'x = 5\nx = 8\nprint(x)', ['5', '13', '58'], 'The second line REPLACES the value. The old 5 is forgotten.', skill='math')
out(U, 'x = 10\ny = x\nx = 20\nprint(y)', ['20', '30', 'x'], 'y copied the value 10 at that moment. Changing x later does not change y.', skill='math', level=2)
out(U, 'x = 4\nx = x + 1\nprint(x)', ['4', 'x + 1', '41'], 'Read it as: take the OLD x (4), add 1, store the result back in x.', skill='math')
out(U, 'price = 8\nqty = 3\nprint(price * qty)', ['83', '11', 'price * qty'], 'Variables hold numbers, so * multiplies: 8 times 3.', skill='math')
out(U, 'print(10 / 2)', ['5', '5.0', '20'], 'The / sign ALWAYS gives a float (a number with .0), even when it divides evenly.', skill='math')
out(U, 'print(7 / 2)', ['3', '3.5', '4'], '7 divided by 2 is 3.5.', skill='math')
out(U, 'print(2 + 3 * 4)', ['20', '14', '24'], 'Multiplication happens BEFORE addition (just like in math class): 3*4=12, then 2+12.', skill='math')
out(U, 'print((2 + 3) * 4)', ['14', '20', '24'], 'Brackets first: 2+3=5, then 5*4.', skill='math')
out(U, 'print(10 - 2 * 3)', ['24', '4', '16'], '2*3=6 first, then 10-6.', skill='math')
out(U, 'print(12 / 4 + 1)', ['4', '4.0', '3.0'], '12/4 is 3.0 (a float), plus 1 gives 4.0. Float + int = float.', skill='math', level=2)
out(U, 'a = 6\nb = 4\nprint("Sum:", a + b)', ['Sum: a + b', 'Sum: 64', 'Sum:10'], 'Python works out a + b = 10 and prints it after "Sum:".', skill='math')
out(U, 'a = 6\nb = 4\nprint("Sum: a + b")', ['Sum: 10', 'Sum: 64', 'Error: NameError'], 'Everything inside the quotes is plain text.', skill='math')
out(U, 'total = 5\nprint(total, "apples")', ['total apples', '5apples', '5 apples'], 'The variable is replaced by its value; the comma adds a space.', skill='math')
out(U, 'a = 5\nb = 2\nprint(a * b, a - b, a / b)', ['10 3 2', '10 3 2.5', '7 3 2.5'], 'Three values: 10, 3, and 5/2 = 2.5.', skill='math')
out(U, 'x = 2.5\nprint(x * 2)', ['5', '5.0', '4.5'], 'A float times anything gives a float, so 5.0 not 5.', skill='math')
out(U, 'width = 4\nheight = 3\narea = width * height\nprint("Area:", area)', ['Area: 7', 'Area: width * height', 'Area: 12'], 'area stores 12, then print shows it.', skill='math')
out(U, 'first = "Ice"\nsecond = "cream"\nprint(first + second)', ['Ice cream', 'first + second', 'Ice+cream'], 'Text + text glues, no space.', skill='math')
out(U, 'Name = "Zoe"\nprint(name)', ['Zoe', 'Name', 'Error: SyntaxError'], 'Capital letters matter! Name and name are two different words, and name was never created.', skill='math')
out(U, 'x = 5\nprint(x + 1)\nprint(x)', ['6\n6', '6\n5', '5\n6'], 'print(x + 1) shows 6 but does NOT change x. x is still 5.', skill='math', level=2)
out(U, 'a = 2\na = a * 3\na = a + 1\nprint(a)', ['6', '7', '9'], '2, then 2*3=6, then 6+1=7.', skill='math', level=2)
out(U, 'print(y)', ['0', 'y', 'Error: NameError'], 'You used y without ever creating it with y = something.', skill='math')
out(U, 'x = 7\nprint(x)\nprint(y)', ['7', 'Error: NameError', '7\ny'], 'Python runs line by line. It prints 7, THEN crashes at print(y) because y was never created. Whatever printed before the crash stays on screen.', skill='math', level=3)

typed(U, 'a = 9\nb = 3\nprint(a / b)', 'Division with / always gives a float: 3.0, not 3.', skill='math')
typed(U, 'x = 4\ny = 6\nprint(x * y, x + y)', 'Two values: 24 and 10.', skill='math')
typed(U, 'n = 7\nn = n + n\nprint(n)', '7 + 7 = 14.', skill='math')
typed(U, 'a = 5\nb = 2\nprint("Answer:", a / b)', '5 / 2 = 2.5.', skill='math')
typed(U, 'x = 3\nprint(x * 1.5)', 'int times float = float: 4.5.', skill='math')
typed(U, 'a = 20\nb = 4\nprint(a - b * 2)', 'Multiply first: 4*2 = 8, then 20 - 8 = 12.', skill='math')
typed(U, 'w = "Hi"\nprint(w + w)', 'Text + text = glued: HiHi.', skill='math')

for e, w in [('10 / 2', '/ ALWAYS makes a float.'), ('10 + 5', 'int + int = int.'), ('2 * 3.0', 'Any float in the math makes the answer a float.'),
             ('"hi" + "yo"', 'Text glued to text is still text (str).'), ('7 - 2.5', 'int - float = float.'), ('"3" + "4"', 'Quotes make them text, so + glues: "34" - a str.'),
             ('9 / 3', '/ always gives a float, even when it divides evenly.'), ('3 * 4', 'int * int = int.'), ('2.0 + 2.0', 'float + float = float.'), ('6 * "a"', 'Text times a whole number = repeated text (str).')]:
    ty(U, e, w, skill='math')

fill(U, 'a = 5\nb = 3\nprint(a ___ b)', ['*', '+', '-'], '15', 'We want 15 = 5 times 3.', skill='math')
fill(U, 'x = 10\nx = x ___ 5\nprint(x)', ['+', '-', '*'], '15', 'To get 15 from 10 and 5 we add.', skill='math')
fill(U, 'price = 4\nqty = 5\n___ = price * qty\nprint(total)', ['total', 'Total', '"total"'], '20', 'The name on the left must match the name used in print (case counts).', skill='math')
fill(U, 'age = 11\nprint("Age:", ___)', ['age', '"age"', 'Age'], 'Age: 11', 'Use the variable name WITHOUT quotes to get its value.', skill='math')

fix(U, 'It should print 7 but prints the word total. Fix it.', 'a = 3\nb = 4\ntotal = a + b\nprint("total")', 'a = 3\nb = 4\ntotal = a + b\nprint(total)', [[]],
    'Quotes turn a variable name into plain text.', skill='math')
fix(U, 'It crashes with NameError. Fix it so it prints 10.', 'score = 10\nprint(Score)', 'score = 10\nprint(score)', [[]],
    'Score and score are different names.', skill='math')
fix(U, 'It should print 12 but prints 7. Fix it.', 'a = 3\nb = 4\nprint(a + b)', 'a = 3\nb = 4\nprint(a * b)', [[]],
    'The problem says multiply, so use *.', skill='math')
fix(U, 'It should print 10 (5 plus 5), but prints 5. Fix it.', 'x = 5\nx + 5\nprint(x)', 'x = 5\nx = x + 5\nprint(x)', [[]],
    'x + 5 on its own is calculated and thrown away. You must store it back: x = x + 5.', skill='math', level=3)

write(U, 'Make variables <b>a = 8</b> and <b>b = 2</b>. Print their sum, then their product on the next line. (Expected: 10 then 16)',
      'a = 8\nb = 2\nprint(a + b)\nprint(a * b)', [[]], ['Create a and b first.', 'a = 8\nb = 2'],
      'Variables let you reuse numbers.', skill='math', must=[[r'\ba\b', 'Use variables a and b.']])
write(U, 'Make a variable <b>score = 10</b>. Add 5 to it (store it back in score) and print: <b>Score: 15</b>',
      'score = 10\nscore = score + 5\nprint("Score:", score)', [[]], ['score = score + 5 changes the stored value.', 'Then print("Score:", score)'],
      'x = x + 5 updates a variable.', skill='math', must=[[r'score\s*=\s*score', 'Update the variable with score = score + 5']])
write(U, 'A box is <b>w = 6</b> wide and <b>h = 4</b> tall. Make variables and print <b>Area: 24</b> (calculated by Python).',
      'w = 6\nh = 4\nprint("Area:", w * h)', [[]], ['Make w and h, then print("Area:", ...)'],
      'Use variables in your math.', skill='math', must=[[r'w\s*\*\s*h|h\s*\*\s*w', 'Calculate with w * h.']])

know(U, 'What does x = 7 do?', ['Stores the value 7 in the name x', 'Asks whether x is equal to 7', 'Prints the number 7 on the screen', 'Turns x into the text "7"'], 'One = is "store". It is not asking a question.', skill='math')
know(U, 'Which is a GOOD variable name?', ['my_age', 'my age', '2cool', 'my-age'], 'Names cannot have spaces, cannot start with a number, and cannot have dashes. Underscores are fine.', skill='math')
know(U, 'After x = 3 then x = x + 2, what is x?', ['5', '3', '2', '32'], 'Take the old x (3), add 2, store the result (5).', skill='math')
know(U, 'What does the / operator always give?', ['A float (like 2.0)', 'An int (like 2)', 'A str (like "2")', 'An error when it divides evenly'], '10 / 5 gives 2.0, not 2.', skill='math')
know(U, 'Which is calculated FIRST in 2 + 3 * 4 ?', ['3 * 4', '2 + 3', 'All at once', 'Left to right'], 'Multiplication before addition, just like math class.', skill='math')
