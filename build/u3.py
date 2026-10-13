from dsl import *
U = 3
out(U, 'name = input()\nprint("Hi", name)', ['Hi name', 'Hi', 'Hi, Ana'], 'name holds whatever the user typed (Ana).', stdin=['Ana'], skill='input')
out(U, 'x = input()\nprint(x)', ['"7"', 'x', '7.0'], 'It prints the characters the user typed. (It looks like a number, but it is really text.)', stdin=['7'], skill='input')
out(U, 'a = input()\nb = input()\nprint(a + b)', ['7', '3 + 4', 'Error: TypeError'], 'input() gives TEXT, so "3" + "4" glues to "34". No math!', stdin=['3', '4'], skill='input')
out(U, 'a = input()\nprint(a * 3)', ['15', '5 * 3', 'Error: TypeError'], 'a is the TEXT "5". Text times 3 repeats it: 555.', stdin=['5'], skill='input')
out(U, 'a = input()\nprint(a + 1)', ['6', '51', 'Error: ValueError'], 'You cannot add a number to text. input() gave text, so TypeError.', stdin=['5'], skill='input')
out(U, 'x = input("Name: ")\nprint(x)', ['Name: Zed', 'Name:', 'Zed Name:'], 'The "Name: " prompt is just a message for the user. x only holds what they TYPED.', stdin=['Zed'], skill='input')
out(U, 'first = input()\nlast = input()\nprint(first, last)', ['AdaLovelace', 'first last', 'Ada Lovelace'], 'The comma adds a space between the two typed words.', stdin=['Ada', 'Lovelace'], skill='input')
out(U, 'first = input()\nlast = input()\nprint(first + last)', ['Ada Lovelace', 'first + last', 'Ada+Lovelace'], '+ glues text with no space.', stdin=['Ada', 'Lovelace'], skill='input')
out(U, 'age = input()\nprint("You are", age, "years old")', ['You are age years old', 'You are 11years old', 'You are 11 years old'], 'age holds the text 11. Commas add spaces.', stdin=['11'], skill='input')
out(U, 'x = input()\ny = input()\nprint(x + " and " + y)', ['cats and dogs', 'x and y', 'catsanddogs'], 'Three pieces of text glued together.', stdin=['cats', 'dogs'], skill='input')
out(U, 'n = input()\nprint(n + n)', ['42', 'nn', 'Error: TypeError'], 'n is the text "21". "21" + "21" glues to 2121.', stdin=['21'], skill='input')
out(U, 'word = input()\nprint(word * 2)', ['hi 2', 'hi hi', 'hihi'], 'Text times 2 repeats it with no space.', stdin=['hi'], skill='input')
out(U, 'x = input()\nprint("x")', ['5', 'Error: NameError', '"x"'], 'Quotes make x plain text again, so it prints the letter x.', stdin=['5'], skill='input')
out(U, 'a = input()\nb = input()\nprint(a, b)', ['12', '1 2', 'a b'], 'Commas add a space. They are still text, no adding.', stdin=['1', '2'], skill='input')
out(U, 'n = input()\nprint(n - 1)', ['4', '51', 'Error: ValueError'], 'You cannot subtract a number from text: TypeError.', stdin=['5'], skill='input')
out(U, 'color = input()\nprint("I like", color)', ['I like color', 'I likeblue', 'I like blue'], 'color holds the text typed.', stdin=['blue'], skill='input')
out(U, 'a = input()\nb = input()\nprint(a * b)', ['6', '666', 'Error: TypeError'], 'You can only multiply TEXT by a whole NUMBER - not text by text. TypeError.', stdin=['2', '3'], skill='input', level=2)
out(U, 'x = input()\ny = x\nprint(y + "!")', ['9!', 'x!', 'Error: TypeError'], 'y is a copy of the text 9, then "!" is glued on.', stdin=['9'], skill='input')

for st, w in [('5', 'Even if you type digits, input() gives text.'), ('hello', 'Whatever the user types is a str.'), ('3.14', 'Still text - input() is always a str.'), ('100', 'Digits typed on the keyboard are still characters.')]:
    ty(U, 'x', w, setup='x = input()', stdin=[st], skill='input')
ty(U, 'input()', 'input() always gives a str.', stdin=['42'], skill='input')
ty(U, 'input() + input()', 'str + str = str (glued).', stdin=['4', '2'], skill='input')
ty(U, 'input() * 2', 'str times an int = a repeated str.', stdin=['4'], skill='input')
ty(U, 'input() + 1', 'str + int is a TypeError - it crashes.', stdin=['4'], skill='input')

typed(U, 'a = input()\nb = input()\nprint(a + b)', 'Typed 8 then 2: the text "8" glued to "2" is 82.', stdin=['8', '2'], skill='input')
typed(U, 'n = input()\nprint(n * 3)', 'The text 4 three times: 444.', stdin=['4'], skill='input')
typed(U, 'a = input()\nb = input()\nprint("Hello", a, b)', 'Hello, then the two typed words with spaces.', stdin=['Ann', 'Lee'], skill='input')
typed(U, 'x = input()\nprint(x, x)', 'Typed 5: prints 5 5.', stdin=['5'], skill='input')

fill(U, 'name = ___("What is your name? ")\nprint("Hi", name)', ['input', 'print', 'int'], 'Hi Sam', 'input() asks the question and waits for the answer.', stdin=['Sam'], skill='input')
fill(U, 'city = input("City: ")\nprint("I love", ___)', ['city', '"city"', 'City'], 'I love Rome', 'Use the variable name, no quotes, same capitalization.', stdin=['Rome'], skill='input')
fill(U, 'a = input()\nb = input()\nprint(a ___ b)', ['+', '-', '/'], 'ab', 'Text only supports + (glue) and * (repeat).', stdin=['a', 'b'], skill='input')

fix(U, 'The user types a name, but it prints the word "name". Fix it.', 'name = input()\nprint("name")', 'name = input()\nprint(name)', [['Ana'], ['Leo']],
    'Quotes make it text. Remove them to print the variable.', skill='input')
fix(U, 'Nothing is saved. The name should be printed after "Hello". Fix it.', 'input()\nprint("Hello", name)', 'name = input()\nprint("Hello", name)', [['Ana'], ['Leo']],
    'You must store the typed answer in a variable: name = input().', skill='input', level=2)
fix(U, 'Print the two typed words with a SPACE between them (Hello World).', 'a = input()\nb = input()\nprint(a + b)', 'a = input()\nb = input()\nprint(a, b)', [['Hello', 'World'], ['Ann', 'Lee']],
    'Use a comma (adds a space) instead of +.', skill='input')

write(U, 'Ask the user for their name using input(), then print <b>Hello</b> and the name, like: <b>Hello Ana</b>',
      'name = input()\nprint("Hello", name)', [['Ana'], ['Leo'], ['Dr. Who']], ['Store the answer: name = input()', 'name = input()\nprint("Hello", name)'],
      'input() stores what they typed.', skill='input', must=[[r'input\s*\(', 'Use input() to ask.']])
write(U, 'Ask for a word and print it TWICE next to each other with no space (word typed: <b>hi</b> prints <b>hihi</b>).',
      'w = input()\nprint(w + w)', [['hi'], ['Go'], ['ab']], ['Glue the text to itself.', 'w = input()\nprint(w + w)'],
      'Text + text = glued.', skill='input')
write(U, 'Ask for the user\'s favourite food and print: <b>I love pizza!</b> (if they typed pizza). Use + so there is no space before the !',
      'food = input()\nprint("I love " + food + "!")', [['pizza'], ['tacos']], ['"I love " has a space at the end.', 'food = input()\nprint("I love " + food + "!")'],
      'Glue the pieces: text + variable + text.', skill='input', must=[[r'\+', 'Use + to glue.']])
write(U, 'Ask for two words (two inputs). Print the SECOND one first, then the first, with a space between.',
      'a = input()\nb = input()\nprint(b, a)', [['up', 'down'], ['Ann', 'Lee']], ['Store each input in its own variable.', 'a = input()\nb = input()'],
      'Order of print() decides what shows first.', skill='input')

know(U, 'What type of value does input() ALWAYS give you?', ['str (text)', 'int', 'float', 'It depends what you type'], 'Always text - even if you type 7.', skill='input')
know(U, 'The user types 25. Which statement is TRUE?', ['input() gives the text "25", not the number 25', 'input() gives the number 25', 'input() gives 25.0', 'Python decides if it is text or number'], 'Python never guesses. input() = text.', skill='input')
know(U, 'What is the "prompt" in input("Age? ")?', ['The message shown to the user', 'The answer typed', 'The variable', 'A number'], 'The prompt is only the question shown on screen.', skill='input')
know(U, 'Where does the typed answer go if you write only input() with no variable?', ['Nowhere - it is lost', 'Into a variable called input', 'Into the print', 'It prints'], 'Use x = input() to keep it.', skill='input')
know(U, 'True or False: x = input() and the user types 3. Then x + 1 equals 4.', ['False - it crashes (TypeError)', 'True', 'False - it prints 31', 'False - it prints 3'], 'x is the text "3". Text + number = TypeError.', skill='input')
