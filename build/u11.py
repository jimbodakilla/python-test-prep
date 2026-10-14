from dsl import *
U = 11
S = 'lists'
def O(code, wrong, why, stdin=(), level=1): return out(U, code, wrong, why, stdin=stdin, skill=S, level=level)
def T(code, why, stdin=(), level=2): return typed(U, code, why, stdin=stdin, skill=S, level=level)
def TY(expr, why, setup='', choices=None, level=1): return ty(U, expr, why, setup=setup, skill=S, level=level, choices=choices or ['int', 'str', 'list', 'Error'])
def LN(code, why, stdin=(), level=2): return line(U, code, why, stdin=stdin, skill=S, level=level)
def FL(code, opts, want, why, stdin=(), level=1): return fill(U, code, opts, want, why, stdin=stdin, skill=S, level=level)
def FX(prompt, buggy, solution, tests, why, level=2, alts=()): return fix(U, prompt, buggy, solution, tests, why, skill=S, level=level, alts=alts)
def WR(prompt, solution, tests, hints, why, level=2, alts=(), must=(), starter=''): return write(U, prompt, solution, tests, hints, why, skill=S, level=level, alts=alts, must=must, starter=starter)
def KN(q, opts, why, code=None, level=1): return know(U, q, opts, why, skill=S, code=code, level=level)

# ---------------- 1. a list is a row of numbered boxes ----------------
O('scores = [90, 85, 77]\nprint(scores)', ['90 85 77', '90, 85, 77', '[90 85 77]'],
  'print shows a list the way you type it: square brackets and commas, so [90, 85, 77].')
O('names = ["Ana", "Bo"]\nprint(names)', ['[Ana, Bo]', 'Ana Bo', '["Ana", "Bo"]'],
  'A list of strings prints with brackets AND quotes around each string: [\'Ana\', \'Bo\'].')
O('a = [4, 8, 15, 16]\nprint(a[-1])', ['4', '15', '-1'],
  'A negative index counts from the end: a[-1] is the last box, which holds 16.')
O('a = [1, 2, 3]\nprint(a[3])', ['3', 'None', 'Error: ValueError'],
  'The indexes are 0, 1, 2. There is no box number 3, so Python raises an IndexError.')
O('a = [1, 2, 3]\na[1] = 100\nprint(a)', ['[100, 2, 3]', '[1, 100, 2, 3]', 'Error: TypeError'],
  'a[1] is the SECOND box (counting from 0). It is replaced by 100, so the list is [1, 100, 3].')
O('word = "cat"\nword[0] = "b"\nprint(word)', ['bat', 'cat', 'Error: IndexError'],
  'A string can NOT be changed box by box. Assigning to word[0] raises a TypeError. Lists can be changed, strings cannot.', level=2)
O('scores = [90, 85, 77\nprint(scores)', ['[90, 85, 77]', 'Error: IndexError', 'Error: NameError'],
  'The closing bracket ] is missing, so Python cannot even read the list. That is a SyntaxError.', level=2)

# ---------------- 2. methods ----------------
O('a = [1, 2]\na.append(3)\nprint(a)', ['[3, 1, 2]', '[1, 2]', '[1, 2, [3]]'],
  'append puts ONE new item at the END of the list: [1, 2, 3].')
O('a = [10, 20, 30]\na.insert(1, 99)\nprint(a)', ['[10, 20, 99, 30]', '[99, 10, 20, 30]', '[10, 99, 30]'],
  'insert(1, 99) puts 99 at index 1 and pushes the others right. Nothing is thrown away: [10, 99, 20, 30].', level=1)
O('a = [5, 6, 7]\nx = a.pop()\nprint(x)\nprint(a)', ['5\n[6, 7]', '[5, 6]\n7', '7\n[5, 6, 7]'],
  'pop() removes the LAST item AND gives it back. x is 7, and the list that is left is [5, 6].', level=1)
O('a = [3, 1, 3, 2]\na.remove(3)\nprint(a)', ['[1, 2]', '[3, 1, 2]', '[1, 3, 2, 3]'],
  'remove(3) deletes only the FIRST 3 it finds. The second 3 stays, so the list is [1, 3, 2].', level=2)
O('a = [3, 1, 2]\nx = a.sort()\nprint(x)', ['[1, 2, 3]', '[3, 1, 2]', 'Error: TypeError'],
  'sort() changes the list itself and RETURNS None. So x is None, not a sorted list.', level=2)
O('a = [3, 1, 2]\nb = sorted(a)\nprint(a)\nprint(b)', ['[1, 2, 3]\n[1, 2, 3]', '[3, 1, 2]\n[3, 1, 2]', '[1, 2, 3]\n[3, 1, 2]'],
  'sorted(a) makes a NEW sorted list and leaves a alone: a is still [3, 1, 2] and b is [1, 2, 3].', level=2)
O('a = [1, 2, 3]\nprint(a.reverse())\nprint(a)', ['[3, 2, 1]\n[3, 2, 1]', 'None\n[1, 2, 3]', '[3, 2, 1]\nNone'],
  'reverse() flips the list in place and returns None. The first print shows None; the list is now [3, 2, 1].', level=3)
O('a = [2, 5, 2, 7]\nprint(a.count(2))\nprint(a.index(7))', ['2\n4', '3\n3', '1\n3'],
  'count(2) counts how many 2s there are (two). index(7) gives the position of 7, which is 3 because we count from 0.', level=2)
O('print([1, 2] + [3])', ['[1, 2, [3]]', '[4]', '[1, 2][3]'],
  '+ joins two lists into one longer list: [1, 2, 3]. It does not add the numbers.')
O('print([1, 2] * 2)', ['[2, 4]', '[1, 2, 2]', '[1, 2][1, 2]'],
  '* repeats the whole list: [1, 2] twice in a row gives [1, 2, 1, 2]. It does not multiply the numbers.', level=1)
O('a = [10, 20, 30, 40, 50]\nprint(a[1:4])', ['[10, 20, 30, 40]', '[20, 30, 40, 50]', '[20, 30]'],
  'a[1:4] starts at index 1 and stops BEFORE index 4: the items at 1, 2, 3 are 20, 30, 40.', level=1)
O('fruits = ["fig", "kiwi"]\nprint("fi" in fruits)', ['True', 'fig', 'Error: TypeError'],
  'in checks for a whole item. "fi" is not one of the items "fig" and "kiwi", so the answer is False.', level=1)
O('a = [1]\na.append([2, 3])\nprint(a)', ['[1, 2, 3]', '[1, 2]', '[2, 3, 1]'],
  'append adds ONE item, and here that item is the whole list [2, 3]. So we get a list inside a list: [1, [2, 3]]. extend would add 2 and 3 separately.', level=3)
O('a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)', ['[1, 2, 3]', '[4]', '[1, 2, 3, 4, 4]'],
  'b = a does NOT copy. Both names point to the SAME list, so adding 4 through b also changes a.', level=3)

# ---------------- 3. loops over lists ----------------
O('a = ["x", "y", "z"]\nfor i in range(len(a)):\n    print(i, a[i])', ['1 x\n2 y\n3 z', 'x 0\ny 1\nz 2', '0 x\n1 y\n2 z\n3'],
  'len(a) is 3, so range(3) gives 0, 1, 2. Each line prints the position and the item at that position.', level=2)
O('scores = [90, 75, 82, 60]\ncount = 0\nfor s in scores:\n    if s > 80:\n        count += 1\nprint(count)', ['3', '4', '172'],
  'Only 90 and 82 are above 80, so count goes up twice and prints 2.', level=2)
O('a = [1, 2, 3]\nfor x in a:\n    x = x * 2\nprint(a)', ['[2, 4, 6]', '6', '[1, 4, 9]'],
  'x is only a COPY of each item. Doubling x does not touch the list, so a is still [1, 2, 3].', level=3)
O('for n in [1, 2]:\nprint(n)', ['1\n2', '[1, 2]', 'Error: SyntaxError'],
  'The line after for: must be indented. Without the indent Python raises an IndentationError.', level=2)

# ---------------- 4. building lists / split / join ----------------
O('nums = []\nfor i in range(3):\n    nums.append(int(input()))\nprint(sum(nums))', ['456', '[4, 5, 6]', 'Error: TypeError'],
  'int() makes each answer a number before append. sum(nums) adds 4 + 5 + 6 = 15.', stdin=['4', '5', '6'], level=2)
O('words = "red green blue".split()\nprint(words)', ['red green blue', '[red, green, blue]', "['red green blue']"],
  'split() cuts the text at every space and returns a list of three strings.')
O('print("-".join(["a", "b", "c"]))', ['a b c', 'abc', "['a-b-c']"],
  'join glues the items together with "-" between them, and the result is one STRING: a-b-c.', level=1)
O('print(list(range(5)))', ['[1, 2, 3, 4, 5]', '[0, 1, 2, 3, 4, 5]', 'range(5)'],
  'range(5) counts 0, 1, 2, 3, 4 (it stops before 5). list() turns that into a real list.')

# ---------------- typed ----------------
T('a = [5, 3, 8]\na.append(1)\na.sort()\nprint(a)', 'append makes [5, 3, 8, 1]. sort() puts them in order: [1, 3, 5, 8].', level=1)
T('nums = []\nfor i in range(3):\n    nums.append(int(input()))\nprint(nums)\nprint(max(nums))', 'The list keeps the typed order, and max picks the biggest: 9.', stdin=['4', '9', '2'])
T('a = [1, 2, 3]\nb = a.copy()\nb[0] = 50\nprint(a)\nprint(b)', 'copy() makes a separate list, so only b changes.', level=1)
T('a = [1, 2, 3, 4, 5]\nprint(a[::-1])\nprint(a[1:4])\nprint(a[-2:])', 'Slices of a list work like slices of a string. [::-1] reverses, [1:4] is indexes 1-3, [-2:] is the last two.', level=3)
T('squares = []\nfor n in range(1, 5):\n    squares.append(n * n)\nprint(squares)\nprint(sum(squares))', 'n goes 1, 2, 3, 4, so squares is [1, 4, 9, 16] and the sum is 30.')

# ---------------- ty ----------------
TY('[1, 2, 3]', 'Square brackets with items inside make a list.')
TY('scores[0]', 'One item taken out of a list of numbers is just a number.', setup='scores = [90, 85]')
TY('names[1]', 'Index 1 is the second box, which holds the string "Bo", so the type is str.', setup='names = ["Ana", "Bo"]')
TY('scores[:2]', 'A slice of a list is a LIST (even if it holds one item). A single index gives one item.', setup='scores = [90, 85, 77]')
TY('"a b c".split()', 'split() always returns a list of strings, here three of them.')
TY('" ".join(["a", "b"])', 'join glues the items together with spaces into ONE piece of text, so the type is str.')
TY('lst.sort()', 'sort() changes the list in place and gives back nothing, the special value None.', setup='lst = [3, 1]', choices=['list', 'NoneType', 'int', 'Error'], level=2)
TY('sum(prices) / len(prices)', 'sum is 6.0 and / always gives a float, even for a whole-number result.', setup='prices = [2.5, 3.5]', choices=['int', 'float', 'list', 'Error'], level=2)
TY('lst[5]', 'The list has only 3 boxes (0, 1, 2), so index 5 raises an IndexError.', setup='lst = [1, 2, 3]', level=1)

# ---------------- line ----------------
LN('nums = [3, 6, 9]\ntotal = 0\nfor i in range(len(nums) + 1):\n    total += nums[i]\nprint(total)', 'range(len(nums) + 1) gives 0, 1, 2, 3. When i is 3 there is no box 3, so line 4 raises an IndexError.')
LN('pets = ["cat", "dog"]\npets.append("fish")\npets.remove("bird")\nprint(pets)', '"bird" is not in the list, so line 3 raises a ValueError. append on line 2 is fine.', level=1)
LN('nums = []\nfor i in range(2):\n    nums.append(input())\nprint(len(nums))\nprint(sum(nums))', 'The list holds text, not numbers. sum(nums) on line 5 tries 0 + "3" and raises a TypeError.', stdin=['3', '4'])
LN('scores = [80, 90]\nscores.append(70)\nscores = scores + 100\nprint(scores)', 'You can only join a list with another list. scores + 100 on line 3 is a TypeError (use [100] or append).', level=1)

# ---------------- fill ----------------
FL('fruits = ["fig", "kiwi"]\nfruits.___("plum")\nprint(fruits)', ['append', 'add', 'push'], "['fig', 'kiwi', 'plum']",
   'append is the list method that adds one item at the end. add and push do not exist for lists.')
FL('scores = [90, 85, 77]\nprint(scores[___])', ['-1', '3', '1'], '77', 'Index -1 is the last box. Index 3 does not exist and index 1 would give 85.')
FL('a = [1, 2, 3]\nb = ___\nb.append(4)\nprint(a)', ['a.copy()', 'a', 'a.sort()'], '[1, 2, 3]', 'a.copy() makes a separate list. Plain b = a would change a too, and sort() returns None.', level=1)
FL('words = "red green blue".___()\nprint(len(words))', ['split', 'join', 'count'], '3', 'split() makes a list of words, and len counts them. join and count do something else.')
FL('names = ["Al", "Bo", "Cy"]\nfor i in range(___(names)):\n    print(names[i])', ['len', 'sum', 'max'], 'Al\nBo\nCy', 'range(len(names)) gives the positions 0, 1, 2.', level=2)

# ---------------- fix ----------------
FX('It should print the LAST word of the sentence, but it crashes. Fix it.',
   'words = input().split()\nprint(words[len(words)])',
   'words = input().split()\nprint(words[len(words) - 1])', [['a b c'], ['x y'], ['hello']],
   'The last index is len(words) - 1, because we start at 0. words[-1] works too.', alts=['words = input().split()\nprint(words[-1])'], level=1)
FX('It should print the numbers in order, smallest first. It prints None. Fix it.',
   'nums = []\nfor i in range(3):\n    nums.append(int(input()))\nnums = nums.sort()\nprint(nums)',
   'nums = []\nfor i in range(3):\n    nums.append(int(input()))\nnums.sort()\nprint(nums)', [['3', '1', '2'], ['9', '5', '7'], ['4', '4', '1']],
   'sort() changes the list and returns None, so nums = nums.sort() throws the list away.',
   alts=['nums = []\nfor i in range(3):\n    nums.append(int(input()))\nnums = sorted(nums)\nprint(nums)'])
FX('It should print ALL three names in a list, but it prints only the last one. Fix it.',
   'names = []\nfor i in range(3):\n    name = input()\n    names = [name]\nprint(names)',
   'names = []\nfor i in range(3):\n    name = input()\n    names.append(name)\nprint(names)', [['Ana', 'Bo', 'Cy'], ['x', 'y', 'z']],
   'names = [name] replaces the whole list each time. append adds to the list that already exists.')
FX('It should double every number in the list, but the list does not change. Fix it.',
   'nums = []\nfor i in range(3):\n    nums.append(int(input()))\nfor n in nums:\n    n = n * 2\nprint(nums)',
   'nums = []\nfor i in range(3):\n    nums.append(int(input()))\nfor i in range(len(nums)):\n    nums[i] = nums[i] * 2\nprint(nums)', [['1', '2', '3'], ['5', '0', '4']],
   'n is only a copy of each item. To change the list you must write into a position: nums[i] = nums[i] * 2.', level=3,
   alts=['nums = []\nfor i in range(3):\n    nums.append(int(input()))\ndoubled = []\nfor n in nums:\n    doubled.append(n * 2)\nprint(doubled)'])
FX('The backup should keep the ORIGINAL order, but it comes out sorted too. Fix it.',
   'original = [3, 1, 2]\nbackup = original\noriginal.sort()\nprint(backup)\nprint(original)',
   'original = [3, 1, 2]\nbackup = original.copy()\noriginal.sort()\nprint(backup)\nprint(original)', [[]],
   'backup = original gives ONE list two names. Use original.copy() to make a real backup.', level=3,
   alts=['original = [3, 1, 2]\nbackup = original[:]\noriginal.sort()\nprint(backup)\nprint(original)', 'original = [3, 1, 2]\nbackup = list(original)\noriginal.sort()\nprint(backup)\nprint(original)'])
FX('It should remove the fruit the user types, but it crashes when the fruit is not in the basket. Fix it.',
   'fruit = input()\nbasket = ["apple", "pear", "plum"]\nbasket.remove(fruit)\nprint(basket)',
   'fruit = input()\nbasket = ["apple", "pear", "plum"]\nif fruit in basket:\n    basket.remove(fruit)\nprint(basket)', [['pear'], ['kiwi'], ['apple']],
   'remove raises a ValueError when the value is missing. Check with "in" first.', level=3)

# ---------------- write ----------------
WR('Read <b>5 whole numbers</b> (one per line). Print the <b>largest</b> one. Practise: find it with a loop and an if.',
   'best = int(input())\nfor i in range(4):\n    n = int(input())\n    if n > best:\n        best = n\nprint(best)',
   [['3', '9', '2', '7', '5'], ['-4', '-9', '-1', '-7', '-3'], ['8', '8', '8', '8', '8'], ['10', '1', '2', '3', '4']],
   ['Start with the first number as your best so far.', 'For each other number: if n > best then best = n.'],
   'Keep the biggest number seen so far and update it when a bigger one comes.', level=3,
   must=[[r'\bfor\b|\bwhile\b', 'Use a loop.'], [r'\bif\b', 'Use an if to compare, instead of max().']],
   alts=['nums = []\nfor i in range(5):\n    nums.append(int(input()))\nbest = nums[0]\nfor n in nums:\n    if n > best:\n        best = n\nprint(best)'])
WR('First read <b>n</b> (how many numbers). Then read n numbers into a list. Print their <b>average</b>. (4, 5, 9 prints 6.0)',
   'n = int(input())\nnums = []\nfor i in range(n):\n    nums.append(int(input()))\nprint(sum(nums) / len(nums))',
   [['3', '4', '5', '9'], ['2', '1', '2'], ['1', '7'], ['4', '0', '0', '0', '0']],
   ['Make nums = [] first, then loop n times and append.', 'average = sum(nums) / len(nums)'],
   'Add every number to the list, then divide the sum by how many there are.',
   must=[[r'\.append\s*\(', 'Build a list with append.']],
   alts=['n = int(input())\nnums = []\nfor i in range(n):\n    nums.append(int(input()))\ntotal = 0\nfor x in nums:\n    total += x\nprint(total / n)'])
WR('Read a <b>limit</b>, then a line of numbers separated by spaces. Print <b>how many numbers are bigger</b> than the limit. (Limit 80 and "90 75 82 60" prints 2)',
   'limit = int(input())\nwords = input().split()\ncount = 0\nfor w in words:\n    if int(w) > limit:\n        count += 1\nprint(count)',
   [['80', '90 75 82 60'], ['5', '1 2 3'], ['5', '5 5 5'], ['0', '1 2 3 4']],
   ['input().split() gives a list of TEXT. Use int() on each item.', 'Add 1 to count when the number is bigger.'],
   'Loop over the list, convert each word to a number, and count the ones above the limit.', level=3,
   must=[[r'\bfor\b|\bwhile\b', 'Use a loop.']],
   alts=['limit = int(input())\nwords = input().split()\ncount = 0\nfor i in range(len(words)):\n    if int(words[i]) > limit:\n        count = count + 1\nprint(count)',
         'limit = int(input())\nnums = []\nfor w in input().split():\n    nums.append(int(w))\ncount = 0\nfor n in nums:\n    if n > limit:\n        count += 1\nprint(count)'])
WR('Read <b>4 words</b> (one per line). Print them in <b>reverse order</b>, one per line. Do it by hand with a loop. (a b c d prints d c b a, one per line)',
   'words = []\nfor i in range(4):\n    words.append(input())\nfor i in range(1, 5):\n    print(words[-i])',
   [['a', 'b', 'c', 'd'], ['one', 'two', 'three', 'four'], ['x', 'x', 'y', 'y']],
   ['Put the 4 words in a list first.', 'words[-1] is the last, words[-2] is the one before it. Or count the index down from 3.'],
   'Store the words, then walk the list backwards: the last index is len(words) - 1.', level=3,
   must=[[r'\bfor\b|\bwhile\b', 'Use a loop.']],
   alts=['words = []\nfor i in range(4):\n    words.append(input())\nfor i in range(3, -1, -1):\n    print(words[i])',
         'words = []\nfor i in range(4):\n    words.append(input())\nfor w in words[::-1]:\n    print(w)',
         'words = []\nfor i in range(4):\n    words.append(input())\nwords.reverse()\nfor w in words:\n    print(w)',
         'words = []\nfor i in range(4):\n    words.insert(0, input())\nfor w in words:\n    print(w)'])
WR('Read <b>5 whole numbers</b> and put them in a list. Print a new list with the <b>duplicates removed</b>, keeping the first time each number appears. (3 1 3 2 1 prints [3, 1, 2])',
   'unique = []\nfor i in range(5):\n    n = int(input())\n    if n not in unique:\n        unique.append(n)\nprint(unique)',
   [['3', '1', '3', '2', '1'], ['7', '7', '7', '7', '7'], ['1', '2', '3', '4', '5'], ['5', '4', '5', '4', '5']],
   ['Start with unique = [].', 'Only append n when n not in unique.'],
   'Check "not in" before every append, so a number is added only the first time.', level=3,
   must=[[r'\.append\s*\(', 'Build the new list with append.'], [r'\bin\b', 'Use "in" or "not in" to check the list.']],
   alts=['nums = []\nfor i in range(5):\n    nums.append(int(input()))\nunique = []\nfor n in nums:\n    if n not in unique:\n        unique.append(n)\nprint(unique)',
         'unique = []\nfor i in range(5):\n    n = int(input())\n    if n in unique:\n        pass\n    else:\n        unique.append(n)\nprint(unique)'])
WR('Read <b>5 different whole numbers</b>. Print the <b>second largest</b>. (5 9 1 7 3 prints 7)',
   'nums = []\nfor i in range(5):\n    nums.append(int(input()))\nnums.sort()\nprint(nums[-2])',
   [['5', '9', '1', '7', '3'], ['9', '8', '7', '6', '5'], ['1', '2', '3', '4', '5'], ['-5', '-2', '-9', '-1', '-7']],
   ['Put the numbers in a list.', 'After sort(), the largest is nums[-1]. Which one is second?'],
   'Sort the list; the biggest is last, so the second largest is at index -2.', level=3,
   must=[[r'\.append\s*\(', 'Put the numbers in a list with append.']],
   alts=['nums = []\nfor i in range(5):\n    nums.append(int(input()))\nprint(sorted(nums)[-2])',
         'nums = []\nfor i in range(5):\n    nums.append(int(input()))\nnums.sort(reverse=True)\nprint(nums[1])',
         'nums = []\nfor i in range(5):\n    nums.append(int(input()))\nnums.remove(max(nums))\nprint(max(nums))'])
WR('Read a number <b>n</b>. Print a list of the <b>first n square numbers</b> (1, 4, 9 ...). (5 prints [1, 4, 9, 16, 25])',
   'n = int(input())\nsquares = []\nfor i in range(1, n + 1):\n    squares.append(i * i)\nprint(squares)',
   [['5'], ['1'], ['3'], ['0']],
   ['Start with squares = [].', 'range(1, n + 1) gives 1 up to n.'],
   'Loop i from 1 to n, and append i * i each time. For n = 0 the loop never runs and the list stays empty.',
   must=[[r'\.append\s*\(', 'Build the list with append.']],
   alts=['n = int(input())\nsquares = []\nfor i in range(n):\n    squares.append((i + 1) * (i + 1))\nprint(squares)',
         'n = int(input())\nsquares = []\ni = 1\nwhile i <= n:\n    squares.append(i ** 2)\n    i += 1\nprint(squares)'])
WR('Read <b>4 prices</b> (decimals, one per line) into a list. Print how many items there are, then the total with 2 decimals, like this:<br><code>Items: 4</code><br><code>Total: 7.25</code>',
   'prices = []\nfor i in range(4):\n    prices.append(float(input()))\ntotal = sum(prices)\nprint("Items:", len(prices))\nprint(f"Total: {total:.2f}")',
   [['2.5', '1.25', '3', '0.5'], ['0', '0', '0', '0'], ['10', '10', '10', '10'], ['0.75', '0.5', '0.25', '1']],
   ['Use float(input()) so decimals work.', 'f"Total: {total:.2f}" prints 2 decimals.'],
   'append each price, then len gives the item count and sum gives the total.', level=3,
   must=[[r'\.append\s*\(', 'Build the list with append.']],
   alts=['prices = []\nfor i in range(4):\n    prices.append(float(input()))\ntotal = 0\nfor p in prices:\n    total += p\nprint("Items:", len(prices))\nprint(f"Total: {total:.2f}")'])
WR('Read a sentence. Print its words joined with a dash <code>-</code>. (red green blue prints red-green-blue)',
   'words = input().split()\nprint("-".join(words))',
   [['red green blue'], ['hello'], ['a b'], ['one two three four five']],
   ['split() makes the list.', '"-".join(list) glues it back.'],
   'split() turns the sentence into a list and "-".join puts the dashes between the items.',
   must=[[r'\.join\s*\(', 'Use join.']],
   alts=['print("-".join(input().split()))'])

# ---------------- know ----------------
KN('What is the index of the FIRST item in a list?', ['0', '1', '-1', '10'],
   'Python counts from 0, so the first box is index 0 and the last box of a 3-item list is index 2.')
KN('A list has 5 items. What is the biggest valid index?', ['4', '5', '6', '1'],
   'The indexes are 0, 1, 2, 3, 4. Index 5 would raise an IndexError.')
KN('What is the difference between append and insert?', ['append adds at the end; insert picks the position', 'append adds at the start; insert adds at the end', 'append copies the list; insert changes the list', 'They do exactly the same thing in Python'],
   'a.append(x) always goes to the end. a.insert(i, x) puts x at index i and shifts the others along.', level=2)
KN('What does a.sort() return?', ['None, because it sorts the list in place', 'A new list in sorted order', 'The smallest item in the list', 'The same list but backwards'],
   'sort() changes a itself and returns None. That is why x = a.sort() leaves x empty-handed. Use sorted(a) to get a new list.', level=2)
KN('After b = a (a is a list), what is true?', ['a and b are two names for the same list', 'b is a separate copy of the list a', 'b holds only the first item of a', 'Python shows a TypeError right away'],
   'Assignment never copies a list. To get a copy, write b = a.copy().', level=3)
KN('When should you use for i in range(len(a)) instead of for x in a?', ['When you need the position of each item', 'When the list has more than ten items', 'When every item in the list is a number', 'Never, because both always work the same'],
   'for x in a only gives the values. range(len(a)) gives the positions, which you need for a[i] = ... or for printing the index.', level=2)
