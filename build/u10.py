from dsl import *
U = 10
S = 'strings'

# ---------------------------------------------------------------- out (predict / what happens)
out(U, 'print(len("Python"))', ['5', '7', 'Python'], 'len() counts the characters: P-y-t-h-o-n is 6 letters, so it prints 6.', skill=S)
out(U, 'print(len("hi there"))', ['7', '9', '2'], 'The space counts as a character: h, i, space, t, h, e, r, e = 8.', skill=S)
out(U, 'word = "planet"\nprint(word[0])', ['l', 'planet', 'Error: IndexError'], 'Positions start at 0, so word[0] is the FIRST letter: p.', skill=S)
out(U, 'word = "planet"\nprint(word[2])', ['l', 'n', 'Error: IndexError'], 'p is 0, l is 1, a is 2. So word[2] is "a", the THIRD letter (not the second).', skill=S)
out(U, 'word = "planet"\nprint(word[-1])', ['p', 'e', 'Error: IndexError'], 'A negative index counts from the end: -1 is the last character, t.', skill=S)
out(U, 'word = "planet"\nprint(word[6])', ['t', 'e', 'Error: ValueError'], '"planet" has 6 letters, so the positions are 0 to 5. Position 6 does not exist: IndexError.', skill=S)
out(U, 'print("rocket"[1:4])', ['ocke', 'rock', 'ket'], 'The slice starts AT 1 (o) and stops BEFORE 4. So it takes positions 1, 2, 3: o, c, k.', skill=S, level=2)
out(U, 'print("rocket"[:3])', ['rock', 'ro', 'ket'], 'Nothing before the colon means "start at 0". It stops before 3, so positions 0, 1, 2 = roc.', skill=S, level=2)
out(U, 'print("rocket"[2:])', ['ocket', 'ck', 'ro'], 'Nothing after the colon means "go to the end". From position 2 (c) to the end: cket.', skill=S, level=1)
out(U, 'print("rocket"[::-1])', ['rocket', 'ekcor', 'Error: TypeError'], 'The step -1 walks backwards through the whole string, so rocket becomes tekcor.', skill=S, level=2)
out(U, 'name = "sam"\nname.upper()\nprint(name)', ['SAM', 'None', 'Error: TypeError'], 'name.upper() makes a NEW string but nothing stores it, so name is still "sam".', skill=S)
out(U, 'name = "sam"\nname = name.upper()\nprint(name)', ['sam', 'Sam', 'name'], 'name = name.upper() stores the new string back into name, so name is now "SAM".', skill=S)
out(U, 'print("a-b-c".replace("-", " "))', ['a-b-c', 'a b-c', 'abc'], 'replace changes EVERY match, not just the first: both dashes become spaces.', skill=S)
out(U, 'print("banana".find("n"))', ['3', '1', 'Error: ValueError'], 'b is 0, a is 1, n is 2. find gives the position of the first match, which is 2.', skill=S)
out(U, 'print("cat".find("z"))', ['0', 'None', 'Error: ValueError'], 'find does not crash when it finds nothing. It returns -1, which means "not found".', skill=S, level=2)
out(U, 'print("A" in "cat")', ['True', 'A', 'Error: TypeError'], 'Capital A is not the same as lowercase a, so "A" is not in "cat". The answer is False.', skill=S, level=1)
out(U, 'text = "Hello"\ntext[0] = "J"\nprint(text)', ['Jello', 'Hello', 'Error: IndexError'], 'Strings cannot be changed in place. Assigning to text[0] is a TypeError.', skill=S, level=2)
out(U, 'print("ab" + "cd" * 2)', ['abcdabcd', 'ababcdcd', 'abcd2'], '* happens before +. "cd" * 2 is cdcd, then "ab" is glued on the front: abcdcd.', skill=S, level=3)
out(U, 'text = "hello"\ntext.replace("l", "L")\nprint(text)', ['heLLo', 'heLlo', 'Error: TypeError'], 'The replaced string is thrown away because it is not stored. text is still "hello".', skill=S, level=2)
out(U, 'for ch in "abc":\n    print(ch.upper())', ['ABC', 'a\nb\nc', 'abc'], 'The loop visits a, b, c one at a time. Each print starts a new line: A, B, C on 3 lines.', skill=S, level=2)
out(U, 'word = "Sassy"\nprint(word.lower().count("s"))', ['2', '1', '5'], 'lower() makes "sassy" first, so the capital S counts too: s-a-s-s-y has 3 s letters.', skill=S, level=3)
out(U, 'word = "level"\nprint(word == word[::-1])', ['level', 'False', 'Error: TypeError'], 'word[::-1] is "level" again, so the two are equal and == gives True.', skill=S, level=3)
out(U, 'name = "ada lovelace"\nprint(name[0].upper() + name[1:])', ['Ada Lovelace', 'ADA LOVELACE', 'ada lovelace'], 'Only the first letter is made a capital. name[1:] is the rest, "da lovelace", unchanged.', skill=S, level=3)

# ---------------------------------------------------------------- typed
typed(U, 'word = "python"\nprint(word[0], word[-1], len(word))', 'word[0] is p, word[-1] is n, len is 6. The commas put one space between them.', skill=S, level=1)
typed(U, 'print("Hello, World".upper())\nprint("Hello, World".lower())', 'upper() makes every letter a capital, lower() makes every letter small. Two prints = two lines.', skill=S, level=1)
typed(U, 'word = input()\nprint(word[:2] + word[-2:])', 'word[:2] is "pl" and word[-2:] is "et", glued together: plet.', stdin=['planet'], skill=S, level=3)
typed(U, 'text = input()\nprint(text.strip())\nprint(len(text))', 'strip() removes the spaces at both ends, but text itself still has them: 2 spaces + hi + 2 spaces = 6 characters.', stdin=['  hi  '], skill=S, level=2)
typed(U, 'text = "one two two"\nprint(text.count("two"), text.find("two"))\nprint(text.replace("two", "2"))', '"two" appears 2 times, first at position 4 (o-n-e-space is 0-3). Replace changes both of them.', skill=S, level=2)
typed(U, 'count = 0\nfor ch in "banana":\n    if ch == "a":\n        count += 1\nprint(count)', 'The letters of banana are b, a, n, a, n, a. The a letters add 1 each time, 3 in total.', skill=S, level=3)

# ---------------------------------------------------------------- ty
C = ['str', 'int', 'bool', 'Error']
ty(U, 'len("hello")', 'len() counts characters, and a count is a whole number.', skill=S, choices=C)
ty(U, '"hello"[1]', 'Indexing gives back ONE character, and a single character is still a string.', skill=S, choices=C)
ty(U, '"hello".find("l")', 'find gives the position of the first l (a whole number), not text.', skill=S, choices=C, level=2)
ty(U, '"hello".startswith("he")', 'Questions like startswith answer True or False, which is a bool.', skill=S, choices=C)
ty(U, '"7".isdigit()', 'isdigit() is a yes/no question, so it gives a bool, even though the text is a digit.', skill=S, choices=C, level=1)
ty(U, '"hello"[5]', 'The positions go 0 to 4. Position 5 is outside the word, so it crashes.', skill=S, choices=C, level=2)
ty(U, '"e" in "hello"', 'The in operator is a yes/no check, so the result is a bool.', skill=S, choices=C)

# ---------------------------------------------------------------- line
line(U, 'word = "apple"\nfirst = word[0]\nlast = word[5]\nprint(first, last)', '"apple" has 5 letters, so the last position is 4. word[5] on line 3 is an IndexError.', skill=S, level=2)
line(U, 'name = "sam"\nprint(name.upper())\nname[0] = "S"\nprint(name)', 'Line 2 is fine. Line 3 tries to change a letter inside a string, which is a TypeError.', skill=S, level=2)
line(U, 'age = input()\nprint(len(age))\nprint(age + 1)', 'age is the text "12". len works on text (line 2), but text + number on line 3 is a TypeError.', stdin=['12'], skill=S, level=2)
line(U, 'word = "hello"\nprint(word[1:3])\nprint(word[10:])\nprint(word[10])', 'Slices never crash, even past the end (line 3 just prints nothing). Only a single index crashes: line 4.', skill=S, level=3)

# ---------------------------------------------------------------- fill
fill(U, 'name = "ada"\nname = name.___()\nprint(name)', ['upper', 'strip', 'len'], 'ADA', 'upper() makes the capitals. strip() would leave "ada" and name.len() does not exist.', skill=S)
fill(U, 'word = "planet"\nprint(word[___])', ['-1', '6', 'last'], 't', 'Index -1 is the last character. word[6] is past the end and "last" is not defined.', skill=S)
fill(U, 'print("racecar"[___])', [':4', '4:', '::4'], 'race', '[:4] takes positions 0 to 3: race. [4:] would be car and [::4] would skip ahead by 4.', skill=S, level=2)

# ---------------------------------------------------------------- fix
fix(U, 'It should print the LAST letter of the word, but it crashes. Fix it.', 'word = input()\nprint(word[len(word)])',
    'word = input()\nprint(word[len(word) - 1])', [['planet'], ['a'], ['hello']],
    'len(word) is one more than the last position, because positions start at 0. Use len(word) - 1 or word[-1].', skill=S, alts=['word = input()\nprint(word[-1])'], level=2)
fix(U, 'It should print the name in CAPITAL letters but it prints the name unchanged. Fix it.', 'name = input()\nname.upper()\nprint(name)',
    'name = input()\nname = name.upper()\nprint(name)', [['sam'], ['zoe'], ['Maria']],
    'name.upper() makes a new string but the program throws it away. Store it with name = name.upper().', skill=S, alts=['name = input()\nprint(name.upper())'], level=1)
fix(U, 'It should print the FIRST THREE letters (typing planet prints pla), but it prints only two. Fix it.', 'word = input()\nprint(word[0:2])',
    'word = input()\nprint(word[0:3])', [['planet'], ['cat'], ['spaceship']],
    'A slice stops BEFORE the end number, so [0:2] gives positions 0 and 1 only. [0:3] gives 0, 1, 2.', skill=S, alts=['word = input()\nprint(word[:3])'], level=2)
fix(U, 'It should change the first letter to X (typing cat prints Xat) but it crashes. Fix it.', 'word = input()\nword[0] = "X"\nprint(word)',
    'word = input()\nword = "X" + word[1:]\nprint(word)', [['cat'], ['hello'], ['ab']],
    'You cannot change a letter inside a string. Build a NEW string: "X" plus everything from position 1 on.', skill=S, level=3)
fix(U, 'It should print Has an a when the text contains the letter a, otherwise No a. It gets some words wrong. Fix it.',
    'text = input()\nif text.find("a"):\n    print("Has an a")\nelse:\n    print("No a")',
    'text = input()\nif "a" in text:\n    print("Has an a")\nelse:\n    print("No a")', [['banana'], ['apple'], ['cherry']],
    'find returns a position, not True or False. "apple" gives 0 (counts as False) and "cherry" gives -1 (counts as True). Use "a" in text.', skill=S, level=3,
    alts=['text = input()\nif text.find("a") != -1:\n    print("Has an a")\nelse:\n    print("No a")', 'text = input()\nif text.find("a") >= 0:\n    print("Has an a")\nelse:\n    print("No a")', 'text = input()\nif text.count("a") > 0:\n    print("Has an a")\nelse:\n    print("No a")'])
fix(U, 'It should count the letter a in any word, big or small (Banana has 3). It misses the capital letters. Fix it.', 'text = input()\nprint(text.count("a"))',
    'text = input()\nprint(text.lower().count("a"))', [['Banana'], ['APPLE'], ['xyz']],
    'count is case-sensitive, so "A" is not "a". Make everything lowercase first with lower(), then count.', skill=S, level=3,
    alts=['text = input()\nprint(text.count("a") + text.count("A"))'])

# ---------------------------------------------------------------- write
write(U, 'Ask for a word. Print its <b>first letter</b> and its <b>last letter</b> with a space between them. Typing <code>planet</code> prints <code>p t</code>.',
      'word = input()\nprint(word[0], word[-1])', [['planet'], ['a'], ['hello'], ['xy']],
      ['The first letter is word[0].', 'The last letter is word[-1].', 'print(word[0], word[-1])'],
      'Index 0 is the first letter and -1 is the last. A one-letter word has the same letter in both places.', skill=S, level=1,
      alts=['word = input()\nprint(word[0], word[len(word) - 1])', 'word = input()\nprint(word[0] + " " + word[-1])'],
      must=[[r'\[', 'Use an index in square brackets, like word[0].']])
write(U, 'Ask for a word and print how many <b>vowels</b> (a, e, i, o, u) it has. All the letters are lowercase. <code>banana</code> prints <code>3</code>.',
      'word = input()\ncount = 0\nfor ch in word:\n    if ch in "aeiou":\n        count += 1\nprint(count)', [['banana'], ['rhythm'], ['education'], ['a']],
      ['Start with count = 0.', 'for ch in word: looks at one letter at a time.', 'if ch in "aeiou": count += 1'],
      'The loop checks each letter. If it is inside "aeiou", add 1 to count. rhythm has none, so it prints 0.', skill=S, level=3,
      alts=['word = input()\nprint(word.count("a") + word.count("e") + word.count("i") + word.count("o") + word.count("u"))',
            'word = input()\ncount = 0\nfor ch in word:\n    if ch == "a" or ch == "e" or ch == "i" or ch == "o" or ch == "u":\n        count += 1\nprint(count)',
            'word = input()\ncount = 0\ni = 0\nwhile i < len(word):\n    if word[i] in "aeiou":\n        count += 1\n    i += 1\nprint(count)'])
write(U, 'Ask for a word and print it <b>backwards</b>. <code>stressed</code> prints <code>desserts</code>.',
      'word = input()\nprint(word[::-1])', [['stressed'], ['a'], ['abc'], ['racecar']],
      ['A slice with a step of -1 walks backwards.', 'word[::-1]'],
      'The slice [::-1] reads the whole word from the end to the start.', skill=S, level=1,
      alts=['word = input()\nrev = ""\nfor ch in word:\n    rev = ch + rev\nprint(rev)'])
write(U, 'Make a <b>username</b>: ask for a name and print its <b>first 3 letters</b> followed by its <b>last 2 letters</b>, all in lowercase. <code>Elephant</code> prints <code>elent</code>.',
      'name = input().lower()\nprint(name[:3] + name[-2:])', [['Elephant'], ['jimmy'], ['MATILDA'], ['cart']],
      ['Make it lowercase with .lower().', 'name[:3] is the first three, name[-2:] is the last two.', 'Glue them with +'],
      'name[:3] takes positions 0, 1, 2 and name[-2:] takes the final two. lower() makes it all small letters.', skill=S, level=3,
      alts=['name = input()\nname = name.lower()\nprint(name[0:3] + name[len(name) - 2:])', 'name = input()\nprint((name[:3] + name[-2:]).lower())', 'name = input()\nprint(name[:3].lower() + name[-2:].lower())'],
      must=[[r'\[', 'Use slices in square brackets, like name[:3].']])
write(U, 'Ask for a first name, then a last name (two inputs). Print the two <b>initials</b> as capital letters with no space. <code>ada</code> and <code>lovelace</code> prints <code>AL</code>.',
      'first = input()\nlast = input()\nprint(first[0].upper() + last[0].upper())', [['ada', 'lovelace'], ['Zoe', 'Smith'], ['maria', 'bejar'], ['x', 'y']],
      ['The first letter of a name is first[0].', 'Make each one a capital with .upper()'],
      'Index 0 gives the first letter of each name, and upper() turns it into a capital. Then + glues the two letters.', skill=S, level=2,
      alts=['first = input()\nlast = input()\nprint((first[0] + last[0]).upper())', 'first = input()\nlast = input()\nprint(first[0].upper(), last[0].upper(), sep="")'],
      must=[[r'\[\s*0\s*\]', 'Use [0] to get the first letter.']])
write(U, 'Ask for a word. Print <code>True</code> if it reads the same <b>backwards</b> (a palindrome), otherwise print <code>False</code>. <code>level</code> prints <code>True</code>.',
      'word = input()\nprint(word == word[::-1])', [['level'], ['python'], ['a'], ['noon'], ['abca']],
      ['Reverse the word with word[::-1].', 'Compare the word with its reverse using ==.', 'print(word == word[::-1])'],
      'A palindrome equals its own reverse. The comparison == gives True or False, and print shows it.', skill=S, level=3,
      alts=['word = input()\nprint(word[::-1] == word)', 'word = input()\nback = word[::-1]\nprint(word == back)', 'word = input()\nif word == word[::-1]:\n    print(True)\nelse:\n    print(False)'])
write(U, 'Ask for a sentence and print it with every <b>space replaced by a dash</b>. <code>I like pizza</code> prints <code>I-like-pizza</code>.',
      'text = input()\nprint(text.replace(" ", "-"))', [['I like pizza'], ['one'], ['a b c d'], ['to be or not to be']],
      ['The replace method swaps one piece of text for another.', 'text.replace(" ", "-")'],
      'replace(" ", "-") swaps every space for a dash. A single word has no spaces, so it stays the same.', skill=S, level=2,
      alts=['text = input()\nout = ""\nfor ch in text:\n    if ch == " ":\n        out += "-"\n    else:\n        out += ch\nprint(out)'])
write(U, 'Ask for a name in any messy capitals and print it in <b>Title Case</b>. <code>mARIA lOPEZ</code> prints <code>Maria Lopez</code>.',
      'name = input()\nprint(name.title())', [['mARIA lOPEZ'], ['ADA LOVELACE'], ['sam'], ['jimmy bejar']],
      ['One string method does exactly this.', 'name.title()'],
      'title() makes the first letter of every word a capital and all the other letters small.', skill=S, level=2,
      must=[[r'\.title\s*\(', 'Use the title() method.']])
write(U, 'Ask for some text that may have extra spaces at the start and end. Remove them, make the text capitals, and add <code>!</code> at the end. <code>   hello there  </code> prints <code>HELLO THERE!</code>.',
      'text = input()\nprint(text.strip().upper() + "!")', [['   hello there  '], ['go'], ['  quiet please'], ['Wow   ']],
      ['strip() removes spaces from both ends.', 'You can chain methods: text.strip().upper()', 'Then + "!"'],
      'strip() removes the extra spaces first, upper() makes capitals, and + "!" glues the exclamation mark on the end.', skill=S, level=3,
      alts=['text = input()\ntext = text.strip()\ntext = text.upper()\nprint(text + "!")', 'text = input()\nprint(text.upper().strip() + "!")', 'text = input()\nprint(text.strip().upper(), end="")\nprint("!")'],
      must=[[r'\.strip\s*\(', 'Use strip() to remove the spaces.']])
write(U, 'Ask for some text. If it is all digits, print the number <b>plus 1</b>. Otherwise print <code>Not a number</code>. <code>41</code> prints <code>42</code>.',
      'text = input()\nif text.isdigit():\n    print(int(text) + 1)\nelse:\n    print("Not a number")', [['41'], ['abc'], ['7a'], ['0'], ['2.5']],
      ['isdigit() is True when the text is only digits.', 'Convert with int() only after the check.', 'if text.isdigit():'],
      'isdigit() protects int() from crashing. "7a" and "2.5" are not all digits, so they go to the else branch.', skill=S, level=3,
      must=[[r'isdigit\s*\(', 'Use isdigit() to check the text before converting.']])

# ---------------------------------------------------------------- know
know(U, 'What is the index (position number) of the FIRST letter in a string?', ['0', '1', '-1', 'It depends on the word'], 'Python counts positions from 0, so the first letter is at index 0.', skill=S)
know(U, 'Which one gives the LAST character of the string word?', ['word[-1]', 'word[len(word)]', 'word[-0]', 'word[last]'], 'A negative index counts from the end. word[len(word)] is too big by one and word[-0] is just word[0].', skill=S)
know(U, 'Which positions does text[2:5] take?', ['2, 3 and 4', '2, 3, 4 and 5', '3, 4 and 5', '1, 2, 3 and 4'], 'A slice starts AT the first number and stops BEFORE the second one, so 5 is left out.', skill=S, level=2)
know(U, 'What does text.find("x") give when there is no "x" in the text?', ['-1', '0', 'None', 'An error'], 'find returns -1 for "not found". 0 would mean found at the very first position.', skill=S, level=2)
know(U, 'Why does name.upper() on a line by itself NOT change name?', ['Strings cannot be changed, so the method returns a new string', 'upper() only works when it is inside a print()', 'Python forgets variables after one line of code', 'name must already be written in lowercase letters'], 'Strings are immutable. upper() hands back a NEW string, so you must store it: name = name.upper().', skill=S, level=2)
know(U, 'Which check is safest before running int(text) on typed text?', ['text.isdigit()', 'text.isalpha()', 'text.upper()', 'text.lower()'], 'isdigit() is True only when every character is a digit, so int(text) will not crash on it.', skill=S, level=2)
