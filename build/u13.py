from dsl import *
U = 13
S = 'project'

# =====================================================================
# WRITE: whole mini projects (hidden tests, each with edge cases)
# =====================================================================
write(U, 'Ask for a whole number <b>N</b>. Print the numbers from 1 to N, one per line. But for a multiple of 3 print <b>Fizz</b> instead, '
         'for a multiple of 5 print <b>Buzz</b>, and for a multiple of <b>both</b> 3 and 5 print <b>FizzBuzz</b>. N = 5 prints 1, 2, Fizz, 4, Buzz (one per line).',
      'n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
      [['5'], ['15'], ['1'], ['10']],
      ['Pattern: "for every number" = a for loop. Check the FizzBuzz case FIRST.', 'for i in range(1, n + 1):  (the + 1 makes N itself included)'],
      'A multiple of both 3 and 5 is a multiple of 15, so test that first; if you test i % 3 first, 15 prints Fizz and never reaches FizzBuzz. range(1, n + 1) stops at n, so N is included.',
      skill=S, level=3, starter='n = int(input())\n',
      alts=['n = int(input())\nfor i in range(1, n + 1):\n    if i % 3 == 0 and i % 5 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
            'n = int(input())\ni = 1\nwhile i <= n:\n    word = ""\n    if i % 3 == 0:\n        word = word + "Fizz"\n    if i % 5 == 0:\n        word = word + "Buzz"\n    if word == "":\n        print(i)\n    else:\n        print(word)\n    i += 1'])

write(U, 'Ask for a whole number. Print its times table from 1 to 10, one line each, in the form <b>3 x 1 = 3</b> (for the number 3).',
      'n = int(input())\nfor i in range(1, 11):\n    print(n, "x", i, "=", n * i)',
      [['3'], ['7'], ['1'], ['12']],
      ['Pattern: "for every" from 1 to 10 = for i in range(1, 11).', 'print(n, "x", i, "=", n * i)'],
      'The loop variable i takes 1, 2, ... 10, and each pass prints n, the text x, i, = and n * i. range(1, 11) stops before 11 so the last line is n x 10.',
      skill=S, level=2,
      alts=['n = int(input())\ni = 1\nwhile i <= 10:\n    print(n, "x", i, "=", n * i)\n    i += 1',
            'n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")'])

write(U, 'Ask how many numbers <b>N</b> there are (at least 1), then ask for N whole numbers. Print two lines: <b>Total: </b>the sum, and <b>Average: </b>the sum divided by N. '
         'For N = 3 and the numbers 4, 6, 8 it prints <b>Total: 18</b> and <b>Average: 6.0</b>.',
      'n = int(input())\ntotal = 0\nfor i in range(n):\n    total += int(input())\nprint("Total:", total)\nprint("Average:", total / n)',
      [['3', '4', '6', '8'], ['2', '3', '4'], ['1', '7'], ['4', '1', '2', '3', '4'], ['3', '-2', '0', '2']],
      ['Pattern: an accumulator. Start total at 0 BEFORE the loop, add one number per pass.', 'total += int(input())'],
      'The accumulator starts at 0 before the loop and grows by one typed number each pass. The average divides by N, and / always gives a float (18 / 3 = 6.0).',
      skill=S, level=2, starter='n = int(input())\ntotal = 0\n',
      alts=['n = int(input())\ntotal = 0\nfor i in range(n):\n    x = int(input())\n    total = total + x\nprint("Total:", total)\nprint("Average:", total / n)',
            'n = int(input())\ntotal = 0\ni = 0\nwhile i < n:\n    total += int(input())\n    i += 1\nprint("Total:", total)\nprint("Average:", total / n)',
            'n = int(input())\nnums = []\nfor i in range(n):\n    nums.append(int(input()))\nprint("Total:", sum(nums))\nprint("Average:", sum(nums) / n)'])

write(U, 'Ask how many numbers <b>N</b> there are (at least 1), then ask for N whole numbers (they can be negative). Print <b>Smallest: </b>and the smallest, then <b>Biggest: </b>and the biggest, on two lines.',
      'n = int(input())\nfirst = int(input())\nsmall = first\nbig = first\nfor i in range(n - 1):\n    x = int(input())\n    if x < small:\n        small = x\n    if x > big:\n        big = x\nprint("Smallest:", small)\nprint("Biggest:", big)',
      [['3', '5', '-2', '9'], ['1', '4'], ['3', '-5', '-8', '-1'], ['4', '7', '7', '7', '7'], ['2', '10', '3']],
      ['Pattern: find-the-biggest. Start from the FIRST number, not from 0.', 'if x > big:  big = x'],
      'Start both variables from the first typed number. If you started big at 0, the numbers -5, -8, -1 would wrongly leave 0 as the biggest. Then every other number can only replace them.',
      skill=S, level=3,
      alts=['n = int(input())\nnums = []\nfor i in range(n):\n    nums.append(int(input()))\nprint("Smallest:", min(nums))\nprint("Biggest:", max(nums))',
            'n = int(input())\nsmall = 1000000\nbig = -1000000\nfor i in range(n):\n    x = int(input())\n    if x < small:\n        small = x\n    if x > big:\n        big = x\nprint("Smallest:", small)\nprint("Biggest:", big)',
            'n = int(input())\nnums = []\nfor i in range(n):\n    nums.append(int(input()))\nnums.sort()\nprint("Smallest:", nums[0])\nprint("Biggest:", nums[-1])'])

write(U, 'Ask for a word or sentence. Count the <b>vowels</b> (a, e, i, o, u - capital letters count too) and the <b>consonants</b> (every other <b>letter</b>; spaces, digits and symbols are neither). '
         'Print <b>Vowels: </b>the count, then <b>Consonants: </b>the count. For <b>Hello World</b> it prints Vowels: 3 and Consonants: 7.',
      'text = input().lower()\nvowels = 0\nconsonants = 0\nfor ch in text:\n    if ch in "aeiou":\n        vowels += 1\n    elif ch.isalpha():\n        consonants += 1\nprint("Vowels:", vowels)\nprint("Consonants:", consonants)',
      [['Hello World'], ['python'], ['AEIOU'], ['Hi 5!'], ['rhythm']],
      ['Pattern: two counters in one loop. Make the text lowercase first so capitals count.', 'elif ch.isalpha():  keeps spaces and symbols out of the consonants'],
      'Check vowels first; any other character counts as a consonant only if it is a letter (isalpha). In Hello World: e, o, o are vowels and H, l, l, W, r, l, d are consonants; the space is neither.',
      skill=S, level=3,
      alts=['text = input()\nvowels = 0\nconsonants = 0\nfor ch in text:\n    if ch.isalpha():\n        if ch.lower() in "aeiou":\n            vowels += 1\n        else:\n            consonants += 1\nprint("Vowels:", vowels)\nprint("Consonants:", consonants)',
            'text = input()\nvowels = 0\nconsonants = 0\nfor ch in text:\n    if ch in "aeiouAEIOU":\n        vowels += 1\n    elif ch.isalpha():\n        consonants += 1\nprint("Vowels:", vowels)\nprint("Consonants:", consonants)',
            'text = input().lower()\nvowels = 0\nconsonants = 0\ni = 0\nwhile i < len(text):\n    if text[i] in "aeiou":\n        vowels += 1\n    elif text[i].isalpha():\n        consonants += 1\n    i += 1\nprint("Vowels:", vowels)\nprint("Consonants:", consonants)'])

write(U, 'Ask for a word. If it reads the same forwards and backwards (ignore capital letters), print <b>Palindrome</b>. Otherwise print <b>Not a palindrome</b>. '
         '<b>Racecar</b> is a palindrome; <b>python</b> is not.',
      'w = input().lower()\nif w == w[::-1]:\n    print("Palindrome")\nelse:\n    print("Not a palindrome")',
      [['level'], ['Racecar'], ['python'], ['a'], ['ab']],
      ['Make the word lowercase first, then compare it with its reverse.', 'w[::-1] is the word backwards'],
      'Lowercase first so R and r match. w[::-1] is the word backwards, so level == level is True while python == nohtyp is False. A one-letter word is its own reverse.',
      skill=S, level=2,
      alts=['w = input().lower()\nback = ""\nfor ch in w:\n    back = ch + back\nif w == back:\n    print("Palindrome")\nelse:\n    print("Not a palindrome")',
            'w = input().lower()\nsame = True\nfor i in range(len(w)):\n    if w[i] != w[len(w) - 1 - i]:\n        same = False\nif same:\n    print("Palindrome")\nelse:\n    print("Not a palindrome")'])

write(U, 'Ask for a password. Check the rules <b>in this order</b>: if it has fewer than 8 characters print <b>Too short</b>; otherwise, if it has no digit (0-9) print <b>Needs a digit</b>; otherwise print <b>Strong</b>.',
      'pw = input()\nhas_digit = False\nfor ch in pw:\n    if ch.isdigit():\n        has_digit = True\nif len(pw) < 8:\n    print("Too short")\nelif not has_digit:\n    print("Needs a digit")\nelse:\n    print("Strong")',
      [['abc1'], ['abcdefgh'], ['abcdefg1'], ['seven77'], ['Passw0rdOK']],
      ['Pattern: a flag. Start has_digit = False, look at every character, switch it to True if you see a digit.', 'if len(pw) < 8: ... elif not has_digit: ... else: ...'],
      'The flag starts False and flips to True when ANY character is a digit. Then an if/elif/else checks the length first: seven77 has a digit but only 7 characters, so it is Too short, and abcdefgh has 8 characters but no digit.',
      skill=S, level=3,
      alts=['pw = input()\ndigits = 0\nfor ch in pw:\n    if ch in "0123456789":\n        digits += 1\nif len(pw) < 8:\n    print("Too short")\nelif digits == 0:\n    print("Needs a digit")\nelse:\n    print("Strong")',
            'pw = input()\nif len(pw) < 8:\n    print("Too short")\nelse:\n    found = False\n    for ch in pw:\n        if ch.isdigit():\n            found = True\n    if found:\n        print("Strong")\n    else:\n        print("Needs a digit")',
            'pw = input()\nhas_digit = False\ni = 0\nwhile i < len(pw):\n    if pw[i].isdigit():\n        has_digit = True\n    i += 1\nif len(pw) >= 8 and has_digit:\n    print("Strong")\nelif len(pw) < 8:\n    print("Too short")\nelse:\n    print("Needs a digit")'])

write(U, 'A shopping cart. Keep asking for item prices (whole numbers), one per line, until the user types <b>0</b>. (The 0 is not an item.) Then print <b>Items: </b>how many prices were typed and <b>Total: </b>their sum, on two lines.',
      'total = 0\nitems = 0\nprice = int(input())\nwhile price != 0:\n    total += price\n    items += 1\n    price = int(input())\nprint("Items:", items)\nprint("Total:", total)',
      [['4', '10', '6', '0'], ['0'], ['5', '0'], ['1', '2', '3', '4', '5', '0'], ['100', '250', '0']],
      ['Pattern: "keep asking until" = a while loop. Read once BEFORE the loop and once at the END of each pass.', 'while price != 0:'],
      'A counter and an accumulator work together. Reading once before the loop and again at the bottom means the 0 is never added or counted; if the first price is 0 the loop body never runs and both stay 0.',
      skill=S, level=2,
      alts=['total = 0\nitems = 0\nwhile True:\n    price = int(input())\n    if price == 0:\n        break\n    total += price\n    items += 1\nprint("Items:", items)\nprint("Total:", total)',
            'total = 0\nitems = 0\nprice = -1\nwhile price != 0:\n    price = int(input())\n    if price != 0:\n        total += price\n        items += 1\nprint("Items:", items)\nprint("Total:", total)'])

write(U, 'Ask how many scores <b>N</b> there are, then ask for N scores (whole numbers 0-100). For <b>each</b> score print its letter right away: 90 or more is <b>A</b>, 80-89 is <b>B</b>, 70-79 is <b>C</b>, below 70 is <b>F</b>. '
         'After all the letters print <b>Average: </b>the average of the scores.',
      'n = int(input())\ntotal = 0\nfor i in range(n):\n    score = int(input())\n    total += score\n    if score >= 90:\n        print("A")\n    elif score >= 80:\n        print("B")\n    elif score >= 70:\n        print("C")\n    else:\n        print("F")\nprint("Average:", total / n)',
      [['3', '90', '89', '70'], ['2', '100', '0'], ['1', '69'], ['4', '95', '85', '75', '65'], ['2', '80', '71']],
      ['Two jobs inside one loop: add to total AND print the letter. Print the average AFTER the loop.', 'Order the elif checks from the highest score down.'],
      'The loop does two jobs per score: add it to the total and print a letter. Checking from the top down (>= 90, then >= 80, then >= 70) means each elif only runs when the earlier ones failed. 90, 89, 70 gives A, B, C and 249 / 3 = 83.0.',
      skill=S, level=3,
      alts=['n = int(input())\ntotal = 0\ni = 0\nwhile i < n:\n    score = int(input())\n    total = total + score\n    if score >= 90:\n        print("A")\n    elif score >= 80:\n        print("B")\n    elif score >= 70:\n        print("C")\n    else:\n        print("F")\n    i += 1\nprint("Average:", total / n)',
            'n = int(input())\nscores = []\nfor i in range(n):\n    scores.append(int(input()))\nfor s in scores:\n    if s >= 90:\n        print("A")\n    elif s >= 80:\n        print("B")\n    elif s >= 70:\n        print("C")\n    else:\n        print("F")\nprint("Average:", sum(scores) / n)'])

write(U, 'Ask for a top temperature in Celsius (a whole number, 0 or more). Print one line for every 10 degrees from 0 up to that number (include the top if it is a multiple of 10), like <b>10 C = 50.0 F</b>. Formula: F = C * 9 / 5 + 32. Top 30 prints four lines.',
      'top = int(input())\nfor c in range(0, top + 1, 10):\n    print(c, "C =", c * 9 / 5 + 32, "F")',
      [['30'], ['0'], ['50'], ['45'], ['100']],
      ['Pattern: a for loop that counts in steps of 10 (or a while loop that does c += 10).', 'print(c, "C =", c * 9 / 5 + 32, "F")'],
      'Counting 0, 10, 20 ... up to the top with a step of 10, each pass prints c and c * 9 / 5 + 32. Top 0 still prints one line (0 C = 32.0 F) and top 45 stops at 40 because 50 is too big.',
      skill=S, level=2,
      alts=['top = int(input())\nc = 0\nwhile c <= top:\n    print(c, "C =", c * 9 / 5 + 32, "F")\n    c += 10',
            'top = int(input())\nfor i in range(top // 10 + 1):\n    c = i * 10\n    print(c, "C =", c * 9 / 5 + 32, "F")'])

write(U, 'Ask for a whole number <b>N</b> (2 or more). Print <b>Prime</b> if only 1 and N divide it evenly, otherwise print <b>Not prime</b>. (7 is prime, 9 is not because 3 divides it.)',
      'n = int(input())\nprime = True\nfor d in range(2, n):\n    if n % d == 0:\n        prime = False\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")',
      [['2'], ['9'], ['13'], ['49'], ['97'], ['4']],
      ['Pattern: a flag. Start with prime = True and try every divisor d from 2 up to N - 1.', 'if n % d == 0:  prime = False'],
      'Assume prime = True, then try d = 2, 3, ... N - 1. If any d divides N evenly (n % d == 0) the flag turns False. For 2 the range is empty so it stays Prime; for 49 the divisor 7 flips it.',
      skill=S, level=3,
      alts=['n = int(input())\ncount = 0\nfor d in range(1, n + 1):\n    if n % d == 0:\n        count += 1\nif count == 2:\n    print("Prime")\nelse:\n    print("Not prime")',
            'n = int(input())\nprime = True\nd = 2\nwhile d < n:\n    if n % d == 0:\n        prime = False\n        break\n    d += 1\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")',
            'n = int(input())\nprime = True\nfor d in range(2, n):\n    if n % d == 0:\n        prime = False\n        break\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")'])

write(U, 'Ask for a whole number <b>N</b> from 0 to 10. Print its <b>factorial</b>: 1 x 2 x 3 x ... x N. (5 prints 120, and 0 prints 1.)',
      'n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result = result * i\nprint(result)',
      [['5'], ['0'], ['1'], ['10'], ['3']],
      ['Pattern: an accumulator, but for MULTIPLYING. What number must it start at?', 'result = 1'],
      'A multiplying accumulator must start at 1: starting at 0 would make every product 0. For N = 0 the loop does not run at all, so the answer stays 1, which is the correct value of 0!.',
      skill=S, level=2,
      alts=['n = int(input())\nresult = 1\ni = 1\nwhile i <= n:\n    result *= i\n    i += 1\nprint(result)',
            'n = int(input())\nresult = 1\nfor i in range(n, 0, -1):\n    result = result * i\nprint(result)',
            'n = int(input())\nresult = 1\nfor i in range(2, n + 1):\n    result *= i\nprint(result)'])

write(U, 'Ask for a sentence (the words are separated by single spaces). Print how many <b>words</b> it has. <b>I love Python</b> prints 3.',
      's = input()\nprint(len(s.split()))',
      [['I love Python'], ['hello'], ['the quick brown fox jumps'], ['to be or not to be']],
      ['The text method split() cuts a sentence into a list of words.', 'len(...) counts the items in a list'],
      'split() cuts the sentence at the spaces into a list, and len() counts the pieces: I, love, Python is 3 pieces. A single word like hello makes a list of 1.',
      skill=S, level=2,
      alts=['s = input()\nprint(s.count(" ") + 1)',
            's = input()\nwords = 1\nfor ch in s:\n    if ch == " ":\n        words += 1\nprint(words)',
            's = input()\nwords = s.split()\ncount = 0\nfor w in words:\n    count += 1\nprint(count)'])

write(U, 'Ask for a sentence. Print its <b>longest word</b>. If two words are equally long, print the one that comes <b>first</b>. '
         '<b>I love programming</b> prints programming.',
      'words = input().split()\nlongest = words[0]\nfor w in words:\n    if len(w) > len(longest):\n        longest = w\nprint(longest)',
      [['I love programming'], ['cat dog rat'], ['a bb ccc dd'], ['hello'], ['one three five seven']],
      ['Pattern: find-the-biggest, but compare len(w) instead of the word itself.', 'if len(w) > len(longest):  (use > not >= so the FIRST one wins a tie)'],
      'Same shape as find-the-biggest, comparing lengths. Using > (not >=) means a tie never replaces the earlier word: in one three five seven, three and seven both have 5 letters, and three comes first.',
      skill=S, level=3,
      alts=['words = input().split()\nlongest = ""\nfor w in words:\n    if len(w) > len(longest):\n        longest = w\nprint(longest)',
            'words = input().split()\nlongest = words[0]\ni = 1\nwhile i < len(words):\n    if len(words[i]) > len(longest):\n        longest = words[i]\n    i += 1\nprint(longest)'])

write(U, 'A tiny menu. Keep reading choices (one per line) until the user types <b>q</b>. A counter starts at 0. Choice <b>1</b> adds 1 to it, choice <b>2</b> subtracts 1, choice <b>3</b> prints <b>Count: </b>and the counter. '
         'Any other choice prints <b>Unknown choice</b>. When q is typed, print <b>Bye</b> and stop.',
      'count = 0\nchoice = input()\nwhile choice != "q":\n    if choice == "1":\n        count += 1\n    elif choice == "2":\n        count -= 1\n    elif choice == "3":\n        print("Count:", count)\n    else:\n        print("Unknown choice")\n    choice = input()\nprint("Bye")',
      [['1', '1', '3', 'q'], ['3', 'q'], ['q'], ['1', '2', '2', '3', 'x', 'q'], ['x', '3', 'q']],
      ['Pattern: a menu loop. Read a choice, keep going while it is not "q", and read the next choice at the END of each pass.', 'The choices are TEXT: compare with "1", not 1.'],
      'A menu loop repeats until the quit key. The choices are text, so they are compared with "1", "2", "3" in quotes. Typing q first skips the loop and goes straight to Bye.',
      skill=S, level=3, starter='count = 0\n',
      alts=['count = 0\nwhile True:\n    choice = input()\n    if choice == "q":\n        break\n    if choice == "1":\n        count += 1\n    elif choice == "2":\n        count -= 1\n    elif choice == "3":\n        print("Count:", count)\n    else:\n        print("Unknown choice")\nprint("Bye")',
            'count = 0\nwhile True:\n    choice = input()\n    if choice == "q":\n        print("Bye")\n        break\n    elif choice == "1":\n        count += 1\n    elif choice == "2":\n        count -= 1\n    elif choice == "3":\n        print("Count:", count)\n    else:\n        print("Unknown choice")'])

write(U, 'Two players each type a move: <b>rock</b>, <b>paper</b> or <b>scissors</b> (all lowercase). Rock beats scissors, scissors beats paper, paper beats rock. '
         'Print <b>Player 1 wins</b>, <b>Player 2 wins</b> or <b>Tie</b>. Player 1 types first.',
      'a = input()\nb = input()\nif a == b:\n    print("Tie")\nelif (a == "rock" and b == "scissors") or (a == "scissors" and b == "paper") or (a == "paper" and b == "rock"):\n    print("Player 1 wins")\nelse:\n    print("Player 2 wins")',
      [['rock', 'scissors'], ['paper', 'rock'], ['scissors', 'rock'], ['paper', 'paper'], ['rock', 'paper'], ['scissors', 'paper']],
      ['Handle the tie first. Then list the THREE ways player 1 wins; everything else is player 2.', 'a == "rock" and b == "scissors"'],
      'After ruling out a tie there are only three winning pairs for player 1 (rock/scissors, scissors/paper, paper/rock). Every other pair must be a win for player 2, so one else covers them.',
      skill=S, level=2,
      alts=['a = input()\nb = input()\nif a == b:\n    print("Tie")\nelif a == "rock":\n    if b == "scissors":\n        print("Player 1 wins")\n    else:\n        print("Player 2 wins")\nelif a == "paper":\n    if b == "rock":\n        print("Player 1 wins")\n    else:\n        print("Player 2 wins")\nelse:\n    if b == "paper":\n        print("Player 1 wins")\n    else:\n        print("Player 2 wins")',
            'a = input()\nb = input()\nif a == b:\n    print("Tie")\nelif a == "rock" and b == "paper":\n    print("Player 2 wins")\nelif a == "paper" and b == "scissors":\n    print("Player 2 wins")\nelif a == "scissors" and b == "rock":\n    print("Player 2 wins")\nelse:\n    print("Player 1 wins")'])

write(U, 'A guessing game with a fixed secret number: <b>7</b>. Keep reading guesses (whole numbers, one per line) until the guess is 7. '
         'For each wrong guess print <b>Too low</b> (the guess is below 7) or <b>Too high</b>. When the guess is 7 print <b>Correct! Tries: </b>N, where N counts <b>all</b> the guesses including the correct one.',
      'secret = 7\ntries = 1\nguess = int(input())\nwhile guess != secret:\n    if guess < secret:\n        print("Too low")\n    else:\n        print("Too high")\n    tries += 1\n    guess = int(input())\nprint("Correct! Tries:", tries)',
      [['7'], ['3', '10', '7'], ['1', '2', '3', '4', '5', '6', '7'], ['9', '8', '7'], ['7', '3']],
      ['Pattern: "keep asking until" with a counter. Count the correct guess too.', 'while guess != secret:'],
      'The loop runs once per WRONG guess and counts it; the correct guess is counted by starting tries at 1. For 3, 10, 7: Too low, Too high, then Correct with 3 tries. After a 7 the program stops reading, so extra input is ignored.',
      skill=S, level=3, starter='secret = 7\n',
      alts=['secret = 7\ntries = 0\nguess = -1\nwhile guess != secret:\n    guess = int(input())\n    tries += 1\n    if guess < secret:\n        print("Too low")\n    elif guess > secret:\n        print("Too high")\nprint("Correct! Tries:", tries)',
            'secret = 7\ntries = 0\nwhile True:\n    guess = int(input())\n    tries += 1\n    if guess == secret:\n        break\n    elif guess < secret:\n        print("Too low")\n    else:\n        print("Too high")\nprint("Correct! Tries:", tries)'])

write(U, 'Ask for a whole number <b>N</b> from 1 to 9. Print N lines: line 1 is <b>1</b>, line 2 is <b>22</b>, line 3 is <b>333</b>, and so on up to line N. (N = 4 prints 1, 22, 333, 4444.)',
      'n = int(input())\nfor i in range(1, n + 1):\n    print(str(i) * i)',
      [['1'], ['3'], ['5'], ['9']],
      ['Pattern: "for every" line. Line i is the digit i written i times. Text times a number repeats it.', 'print(str(i) * i)'],
      'On pass i the line is the text of i repeated i times: str(3) * 3 is 333. Without str(), 3 * 3 would be the number 9. range(1, n + 1) makes the last line N.',
      skill=S, level=3,
      alts=['n = int(input())\nfor i in range(1, n + 1):\n    for j in range(i):\n        print(i, end="")\n    print()',
            'n = int(input())\ni = 1\nwhile i <= n:\n    print(i * str(i))\n    i += 1',
            'n = int(input())\nfor i in range(1, n + 1):\n    line = ""\n    for j in range(i):\n        line = line + str(i)\n    print(line)'])

# =====================================================================
# FIX: realistic bugs
# =====================================================================
fix(U, 'It should print the <b>product</b> of N typed numbers (N first, then the numbers). 3 numbers 2, 3, 4 should print 24, but it always prints 0. Fix it.',
    'n = int(input())\nproduct = 0\nfor i in range(n):\n    product = product * int(input())\nprint(product)',
    'n = int(input())\nproduct = 1\nfor i in range(n):\n    product = product * int(input())\nprint(product)',
    [['3', '2', '3', '4'], ['1', '5'], ['2', '10', '10']],
    'Anything times 0 is 0, so a product that starts at 0 can never grow. A multiplying accumulator must start at 1 (an adding one starts at 0).', skill=S, level=2)

fix(U, 'It should print the sum of 1 to N <b>including N</b> (N = 5 gives 15). It is always too small. Fix it.',
    'n = int(input())\ntotal = 0\nfor i in range(1, n):\n    total += i\nprint(total)',
    'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)',
    [['5'], ['1'], ['10']],
    'range(1, n) stops BEFORE n, so n is never added: for 5 it adds 1+2+3+4 = 10 instead of 15. range(1, n + 1) includes n.', skill=S, level=2,
    alts=['n = int(input())\ntotal = 0\nfor i in range(n + 1):\n    total += i\nprint(total)'])

fix(U, 'It should count how many of the typed numbers are even. The program will not even start. Fix it.',
    'n = int(input())\nevens = 0\nfor i in range(n):\n    x = int(input())\n    if x % 2 = 0:\n        evens += 1\nprint("Evens:", evens)',
    'n = int(input())\nevens = 0\nfor i in range(n):\n    x = int(input())\n    if x % 2 == 0:\n        evens += 1\nprint("Evens:", evens)',
    [['3', '2', '5', '8'], ['2', '1', '3'], ['1', '4']],
    'One = stores a value; two == asks a question. An if needs the question, so x % 2 == 0 is right and x % 2 = 0 is a SyntaxError.', skill=S, level=2)

fix(U, 'It should say <b>Great job!</b> for a score of 90 or more and <b>Keep practicing</b> otherwise, but it crashes. Fix it.',
    'score = input()\nif score >= 90:\n    print("Great job!")\nelse:\n    print("Keep practicing")',
    'score = int(input())\nif score >= 90:\n    print("Great job!")\nelse:\n    print("Keep practicing")',
    [['95'], ['90'], ['72'], ['100']],
    'input() gives TEXT, and a text cannot be compared with the number 90 (TypeError). Wrap it in int() when you read it.', skill=S, level=2)

fix(U, 'This should print <b>even</b> or <b>odd</b> for the typed number. For 4 it prints True and then odd! Fix the function.',
    'def is_even(n):\n    print(n % 2 == 0)\n\nn = int(input())\nif is_even(n):\n    print("even")\nelse:\n    print("odd")',
    'def is_even(n):\n    return n % 2 == 0\n\nn = int(input())\nif is_even(n):\n    print("even")\nelse:\n    print("odd")',
    [['4'], ['7'], ['10'], ['0']],
    'print only SHOWS the answer; the function hands back None, which counts as False in the if, so it always said odd. return gives the answer back to the caller.', skill=S, level=2)

fix(U, 'It should print the total <b>once</b>, after all the numbers (N first, then N numbers). Right now it prints a line after every number. Fix it.',
    'n = int(input())\ntotal = 0\nfor i in range(n):\n    x = int(input())\n    total += x\n    print("Total:", total)',
    'n = int(input())\ntotal = 0\nfor i in range(n):\n    x = int(input())\n    total += x\nprint("Total:", total)',
    [['3', '1', '2', '3'], ['1', '5'], ['4', '10', '20', '30', '40']],
    'Indented lines belong to the loop body and run every pass. For 1, 2, 3 the buggy print runs three times (1, 3, 6). Move print back to the left edge so it runs once, after the loop.', skill=S, level=3)

fix(U, 'It should count down from N to 1 and then print <b>Liftoff!</b>. For N = 3 it must print 3, 2, 1, Liftoff! but the 1 is missing. Fix it.',
    'n = int(input())\nfor i in range(n, 1, -1):\n    print(i)\nprint("Liftoff!")',
    'n = int(input())\nfor i in range(n, 0, -1):\n    print(i)\nprint("Liftoff!")',
    [['3'], ['5'], ['1']],
    'range stops BEFORE its end value. Counting down, range(n, 1, -1) stops before 1 so it is never printed; range(n, 0, -1) stops before 0 so 1 is included. For N = 1 the buggy loop printed nothing at all.', skill=S, level=3,
    alts=['n = int(input())\nfor i in range(n):\n    print(n - i)\nprint("Liftoff!")'])

fix(U, 'It should print <b>Prime</b> or <b>Not prime</b>. But it says Prime for 9 and 15! The loop stops too early. Fix it.',
    'n = int(input())\nprime = True\nfor d in range(2, n):\n    if n % d == 0:\n        prime = False\n    break\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")',
    'n = int(input())\nprime = True\nfor d in range(2, n):\n    if n % d == 0:\n        prime = False\n        break\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")',
    [['9'], ['7'], ['15'], ['4']],
    'The break is at the loop level, so it ends the loop after the very first d (2) whatever happened. 9 % 2 is 1, the loop stopped, and 9 stayed Prime. Indent break under the if, or delete it.', skill=S, level=3,
    alts=['n = int(input())\nprime = True\nfor d in range(2, n):\n    if n % d == 0:\n        prime = False\nif prime:\n    print("Prime")\nelse:\n    print("Not prime")'])

# =====================================================================
# PREDICT: typed (type the exact output)
# =====================================================================
typed(U, 'def shout(word):\n    return word.upper() + "!"\n\nfor name in ["ana", "leo"]:\n    print(shout(name))',
      'The loop gives the function "ana" then "leo". Each call returns the word in capitals plus ! , so the lines are ANA! and LEO!.', skill=S, level=1)

typed(U, 'total = 0\ncount = 0\nprice = int(input())\nwhile price != 0:\n    total += price\n    count += 1\n    price = int(input())\nprint(count, total)',
      'The prices 4, 6, 10 are added (total 20) and counted (3). The 0 stops the loop before it is added. print with a comma shows 3 20.',
      stdin=['4', '6', '10', '0'], skill=S, level=2)

typed(U, 'def is_pal(w):\n    return w == w[::-1]\n\nfor w in ["noon", "moon", "a"]:\n    print(w, is_pal(w))',
      'noon backwards is noon (True), moon backwards is noom (False), and a one-letter word is its own reverse (True). Each line shows the word, a space, then the answer.', skill=S, level=2)

typed(U, 'nums = [4, 9, 2, 7, 5]\nbig = nums[0]\nfor n in nums:\n    if n > big:\n        big = n\n    print(big)',
      'big starts at 4. The print is inside the loop, so it shows big after EVERY number: 4, then 9 (9 is bigger), then 9, 9, 9 because 2, 7 and 5 are not bigger than 9.', skill=S, level=3)

typed(U, 'def initials(names):\n    result = ""\n    for n in names:\n        result += n[0].upper()\n    return result\n\nprint(initials(["ada", "bob", "cy"]))\nprint(len(initials(["x", "y"])))',
      'Each name gives its first letter in capitals: A, B, C glued to ABC. The second call builds XY, and len("XY") is 2, so the second line is the number 2.', skill=S, level=3)

typed(U, 'secret = 7\ntries = 0\nguess = int(input())\nwhile guess != secret:\n    tries += 1\n    if guess < secret:\n        print("low")\n    else:\n        print("high")\n    guess = int(input())\nprint("tries:", tries)',
      'The guesses 3 and 9 are wrong: 3 is below 7 (low), 9 is above (high). Each wrong guess adds 1, so tries is 2. The 7 ends the loop without being counted.',
      stdin=['3', '9', '7'], skill=S, level=3)

# =====================================================================
# PREDICT: multiple choice
# =====================================================================
out(U, 'def has_digit(s):\n    for ch in s:\n        if ch.isdigit():\n            return True\n    return False\n\nprint(has_digit("abc"), has_digit("a1"))',
    ['True True', 'True False', 'False False'],
    'has_digit("abc") checks a, b, c, finds no digit and reaches the last return: False. has_digit("a1") returns True as soon as it meets 1. So print shows False True.', skill=S, level=2)

out(U, 'word = input()\ncount = 0\nfor ch in word:\n    if ch in "aeiou":\n        count += 1\nprint(word, count)',
    ['Education 5', 'Education 3', 'Education 9'],
    'The test only knows lowercase vowels, so the capital E is skipped. Only u, a, i, o count: 4. The word has 5 vowels, but this program says 4.',
    stdin=['Education'], skill=S, level=3)

out(U, 'for i in range(1, 8):\n    if i % 2 == 0:\n        continue\n    if i > 5:\n        break\n    print(i)',
    ['1\n3\n5\n7', '2\n4\n6', '1\n3'],
    'continue skips the even numbers 2, 4, 6. The odd numbers 1, 3, 5 are printed. At 7, i > 5 is true so break ends the loop BEFORE the print: output 1, 3, 5.', skill=S, level=2)

out(U, 'count = 0\nchoice = input()\nwhile choice != "q":\n    if choice == "1":\n        count += 1\n    elif choice == "2":\n        count -= 1\n    choice = input()\nprint(count)',
    ['3', '4', '5'],
    'The choices 1, 1, 2, 1 change count: +1, +1, -1, +1 = 2. The q is not 1 or 2 and ends the loop, and the final print shows 2.',
    stdin=['1', '1', '2', '1', 'q'], skill=S, level=2)

# =====================================================================
# LINE: which line crashes?
# =====================================================================
line(U, 'n = int(input())\ntotal = 0\nfor i in range(n):\n    total += int(input())\nprint("Average:", total / count)',
     'The loop reads fine (4 + 6), but the last line uses a variable called count that was never created. That is a NameError on line 5.', stdin=['2', '4', '6'], skill=S, level=2)

line(U, 'def average(a, b):\n    return (a + b) / 2\n\nx = int(input())\ny = int(input())\nprint(average(x))',
     'The function needs TWO values but the call average(x) gives only one. Python crashes with a TypeError at the call, on line 6.', stdin=['4', '6'], skill=S, level=3)

line(U, 'scores = [90, 80, 70]\ntotal = 0\nfor i in range(len(scores) + 1):\n    total += scores[i]\nprint(total)',
     'The list has 3 items (positions 0, 1, 2), but range(4) also gives i = 3. scores[3] does not exist: IndexError on line 4, inside the loop.', skill=S, level=3)

# =====================================================================
# KNOW: choosing patterns
# =====================================================================
know(U, 'The spec says: "Show HOW MANY numbers in the list are bigger than 10." Which pattern does it need?',
     ['A counter: start at 0, add 1 when the test is true', 'An accumulator: add every number to a running total', 'Find the biggest: keep the largest number seen so far', 'A menu loop: repeat until the user types a quit key'],
     '"How many" means counting. Start count at 0 and do count += 1 only when a number is bigger than 10. An accumulator adds the values themselves, which is a different question.', skill=S, level=1)

know(U, 'A program must keep asking for a password until the user types the right one. Which loop fits best?',
     ['A while loop, because nobody knows how many tries it takes', 'A for loop with range(10), because ten tries is plenty', 'An if statement, because it only has to check one time', 'No loop, because input() repeats itself until it is right'],
     '"Keep asking until" means we do not know how many times in advance. A while loop checks the condition each time. A for loop needs a fixed count, and an if checks only once.', skill=S, level=1)

know(U, 'When finding the biggest of N typed numbers, why start big as the FIRST number instead of 0?',
     ['If every number is negative, 0 would wrongly stay the biggest', 'Python gives an error when a variable starts at the number 0', 'The loop cannot run when big is smaller than the first number', 'The first number you type is always the biggest one of all'],
     'With -5, -8, -1 typed, big = 0 would never be replaced, because no negative number is bigger than 0. Starting from the first number is always a real value from the data.', skill=S, level=2)

know(U, 'Your program finds the average of N typed numbers. Which test is the best EDGE case?',
     ['N = 1, with a single number', 'N = 5, with 10, 20, 30, 40 and 50', 'N = 4, with 2, 4, 6 and 8', 'N = 3, with 5, 6 and 7'],
     'Edge cases are the smallest or strangest input. With N = 1 the loop runs only once, which shows whether the start value and the division are right. Ordinary lists rarely reveal such bugs.', skill=S, level=2)

know(U, 'What is the best order for solving a project problem?',
     ['Restate it, pick the pattern, plan in comments, code, test', 'Code it, test it, restate it, pick the pattern, then plan', 'Pick the pattern, code it, test it, plan, then restate it', 'Plan in comments, test it, code it, restate, pick a pattern'],
     'Understand first (restate with an example), then choose the code shape (pattern), write the plan as comments, code it, and test with the example and an edge case. Coding first leads to rewrites.', skill=S, level=1)
