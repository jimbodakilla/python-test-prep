from lessons import L

L(13, 'Mini projects: put it all together', '🚀', 35,
  'Turn a short spec into a working program with a 5-step method and the right pattern.',
  ['I restate a problem with an example before I code', 'I pick the right pattern from the words in the spec (how many, total, biggest, keep asking...)',
   'I write my plan as comments, then code it', 'I test with the example AND an edge case'],
  [
  ('p', 'You know the tools now: <code>if</code>, loops, strings, lists, functions. A <b>project</b> is different. Nobody tells you which tool to use. You get a <b>spec</b> (a short description) and you decide. '
        'The secret of good programmers: <b>they do not start typing, they start thinking.</b>'),
  ('rule', 'The 5-step method',
   '<b>1. Restate</b> the problem in your own words and write ONE example (input and output).<br>'
   '<b>2. Pick the pattern</b> (counter, accumulator, find-the-biggest, filter, build-a-list, keep-asking loop, menu loop).<br>'
   '<b>3. Plan</b> in comments: one comment per step, before any code.<br>'
   '<b>4. Code</b> it, one comment at a time.<br>'
   '<b>5. Test</b> with the example from step 1, then with an <b>edge case</b> (zero, one item, negatives, a tie, the exact limit).'),
  ('h', 'Project 1: FizzBuzz-lite'),
  ('p', '<b>Spec:</b> "Print the numbers 1 to 15. For a multiple of 3 print <code>Fizz</code> instead of the number."<br>'
        '<b>1. Restate + example:</b> 1, 2, Fizz, 4, 5, Fizz, ...<br>'
        '<b>2. Pattern:</b> the words <b>"for every"</b> number 1 to 15 = a <code>for</code> loop; "if it is a multiple of 3" = an <code>if</code>/<code>else</code> inside it. A multiple of 3 has remainder 0 when you use <code>%</code>.'),
  ('try', '# Plan:\n# for every number from 1 to 15\n#   if it is a multiple of 3 -> print Fizz\n#   otherwise -> print the number\nfor i in range(1, 16):\n    if i % 3 == 0:\n        print("Fizz")\n    else:\n        print(i)',
   [], 'Predict first: which numbers become Fizz? Run it. Then try changing the 3 to a 4. Notice <code>range(1, 16)</code>: the end value is NOT included.'),
  ('trace', 'for i in range(1, 7):\n    if i % 3 == 0:\n        print("Fizz")\n    else:\n        print(i)', []),
  ('p', 'Your turn later: add <code>Buzz</code> for multiples of 5. Careful with 15, a multiple of BOTH: check that case <b>first</b>.'),
  ('h', 'Project 2: average of N typed numbers'),
  ('p', '<b>Spec:</b> "Ask how many numbers (N), then ask for N whole numbers. Print the average."<br>'
        '<b>1. Example:</b> N = 3, numbers 4, 6, 8 prints 6.0.<br>'
        '<b>2. Pattern:</b> <b>"total"</b> = an <b>accumulator</b>: a variable that starts at 0 BEFORE the loop and grows inside it. We know the count (N), so a <code>for</code> loop.<br>'
        '<b>3. Plan</b> is already in the comments below.'),
  ('try', '# 1. read N\n# 2. total starts at 0\n# 3. N times: read a number, add it to total\n# 4. print total / N\nn = int(input())\ntotal = 0\nfor i in range(n):\n    total = total + int(input())\nprint("Average:", total / n)',
   ['3', '4', '6', '8'], 'Run it with the example (3, 4, 6, 8). Then do step 5: change the stdin to <b>1</b> then <b>7</b> (one number), and to <b>3</b>, <b>-2</b>, <b>0</b>, <b>2</b> (negatives and zero).'),
  ('trap', '<b>Test the edges, not just the example.</b> The example (4, 6, 8) is friendly. What if N = 1? What if a number is negative or 0? '
           'If the spec says N is at least 1 you do not have to handle N = 0 (it would divide by zero: <code>ZeroDivisionError</code>). But you must check the smallest legal case.'),
  ('h', 'Project 3: password checker'),
  ('p', '<b>Spec:</b> "A password is <code>Strong</code> if it has at least 8 characters AND at least one digit. Otherwise <code>Weak</code>."<br>'
        '<b>2. Pattern:</b> <b>"has at least one"</b> = a <b>flag</b>. Start <code>has_digit = False</code>, look at every character with a <code>for</code> loop, and switch the flag to <code>True</code> if you see a digit. After the loop, use <code>and</code> to combine both rules.'),
  ('try', '# 1. read the password\n# 2. flag: has_digit starts False\n# 3. for every character: if it is a digit, flag = True\n# 4. Strong if long enough AND flag is True\npassword = input()\nhas_digit = False\nfor ch in password:\n    if ch.isdigit():\n        has_digit = True\nif len(password) >= 8 and has_digit:\n    print("Strong")\nelse:\n    print("Weak")',
   ['abcdefg1'], 'Run it. Then test the edges: <b>abcdefgh</b> (8 letters, no digit), <b>abc1</b> (digit but short), and <b>abcdefg1</b> (exactly 8). Which one is the limit case?'),
  ('h', 'Which pattern? Read the spec for clue words'),
  ('table', ['The spec says...', 'Pattern', 'Code shape'], [
     ['<b>"how many"</b>, "count the..."', 'counter', '<code>count = 0</code> before the loop, <code>count += 1</code> inside an <code>if</code>'],
     ['<b>"total"</b>, "sum", "add up"', 'accumulator', '<code>total = 0</code> before the loop, <code>total += x</code> inside (use <code>1</code> to multiply)'],
     ['<b>"the biggest"</b>, "smallest", "longest"', 'find-the-biggest', '<code>big = first item</code>, then <code>if x &gt; big: big = x</code>'],
     ['<b>"only the ones that..."</b>', 'filter', 'an <code>if</code> inside the loop; only act when it is true'],
     ['<b>"make a list of..."</b>', 'build-a-list', '<code>result = []</code>, then <code>result.append(x)</code> inside the loop'],
     ['<b>"does it have..."</b>, "is there any"', 'flag', '<code>found = False</code>, switch to <code>True</code> inside the loop'],
     ['<b>"for every"</b>, "each", "all of them"', 'for loop', '<code>for x in ...:</code> or <code>for i in range(...):</code>'],
     ['<b>"keep asking until"</b>, "stop when"', 'keep-asking loop', 'read once, <code>while x != stop:</code>, read again at the END of the loop'],
     ['<b>"a menu"</b>, "until the user types q"', 'menu loop', 'a keep-asking loop with an <code>if</code>/<code>elif</code> chain inside']]),
  ('try', 'count = 0\nchoice = input()\nwhile choice != "q":\n    if choice == "1":\n        count += 1\n    elif choice == "3":\n        print("Count:", count)\n    choice = input()\nprint("Bye")',
   ['1', '1', '3', 'q'], 'A tiny menu loop: it reads, checks "q", acts, and reads again. Predict the output for 1, 1, 3, q, then Run. What happens if the very first thing typed is q?'),
  ('h', 'Bugs that hide inside projects'),
  ('table', ['Mistake', 'What happens'], [
     ['accumulator for a product starts at <code>0</code>', 'No error, but the answer is always 0 (start at 1)'],
     ['<code>range(1, n)</code> when you wanted 1 to n', 'No error, but n is skipped (the sum of 1 to 5 gives 10, not 15)'],
     ['<code>total = 0</code> placed INSIDE the loop', 'No error, but total is reset each pass, so only the last number counts'],
     ['<code>if x = 5:</code> (one equals sign)', 'SyntaxError'],
     ['forgetting <code>int()</code>: <code>score = input()</code> then <code>score &gt;= 90</code>', 'TypeError (text cannot be compared with a number)'],
     ['<code>print(...)</code> where you needed <code>return</code>', 'The function gives back None; <code>None + 1</code> is a TypeError'],
     ['a list position one too big: <code>scores[3]</code> in a list of 3', 'IndexError']]),
  ('trap', '<b>The quiet bugs are the dangerous ones.</b> Most of the bugs in this table produce <b>no error message</b>, just a wrong answer. '
           'The only defence is step 5: run the example, run an edge case, and compare with the answer you worked out by hand in step 1.'),
  ('quick', 'The spec says: "Find the <b>longest</b> word in a sentence." Which pattern?', ['Find-the-biggest, comparing len(word)', 'A counter that adds 1 for every word', 'An accumulator that adds all the words up', 'A menu loop that repeats until q'], 0, 'Longest/biggest/smallest means find-the-biggest: keep the best so far and replace it when a word is longer.'),
  ('quick', 'A program asks for prices until the user types 0, then prints the total. Where does <code>total = 0</code> go?', ['Before the loop, once', 'Inside the loop, every pass', 'After the loop', 'Anywhere, it does not matter'], 0, 'The accumulator starts once, before the loop. Inside the loop it would be reset to 0 on every pass.'),
  ('quick', 'You wrote a program that counts the vowels in a word. Which test is the best EDGE case?', ['A word with no vowels, like "rhythm"', 'A word like "banana"', 'A word like "computer"', 'A word like "school"'], 0, 'No vowels at all checks that the counter correctly stays at 0. Ordinary words rarely reveal a bug.'),
  ])
