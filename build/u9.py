from dsl import *
U = 9
S = 'loops'

# ------------------------------------------------------------------ out (predict the output)
out(U, 'for i in range(3):\n    print(i)', ['1\n2\n3', '0\n1\n2\n3', '3'],
    'range(3) gives 0, 1, 2. It starts at 0 and stops BEFORE 3, so the body runs 3 times and prints 3 lines.', skill=S, level=1)
out(U, 'for i in range(5):\n    print("Hi")', ['Hi\nHi\nHi\nHi', 'Hi\nHi\nHi\nHi\nHi\nHi', 'Hi'],
    'range(5) makes 5 rounds (0, 1, 2, 3, 4). The body never uses i, but it still runs once per round: 5 lines of Hi.', skill=S, level=1)
out(U, 'for i in range(1, 5):\n    print(i)', ['1\n2\n3\n4\n5', '0\n1\n2\n3\n4', '2\n3\n4'],
    'range(1, 5) starts AT 1 and stops BEFORE 5, so i is 1, 2, 3, 4. The stop number is never reached.', skill=S, level=1)
out(U, 'for i in range(3):\n    print(i * 2)', ['2\n4\n6', '0\n2\n4\n6', '0\n1\n2'],
    'i is 0, then 1, then 2. Each round prints i * 2, which is 0, 2, 4.', skill=S, level=1)
out(U, 'for i in range(0, 10, 3):\n    print(i)', ['3\n6\n9', '0\n3\n6\n9\n12', '0\n3\n6'],
    'range(0, 10, 3) starts at 0 and adds 3 each time: 0, 3, 6, 9. The next one would be 12, which is past 10, so it stops.', skill=S, level=2)
out(U, 'for i in range(5, 0, -1):\n    print(i)', ['5\n4\n3\n2\n1\n0', '4\n3\n2\n1\n0', '1\n2\n3\n4\n5'],
    'The step -1 counts down: 5, 4, 3, 2, 1. It stops BEFORE the stop number 0, so 0 is never printed.', skill=S, level=2)
out(U, 'for i in range(4):\n    print(i, end="")', ['0 1 2 3', '0\n1\n2\n3', '3210'],
    'end="" tells print not to start a new line, so the numbers 0, 1, 2, 3 stick together on one line: 0123.', skill=S, level=2)
out(U, 'total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)', ['15', '6', '4'],
    'i is 1, 2, 3, 4 (not 5). total grows 0, 1, 3, 6, 10. The answer is 10.', skill=S, level=2)
out(U, 'p = 1\nfor i in range(1, 5):\n    p = p * i\nprint(p)', ['120', '10', '4'],
    'p starts at 1 and is multiplied by 1, 2, 3, 4: 1, 2, 6, 24. range(1, 5) stops before 5, so 5 is not included.', skill=S, level=2)
out(U, 'total = 0\nfor i in range(3):\n    total = total + i\n    print(total)', ['0\n1\n2', '1\n3\n6', '3'],
    'The print is INSIDE the loop (indented), so it shows total every round: 0, then 0+1 = 1, then 1+2 = 3.', skill=S, level=3)
out(U, 'for i in range(3):\nprint(i)', ['0\n1\n2', '3', 'Error: SyntaxError'],
    'The line after for ...: must be indented. Without the indent Python stops with an IndentationError before running anything.', skill=S, level=1)
out(U, 'for i in range(3)\n    print(i)', ['0\n1\n2', 'Error: IndentationError', 'Error: NameError'],
    'The for line has no colon at the end. Python cannot read the program, so it stops with a SyntaxError.', skill=S, level=1)
out(U, 'n = 1\nwhile n < 4:\n    print(n)\n    n = n + 1', ['1\n2\n3\n4', '2\n3\n4', '0\n1\n2\n3'],
    'The loop runs while n < 4. n is 1, 2, 3 and prints each time. When n becomes 4 the test 4 < 4 is False, so the loop stops.', skill=S, level=1)
out(U, 'n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("Go!")', ['3\n2\n1\n0\nGo!', '2\n1\n0\nGo!', '3\n2\n1'],
    'n counts 3, 2, 1 and each is printed. When n reaches 0 the test 0 > 0 is False, so the loop ends. Go! is not indented, so it prints once after the loop.', skill=S, level=1)
out(U, 'x = 1\nwhile x < 20:\n    x = x * 2\nprint(x)', ['16', '20', '40'],
    'x goes 1, 2, 4, 8, 16, 32. At 16 the test 16 < 20 is still True, so it doubles once more to 32. Then 32 < 20 is False and the loop stops.', skill=S, level=2)
out(U, 'for i in range(1, 10):\n    if i == 4:\n        break\n    print(i)', ['1\n2\n3\n4', '4', '1\n2\n3\n5\n6\n7\n8\n9'],
    'When i reaches 4, break ends the whole loop right away, before the print. Only 1, 2, 3 were printed.', skill=S, level=2)
out(U, 'for i in range(1, 6):\n    if i == 3:\n        continue\n    print(i)', ['1\n2', '1\n2\n3\n4\n5', '3'],
    'continue skips the rest of ONE round and goes to the next. When i is 3 the print is skipped, but the loop keeps going: 1, 2, 4, 5.', skill=S, level=2)
out(U, 'n = int(input())\ntotal = 0\nfor _ in range(n):\n    total = total + int(input())\nprint(total)', ['38', '15', '20'],
    'The first input, 3, says how many numbers follow. The loop reads 3 numbers (5, 10, 20) and adds them: 35. The 3 itself is not added.',
    stdin=['3', '5', '10', '20'], skill=S, level=2)
out(U, 'count = 0\nfor i in range(1, 8):\n    if i % 2 == 0:\n        count = count + 1\nprint(count)', ['4', '7', '2'],
    'i goes 1 to 7. The even ones are 2, 4, 6, so count goes up 3 times. It prints 3.', skill=S, level=2)
out(U, 'total = 0\nn = 1\nwhile total < 10:\n    total = total + n\n    n = n + 1\nprint(total, n)', ['10 4', '10 10', '9 5'],
    'total goes 1, 3, 6, 10 and n goes up each round: 2, 3, 4, 5. Once total is 10 the test 10 < 10 is False. It prints total 10 and n 5.', skill=S, level=3)
out(U, 'for i in range(1, 3):\n    for j in range(1, 4):\n        print(i * j, end=" ")\n    print()', ['1 2 3 2 4 6', '1 2\n2 4\n3 6', '1 2 3\n2 4 6\n3 6 9'],
    'For each i (1, then 2) the inner loop runs j = 1, 2, 3 and prints i * j on one line. The empty print() then starts a new line. Row 1: 1 2 3. Row 2: 2 4 6.', skill=S, level=3)
out(U, 'for i in range(4):\n    pass\nprint(i)', ['4', '0', 'Error: NameError'],
    'The loop variable keeps its last value after the loop ends. i went 0, 1, 2, 3, so print(i) shows 3 (not 4).', skill=S, level=3)

# ------------------------------------------------------------------ typed
typed(U, 'for i in range(4):\n    print(i + 1)', 'i is 0, 1, 2, 3, so i + 1 is 1, 2, 3, 4. One number per line.', skill=S, level=1)
typed(U, 'for i in range(3, 0, -1):\n    print(i)\nprint("Liftoff!")', 'The loop counts 3, 2, 1 (it stops before 0). Liftoff! is outside the loop, so it prints once at the end.', skill=S, level=1)
typed(U, 'count = 0\nfor i in range(10):\n    count = count + 1\nprint(count)', 'range(10) makes 10 rounds, and each round adds 1 to count, so count ends at 10.', skill=S, level=1)
typed(U, 'total = 0\nfor i in range(1, 4):\n    total = total + i\n    print(total)', 'The print is inside the loop. total becomes 1, then 1 + 2 = 3, then 3 + 3 = 6, and each value is printed.', skill=S, level=2)
typed(U, 'x = 10\nfor i in range(3):\n    x = x - i\nprint(x)', 'i is 0, 1, 2. x goes 10 - 0 = 10, then 10 - 1 = 9, then 9 - 2 = 7.', skill=S, level=2)
typed(U, 'n = int(input())\nfor i in range(n):\n    print("Row", i)', 'The input is 3, so range(3) gives i = 0, 1, 2. Rows are numbered from 0, so there is no Row 3.', stdin=['3'], skill=S, level=2)
typed(U, 'for i in range(1, 20, 5):\n    print(i, end=" ")', 'Start at 1 and add 5 each time: 1, 6, 11, 16. The next, 21, is past 20. They all stay on one line.', skill=S, level=2)
typed(U, 'n = 5\nwhile n > 0:\n    n = n - 2\nprint(n)', 'n goes 5, 3, 1, then 1 - 2 = -1. The test -1 > 0 is False, so the loop stops and prints -1 (it does not stop at 0).', skill=S, level=3)
typed(U, 'for i in range(2):\n    for j in range(2):\n        print(i, j)', 'The inner loop finishes completely for each i. i = 0 pairs with j = 0, 1 and then i = 1 pairs with j = 0, 1. That is 4 lines.', skill=S, level=3)
typed(U, 'total = 0\nfor i in range(1, 10):\n    total = total + i\n    if total > 8:\n        break\nprint(total, i)', 'total goes 1, 3, 6, 10. At i = 4 total is 10, which is above 8, so break stops the loop. i is still 4, so it prints 10 4.', skill=S, level=3)

# ------------------------------------------------------------------ ty
ty(U, 'i', 'The loop variable i takes the values 0, 1, 2 from range(3), and those are whole numbers.', setup='for i in range(3):\n    pass',
   skill=S, level=1, choices=['int', 'float', 'str', 'bool'])
ty(U, 'total', 'total starts as the whole number 0, but adding 0.5 each round makes it a float. A float plus anything stays a float.',
   setup='total = 0\nfor i in range(3):\n    total = total + 0.5', skill=S, level=2, choices=['int', 'float', 'str', 'bool'])

# ------------------------------------------------------------------ line (which line crashes)
line(U, 'total = 0\nfor i in range(5):\n    total = total + 10 // (3 - i)\nprint(total)',
     'At i = 3 the bottom of the division is 3 - 3 = 0, so line 3 crashes with ZeroDivisionError. The loop body is on line 3.', skill=S, level=3)
line(U, 'n = 3\nwhile n > 0\n    print(n)\n    n = n - 1',
     'The while line (line 2) has no colon at the end, so Python reports a SyntaxError there.', skill=S, level=1)
line(U, 'for i in range(1, 4):\n    total = total + i\nprint(total)',
     'total was never created before the loop. On the very first round, line 2 tries to read it and fails with NameError.', skill=S, level=2)
line(U, 'total = 0\nfor i in range(3):\n    n = input()\n    total = total + n\nprint(total)',
     'input() gives text. Line 4 tries to add text to the number total, which is a TypeError. The fix is int(input()) on line 3.', stdin=['4', '5', '6'], skill=S, level=2)
line(U, 'total = 0\nfor i in range(3):\ntotal = total + i\nprint(total)',
     'Line 3 is the loop body but it is not indented, so Python stops with IndentationError on line 3.', skill=S, level=1)
line(U, 'n = float(input())\nfor i in range(n):\n    print(i)',
     'float(input()) makes 3.0, a decimal. range() only accepts whole numbers, so line 2 crashes with a TypeError. Use int(input()).', stdin=['3'], skill=S, level=3)

# ------------------------------------------------------------------ fill
fill(U, 'for i in ___(4):\n    print(i)', ['range', 'list', 'print'], '0\n1\n2\n3', 'range(4) is what produces 0, 1, 2, 3 for the loop to walk through.', skill=S, level=1)
fill(U, 'total = 0\nfor i in range(1, 6):\n    total = total ___ i\nprint(total)', ['+', '*', '-'], '15', 'To ADD up 1 + 2 + 3 + 4 + 5 = 15 we need +. With * the total stays 0 (0 times anything is 0).', skill=S, level=1)
fill(U, 'for i in range(___, 0, -1):\n    print(i)', ['3', '0', '-1'], '3\n2\n1', 'A countdown has to START at 3 and step down by 1 until just before 0.', skill=S, level=2)
fill(U, 'n = 1\nwhile n ___ 4:\n    print(n)\n    n = n + 1', ['<=', '<', '>'], '1\n2\n3\n4', 'To include 4, the test must still be True when n is 4. n <= 4 does that. With < the loop stops one too early, and with > it never runs.', skill=S, level=2)
fill(U, 'for i in range(3):\n    print(i, ___="")', ['end', 'sep', 'stop'], '012', 'end="" removes the new line after each print, so 0 1 2 stay side by side. sep only matters between several values in one print.', skill=S, level=2)
fill(U, 'count = 0\nfor i in range(10):\n    if i % 2 == 0:\n        ___\nprint(count)', ['count = count + 1', 'count = 1', 'i = i + 1'], '5',
     'Even numbers from 0 to 9 are 0, 2, 4, 6, 8, that is 5 of them. A counter must add 1 to itself each time: count = count + 1.', skill=S, level=2)

# ------------------------------------------------------------------ fix
fix(U, 'It should add up 1 + 2 + ... + n (for n = 5 that is 15), but it prints just the last number. Fix it.',
    'n = int(input())\nfor i in range(1, n + 1):\n    total = 0\n    total = total + i\nprint(total)',
    'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + i\nprint(total)',
    [['5'], ['10'], ['3']], 'total = 0 is INSIDE the loop, so it resets to 0 every round. Put it before the loop so it runs only once.', skill=S, level=2)
fix(U, 'It should print the sum of 1 to n (n = 5 gives 15) but the answer is too small. Fix it.',
    'n = int(input())\ntotal = 0\nfor i in range(1, n):\n    total = total + i\nprint(total)',
    'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + i\nprint(total)',
    [['5'], ['3'], ['1']], 'range(1, n) stops BEFORE n, so n itself is never added. Use range(1, n + 1).', skill=S, level=2)
fix(U, 'It should print the factorial of n (5 x 4 x 3 x 2 x 1 = 120) but it always prints 0. Fix it.',
    'n = int(input())\nresult = 0\nfor i in range(1, n + 1):\n    result = result * i\nprint(result)',
    'n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result = result * i\nprint(result)',
    [['5'], ['3'], ['0']], 'A product must START at 1. Starting at 0 gives 0 x anything = 0. (Start at 0 only for sums.)', skill=S, level=2)
fix(U, 'It should print ONLY the final total (for n = 4: 10), but it prints a number every round. Fix it.',
    'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + i\n    print(total)',
    'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + i\nprint(total)',
    [['4'], ['3'], ['5']], 'The indented print belongs to the loop body, so it runs every round. Move print back to the left edge so it runs once, after the loop.', skill=S, level=2)
fix(U, 'It should read n numbers and print their sum, but nothing appears on the screen. Fix it.',
    'n = int(input())\ntotal = 0\nfor i in range(n):\n    total = total + int(input())',
    'n = int(input())\ntotal = 0\nfor i in range(n):\n    total = total + int(input())\nprint(total)',
    [['3', '1', '2', '3'], ['2', '10', '20']], 'The program adds everything up but never shows the result. Add print(total) after the loop.', skill=S, level=1)
fix(U, 'It should print 1 2 3 4 5, one per line, but it stops at 4. Fix it.',
    'n = 1\nwhile n < 5:\n    print(n)\n    n = n + 1',
    'n = 1\nwhile n <= 5:\n    print(n)\n    n = n + 1',
    [[]], 'The test n < 5 is False as soon as n is 5, so 5 is never printed. Use n <= 5 (or n < 6).', skill=S, level=1)
fix(U, 'It should read n numbers and print their average (3 numbers 2, 4, 6 give 4.0). It is wrong. Fix BOTH bugs.',
    'n = int(input())\ntotal = 1\nfor i in range(1, n):\n    total = total + int(input())\nprint(total / n)',
    'n = int(input())\ntotal = 0\nfor i in range(n):\n    total = total + int(input())\nprint(total / n)',
    [['3', '2', '4', '6'], ['2', '10', '20'], ['4', '1', '2', '3', '4']],
    'Bug 1: total starts at 1, but a sum must start at 0. Bug 2: range(1, n) runs only n - 1 times, so one number is never read. range(n) runs exactly n times.',
    skill=S, level=3, alts=['n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + int(input())\nprint(total / n)'])

# ------------------------------------------------------------------ write
write(U, 'Read a whole number <b>N</b> and print the sum 1 + 2 + ... + N. (For 5 print 15. For 0 print 0.) Use a loop.',
     'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total = total + i\nprint(total)',
     [['5'], ['1'], ['10'], ['0']],
     ['Start with total = 0 before the loop.', 'for i in range(1, n + 1):  (the + 1 is needed!)', 'print(total) goes AFTER the loop, not inside.'],
     'An accumulator: start at 0, add each i in the loop, print once at the end.', skill=S, level=2,
     alts=['n = int(input())\ntotal = 0\ni = 1\nwhile i <= n:\n    total = total + i\n    i = i + 1\nprint(total)',
           'n = int(input())\ntotal = 0\nfor i in range(n + 1):\n    total += i\nprint(total)'],
     must=[[r'\b(for|while)\b', 'Use a for loop or a while loop for this one.']], starter='n = int(input())\ntotal = 0\n')
write(U, 'Read a whole number <b>N</b>. Print the numbers from N down to 1, one per line, then print <b>Liftoff!</b> (For N = 0 only Liftoff! appears.)',
     'n = int(input())\nfor i in range(n, 0, -1):\n    print(i)\nprint("Liftoff!")',
     [['3'], ['1'], ['5'], ['0']],
     ['Counting down: range(n, 0, -1).', 'Liftoff! is printed once, after the loop (no indent).'],
     'Count down with a negative step, or with a while loop that subtracts 1. Liftoff! sits outside the loop so it prints once.', skill=S, level=2,
     alts=['n = int(input())\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("Liftoff!")',
           'n = int(input())\nfor i in range(n):\n    print(n - i)\nprint("Liftoff!")'],
     must=[[r'\b(for|while)\b', 'Use a loop here - do not print each line by hand.']])
write(U, 'Read a whole number <b>N</b> and print its multiplication table from 1 to 10. Each line looks like <b>3 x 4 = 12</b> (for N = 3).',
     'n = int(input())\nfor i in range(1, 11):\n    print(n, "x", i, "=", n * i)',
     [['3'], ['7'], ['1'], ['12']],
     ['The loop variable goes 1 to 10: range(1, 11).', 'print(n, "x", i, "=", n * i) puts one space between everything.'],
     'range(1, 11) gives 1 to 10. The commas in print put the single spaces in for you.', skill=S, level=2,
     alts=['n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")',
           'n = int(input())\ni = 1\nwhile i <= 10:\n    print(n, "x", i, "=", n * i)\n    i = i + 1'],
     must=[[r'\b(for|while)\b', 'Use a loop for the ten lines.']])
write(U, 'Read a whole number <b>N</b>, then read <b>N</b> more whole numbers. Print their <b>average</b> (the total divided by N with <code>/</code>). Typing 3, 2, 4, 6 prints 4.0.',
     'n = int(input())\ntotal = 0\nfor _ in range(n):\n    total = total + int(input())\nprint(total / n)',
     [['3', '2', '4', '6'], ['2', '1', '2'], ['1', '7'], ['4', '10', '10', '10', '11']],
     ['The first input is the count N, not part of the total.', 'Loop N times: total = total + int(input())', 'print(total / n) after the loop.'],
     'Read N, loop N times reading and adding, then divide the total by N. / always gives a decimal.', skill=S, level=3,
     alts=['n = int(input())\ntotal = 0\ncount = 0\nwhile count < n:\n    total = total + int(input())\n    count = count + 1\nprint(total / n)',
           'n = int(input())\ntotal = 0\nfor i in range(n):\n    total += int(input())\nprint(total / n)'],
     must=[[r'\b(for|while)\b', 'You need a loop to read N numbers.']])
write(U, 'Read a whole number <b>N</b>, then read <b>N</b> more whole numbers. Print <b>how many of them are even</b>. (0 counts as even.)',
     'n = int(input())\ncount = 0\nfor _ in range(n):\n    x = int(input())\n    if x % 2 == 0:\n        count = count + 1\nprint(count)',
     [['5', '2', '3', '4', '7', '8'], ['3', '1', '3', '5'], ['4', '0', '2', '4', '6'], ['1', '9']],
     ['Start count = 0 before the loop.', 'A number x is even when x % 2 == 0.', 'Add 1 to count only inside the if.'],
     'A counter starts at 0 and goes up by 1 only when the number is even (x % 2 == 0).', skill=S, level=3,
     alts=['n = int(input())\ncount = 0\ni = 0\nwhile i < n:\n    x = int(input())\n    if x % 2 == 0:\n        count += 1\n    i += 1\nprint(count)'],
     must=[[r'\b(for|while)\b', 'You need a loop to read N numbers.']])
write(U, 'Read a whole number <b>N</b> and print a triangle of stars: row 1 has 1 star, row 2 has 2 stars, up to N stars. (N = 3 gives *, **, ***).',
     'n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)',
     [['3'], ['1'], ['5'], ['4']],
     ['Row number i needs i stars.', 'Text times a number repeats it: "*" * 3 is ***', 'for i in range(1, n + 1):'],
     'Row i is "*" * i. Looping i from 1 to N draws all the rows.', skill=S, level=2,
     alts=['n = int(input())\nfor i in range(1, n + 1):\n    for j in range(i):\n        print("*", end="")\n    print()',
           'n = int(input())\ni = 1\nwhile i <= n:\n    print("*" * i)\n    i = i + 1'],
     must=[[r'\b(for|while)\b', 'Use a loop for the rows.']])
write(U, 'Read a whole number <b>N</b> and print its <b>factorial</b>: 1 x 2 x 3 x ... x N. (5 gives 120. 0 gives 1.)',
     'n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result = result * i\nprint(result)',
     [['5'], ['1'], ['0'], ['6'], ['10']],
     ['A product starts at 1, not 0.', 'result = result * i inside the loop.', 'For 0 the loop does not run at all, so result stays 1.'],
     'Start the product at 1, multiply by each i from 1 to N. For 0 the loop is empty and the answer stays 1.', skill=S, level=3,
     alts=['n = int(input())\nresult = 1\nwhile n > 1:\n    result = result * n\n    n = n - 1\nprint(result)',
           'n = int(input())\nresult = 1\nfor i in range(n, 0, -1):\n    result *= i\nprint(result)'],
     must=[[r'\b(for|while)\b', 'Use a loop to multiply the numbers.']])
write(U, 'Keep reading whole numbers until the user types <b>0</b>. Then print the <b>sum</b> of all the numbers typed (the 0 itself adds nothing). Typing 4, 6, 0 prints 10.',
     'total = 0\nx = int(input())\nwhile x != 0:\n    total = total + x\n    x = int(input())\nprint(total)',
     [['4', '6', '0'], ['0'], ['5', '5', '5', '5', '0'], ['-3', '10', '0']],
     ['You do not know how many numbers come, so use while, not for.', 'Read one number BEFORE the loop, and read the next one at the BOTTOM of the loop.', 'while x != 0:'],
     'while repeats as long as the number is not 0. The next input() at the bottom of the loop is what lets the loop finally stop.', skill=S, level=3,
     alts=['total = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    total = total + x\nprint(total)'],
     must=[[r'\bwhile\b', 'We do not know how many numbers are coming, so use a while loop.']], starter='total = 0\nx = int(input())\n')
write(U, 'Read two whole numbers <b>A</b> and <b>B</b> (A is not bigger than B). Print every number from A to B on ONE line, with a space between them. (1 and 5 prints 1 2 3 4 5).',
     'a = int(input())\nb = int(input())\nfor i in range(a, b + 1):\n    print(i, end=" ")\nprint()',
     [['1', '5'], ['3', '3'], ['10', '14'], ['-2', '2']],
     ['for i in range(a, b + 1):', 'print(i, end=" ") keeps everything on the same line.'],
     'range(a, b + 1) includes B. end=" " puts a space instead of a new line after each number.', skill=S, level=3,
     alts=['a = int(input())\nb = int(input())\ni = a\nwhile i <= b:\n    print(i, end=" ")\n    i = i + 1\nprint()'],
     must=[[r'\b(for|while)\b', 'Use a loop to print the numbers.']])
write(U, 'Read a whole number <b>N</b>, then read <b>N</b> more whole numbers (N is at least 1). Print the <b>biggest</b> one.',
     'n = int(input())\nbiggest = int(input())\nfor i in range(n - 1):\n    x = int(input())\n    if x > biggest:\n        biggest = x\nprint(biggest)',
     [['3', '4', '9', '2'], ['1', '5'], ['4', '-5', '-2', '-9', '-7'], ['3', '7', '7', '7']],
     ['Start biggest with the FIRST number typed (not 0 - what if all numbers are negative?).', 'Then loop n - 1 more times.', 'if x > biggest: biggest = x'],
     'Start from the first number so negative lists still work, then replace biggest whenever a bigger one shows up.', skill=S, level=3,
     alts=['n = int(input())\nbiggest = int(input())\nfor i in range(n - 1):\n    x = int(input())\n    biggest = max(biggest, x)\nprint(biggest)',
           'n = int(input())\nbiggest = int(input())\ncount = 1\nwhile count < n:\n    x = int(input())\n    if x > biggest:\n        biggest = x\n    count = count + 1\nprint(biggest)'],
     must=[[r'\b(for|while)\b', 'You need a loop to read all the numbers.']])

# ------------------------------------------------------------------ know
know(U, 'How many times does the body of <code>for i in range(7):</code> run?', ['7 times', '6 times', '8 times', 'Only 1 time'],
     'range(7) is 0, 1, 2, 3, 4, 5, 6, which is 7 values, so the body runs 7 times.', skill=S, level=1)
know(U, 'Which values does <code>i</code> take in <code>for i in range(2, 6):</code> ?', ['2, 3, 4, 5', '2, 3, 4, 5, 6', '3, 4, 5, 6', '2, 3, 4'],
     'The first number (2) is included and the last number (6) is not, so i is 2, 3, 4, 5.', skill=S, level=1)
know(U, 'Why do programmers use loops?', ['To repeat steps without copy-pasting', 'To turn typed text into real numbers', 'To stop a program from ever crashing', 'To hide some lines from the screen'],
     'A loop runs the same indented lines again and again, so 100 repeats need the code written once, not 100 times.', skill=S, level=1)
know(U, 'To print 1 2 3 4 5 (one per line), which header goes before <code>print(i)</code>?',
     ['for i in range(1, 6):', 'for i in range(1, 5):', 'for i in range(5):', 'for i in range(0, 5):'],
     'range(1, 6) starts at 1 and stops before 6, giving 1 to 5. range(1, 5) stops at 4 and range(5) is 0 to 4.', skill=S, level=1)
know(U, 'Where should <code>total = 0</code> go when you add up numbers in a loop?',
     ['Above the loop, so it runs once', 'Inside the loop, as its first line', 'Below the loop, after it finishes', 'Nowhere, Python starts it at zero'],
     'It must run once before the loop. Inside the loop it would reset total to 0 every round and erase the sum so far.', skill=S, level=2)
know(U, 'When does a <code>while</code> loop stop?', ['When its condition becomes False', 'After it has run exactly ten times', 'As soon as one line has been printed', 'When the first number reaches zero'],
     'while checks the condition before every round and stops the moment it is False. Nothing else ends it (except break).', skill=S, level=1)
know(U, 'What does <code>continue</code> do inside a loop?',
     ['Skips the rest of this round and moves on', 'Stops the whole loop and leaves it right now', 'Starts the loop again from its first value', 'Ends the program and prints what is left'],
     'continue only skips the rest of the CURRENT round. The loop carries on. (break is the one that leaves the loop.)', skill=S, level=2)
know(U, 'What does <code>end=""</code> change in <code>print(x, end="")</code>?',
     ['It stays on the same line afterwards', 'It prints the value of x two times', 'It leaves the value of x out of the print', 'It adds a blank line after the value'],
     'Normally print ends with a new line. end="" ends with nothing, so the next print continues on the SAME line.', skill=S, level=2)
know(U, 'A while loop never ends. What is the most likely reason?',
     ['The loop never changes its own counter', 'The test uses < instead of <=', 'The loop body has more than one line', 'There is a print() inside the loop'],
     'If the counter in the condition is never updated, the test stays True forever. Always change the counter inside the loop (for example n = n + 1).', skill=S, level=2)
