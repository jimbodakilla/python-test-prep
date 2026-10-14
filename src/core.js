/* core: tiny DOM helper, storage, RNG, syntax highlighter, friendly error explainer */
'use strict';
const D = window.PYDATA;
const PF = window.PyFun;
const ITEMS = D.items;
const BYID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const SKILL_NAMES = D.skills;
const CORE_SKILLS = D.testSkills, LEVEL_SKILLS = D.levelSkills, ALL_SKILLS = [...D.testSkills, ...D.levelSkills];
const UNITS = D.units, unitTrack = u => (UNITS[u] || { track: 'level' }).track, unitTitle = u => (UNITS[u] || {}).title || '';
const TEST_UNITS = Object.keys(UNITS).map(Number).filter(u => UNITS[u].track === 'test'), LEVEL_UNITS = Object.keys(UNITS).map(Number).filter(u => UNITS[u].track === 'level');

/* ---------- DOM ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = x => Math.round(x * 100);

/* ---------- storage (never trust it to exist) ---------- */
const dayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const Store = {
  key: 'pyprep.v1', data: null,
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.key)); } catch (e) { d = null; }
    if (!d || typeof d !== 'object' || Array.isArray(d)) d = {};
    const obj = x => (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}, arr = x => Array.isArray(x) ? x : [];
    d.items = obj(d.items); d.lessons = obj(d.lessons); d.best = obj(d.best); d.visited = obj(d.visited); d.plan = obj(d.plan);
    d.sessions = arr(d.sessions).filter(s => s && typeof s === 'object'); d.mocks = arr(d.mocks).filter(m => m && Number.isFinite(m.total) && m.total > 0);
    d.xp = Number.isFinite(d.xp) ? d.xp : 0; d.bestStreak = Number.isFinite(d.bestStreak) ? d.bestStreak : 0; d.runs = Number.isFinite(d.runs) ? d.runs : 0;
    d.days = arr(d.days).filter(x => typeof x === 'string').slice(-120); d.badgesSeen = obj(d.badgesSeen);
    if (d.theme !== 'light' && d.theme !== 'dark') delete d.theme;
    this.data = d;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* private mode: keep in memory */ } },
  record(id, ok) {
    if (String(id)[0] === 'g') return;            // generated questions are not tracked
    const r = this.data.items[id] || { n: 0, right: 0, ever: false };
    r.n++; if (ok) { r.right++; r.ever = true; } r.last = ok; r.ts = Date.now();
    this.data.items[id] = r; this.markDay(); this.save();
  },
  markDay() { const t = dayKey(new Date()); if (!this.data.days.includes(t)) { this.data.days.push(t); this.data.days = this.data.days.slice(-120); } },
  addXp(n) {
    const before = levelInfo(this.data.xp); this.data.xp += n; this.save();
    if (window.paintChrome) window.paintChrome(true);
    const after = levelInfo(this.data.xp);
    if (after.n > before.n) setTimeout(() => celebrate({ title: 'Level ' + after.n + '!', text: 'You are now a ' + after.name + '.', mood: 'cheer', confetti: true }), 900);
  },
  reset() { this.data = null; try { localStorage.removeItem(this.key); } catch (e) {} this.load(); },
};
Store.load();

/* ---------- RNG ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng((Date.now() ^ (Math.random() * 2 ** 32)) >>> 0);
function shuffle(arr, r = R) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pick = (arr, r = R) => arr[Math.floor(r() * arr.length)];
const randInt = (a, b, r = R) => a + Math.floor(r() * (b - a + 1));

/* ---------- text normalising (same rule the build used for answer keys) ---------- */
function norm(s) { return String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, ''); }

/* ---------- mastery ---------- */
function skillStats() {
  const out = {};
  for (const s of ALL_SKILLS) out[s] = { total: 0, solved: 0, tried: 0, wrongNow: 0 };
  for (const it of ITEMS) {
    const st = out[it.skill]; if (!st) continue;
    st.total++;
    const r = Store.data.items[it.id];
    if (r) { st.tried++; if (r.last) st.solved++; else st.wrongNow++; }
  }
  for (const s of ALL_SKILLS) { const st = out[s]; st.mastery = Math.min(1, st.solved / Math.min(st.total, 12)); }
  return out;
}
function overallReadiness() {
  const st = skillStats(); return CORE_SKILLS.reduce((a, s) => a + st[s].mastery, 0) / CORE_SKILLS.length;
}
function levelReadiness() {
  const st = skillStats(); return LEVEL_SKILLS.reduce((a, s) => a + st[s].mastery, 0) / LEVEL_SKILLS.length;
}
function unitStats(u) {
  const its = ITEMS.filter(i => i.unit === u);
  let solved = 0, tried = 0;
  for (const it of its) { const r = Store.data.items[it.id]; if (r) { tried++; if (r.last) solved++; } }
  return { total: its.length, solved, tried, mastery: Math.min(1, solved / Math.min(its.length, 15)) };
}

/* ---------- syntax highlighting ---------- */
const BUILTINS = new Set(['print', 'input', 'int', 'float', 'str', 'type', 'round', 'abs', 'len', 'max', 'min', 'range', 'sum', 'sorted', 'list', 'bool']);
const CONSTS = new Set(['True', 'False', 'None', 'if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return', 'break', 'continue', 'pass', 'global', 'and', 'or', 'not']);
const HL_RE = /(#.*$)|([fFrR]{0,2}(?:"(?:\\.|[^"\\])*(?:"|$)|'(?:\\.|[^'\\])*(?:'|$)))|(\b\d+\.?\d*(?:[eE][+-]?\d+)?\b|\.\d+)|([A-Za-z_][A-Za-z_0-9]*)|(\*\*|\/\/|[+\-*\/%=<>!]=?)/g;
function hlLine(line) {
  let out = '', last = 0, m; HL_RE.lastIndex = 0;
  while ((m = HL_RE.exec(line))) {
    out += esc(line.slice(last, m.index)); last = m.index + m[0].length;
    if (m[1] != null) out += `<span class="tk-c">${esc(m[1])}</span>`;
    else if (m[2] != null) {
      let s = esc(m[2]);
      if (/^[fF]/.test(m[2])) s = s.replace(/\{[^{}]*\}/g, x => `<span class="tk-fx">${x}</span>`);
      out += `<span class="tk-s">${s}</span>`;
    } else if (m[3] != null) out += `<span class="tk-n">${esc(m[3])}</span>`;
    else if (m[4] != null) out += BUILTINS.has(m[4]) ? `<span class="tk-b">${m[4]}</span>` : CONSTS.has(m[4]) ? `<span class="tk-k">${m[4]}</span>` : esc(m[4]);
    else out += `<span class="tk-o">${esc(m[5])}</span>`;
  }
  return out + esc(line.slice(last));
}
function highlight(code, errLine, curLine) {
  return code.split('\n').map((ln, i) =>
    `<span class="ln${i + 1 === errLine ? ' ln-err' : ''}${i + 1 === curLine ? ' ln-cur' : ''}">${hlLine(ln) || ' '}</span>`).join('\n');
}
function codeBlock(code, opts = {}) {
  const lines = code.split('\n');
  const el = h('div', { class: 'codeblock' + (opts.compact ? ' compact' : '') },
    h('div', { class: 'cb-gutter', 'aria-hidden': 'true' }, lines.map((_, i) => h('span', null, String(i + 1)))),
    h('pre', { class: 'cb-code', html: highlight(code, opts.errLine, opts.curLine) }));
  return el;
}

/* ---------- friendly error explanations ---------- */
const an = w => (/^[aeiou]/.test(w) ? 'an <b>' : 'a <b>') + w + '</b>';
function explainError(err, vars, code) {
  const t = err.type, m = err.msg || '';
  const names = (vars || []).map(v => v.name);
  let mm;
  const E = (what, fix) => ({ what, fix });
  if (t === 'TimeLimit') return E('Your program ran for a very long time. It is probably stuck in a loop that <b>never ends</b>.', 'In a <code>while</code> loop, something inside must change so the condition becomes False (like <code>count = count + 1</code>). A <code>for</code> loop over <code>range()</code> always ends. Press Stop next time.');
  if (t === 'IndexError') {
    if (/string index/.test(m)) return E('You asked for a letter at a position that does not exist. Positions start at <b>0</b>, so a word with 5 letters ends at position <b>4</b>.', 'The last letter is <code>text[-1]</code> or <code>text[len(text) - 1]</code>.');
    if (/pop/.test(m)) return E('You tried to <code>pop</code> from an empty list or from a position that is not there.', 'Check <code>len(list)</code> first.');
    return E('You asked for a list position that does not exist. A list with 3 items has positions <b>0, 1, 2</b> (not 3).', 'The last item is <code>my_list[-1]</code> or <code>my_list[len(my_list) - 1]</code>. In a loop, <code>range(len(my_list))</code> stops at the right place.');
  }
  if (t === 'UnboundLocalError') return E('Inside a function, assigning to a name makes it a <b>new local variable</b> that starts empty. You read it before giving it a value.', 'Pass the value in as a parameter and <code>return</code> the new value. (Or add <code>global name</code> as the first line of the function.)');
  if (t === 'RecursionError') return E('A function kept calling itself and never stopped.', 'Check that the function does not call itself without an ending condition.');
  if (t === 'AttributeError') {
    mm = /'(\w+)' object has no attribute '(\w+)'/.exec(m);
    if (mm && mm[1] === 'NoneType') return E('This value is <b>None</b> (nothing). A function with no <code>return</code>, or <code>list.sort()</code> / <code>append()</code>, gives back None.', 'Do not store the result of <code>sort()</code> or <code>append()</code>. Call <code>my_list.sort()</code> on its own line, then use <code>my_list</code>.');
    if (mm) return E('A <b>' + mm[1] + '</b> does not have a method called <code>' + esc(mm[2]) + '</code>. Methods belong to a type: strings have <code>upper()</code>, lists have <code>append()</code>.', 'Check the spelling and the type with <code>print(type(x))</code>.');
  }
  if (t === 'TypeError') {
    if (/NoneType/.test(m) && /unsupported operand|not subscriptable|not iterable|has no len/.test(m)) return E('One of the values is <b>None</b> (nothing). A function that only <b>prints</b> (no <code>return</code>) gives back None, and so does <code>list.sort()</code>.', 'Use <code>return value</code> inside the function, then store the result: <code>x = my_function(...)</code>.');
    if ((mm = /(\w+)\(\) missing (\d+) required positional argument/.exec(m))) return E('You called <code>' + mm[1] + '()</code> with <b>too few</b> values. It needs ' + mm[2] + ' more.', 'Look at the <code>def</code> line: every parameter without a default needs a value when you call it.');
    if ((mm = /(\w+)\(\) takes .* but (\d+) w/.exec(m))) return E('You gave <code>' + mm[1] + '()</code> <b>too many</b> values (' + mm[2] + ').', 'Count the parameters in the <code>def</code> line and give exactly that many.');
    if (/does not support item assignment/.test(m)) return E('A string <b>cannot be changed</b> letter by letter.', 'Build a new string: <code>word = "b" + word[1:]</code>');
    if (/indices must be integers/.test(m)) return E('The number inside <code>[ ]</code> must be a <b>whole number (int)</b>.', 'Convert with <code>int()</code>, or check that you are not using text.');
    if (/is not subscriptable/.test(m)) return E('You used <code>[ ]</code> on something that has no positions (like a number).', 'Only strings, lists and ranges can be indexed.');
    if (/is not iterable/.test(m)) return E('A <code>for</code> loop (or <code>in</code>) needs something to go through: a list, a string, or <code>range(...)</code>.', 'To repeat N times use <code>for i in range(N):</code>.');
    if (/is not callable/.test(m)) return E('You put <code>( )</code> after something that is not a function (maybe a variable with the same name as a function).', 'Check the name. Do not name a variable <code>list</code>, <code>sum</code>, <code>max</code>...');
    if (/has no len/.test(m)) return E('<code>len()</code> counts letters or items. A number has neither.', 'Use <code>len(str(number))</code> to count digits.');
    if (/can only concatenate list/.test(m)) return E('You used + to join a list with something that is not a list.', 'To add one item use <code>my_list.append(item)</code>, or wrap it: <code>my_list + [item]</code>.');
    if (/not supported between instances/.test(m)) return E('You compared two things of different kinds, like text and a number.', 'Convert first: <code>int(input())</code>. (Comparing numbers as text gives surprises: "10" &lt; "9" is True.)');
  }
  if (t === 'ValueError') {
    if (/list\.remove|is not in list|substring not found/.test(m)) return E('You asked to find or remove something that is <b>not there</b>.', 'Check first with <code>if item in my_list:</code>.');
    if (/iterable argument is empty/.test(m)) return E('<code>min()</code> / <code>max()</code> need at least one value, but the list is empty.', 'Check <code>len(list) > 0</code> first.');
  }
  if (t === 'IndentationError') {
    if (/expected an indented block/.test(m)) return E('After a line that ends with a <b>colon :</b> the next line must be <b>indented</b> (4 spaces) - that is how Python knows what belongs inside.', 'Press Tab (or 4 spaces) at the start of the lines that belong inside the <code>if</code> / <code>for</code> / <code>while</code> / <code>def</code>.');
    if (/unindent does not match/.test(m)) return E('The lines in one block must start in exactly the <b>same column</b>.', 'Use the same number of spaces for every line inside the block.');
  }
  if (t === 'SyntaxError') {
    if (/expected ':'/.test(m)) return E('Lines that start with <code>if</code>, <code>elif</code>, <code>else</code>, <code>for</code>, <code>while</code> or <code>def</code> must end with a <b>colon :</b>', 'Add <code>:</code> at the end of that line.');
    if (/Maybe you meant '==' or ':='/.test(m)) return E('In an <code>if</code> or <code>while</code> you <b>compare</b> with <code>==</code> (two equal signs). One <code>=</code> means store.', 'Change <code>=</code> to <code>==</code>.');
    if (/outside (function|loop)|not properly in loop/.test(m)) return E('<code>return</code> only works inside a function, and <code>break</code> / <code>continue</code> only inside a loop.', 'Check the indentation, or remove it.');
  }
  if (t === 'NotInCourse') return E(m + '.', 'You do not need it for this test. Take it out and use only print, input, int, float and variables.');
  if (t === 'TypeError') {
    if ((mm = /can only concatenate str \(not "(\w+)"\) to str/.exec(m)))
      return E('You used <b>+</b> to glue text and ' + (/^[aeiou]/.test(mm[1]) ? 'an' : 'a') + ' <b>' + mm[1] + '</b>. The + sign only joins text with text, or adds number with number.',
        'In print(), use a <b>comma</b> instead: <code>print("Age:", age)</code>. Or, if the number came from input(), convert the TEXT to a number with <code>int()</code> or <code>float()</code> first.');
    if ((mm = /unsupported operand type\(s\) for (\S+): '(\w+)' and '(\w+)'/.exec(m))) {
      const strSide = mm[2] === 'str' || mm[3] === 'str';
      return strSide
        ? E('One side of <b>' + mm[1].replace('=', '') + '</b> is <b>text (str)</b> and the other is ' + an(mm[2] === 'str' ? mm[3] : mm[2]) + '. Text cannot do math with numbers.',
            'Remember: <b>input() always gives text</b>. Wrap it: <code>int(input())</code> or <code>float(input())</code> so you can do math.')
        : E('Python cannot use <b>' + mm[1] + '</b> on a ' + mm[2] + ' and a ' + mm[3] + '.', 'Check the types of both sides.');
    }
    if ((mm = /can't multiply sequence by non-int of type '(\w+)'/.exec(m)))
      return E('You tried to multiply <b>text</b> by ' + (mm[1] === 'str' ? '<b>more text</b>' : 'a <b>' + mm[1] + '</b>') + '. Text can only be repeated by a <b>whole number (int)</b>, like <code>"ab" * 3</code>.',
        'If both came from input(), convert one to a number with <code>int()</code>.');
    if (/bad operand type for unary/.test(m)) return E('You put a minus sign in front of text.', 'Only numbers can be negative.');
    if (/int\(\) argument must be/.test(m) || /float\(\) argument must be/.test(m)) return E('int()/float() got something it cannot convert.', 'Give it text that looks like a number, or a number.');
    return E('You mixed types that do not go together.', 'Check which values are text (quotes, input()) and which are numbers.');
  }
  if (t === 'ValueError') {
    if ((mm = /invalid literal for int\(\) with base 10: (.*)$/.exec(m))) {
      const raw = mm[1].replace(/^['"]|['"]$/g, '');
      let fix = '<code>int()</code> only understands whole-number text like <code>"42"</code>.';
      if (/^\s*[+-]?\d*\.\d*\s*$/.test(raw) && /\d/.test(raw)) fix = 'Text with a decimal point cannot go into <code>int()</code>. Use <b><code>float()</code></b> for decimals.';
      else if (raw.trim() === '') fix = 'The text was <b>empty</b> (the user just pressed Enter).';
      else if (/^[a-zA-Z]+$/.test(raw)) fix = 'That is a word, not digits.';
      else if (/\d\s+\d/.test(raw)) fix = 'There is a space between the digits, so it is not ONE number.';
      return E('You asked <code>int()</code> to turn <b>' + esc(mm[1]) + '</b> into a whole number, but it cannot.', fix);
    }
    if ((mm = /could not convert string to float: (.*)$/.exec(m)))
      return E('You asked <code>float()</code> to turn <b>' + esc(mm[1]) + '</b> into a decimal number, but it cannot.', 'float() needs text that looks like a number, like <code>"3.5"</code> (a dot, not a comma).');
    return E('The value is the right type but a bad value for that command.', 'Check what was typed or stored.');
  }
  if (t === 'NameError') {
    const nm = (/name '(.*)' is not defined/.exec(m) || [])[1] || '';
    const lower = nm.toLowerCase();
    if (['print', 'input', 'int', 'float', 'str'].includes(lower) && nm !== lower)
      return E('Python commands are <b>all lowercase</b>. <code>' + esc(nm) + '</code> is not the same as <code>' + lower + '</code>.', 'Write <code>' + lower + '</code> with small letters.');
    const near = names.find(n => n.toLowerCase() === lower && n !== nm);
    if (near) return E('Python does not know <code>' + esc(nm) + '</code>. But you made a variable called <code>' + esc(near) + '</code>. <b>Capital letters matter!</b>', 'Use exactly <code>' + esc(near) + '</code>.');
    if (['print', 'input', 'int', 'float', 'str'].some(f => lower.length > 2 && f !== lower && lev(lower, f) <= 1))
      return E('Python does not know <code>' + esc(nm) + '</code>. Is it a typo of a command?', 'Check the spelling: print, input, int, float.');
    return E('Python does not know the word <code>' + esc(nm) + '</code>. Either you <b>forgot the quotes</b> (if it should be text), or you <b>never created the variable</b> (or spelled it differently).',
      'Text needs quotes: <code>print("' + esc(nm) + '")</code>. A variable needs <code>' + esc(nm) + ' = something</code> BEFORE you use it.');
  }
  if (t === 'SyntaxError' || t === 'IndentationError') {
    if (/unterminated string/.test(m)) return E('You started some text with a quote but <b>never closed it</b>.', 'Every opening <code>"</code> needs a closing <code>"</code> on the same line.');
    if (/was never closed/.test(m)) return E('You opened a bracket <b>' + (/'(.)'/.exec(m) || [])[1] + '</b> but never closed it.', 'Every <code>(</code> needs a matching <code>)</code>.');
    if (/unmatched/.test(m)) return E('There is a <b>closing bracket with no opening bracket</b> (or one too many).', 'Count your brackets: each <code>(</code> needs exactly one <code>)</code>.');
    if (/Missing parentheses/.test(m)) return E('<code>print</code> needs <b>brackets</b>.', 'Write <code>print("...")</code>.');
    if (/Perhaps you forgot a comma/.test(m)) return E('Two things are next to each other with nothing between them.', 'Put a <b>comma</b> between them (or a <b>+</b> if both are text).');
    if (/cannot assign to/.test(m)) return E('The <b>left side of = must be a variable name</b>. You can only store a value INTO a name.', 'Write it like <code>age = 11</code>, name on the left.');
    if (/unexpected indent/.test(m)) return E('This line starts with spaces, but it should start at the very left.', 'Delete the spaces at the start of the line.');
    if (/leading zeros/.test(m) || /invalid decimal literal/.test(m)) return E('Python does not understand that number.', 'Names cannot start with a digit, and numbers cannot have extra zeros in front (007).');
    return E('Python <b>cannot read</b> this line. The grammar is broken.', 'Look for: a missing quote <code>"</code>, bracket <code>)</code>, comma <code>,</code>, or a stray symbol. Check the line shown and the one above it.');
  }
  if (t === 'ZeroDivisionError') return E('You divided by <b>zero</b>, which is impossible.', 'Check the number you divide by.');
  if (t === 'EOFError') return E('<code>input()</code> wanted an answer but there was nothing left to read.', 'Your program asked for more input than was typed.');
  if (t === 'MemoryError' && /too much text/.test(m)) return E('Your program printed a <b>huge</b> amount of text, so the website stopped it to stay fast.', 'Check the number you multiply text by, and make sure nothing repeats forever.');
  if (t === 'MemoryError' || t === 'OverflowError') return E(esc(m), 'Try a smaller number.');
  return E(esc(m), 'Read the error name and the line number.');
}
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function tracebackText(err, code) {
  const line = err.line || 1; const src = (code.split('\n')[line - 1] || '').trim();
  if (/^(SyntaxError|IndentationError)$/.test(err.type))
    return `  File "main.py", line ${line}\n    ${src}\n${err.type}: ${err.msg}`;
  if (err.type === 'NotInCourse') return err.msg;
  return `Traceback (most recent call last):\n  File "main.py", line ${line}, in <module>\n    ${src}\n${err.type}: ${err.msg}`;
}

/* ---------- run a program silently with prepared input -> transcript ---------- */
async function silentRun(code, stdin) {
  const q = (stdin || []).slice(); let out = '';
  const res = await PF.run(code, { limit: 400000, write: s => { out += s; }, input: async () => q.length ? q.shift() : null });
  return { out, res };
}
async function transcript(code, stdin) {            // like the real terminal: prompts + typed answers shown
  const q = (stdin || []).slice(); const parts = [];
  const res = await PF.run(code, {
    limit: 400000, write: s => parts.push({ t: 'out', s }),
    input: async p => { if (p) parts.push({ t: 'out', s: p }); if (!q.length) return null; const v = q.shift(); parts.push({ t: 'in', s: v + '\n' }); return v; },
  });
  return { parts, res };
}
function renderTranscript(tr, code) {
  const box = h('div', { class: 'term term-static', role: 'region', 'aria-label': 'Program output' });
  for (const p of tr.parts) box.append(h('span', { class: p.t === 'in' ? 'term-typed' : '' }, p.s));
  if (tr.res.error) {
    box.append(h('div', { class: 'term-err' }, h('pre', null, tracebackText(tr.res.error, code))));
  }
  if (!tr.parts.length && !tr.res.error) box.append(h('span', { class: 'muted' }, '(nothing was printed)'));
  return box;
}

/* ---------- misc UI helpers ---------- */
function typeBadge(t) { return h('span', { class: 'badge b-' + t }, t); }
function toast(msg) {
  let t = $('#toast'); if (!t) { t = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function ring(value, size = 120, label) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  const col = v >= 0.8 ? 'var(--mint)' : v >= 0.5 ? 'var(--sun)' : 'var(--violet)';
  const wrap = h('div', { class: 'ring', style: `width:${size}px;height:${size}px` });
  wrap.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label || 'progress')} ${pct(v)} percent">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="12"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>
    <div class="ring-n"><b>${pct(v)}%</b><span>${esc(label || '')}</span></div>`;
  return wrap;
}
function bar(value, cls = '', label = 'Progress') {
  const v = Math.max(0, Math.min(1, value));
  return h('div', { class: 'bar ' + cls, role: 'progressbar', 'aria-label': label, 'aria-valuenow': pct(v), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `--v:${v}` }));
}

/* ---------- why does my output differ from the expected output? ---------- */
function diagnose(got, expect) {
  if (got === expect) return null;
  const sq = s => s.replace(/\s+/g, '');
  if (sq(got) === sq(expect)) return 'Right characters, wrong <b>spaces or line breaks</b>. A comma adds one space; + adds none; each print() is a new line.';
  if (got.toLowerCase() === expect.toLowerCase()) return 'Check the <b>capital letters</b>. They must match exactly.';
  if (got.replace(/\.0\b/g, '') === expect.replace(/\.0\b/g, '')) return 'So close! One side has <b>.0</b> and the other does not. That is <b>int vs float</b>: /, float() and any decimal give a float; int() gives a whole number.';
  if (got.length > expect.length && got.endsWith('\n' + expect)) return 'Your answer is in there, but your program printed <b>extra text before it</b>. Put questions inside <code>input("...")</code> instead of print(). Only print what the task asks for.';
  if (got.length > expect.length && got.startsWith(expect + '\n')) return 'Your program printed <b>extra text after</b> the answer. Only print what the task asks for.';
  if (got === '') return 'Your program printed nothing. Did you forget <code>print()</code>?';
  return null;
}
function applyTheme() {
  const t = Store.data.theme; const el = document.documentElement;
  if (t === 'light' || t === 'dark') el.dataset.theme = t; else delete el.dataset.theme;
}
applyTheme();

/* =====================================================================
   GAME LAYER: icons, Pip the mascot, levels, badges, streak, celebrations
   ===================================================================== */
const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
function icon(name, cls) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'ico' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + name); s.append(u); return s;
}
const PIP_SVG = `<svg class="pip" viewBox="0 0 160 160" data-mood="happy" xmlns="http://www.w3.org/2000/svg">
<g class="pip-all">
 <path class="pb" d="M30 150c-15 0-21-13-15-25 4-8 14-13 29-13h72c15 0 25 5 29 13 6 12 0 25-15 25z"/>
 <path class="pbs" d="M140 132c11-2 17-11 14-20" fill="none"/>
 <ellipse class="ps" cx="50" cy="131" rx="9" ry="6"/><ellipse class="ps" cx="80" cy="133" rx="9" ry="6"/><ellipse class="ps" cx="110" cy="131" rx="9" ry="6"/>
 <g class="pip-head">
  <ellipse class="ph" cx="80" cy="72" rx="54" ry="48"/>
  <path class="pc" d="M42 86c10 24 66 24 76 0 0 20-19 32-38 32S42 106 42 86z"/>
  <ellipse class="pch" cx="38" cy="88" rx="9" ry="5.500"/><ellipse class="pch" cx="122" cy="88" rx="9" ry="5.500"/>
  <g data-m="happy think oops sleepless" class="eyes-open">
   <g class="eye"><circle class="pw" cx="58" cy="64" r="18"/><circle class="pp" cx="61" cy="66" r="9"/><circle class="pg" cx="64" cy="61" r="3.200"/></g>
   <g class="eye"><circle class="pw" cx="102" cy="64" r="18"/><circle class="pp" cx="99" cy="66" r="9"/><circle class="pg" cx="102" cy="61" r="3.200"/></g>
  </g>
  <g data-m="cheer sleep" class="eyes-closed">
   <path class="pl" d="M42 66q16-18 32 0M86 66q16-18 32 0" fill="none"/>
  </g>
  <g data-m="sleep"><path class="pl" d="M42 62q16 14 32 0M86 62q16 14 32 0" fill="none"/></g>
  <g data-m="oops"><path class="pl" d="M40 40l26 8M120 40l-26 8" fill="none"/></g>
  <g data-m="happy"><path class="pl" d="M60 88q20 17 40 0" fill="none"/><path class="pt" d="M80 100v9m0 0l-4 5m4-5l4 5" fill="none"/></g>
  <g data-m="cheer"><path class="pm" d="M58 85q22 32 44 0z"/><path class="ptg" d="M68 100q12 9 24 0q-5-9-12-9t-12 9z"/></g>
  <g data-m="oops"><path class="pl" d="M64 99q16-12 32 0" fill="none"/></g>
  <g data-m="think"><path class="pl" d="M68 94h26" fill="none"/></g>
  <g data-m="sleep"><path class="pl" d="M72 94q8 6 16 0" fill="none"/></g>
 </g>
 <g data-m="cheer" class="fx"><path class="sp1" d="M18 36l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path class="sp2" d="M140 26l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500z"/><path class="sp3" d="M148 78l2 4.500 4.500 2-4.500 2-2 4.500-2-4.500-4.500-2 4.500-2z"/></g>
 <g data-m="oops" class="fx"><path class="drop" d="M128 38c5 8 8 12 8 17a8 8 0 0 1-16 0c0-5 3-9 8-17z"/></g>
 <g data-m="think" class="fx"><text x="124" y="34" class="qm">?</text></g>
 <g data-m="sleep" class="fx"><text x="122" y="38" class="qm z">z</text></g>
</g></svg>`;
function Pip(mood = 'happy', size = 96, label) {
  const w = h('span', { class: 'pip-wrap', style: `width:${size}px;height:${size}px` }); w.innerHTML = PIP_SVG;
  const svg = w.firstElementChild; svg.setAttribute('data-mood', mood);
  if (label) { w.setAttribute('role', 'img'); w.setAttribute('aria-label', label); } else w.setAttribute('aria-hidden', 'true');
  w.setMood = m => svg.setAttribute('data-mood', m); return w;
}

/* ---------- levels ---------- */
const LEVELS = [[0, 'Code Rookie'], [100, 'Bug Spotter'], [250, 'Output Oracle'], [450, 'Type Tamer'], [700, 'Error Hunter'], [1000, 'Program Builder'], [1400, 'Python Pro'],
  [1900, 'Loop Ranger'], [2500, 'List Wrangler'], [3200, 'Function Forger'], [4000, 'Code Legend']];
function levelInfo(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const cur = LEVELS[i], next = LEVELS[i + 1];
  return { n: i + 1, name: cur[1], base: cur[0], next: next ? next[0] : null, nextName: next ? next[1] : null, frac: next ? (xp - cur[0]) / (next[0] - cur[0]) : 1 };
}

/* ---------- daily streak ---------- */
function dayStreak() {
  const set = new Set(Store.data.days); const d = new Date(); let n = 0;
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- badges (all derived from saved progress, nothing extra to store) ---------- */
function solvedCount(kind) { let n = 0; for (const [id, r] of Object.entries(Store.data.items)) { const it = BYID[id]; if (it && (!kind || it.kind === kind) && r.ever) n++; } return n; }
const unitMastered = u => unitStats(u).mastery >= 0.8;
const BADGES = [
  { id: 'first', name: 'First Steps', icon: 'play', hue: 'mint', hint: 'Answer your first question.', test: () => Object.keys(Store.data.items).length > 0 },
  { id: 'explorer', name: 'Playground Explorer', icon: 'code', hue: 'sky', hint: 'Run code in the playground or a lesson 5 times.', test: () => Store.data.runs >= 5 },
  { id: 'reader', name: 'Bookworm', icon: 'book', hue: 'violet', hint: 'Read 3 lessons.', test: () => TEST_UNITS.filter(u => lessonDone(u)).length >= 3 },
  { id: 'scholar', name: 'Scholar', icon: 'medal', hue: 'sun', hint: 'Read all 6 test lessons.', test: () => TEST_UNITS.every(u => lessonDone(u)) },
  { id: 'century', name: 'Century Club', icon: 'star', hue: 'sun', hint: 'Get 100 answers right.', test: () => Object.values(Store.data.items).reduce((a, r) => a + (r.right || 0), 0) >= 100 },
  { id: 'perfect', name: 'Perfect Round', icon: 'check', hue: 'mint', hint: 'Get every question right on the first try (8 or more).', test: () => Store.data.sessions.some(s => s.total >= 8 && s.score === s.total) },
  { id: 'hot', name: 'Hot Streak', icon: 'flame', hue: 'coral', hint: 'Answer 5 in a row.', test: () => Store.data.bestStreak >= 5 },
  { id: 'speed', name: 'Speed Demon', icon: 'bolt', hue: 'sun', hint: 'Score 15 in a Type Sprint.', test: () => (Store.data.best.type || 0) >= 15 },
  { id: 'bug', name: 'Bug Squasher', icon: 'bug', hue: 'coral', hint: 'Fix 8 broken programs.', test: () => solvedCount('fix') >= 8 },
  { id: 'writer', name: 'Code Writer', icon: 'pencil', hue: 'violet', hint: 'Write 5 programs that pass.', test: () => solvedCount('write') >= 5 },
  { id: 'ready', name: 'Test Ready', icon: 'trophy', hue: 'sun', hint: 'Score 80% or more on a mock test.', test: () => Store.data.mocks.some(m => (m.track || 'test') === 'test' && m.total >= 10 && m.score / m.total >= 0.8) },
  { id: 'days3', name: '3-Day Streak', icon: 'flame', hue: 'coral', hint: 'Practice on 3 days in a row.', test: () => dayStreak() >= 3 || Store.data.days.length >= 3 && maxDayRun() >= 3 },
  { id: 'u7', name: 'Text Wizard', icon: 'pencil', hue: 'sky', hint: 'Reach 80% in Level Up 1.', test: () => unitMastered(7) },
  { id: 'u8', name: 'Decision Maker', icon: 'shuffle', hue: 'violet', hint: 'Reach 80% in Level Up 2: if / else.', test: () => unitMastered(8) },
  { id: 'u9', name: 'Loop Master', icon: 'loop', hue: 'sky', hint: 'Reach 80% in Level Up 3: loops.', test: () => unitMastered(9) },
  { id: 'u10', name: 'String Wizard', icon: 'code', hue: 'mint', hint: 'Reach 80% in Level Up 4: strings.', test: () => unitMastered(10) },
  { id: 'u11', name: 'List Boss', icon: 'sheet', hue: 'pink', hint: 'Reach 80% in Level Up 5: lists.', test: () => unitMastered(11) },
  { id: 'u12', name: 'Function Hero', icon: 'bolt', hue: 'sun', hint: 'Reach 80% in Level Up 6: functions.', test: () => unitMastered(12) },
  { id: 'u13', name: 'Project Pro', icon: 'rocket', hue: 'coral', hint: 'Reach 80% in Level Up 7: mini projects.', test: () => unitMastered(13) },
];
function maxDayRun() { const ds = [...new Set(Store.data.days)].sort(); let best = 0, run = 0, prev = null; for (const d of ds) { const dt = new Date(d + 'T00:00:00'); if (prev && Math.round((dt - prev) / 86400000) === 1) run++; else run = 1; best = Math.max(best, run); prev = dt; } return best; }
function badgeStatus() { return BADGES.map(b => ({ ...b, earned: !!b.test() })); }
function newBadges() {              // earned since last look: mark as seen, return them
  const fresh = badgeStatus().filter(b => b.earned && !Store.data.badgesSeen[b.id]);
  if (fresh.length) { fresh.forEach(b => { Store.data.badgesSeen[b.id] = 1; }); Store.save(); }
  return fresh;
}
function Medal(b, size = 64) {
  const m = h('div', { class: 'medal hue-' + b.hue + (b.earned ? ' earned' : ' locked'), style: `--ms:${size}px`, role: 'img', 'aria-label': b.name + (b.earned ? ' (earned)' : ' (locked): ' + b.hint) }, icon(b.earned ? b.icon : 'lock'));
  return m;
}

/* ---------- celebrations (all skipped for reduced motion except the banner text) ---------- */
function confetti(count = 34) {
  if (REDUCED) return;
  const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' }); const hues = ['#FFC933', '#6D3BFF', '#2BD9A0', '#FF5C6C', '#3BA9FF', '#FF8AD0'];
  for (let i = 0; i < count; i++) {
    const p = h('i', { style: `left:${10 + Math.random() * 80}%;background:${hues[i % hues.length]};--dx:${(Math.random() - .5) * 360}px;--dy:${-120 - Math.random() * 220}px;--r:${(Math.random() - .5) * 900}deg;animation-delay:${Math.random() * 120}ms;border-radius:${i % 3 ? '2px' : '50%'}` });
    layer.append(p);
  }
  document.body.append(layer); setTimeout(() => layer.remove(), 2200);
}
function celebrate({ title, text, mood = 'cheer', confetti: cf = true, ms = 4800 } = {}) {
  let host = document.getElementById('cele-host'); if (!host) { host = h('div', { id: 'cele-host', 'aria-live': 'polite', role: 'status' }); document.body.append(host); }
  const card = h('div', { class: 'cele', onclick: () => card.remove() }, Pip(mood, 64), h('div', null, h('b', { class: 'cele-t' }, title), h('span', { class: 'cele-x' }, text || '')));
  while (host.children.length >= 2) host.firstChild.remove();
  host.append(card); if (cf) confetti();
  setTimeout(() => card.classList.add('out'), ms); setTimeout(() => card.remove(), ms + 400);
}
function floatXP(n, anchor) {
  if (REDUCED || !anchor) return;
  const r = anchor.getBoundingClientRect(); const y = r.top < 90 ? 150 : r.top; const c = h('div', { class: 'xp-float', style: `left:${Math.max(70, r.left + r.width / 2)}px;top:${y}px`, 'aria-hidden': 'true' }, '+' + n + ' XP');
  document.body.append(c); setTimeout(() => c.remove(), 1300);
}
const CHEER_OK = ['Nailed it!', 'Yes!', 'Exactly right!', 'Clean!', 'Boom!', 'You got it!', 'Sharp!'];
const CHEER_NO = ['Not quite', 'Good try', 'Here is the trick', 'Now you know', 'Learn this one'];
let cheerI = 0;
function cheerLine(ok, streak) {
  if (ok) return streak >= 3 ? streak + ' in a row!' : CHEER_OK[cheerI++ % CHEER_OK.length];
  return CHEER_NO[cheerI++ % CHEER_NO.length];
}

function announceBadges(list) {                 // one banner, however many were earned at once
  if (!list.length) return;
  if (list.length === 1) celebrate({ title: 'New badge: ' + list[0].name, text: list[0].hint, mood: 'cheer', confetti: true });
  else celebrate({ title: list.length + ' new badges!', text: list.map(b => b.name).join(', '), mood: 'cheer', confetti: true, ms: 6500 });
}
function badgeToast() { announceBadges(newBadges()); }
