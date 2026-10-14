from dsl import *
U = 1
# ---------- what does it print ----------
out(U, 'print("Hello")', ['"Hello"', 'print("Hello")', 'hello'], 'Quotes tell Python "this is text". Python prints the text but NOT the quotes.')
out(U, "print('Hi there')", ["'Hi there'", 'Error: SyntaxError', 'Hi'], 'Single quotes and double quotes both make text. The quotes are never printed.')
out(U, 'print(Hello)', ['Hello', '"Hello"', 'Error: SyntaxError'], 'No quotes means Python looks for a VARIABLE named Hello. There is none, so: NameError.')
out(U, 'print(2 + 3)', ['2 + 3', '23', '"5"'], 'No quotes around numbers: Python does the math first, then prints the answer.')
out(U, 'print("2 + 3")', ['5', '23', 'Error: TypeError'], 'Quotes make it text. Text is printed exactly as written - no math happens.')
out(U, 'print("Hi", "there")', ['Hithere', 'Hi,there', 'Hi", "there'], 'A comma between things in print() prints them with ONE SPACE between.', skill='join')
out(U, 'print("Hi" + "there")', ['Hi there', 'Hi+there', 'Error: TypeError'], '+ glues text to text with NO space. You have to add the space yourself.', skill='join')
out(U, 'print("Hi " + "there")', ['Hithere', 'Hi  there', 'Hi + there'], 'The space is INSIDE the first quotes ("Hi "), so it is part of the text.', skill='join')
out(U, 'print("5" + "5")', ['10', '5 + 5', 'Error: TypeError'], 'Both are text, so + glues them: "5" then "5" makes 55. No math happens on text.', skill='join')
out(U, 'print(5 + 5)', ['55', '"10"', '5 + 5'], 'Both are numbers, so + adds them.', skill='join')
out(U, 'print("Score:", 10)', ['Score:10', 'Score: "10"', 'Error: TypeError'], 'The comma lets you mix text and numbers. Python adds one space.', skill='join')
out(U, 'print("Score:" + 10)', ['Score:10', 'Score: 10', 'Error: SyntaxError'], '+ can join text+text or add number+number, but NOT text+number. Use a comma instead.', skill='join')
out(U, 'print("I have", 3, "cats")', ['I have3cats', 'I have 3 cats.', 'Error: TypeError'], 'Each comma = one space. Text and numbers can be mixed with commas.', skill='join')
out(U, 'print("a")\nprint("b")', ['ab', 'a b', 'b\na'], 'Every print() starts a NEW line, and they run top to bottom.')
out(U, 'print(10 - 4, 10 * 2)', ['6, 20', '6 20', '40'], 'Each value is worked out separately, then printed with a space between.', skill='join')
out(U, 'print("10 - 4")', ['6', '10-4', 'Error: TypeError'], 'In quotes = text. Printed exactly as typed.')
out(U, 'print(3, "+", 4, "=", 3 + 4)', ['3+4=7', '3 + 4 = 7', '7'], 'Text pieces and numbers are all separated by single spaces.', skill='join')
out(U, 'print("Tom said "hi"")', ['Tom said "hi"', 'Tom said hi', 'Error: NameError'], 'The quote after "said " ENDS the text early. Python gets confused: SyntaxError. Use single quotes outside: \'Tom said "hi"\'.')
out(U, 'Print("Hi")', ['Hi', 'Error: SyntaxError', 'Error: TypeError'], 'Python is case-sensitive. Print is not print, so Python says it does not know the word Print: NameError.')
out(U, 'print("Hello"', ['Hello', 'Error: NameError', 'Error: TypeError'], 'The ( was never closed with ). That is a SyntaxError.')
out(U, 'print "Hello"', ['Hello', 'Error: NameError', 'Error: TypeError'], 'print needs parentheses: print("Hello"). Without them: SyntaxError.')
out(U, 'print("Ha" * 3)', ['Ha3', 'HaHaHa', 'Ha Ha Ha'], 'Text times a whole number repeats the text. No spaces are added.', skill='join', level=2)
out(U, 'print("-" * 10)', ['-10', '----------', '10'], 'The text "-" repeated 10 times.', skill='join', level=2)
out(U, 'print("Hello" , "World" , "!")', ['Hello World!', 'Hello World !', 'HelloWorld!'], 'Commas always add a space, even before the "!".', skill='join', level=2)
out(U, 'print("Total: " + "5" + "0")', ['Total: 50', 'Total: 5', 'Total: 5 0'], 'Three pieces of text glued together: "Total: " then "5" then "0".', skill='join', level=2)
out(U, 'print(6 * 7)', ['6 * 7', '67', '42'], 'No quotes - Python does the math: 6 times 7.')
out(U, 'print(100 - 1)', ['100 - 1', '99', '101'], 'Python is a calculator when there are no quotes.')

# ---------- type the output ----------
typed(U, 'print("Python", "is", "fun")', 'Commas put one space between each piece.', skill='join')
typed(U, 'print("Good" + "bye")', '+ glues with no space: Goodbye.', skill='join')
typed(U, 'print(7 * 6)', 'No quotes, so Python multiplies.')
typed(U, 'print("Total:", 4 + 5)', 'Python works out 4 + 5 first (that is 9), then prints it after "Total:" with a space.', skill='join')
typed(U, 'print("a" + "b" + "c")', 'Three pieces of text glued together.', skill='join')
typed(U, 'print("one")\nprint("two")', 'Two prints = two lines.')
typed(U, 'print(8, "x", 2, "=", 8 * 2)', 'Spaces appear between every comma-separated piece.', skill='join')

# ---------- fill in the blank ----------
fill(U, 'print(___)', ['"Hello"', 'Hello', 'hello"'], 'Hello', 'Text must be wrapped in quotes.', skill='print')
fill(U, 'print("Good" ___ "day")', [',', '+', '-'], 'Good day', 'A comma adds a space between the pieces. + would give Goodday.', skill='join')
fill(U, 'print("Good" ___ "day")', ['+', ',', '*'], 'Goodday', 'We want NO space between them, so use +.', skill='join')
fill(U, 'print("Age:" ___ 11)', [',', '+', '-'], 'Age: 11', 'You cannot + text and a number. A comma works with both.', skill='join')
fill(U, 'print(___ + 4)', ['10', '"10"', 'ten'], '14', 'For math, the number is NOT in quotes.', skill='print')
fill(U, '___("Hi")', ['print', 'Print', 'say'], 'Hi', 'The command is all lowercase: print.', skill='print')

# ---------- what is wrong? fix it ----------
fix(U, 'The quote is never closed. Fix it so it prints Hello World.', 'print("Hello World)', 'print("Hello World")', [[]],
    'Every opening quote needs a closing quote.', skill='print')
fix(U, 'Python says: name Print is not defined. Fix it.', 'Print("Hi!")', 'print("Hi!")', [[]],
    'Python is case-sensitive: always a lowercase p.', skill='print')
fix(U, 'It should print Age: 12 but it crashes. Fix it.', 'print("Age:" + 12)', 'print("Age:", 12)', [[]],
    'Text + number crashes. Use a comma between them.', skill='join')
fix(U, 'It should print Hello there (as text). Fix it.', 'print(Hello there)', 'print("Hello there")', [[]],
    'Text needs quotes.', skill='print')
fix(U, 'It should print: My name is Sam (with spaces). Fix it.', 'print("My name is" "Sam")', 'print("My name is", "Sam")', [[]],
    'Two pieces of text side by side with nothing between them get stuck together. Put a comma between them.', skill='join')
fix(U, 'The bracket ( is never closed. Fix it so it prints Done.', 'print("Done"', 'print("Done")', [[]],
    'Every ( needs a matching ).', skill='print')
fix(U, 'It should print the ANSWER to 4 + 4, not the text. Fix it.', 'print("4 + 4")', 'print(4 + 4)', [[]],
    'Remove the quotes so Python does the math.', skill='print')

# ---------- write it ----------
write(U, 'Print exactly: <b>Hello, World!</b>', 'print("Hello, World!")', [[]],
      ['Text goes inside quotes.', 'The command is print( ... ) with the quotes INSIDE the brackets.', 'print("Hello, World!")'],
      'The quotes are not printed, only the text inside.', skill='print')
write(U, 'Use Python as a calculator: print the answer to <b>25 + 17</b>. (Do not just type the answer!)',
      'print(25 + 17)', [[]], ['No quotes around the math.', 'print(25 + 17)'],
      'Without quotes Python does the math for you.', skill='print', must=[[r'25\s*\+\s*17', 'Let Python do the math: use 25 + 17 in your code.']])
write(U, 'Print the line <b>I am 11 years old</b> using ONE print and commas between "I am", the number 11, and "years old".',
      'print("I am", 11, "years old")', [[]], ['Three pieces separated by two commas.', 'print("I am", 11, "years old")'],
      'Commas add the spaces for you.', skill='join', must=[[r',', 'Use commas between the pieces.']])
write(U, 'Print two lines. Line 1: <b>Python</b>  Line 2: <b>is fun</b>', 'print("Python")\nprint("is fun")', [[]],
      ['You need two print commands.', 'print("Python")', 'print("Python")\nprint("is fun")'],
      'One print = one line.', skill='print')
write(U, 'Use <b>+</b> to glue "Good" and "bye" into one word: <b>Goodbye</b>', 'print("Good" + "bye")', [[]],
      ['Two quoted pieces with a + between them.', 'print("Good" + "bye")'],
      '+ puts text together with no space.', skill='join', must=[[r'\+', 'Use the + sign to glue the text.']])
write(U, 'Print <b>Result: 48</b>, where 48 is calculated by Python as 6 * 8. Use a comma after "Result:".',
      'print("Result:", 6 * 8)', [[]], ['The first piece is text, the second piece is math with no quotes.', 'print("Result:", 6 * 8)'],
      'Text, comma, math.', skill='join', must=[[r'6\s*\*\s*8', 'Let Python do 6 * 8.']])

# ---------- concept ----------
know(U, 'What do the quotation marks in print("Hi") do?', ['They tell Python the words are TEXT', 'They get printed on the screen with the words', 'They tell Python to do math on the words', 'They are only decoration inside print()'],
     'Quotes mark where text starts and stops. They are not printed.', skill='print')
know(U, 'Which one prints the ANSWER 9?', ['print(4 + 5)', 'print("4 + 5")', 'print("9")+', 'Print(4 + 5)'],
     'Only the one without quotes does math. print("4 + 5") prints the text 4 + 5.', skill='print')
know(U, 'Which line contains a mistake?', ['print("Hello)', "print('Hello')", 'print("Hello")', 'print(5 + 5)'],
     'It opens with " but never closes it.', skill='print', level=1)
know(U, 'A comma between two things inside print() ...', ['prints a space between them', 'prints a comma between them', 'joins them with no space', 'causes an error'],
     'Commas inside print() become one space in the output.', skill='join')
know(U, 'What is the difference between print("5" + "5") and print(5 + 5)?', ['The first prints 55, the second prints 10', 'Both print 10', 'The first prints 10, the second prints 55', 'Both print 55'],
     'Text + text glues. Number + number adds.', skill='join')
