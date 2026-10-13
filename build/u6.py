from dsl import *
U = 6
typed(U, 'a = int(input())\nb = int(input())\nprint("Sum:", a + b)\nprint("Product:", a * b)', 'Two prints = two lines; 3+4=7 and 3*4=12.', stdin=['3', '4'], skill='programs')
typed(U, 'celsius = float(input())\nf = celsius * 9 / 5 + 32\nprint(f)', '100 * 9 / 5 + 32 = 212.0', stdin=['100'], skill='programs')
typed(U, 'price = float(input())\nqty = int(input())\nprint("Total:", price * qty)', '2.5 * 4 = 10.0', stdin=['2.5', '4'], skill='programs')
typed(U, 'name = input()\nage = int(input())\nprint(name, "will be", age + 1, "next year")', 'Ana will be 11 next year', stdin=['Ana', '10'], skill='programs')
typed(U, 'w = int(input())\nh = int(input())\nprint("Perimeter:", 2 * (w + h))', '2 * (5 + 3) = 16', stdin=['5', '3'], skill='programs')
typed(U, 'hours = int(input())\nminutes = hours * 60\nprint(hours, "hours is", minutes, "minutes")', '3 hours is 180 minutes', stdin=['3'], skill='programs')
typed(U, 'a = float(input())\nb = float(input())\nprint(a - b)', '10.0 - 4.0 = 6.0 (floats keep the .0)', stdin=['10', '4'], skill='programs')
typed(U, 'a = input()\nb = input()\nprint(a + b)\nprint(int(a) + int(b))', 'First line: text glued 105. Second: numbers added 15.', stdin=['10', '5'], skill='programs', level=3)
typed(U, 'x = int(input())\nx = x * 2\nx = x + 1\nprint(x)', '5 -> 10 -> 11', stdin=['5'], skill='programs')
typed(U, 'total = float(input())\npeople = int(input())\nprint("Each pays", total / people)', '30 / 3 = 10.0', stdin=['30', '3'], skill='programs')
typed(U, 'first = input()\nlast = input()\nprint("Hello,", first + " " + last + "!")', 'Hello, Ada Lovelace!', stdin=['Ada', 'Lovelace'], skill='programs', level=3)
typed(U, 'm = int(input())\nprint(m, "minutes =", m * 60, "seconds")', '2 minutes = 120 seconds', stdin=['2'], skill='programs')

out(U, 'a = int(input())\nb = int(input())\nprint(a + b)\nprint(a - b)', ['7\n-1', '7\n1', '34\n-1'], '3+4=7 and 3-4=-1.', stdin=['3', '4'], skill='programs')
out(U, 'h = float(input())\nw = float(input())\nprint(h * w)', ['12', '34', '12.0'], 'Floats give 12.0.', stdin=['3', '4'], skill='programs')
out(U, 'n = int(input())\nprint(n, "doubled is", n * 2)', ['5 doubled is 10', '5 doubled is 55', '10 doubled is 5'], 'n is a number.', stdin=['5'], skill='programs')
out(U, 'name = input()\nprint("Hello " + name + "!")', ['Hello name!', 'Hello Zoe !', 'Hello Zoe!'], 'Glued with +: spaces only where we typed them.', stdin=['Zoe'], skill='programs')
out(U, 'name = input()\nprint("Hello", name, "!")', ['Hello Zoe!', 'Hello Zoe !', 'HelloZoe!'], 'Commas add a space before the !.', stdin=['Zoe'], skill='programs')
out(U, 'x = int(input())\ny = int(input())\nprint(x / y)', ['3', '2', '2.0'], '8 / 4 = 2.0 (float).', stdin=['8', '4'], skill='programs')
out(U, 'x = int(input())\ny = int(input())\nprint(x / y)', ['2', '0', 'Error: ZeroDivisionError'], 'Dividing by zero.', stdin=['5', '0'], skill='programs', level=2)
out(U, 'a = float(input())\nb = float(input())\nprint((a + b) / 2)', ['3', '2.5', '3.0'], 'Average: (2+4)/2 = 3.0', stdin=['2', '4'], skill='programs')

write(U, 'Ask for the user\'s name. Print <b>Hello, </b>+name+<b>!</b> exactly: typing <b>Ana</b> prints <b>Hello, Ana!</b>',
      'name = input()\nprint("Hello, " + name + "!")', [['Ana'], ['Leo'], ['Mia']], ['Use + so you control every space.', 'print("Hello, " + name + "!")'],
      'Glue text pieces with +.', skill='programs')
write(U, 'Ask for a rectangle\'s width and height (whole numbers). Print two lines: <b>Area: 12</b> and <b>Perimeter: 14</b> (for 3 and 4).',
      'w = int(input())\nh = int(input())\nprint("Area:", w * h)\nprint("Perimeter:", 2 * (w + h))', [['3', '4'], ['5', '5'], ['10', '2']],
      ['Two inputs, two prints.', 'Perimeter = 2 * (w + h)'], 'Convert, calculate, print.', skill='programs')
write(U, 'Ask for three numbers (decimals allowed). Print their <b>average</b>. 3, 6, 9 prints 6.0',
      'a = float(input())\nb = float(input())\nc = float(input())\nprint((a + b + c) / 3)', [['3', '6', '9'], ['1', '2', '3'], ['10', '20', '30']],
      ['Add them in brackets, then divide by 3.', 'print((a + b + c) / 3)'], 'Average = sum / count.', skill='programs',
      alts=['a = float(input())\nb = float(input())\nc = float(input())\ntotal = a + b + c\nprint(total / 3)'])
write(U, 'Ask for a temperature in Celsius (decimals allowed). Print it in Fahrenheit: F = C * 9 / 5 + 32. For 100 it prints 212.0',
      'c = float(input())\nprint(c * 9 / 5 + 32)', [['100'], ['0'], ['20'], ['-40']], ['Convert to float first.', 'c * 9 / 5 + 32'], 'Follow the formula.', skill='programs',
      alts=['c = float(input())\nprint(9 / 5 * c + 32)', 'c = float(input())\nf = c * 9 / 5 + 32\nprint(f)', 'c = float(input())\nprint((c * 9) / 5 + 32)'])
write(U, 'A pizza costs a price you type (decimal). Ask the price, then ask how many pizzas (whole number). Print <b>Total: </b> and the total cost. Typing 8.5 then 2 prints <b>Total: 17.0</b>',
      'price = float(input())\nn = int(input())\nprint("Total:", price * n)', [['8.5', '2'], ['10', '3'], ['2.25', '4']],
      ['price float, number int.', 'print("Total:", price * n)'], 'Multiply then print with a comma.', skill='programs')
write(U, 'Ask for a number of hours (whole). Print the number of <b>minutes</b> and the number of <b>seconds</b> on two lines. 2 prints 120 then 7200.',
      'h = int(input())\nprint(h * 60)\nprint(h * 3600)', [['2'], ['1'], ['10']], ['Minutes = hours * 60.', 'Seconds = hours * 3600.'], 'Chain the math.', skill='programs',
      alts=['h = int(input())\nm = h * 60\nprint(m)\nprint(m * 60)'])
write(U, 'Ask how much money was paid and the price (decimals). Print the <b>change</b>. 20 and 12.5 prints 7.5',
      'paid = float(input())\ncost = float(input())\nprint(paid - cost)', [['20', '12.5'], ['10', '2.25'], ['5', '5']], ['change = paid - cost', 'Use float() for both.'], 'Subtract.', skill='programs')
write(U, 'Ask for a total bill (decimal) and the number of people (whole number). Print how much <b>each person pays</b>. 30 and 3 prints 10.0',
      'bill = float(input())\npeople = int(input())\nprint(bill / people)', [['30', '3'], ['45.5', '2'], ['100', '8']], ['Divide the bill by the people.', 'bill float, people int.'], 'Share equally.', skill='programs')
write(U, 'Ask for an <b>adjective</b> then a <b>noun</b>. Print: <b>The big dog ran away.</b> (if they typed big and dog). Use + to control spaces.',
      'adj = input()\nnoun = input()\nprint("The " + adj + " " + noun + " ran away.")', [['big', 'dog'], ['tiny', 'cat'], ['slow', 'robot']],
      ['Glue 5 pieces with +.', '"The " + adj + " " + noun + " ran away."'], 'Careful with the spaces.', skill='programs', must=[[r'\+', 'Use + to glue the pieces.']])
write(U, 'Ask for the user\'s name, then their age (whole number). Print: <b>Ana will be 21 in 10 years.</b> (typing Ana and 11).',
      'name = input()\nage = int(input())\nprint(name, "will be", age + 10, "in 10 years.")', [['Ana', '11'], ['Leo', '8'], ['Mia', '12']],
      ['Use commas so the number can be mixed with text.', 'print(name, "will be", age + 10, "in 10 years.")'], 'Convert age before adding.', skill='programs',
      alts=['name = input()\nage = int(input())\nprint(name + " will be " + str(age + 10) + " in 10 years.")'])
write(U, 'Ask for a speed in km/h and a time in hours (both can be decimals). Print the distance. 60 and 2.5 prints 150.0',
      'speed = float(input())\ntime = float(input())\nprint(speed * time)', [['60', '2.5'], ['10', '4'], ['5.5', '2']], ['distance = speed * time', 'float both.'], 'Distance = speed times time.', skill='programs')
write(U, 'Ask for two whole numbers. Print FOUR lines: the first number, the second number, their sum, their product. Typing 3 and 4 prints 3, 4, 7, 12 (one per line).',
      'a = int(input())\nb = int(input())\nprint(a)\nprint(b)\nprint(a + b)\nprint(a * b)', [['3', '4'], ['5', '6'], ['0', '7']],
      ['Four prints.', 'Convert both first.'], 'Plan the steps.', skill='programs', level=3)

fix(U, 'The program should print the average of the two numbers, but it prints the wrong value. Fix it.', 'a = float(input())\nb = float(input())\nprint(a + b / 2)',
    'a = float(input())\nb = float(input())\nprint((a + b) / 2)', [['2', '4'], ['10', '20']], 'Brackets: add first, then divide.', skill='programs')
fix(U, 'It should print the total cost, but it crashes. Fix it.', 'price = input()\nqty = input()\nprint("Total:", price * qty)',
    'price = float(input())\nqty = int(input())\nprint("Total:", price * qty)', [['2.5', '4'], ['10', '3']], 'Convert both before multiplying.', skill='programs')
fix(U, 'Fahrenheit is wrong. The formula is C * 9 / 5 + 32. Fix it.', 'c = float(input())\nprint(c * 9 / 5 - 32)',
    'c = float(input())\nprint(c * 9 / 5 + 32)', [['100'], ['0']], 'It must be + 32.', skill='programs', level=3)
fix(U, 'It should print the perimeter of a rectangle but prints the wrong number. Fix it.', 'w = int(input())\nh = int(input())\nprint(2 * w + h)',
    'w = int(input())\nh = int(input())\nprint(2 * (w + h))', [['3', '4'], ['5', '5']], 'Both sides are doubled: brackets needed.', skill='programs', level=3)
fix(U, 'Two numbers are asked but the program always prints 0. Fix it so it prints the sum.', 'a = int(input())\nb = int(input())\nsum = 0\nprint(sum)',
    'a = int(input())\nb = int(input())\nsum = a + b\nprint(sum)', [['3', '4'], ['10', '5']], 'The sum variable must be assigned a + b.', skill='programs', level=3)
