/* pyfun: a tiny Python interpreter for the 6th-grade subset
   (print, input, int, float, str, variables, + - * / // % **, f-strings).
   Runs in the browser and in Node. Checked against real CPython by tests/fuzz.js */
(function (root) {
'use strict';

/* ---------- values ----------
   int -> BigInt, float -> PyFloat, str -> string, bool -> boolean, None -> null */
class PyError extends Error {
  constructor(type, msg, line) { super(msg); this.pyType = type; this.pyMsg = msg; this.line = line || null; }
}
class PyFloat { constructor(v) { this.v = v; } }
class PyType { constructor(name) { this.name = name; } }
class PyBuiltin { constructor(name, fn) { this.name = name; this.fn = fn; } }

const T_INT = new PyType('int'), T_FLOAT = new PyType('float'), T_STR = new PyType('str'),
      T_BOOL = new PyType('bool'), T_NONE = new PyType('NoneType'), T_TYPE = new PyType('type'),
      T_FUNC = new PyType('builtin_function_or_method');

function typeName(v) {
  if (typeof v === 'bigint') return 'int';
  if (v instanceof PyFloat) return 'float';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'boolean') return 'bool';
  if (v === null) return 'NoneType';
  if (v instanceof PyType) return 'type';
  return 'builtin_function_or_method';
}
const isNum = v => typeof v === 'bigint' || v instanceof PyFloat || typeof v === 'boolean';
const toBig = v => typeof v === 'boolean' ? (v ? 1n : 0n) : v;

/* ---------- number formatting (matches CPython) ---------- */
function floatRepr(x) {
  if (Number.isNaN(x)) return 'nan';
  if (x === Infinity) return 'inf';
  if (x === -Infinity) return '-inf';
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
  const neg = x < 0; if (neg) x = -x;
  const [m, e] = x.toExponential().split('e');
  const exp = parseInt(e, 10);
  const digits = m.replace('.', '');
  let out;
  if (exp >= -4 && exp < 16) {
    if (exp >= 0) {
      if (digits.length <= exp + 1) out = digits + '0'.repeat(exp + 1 - digits.length) + '.0';
      else out = digits.slice(0, exp + 1) + '.' + digits.slice(exp + 1);
    } else out = '0.' + '0'.repeat(-exp - 1) + digits;
  } else {
    const mant = digits.length > 1 ? digits[0] + '.' + digits.slice(1) : digits;
    const ae = Math.abs(exp);
    out = mant + 'e' + (exp < 0 ? '-' : '+') + (ae < 10 ? '0' + ae : String(ae));
  }
  return neg ? '-' + out : out;
}

// x >= 0, finite. Python rounds exact decimal expansions half-to-even; JS toFixed rounds ties up.
function toFixedExact(x, n) {
  if (x >= 1e21) { const s = BigInt(x).toString(); return n > 0 ? s + '.' + '0'.repeat(n) : s; }
  let s = x.toFixed(n);
  const extra = 25, want = Math.min(100, n + extra), got = want - n;
  if (got >= 2) {
    const t = x.toFixed(want);
    const tail = t.slice(t.length - got);
    if (/^50*$/.test(tail)) {
      let trunc = t.slice(0, t.length - got);
      if (trunc.endsWith('.')) trunc = trunc.slice(0, -1);
      const last = trunc.replace('.', '').slice(-1);
      if ((+last) % 2 === 0) s = trunc;
    }
  }
  return s;
}
function roundHalfEven(x) {            // float -> integral float
  const f = Math.floor(x), d = x - f;
  if (d < 0.5) return f; if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
}

function pyRepr(v) {
  if (typeof v === 'string') {
    const q = (v.includes("'") && !v.includes('"')) ? '"' : "'";
    let o = q;
    for (const ch of v) {
      if (ch === '\\') o += '\\\\';
      else if (ch === q) o += '\\' + q;
      else if (ch === '\n') o += '\\n';
      else if (ch === '\t') o += '\\t';
      else if (ch === '\r') o += '\\r';
      else if (ch < ' ' || ch === '\x7f') o += '\\x' + ch.charCodeAt(0).toString(16).padStart(2, '0');
      else o += ch;
    }
    return o + q;
  }
  return pyStr(v);
}
function pyStr(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof PyFloat) return floatRepr(v.v);
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (v === null) return 'None';
  if (v instanceof PyType) return "<class '" + v.name + "'>";
  if (v instanceof PyBuiltin) return '<built-in function ' + v.name + '>';
  return String(v);
}

/* ---------- format() mini-language ---------- */
function groupInt(digits, sep) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
function formatValue(v, spec, line) {
  if (spec === '' || spec == null) return pyStr(v);
  const m = /^(?:(.)?([<>=^]))?([+\- ])?(#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([a-zA-Z%])?$/s.exec(spec);
  if (!m) throw new PyError('ValueError', 'Invalid format specifier', line);
  let [, fill, align, sign, , zero, width, group, prec, type] = m;
  width = width ? parseInt(width, 10) : 0;
  prec = prec !== undefined ? parseInt(prec, 10) : null;
  if (zero && !align) { fill = '0'; align = '='; }
  fill = fill === undefined ? ' ' : fill;
  const tn = typeName(v);
  let body, signStr = '', defAlign = '>';
  if (typeof v === 'string') {
    if (type && type !== 's') throw new PyError('ValueError', `Unknown format code '${type}' for object of type 'str'`, line);
    if (sign) throw new PyError('ValueError', 'Sign not allowed in string format specifier', line);
    if (group) throw new PyError('ValueError', `Cannot specify '${group}' with 's'.`, line);
    if (align === '=') throw new PyError('ValueError', "'=' alignment not allowed in string format specifier", line);
    body = prec !== null ? [...v].slice(0, prec).join('') : v; defAlign = '<';
  } else if (isNum(v)) {
    const isF = v instanceof PyFloat;
    let t = type || '';
    if (!isF && 'xXob'.includes(t) && t) {
      if (prec !== null) throw new PyError('ValueError', 'Precision not allowed in integer format specifier', line);
      const b = toBig(v); signStr = b < 0n ? '-' : ''; const radix = { x: 16, X: 16, o: 8, b: 2 }[t];
      body = (b < 0n ? -b : b).toString(radix); if (t === 'X') body = body.toUpperCase();
    } else if (!isF && (t === 'd' || t === '')) {
      if (prec !== null) throw new PyError('ValueError', 'Precision not allowed in integer format specifier', line);
      const b = toBig(v); signStr = b < 0n ? '-' : '';
      body = (b < 0n ? -b : b).toString();
      if (group) body = groupInt(body, group);
    } else if (t === 'f' || t === 'F' || t === 'e' || t === 'E' || t === '%' || (isF && t === '')) {
      const x = isF ? v.v : Number(toBig(v));
      if (t === '' ) {                       // float with only precision/width: use repr unless precision given
        if (prec !== null) throw new PyError('NotInCourse', 'That format code is not part of this course', line);
        signStr = (x < 0 || Object.is(x, -0)) ? '-' : ''; body = floatRepr(Math.abs(x));
        if (group && Number.isFinite(x) && !/e/.test(body)) { const [ip, fp] = body.split('.'); body = groupInt(ip, group) + '.' + fp; }
      } else {
        const p = prec === null ? 6 : prec; const neg = x < 0 || Object.is(x, -0);
        signStr = neg ? '-' : ''; const a = Math.abs(x);
        if (!Number.isFinite(a)) body = Number.isNaN(a) ? 'nan' : 'inf';
        else if (t === 'f' || t === 'F') body = toFixedExact(a, p);
        else if (t === '%') body = toFixedExact(a * 100, p) + '%';
        else { body = a.toExponential(p).replace(/e([+-])(\d)$/, 'e$10$2'); if (t === 'E') body = body.toUpperCase(); }
        if (group && Number.isFinite(a)) { const [ip, fp] = body.split('.'); body = groupInt(ip, group) + (fp !== undefined ? '.' + fp : ''); }
        if (t === 'F') body = body.toUpperCase();
      }
    } else throw new PyError('ValueError', `Unknown format code '${type}' for object of type '${tn}'`, line);
    if (sign === '+' && signStr === '') signStr = '+';
    else if (sign === ' ' && signStr === '') signStr = ' ';
  } else {
    if (type || prec !== null || sign) throw new PyError('TypeError', `unsupported format string passed to ${tn}.__format__`, line);
    body = pyStr(v); defAlign = '<';
  }
  const a = align || defAlign;
  const len = [...signStr].length + [...body].length;
  const pad = Math.max(0, width - len);
  if (a === '=') return signStr + fill.repeat(pad) + body;
  const full = signStr + body;
  if (a === '<') return full + fill.repeat(pad);
  if (a === '>') return fill.repeat(pad) + full;
  const l = Math.floor(pad / 2); return fill.repeat(l) + full + fill.repeat(pad - l);
}

/* ---------- tokenizer ---------- */
const KEYWORDS_NOT_IN_COURSE = new Set(['if','elif','else','for','while','def','class','return','import','from',
  'try','except','finally','with','lambda','in','is','and','or','not','del','global','nonlocal','break',
  'continue','assert','raise','yield','async','await','as']);

function se(msg, line, type) { return new PyError(type || 'SyntaxError', msg, line); }

function unescape(s, line) {
  return s.replace(/\\(\r?\n|[\\'"abfnrtv0]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|N\{[^}]*\}|.)/gs, (all, c) => {
    switch (c[0]) {
      case '\n': case '\r': return '';
      case '\\': return '\\'; case "'": return "'"; case '"': return '"';
      case 'a': return '\x07'; case 'b': return '\b'; case 'f': return '\f'; case 'n': return '\n';
      case 'r': return '\r'; case 't': return '\t'; case 'v': return '\v'; case '0': return '\0';
      case 'x': return c.length === 3 ? String.fromCharCode(parseInt(c.slice(1), 16)) : all;
      case 'u': return c.length === 5 ? String.fromCharCode(parseInt(c.slice(1), 16)) : all;
      default: return all;
    }
  });
}

function tokenize(src) {
  src = src.replace(/\r\n?/g, '\n').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, ' ');
  const toks = [], stack = []; let i = 0, line = 1, atStart = true;
  const n = src.length;
  const push = (type, value, extra) => toks.push(Object.assign({ type, value, line, pos: i }, extra));
  while (i < n) {
    const c = src[i];
    if (atStart && stack.length === 0) {
      let j = i; while (j < n && (src[j] === ' ' || src[j] === '\t')) j++;
      if (j >= n) { i = j; break; }
      if (src[j] === '\n') { i = j + 1; line++; continue; }
      if (src[j] === '#') { while (j < n && src[j] !== '\n') j++; i = j; continue; }
      if (j > i) throw se('unexpected indent', line, 'IndentationError');
      atStart = false;
    }
    if (c === '\n') {
      if (stack.length === 0) { push('NEWLINE', '\n'); atStart = true; }
      i++; line++; continue;
    }
    if (c === ' ' || c === '\t' || c === '\f') { i++; continue; }
    if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '\\' && src[i + 1] === '\n') { i += 2; line++; continue; }
    // strings (with optional prefix)
    let pm = /^([fFrR]{1,2})?('''|"""|'|")/.exec(src.slice(i, i + 5));
    if (pm && (!pm[1] || /^(f|r|fr|rf)$/i.test(pm[1]))) {
      const prefix = (pm[1] || '').toLowerCase(), q = pm[2], isF = prefix.includes('f'), isR = prefix.includes('r');
      const startLine = line; let j = i + pm[0].length, raw = '', closed = false;
      while (j < n) {
        if (src.startsWith(q, j)) { closed = true; j += q.length; break; }
        if (src[j] === '\\' && j + 1 < n) { raw += src[j] + src[j + 1]; if (src[j + 1] === '\n') line++; j += 2; continue; }
        if (src[j] === '\n') { if (q.length === 1) break; line++; }
        raw += src[j]; j++;
      }
      if (!closed) {
        if (q.length === 3) throw se(`unterminated triple-quoted string literal (detected at line ${line})`, startLine);
        throw se(`unterminated string literal (detected at line ${startLine})`, startLine);
      }
      const t = { type: isF ? 'FSTR' : 'STR', line: startLine, pos: i, raw: isR, value: raw };
      if (!isF) t.value = isR ? raw : unescape(raw, startLine);
      toks.push(t); i = j; atStart = false; continue;
    }
    // numbers
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      const m = /^(?:[0-9][0-9_]*(?:\.[0-9_]*)?|\.[0-9][0-9_]*)(?:[eE][+-]?[0-9][0-9_]*)?/.exec(src.slice(i));
      const text = m[0];
      if (/^[A-Za-z_]/.test(src[i + text.length] || '')) throw se('invalid decimal literal', line);
      const isFloat = /[.eE]/.test(text); const clean = text.replace(/_/g, '');
      if (!isFloat && /^0[0-9]*[1-9]/.test(clean)) throw se('leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers', line);
      push('NUM', isFloat ? new PyFloat(Number(clean)) : BigInt(clean));
      i += text.length; continue;
    }
    if (/[A-Za-z_À-￿]/.test(c)) {
      let j = i + 1; while (j < n && /[A-Za-z0-9_À-￿]/.test(src[j])) j++;
      push('NAME', src.slice(i, j)); i = j; continue;
    }
    const three = src.slice(i, i + 3), two = src.slice(i, i + 2);
    let op = null;
    if (['**=', '//='].includes(three)) op = three;
    else if (['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%='].includes(two)) op = two;
    else if ('+-*/%()[]{},=<>.:;@~&|^'.includes(c)) op = c;
    if (op === null) { throw se('invalid syntax', line); }
    if (op === '(' || op === '[' || op === '{') stack.push({ ch: op, line, pos: i });
    else if (op === ')' || op === ']' || op === '}') {
      if (!stack.length) throw se(`unmatched '${op}'`, line);
      const o = stack.pop(); const want = { '(': ')', '[': ']', '{': '}' }[o.ch];
      if (want !== op) throw se(`closing parenthesis '${op}' does not match opening parenthesis '${o.ch}'` + (o.line !== line ? ` on line ${o.line}` : ''), line);
    }
    push('OP', op); i += op.length; atStart = false;
  }
  const unclosed = stack.length ? stack[0] : null;
  toks.push({ type: 'EOF', value: '', line, pos: n });
  return { toks, unclosed };
}

/* ---------- parser ---------- */
class Parser {
  constructor(toks, unclosed, baseLine) { this.t = toks; this.i = 0; this.unclosed = unclosed; this.baseLine = baseLine || 0; this.depth = 0; }
  get cur() { return this.t[this.i]; }
  peek(k = 1) { return this.t[Math.min(this.i + k, this.t.length - 1)]; }
  fail(msg, tok) {
    tok = tok || this.cur;
    if (this.unclosed && this.unclosed.pos < tok.pos + (tok.type === 'EOF' ? 1 : 0) && (msg === 'invalid syntax' || tok.type === 'EOF'))
      throw se(`'${this.unclosed.ch}' was never closed`, this.unclosed.line);
    throw se(msg || 'invalid syntax', tok.line);
  }
  isOp(v) { return this.cur.type === 'OP' && this.cur.value === v; }
  eatOp(v) { if (this.isOp(v)) { this.i++; return true; } return false; }
  expectOp(v) { if (!this.eatOp(v)) this.fail('invalid syntax'); }

  parseProgram() {
    const out = [];
    while (this.cur.type !== 'EOF') {
      if (this.cur.type === 'NEWLINE') { this.i++; continue; }
      out.push(this.statement());
    }
    if (this.unclosed) throw se(`'${this.unclosed.ch}' was never closed`, this.unclosed.line);
    return out;
  }
  endStmt() {
    if (this.cur.type === 'NEWLINE') { this.i++; return; }
    if (this.cur.type === 'EOF') return;
    if (this.isOp(';')) { this.i++; return; }
    this.fail('invalid syntax');
  }
  statement() {
    const t = this.cur, line = t.line;
    if (t.type === 'NAME') {
      if (KEYWORDS_NOT_IN_COURSE.has(t.value))
        throw new PyError('NotInCourse', `"${t.value}" is real Python, but it is not part of this course yet`, line);
      if (t.value === 'pass') { this.i++; this.endStmt(); return { t: 'pass', line }; }
      if (t.value === 'print') {
        const nx = this.peek();
        if (nx.type === 'STR' || nx.type === 'FSTR' || nx.type === 'NUM' || (nx.type === 'NAME' && !KEYWORDS_NOT_IN_COURSE.has(nx.value)))
          throw se("Missing parentheses in call to 'print'. Did you mean print(...)?", line);
      }
    }
    const e = this.expr();
    if (this.cur.type === 'OP' && ['=', '+=', '-=', '*=', '/=', '//=', '%=', '**='].includes(this.cur.value)) {
      const targets = [e]; let op = this.cur.value;
      if (op === '=') {
        let value = null;
        while (this.eatOp('=')) { value = this.expr(); if (this.isOp('=')) targets.push(value); }
        for (const tg of targets) this.checkTarget(tg);
        this.endStmt();
        return { t: 'assign', targets, value, line };
      }
      this.i++;
      this.checkTarget(e, true);
      const value = this.expr(); this.endStmt();
      return { t: 'aug', op: op.slice(0, -1), target: e, value, line };
    }
    this.endStmt();
    return { t: 'expr', e, line };
  }
  checkTarget(tg, aug) {
    if (tg.t === 'name') return;
    const what = { num: 'literal', str: 'literal', fstr: 'f-string expression', call: 'function call', bin: 'expression',
      unary: 'expression', cmp: 'comparison', const: tg.v === null ? 'None' : tg.v ? 'True' : 'False' }[tg.t] || 'expression';
    if (aug) throw se(`'${what}' is an illegal expression for augmented assignment`, tg.line);
    throw se(`cannot assign to ${what} here. Maybe you meant '==' instead of '='?`, tg.line);
  }
  expr() { return this.comparison(); }
  comparison() {
    const first = this.arith(); const ops = [], rest = [];
    while (this.cur.type === 'OP' && ['==', '!=', '<', '>', '<=', '>='].includes(this.cur.value)) {
      ops.push(this.cur.value); this.i++; rest.push(this.arith());
    }
    return ops.length ? { t: 'cmp', first, ops, rest, line: first.line } : first;
  }
  arith() {
    let l = this.term();
    while (this.cur.type === 'OP' && (this.cur.value === '+' || this.cur.value === '-')) {
      const op = this.cur.value, line = this.cur.line; this.i++;
      l = { t: 'bin', op, l, r: this.term(), line };
    }
    return l;
  }
  term() {
    let l = this.factor();
    while (this.cur.type === 'OP' && ['*', '/', '//', '%'].includes(this.cur.value)) {
      const op = this.cur.value, line = this.cur.line; this.i++;
      l = { t: 'bin', op, l, r: this.factor(), line };
    }
    return l;
  }
  factor() {
    if (this.cur.type === 'OP' && (this.cur.value === '-' || this.cur.value === '+')) {
      const op = this.cur.value, line = this.cur.line; this.i++;
      return { t: 'unary', op, e: this.factor(), line };
    }
    return this.power();
  }
  power() {
    const base = this.postfix();
    if (this.isOp('**')) {
      const line = this.cur.line; this.i++;
      return { t: 'bin', op: '**', l: base, r: this.factor(), line };
    }
    return base;
  }
  postfix() {
    let e = this.atom();
    for (;;) {
      if (this.isOp('(')) {
        const line = this.cur.line; this.i++; this.depth++;
        const args = [], kwargs = [];
        while (!this.isOp(')')) {
          if (this.cur.type === 'EOF' || this.cur.type === 'NEWLINE') this.fail('invalid syntax');
          if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === '=' ) {
            const name = this.cur.value; this.i += 2; kwargs.push({ name, e: this.expr() });
          } else {
            if (kwargs.length) throw se('positional argument follows keyword argument', this.cur.line);
            args.push(this.expr());
          }
          if (this.isOp(',')) { this.i++; continue; }
          if (!this.isOp(')')) {
            const c = this.cur;
            if (c.type === 'NAME' || c.type === 'NUM' || c.type === 'STR' || c.type === 'FSTR') this.fail('invalid syntax. Perhaps you forgot a comma?');
            this.fail('invalid syntax');
          }
        }
        this.i++; this.depth--;
        e = { t: 'call', f: e, args, kwargs, line };
      } else if (this.isOp('.')) {
        throw new PyError('NotInCourse', 'Dot-methods like .upper() are real Python, but not part of this course yet', this.cur.line);
      } else if (this.isOp('[')) {
        throw new PyError('NotInCourse', 'Square brackets (lists / indexing) are real Python, but not part of this course yet', this.cur.line);
      } else break;
    }
    return e;
  }
  atom() {
    const t = this.cur, line = t.line;
    if (t.type === 'NUM') { this.i++; return { t: 'num', v: t.value, line }; }
    if (t.type === 'STR') {
      this.i++; let v = t.value;
      while (this.cur.type === 'STR') { v += this.cur.value; this.i++; }
      return { t: 'str', v, line };
    }
    if (t.type === 'FSTR') { this.i++; return { t: 'fstr', parts: this.fparts(t.value, t.raw, line, 0), line }; }
    if (t.type === 'NAME') {
      if (KEYWORDS_NOT_IN_COURSE.has(t.value)) {
        if (t.value === 'not') throw new PyError('NotInCourse', '"not" is real Python, but it is not part of this course yet', line);
        throw se('invalid syntax', line);
      }
      this.i++;
      if (t.value === 'True') return { t: 'const', v: true, line };
      if (t.value === 'False') return { t: 'const', v: false, line };
      if (t.value === 'None') return { t: 'const', v: null, line };
      return { t: 'name', id: t.value, line };
    }
    if (t.type === 'OP' && t.value === '(') {
      this.i++; this.depth++;
      if (this.isOp(')')) throw new PyError('NotInCourse', 'Tuples are real Python, but not part of this course yet', line);
      const e = this.expr();
      if (this.isOp(',')) throw new PyError('NotInCourse', 'Tuples are real Python, but not part of this course yet', line);
      if (!this.isOp(')')) this.fail('invalid syntax');
      this.i++; this.depth--;
      return e;
    }
    if (t.type === 'OP' && (t.value === '[' || t.value === '{'))
      throw new PyError('NotInCourse', 'Lists and dictionaries are real Python, but not part of this course yet', line);
    this.fail('invalid syntax');
  }
  fparts(raw, isRaw, line, level) {
    const parts = []; let lit = '', i = 0; const n = raw.length;
    const flush = () => { if (lit) { parts.push(isRaw ? lit : unescape(lit, line)); lit = ''; } };
    while (i < n) {
      const c = raw[i];
      if (c === '{') {
        if (raw[i + 1] === '{' && level === 0) { lit += '{'; i += 2; continue; }
        flush();
        let j = i + 1, d = 0, q = null, exprEnd = -1, conv = null, specStart = -1;
        for (; j < n; j++) {
          const ch = raw[j];
          if (q) { if (ch === q) q = null; continue; }
          if (ch === '"' || ch === "'") { q = ch; continue; }
          if ('([{'.includes(ch)) { d++; continue; }
          if (')]'.includes(ch)) { d--; continue; }
          if (ch === '}') { if (d === 0) { exprEnd = exprEnd < 0 ? j : exprEnd; break; } d--; continue; }
          if (d === 0 && ch === '!' && raw[j + 1] !== '=' && exprEnd < 0) { exprEnd = j; conv = raw[j + 1]; j += 1; continue; }
          if (d === 0 && ch === ':' && specStart < 0) { if (exprEnd < 0) exprEnd = j; specStart = j + 1;
            // spec runs to the matching close brace; allow nested {}
            let k = j + 1, dd = 0; for (; k < n; k++) { if (raw[k] === '{') dd++; else if (raw[k] === '}') { if (dd === 0) break; dd--; } }
            j = k; break; }
        }
        if (j >= n) throw se("f-string: expecting '}'", line);
        const exprText = raw.slice(i + 1, exprEnd);
        if (!exprText.trim()) throw se("f-string: valid expression required before '}'", line);
        const sub = tokenize(exprText.trim()); // may throw
        const p = new Parser(sub.toks, sub.unclosed, line);
        for (const tk of sub.toks) tk.line = line;
        const e = p.expr(); if (p.cur.type !== 'EOF') throw se('f-string: invalid syntax', line);
        const spec = specStart >= 0 ? this.fparts(raw.slice(specStart, j), true, line, level + 1) : null;
        parts.push({ e, conv, spec });
        i = j + 1; continue;
      }
      if (c === '}') {
        if (raw[i + 1] === '}' && level === 0) { lit += '}'; i += 2; continue; }
        throw se("f-string: single '}' is not allowed", line);
      }
      lit += c; i++;
    }
    flush(); return parts;
  }
}

/* ---------- arithmetic ---------- */
function floordivBig(a, b) { let q = a / b; if ((a % b !== 0n) && ((a < 0n) !== (b < 0n))) q -= 1n; return q; }
function modBig(a, b) { let r = a % b; if (r !== 0n && ((r < 0n) !== (b < 0n))) r += b; return r; }
function floatDivmod(vx, wx) {
  let mod = vx % wx, div = (vx - mod) / wx;
  if (mod) { if ((wx < 0) !== (mod < 0)) { mod += wx; div -= 1; } }
  else mod = wx < 0 ? -0 : 0;
  let fd;
  if (div) { fd = Math.floor(div); if (div - fd > 0.5) fd += 1; }
  else fd = (vx / wx) < 0 || Object.is(vx / wx, -0) ? -0 : 0;
  return [fd, mod];
}
const bigToNum = b => { const n = Number(b); if (!Number.isFinite(n)) throw new PyError('OverflowError', 'int too large to convert to float'); return n; };

function typeErr(op, l, r) {
  const ln = typeName(l), rn = typeName(r);
  if (op === '+' && typeof l === 'string') return new PyError('TypeError', `can only concatenate str (not "${rn}") to str`);
  if (op === '*' && (typeof l === 'string' || typeof r === 'string')) {
    const other = typeof l === 'string' ? r : l;
    return new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(other)}'`);
  }
  const shown = op === '**' ? '** or pow()' : op;
  return new PyError('TypeError', `unsupported operand type(s) for ${shown}: '${ln}' and '${rn}'`);
}

function binop(op, l, r) {
  if (op === '+' && typeof l === 'string' && typeof r === 'string') return l + r;
  if (op === '*' && ((typeof l === 'string' && (typeof r === 'bigint' || typeof r === 'boolean')) || (typeof r === 'string' && (typeof l === 'bigint' || typeof l === 'boolean')))) {
    const s = typeof l === 'string' ? l : r, k = toBig(typeof l === 'string' ? r : l);
    if (k <= 0n) return '';
    if (BigInt(s.length) * k > 2000000n) throw new PyError('MemoryError', 'That text would be too long for this website to build');
    return s.repeat(Number(k));
  }
  if (!isNum(l) || !isNum(r)) {
    if (op === '%' && typeof l === 'string') throw new PyError('NotInCourse', '% string formatting is real Python, but not part of this course yet');
    throw typeErr(op, l, r);
  }
  const fl = l instanceof PyFloat || r instanceof PyFloat;
  if (!fl) {
    const a = toBig(l), b = toBig(r);
    switch (op) {
      case '+': return a + b; case '-': return a - b; case '*': return a * b;
      case '/': if (b === 0n) throw new PyError('ZeroDivisionError', 'division by zero'); return new PyFloat(intDiv(a, b));
      case '//': if (b === 0n) throw new PyError('ZeroDivisionError', 'division by zero'); return floordivBig(a, b);
      case '%': if (b === 0n) throw new PyError('ZeroDivisionError', 'division by zero'); return modBig(a, b);
      case '**':
        if (b >= 0n) {
          if ((a > 1n || a < -1n) && b > 20000n) throw new PyError('MemoryError', 'That number is too big for this website to work out');
          if ((a > 1n || a < -1n) && BigInt(a.toString().length) * b > 40000n) throw new PyError('MemoryError', 'That number is too big for this website to work out');
          return a ** b;
        }
        if (a === 0n) throw new PyError('ZeroDivisionError', 'zero to a negative power');
        return new PyFloat(Math.pow(bigToNum(a), Number(b)));
    }
  }
  const x = l instanceof PyFloat ? l.v : bigToNum(toBig(l)), y = r instanceof PyFloat ? r.v : bigToNum(toBig(r));
  switch (op) {
    case '+': return new PyFloat(x + y); case '-': return new PyFloat(x - y); case '*': return new PyFloat(x * y);
    case '/': if (y === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return new PyFloat(x / y);
    case '//': if (y === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return new PyFloat(floatDivmod(x, y)[0]);
    case '%': if (y === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return new PyFloat(floatDivmod(x, y)[1]);
    case '**': {
      if (x === 0 && y < 0) throw new PyError('ZeroDivisionError', 'zero to a negative power');
      if (x < 0 && !Number.isInteger(y)) throw new PyError('NotInCourse', 'That would give a complex number, which is not part of this course');
      const p = Math.pow(x, y);
      if (!Number.isFinite(p) && Number.isFinite(x) && Number.isFinite(y)) throw new PyError('OverflowError', "(34, 'Numerical result out of range')");
      return new PyFloat(p);
    }
  }
}
function intDiv(a, b) {      // correctly-rounded-ish int/int true division
  const n = Number(a), d = Number(b);
  if (Number.isFinite(n) && Number.isFinite(d) && Math.abs(n) <= 9007199254740992 && Math.abs(d) <= 9007199254740992) return n / d;
  const neg = (a < 0n) !== (b < 0n); a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  const shift = 60n; const q = (a << shift) / b; const v = Number(q) / Math.pow(2, 60);
  return neg ? -v : v;
}
function compareOp(op, l, r) {
  if (isNum(l) && isNum(r)) {
    const a = l instanceof PyFloat ? l.v : toBig(l), b = r instanceof PyFloat ? r.v : toBig(r);
    switch (op) { case '==': return a == b; case '!=': return a != b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; }
  }
  if (typeof l === 'string' && typeof r === 'string') {
    switch (op) { case '==': return l === r; case '!=': return l !== r; case '<': return l < r; case '>': return l > r; case '<=': return l <= r; case '>=': return l >= r; }
  }
  if (op === '==') return l === r && l !== undefined;
  if (op === '!=') return !(l === r);
  throw new PyError('TypeError', `'${op}' not supported between instances of '${typeName(l)}' and '${typeName(r)}'`);
}

/* ---------- builtins ---------- */
const WS = /^[\s\u0085​]*|[\s\u0085​]*$/g;
function parseIntStr(s) {
  const t = s.replace(/^[\s]+|[\s]+$/g, '');
  if (!/^[+-]?[0-9]+(?:_[0-9]+)*$/.test(t)) throw new PyError('ValueError', `invalid literal for int() with base 10: ${pyRepr(s).slice(0, 200)}`);
  return BigInt(t.replace(/_/g, ''));
}
function parseFloatStr(s) {
  const t = s.replace(/^[\s]+|[\s]+$/g, '');
  const low = t.toLowerCase();
  if (/^[+-]?(inf|infinity)$/.test(low)) return low[0] === '-' ? -Infinity : Infinity;
  if (/^[+-]?nan$/.test(low)) return NaN;
  if (!/^[+-]?(?:[0-9]+(?:_[0-9]+)*\.?(?:[0-9]+(?:_[0-9]+)*)?|\.[0-9]+(?:_[0-9]+)*)(?:[eE][+-]?[0-9]+(?:_[0-9]+)*)?$/.test(t))
    throw new PyError('ValueError', `could not convert string to float: ${pyRepr(s)}`);
  return Number(t.replace(/_/g, ''));
}
function truthy(v) {
  if (v === null) return false; if (typeof v === 'boolean') return v; if (typeof v === 'bigint') return v !== 0n;
  if (v instanceof PyFloat) return v.v !== 0; if (typeof v === 'string') return v.length > 0; return true;
}
function floatToInt(f) {
  if (Number.isNaN(f)) throw new PyError('ValueError', 'cannot convert float NaN to integer');
  if (!Number.isFinite(f)) throw new PyError('OverflowError', 'cannot convert float infinity to integer');
  return BigInt(Math.trunc(f));
}
function roundNumber(x, nd) {
  if (x instanceof PyFloat) {
    if (nd === undefined || nd === null) {
      const f = x.v; if (Number.isNaN(f)) throw new PyError('ValueError', 'cannot convert float NaN to integer');
      if (!Number.isFinite(f)) throw new PyError('OverflowError', 'cannot convert float infinity to integer');
      return BigInt(roundHalfEven(f));
    }
    if (typeof nd !== 'bigint') throw new PyError('TypeError', `'${typeName(nd)}' object cannot be interpreted as an integer`);
    const f = x.v; if (!Number.isFinite(f)) return x;
    const n = Number(nd);
    if (n >= 0) { if (n > 300) return x; const s = (f < 0 || Object.is(f, -0) ? '-' : '') + toFixedExact(Math.abs(f), n); return new PyFloat(Number(s)); }
    const k = Math.pow(10, -n); let rr = roundHalfEven(f / k) * k; if (rr === 0 && (f < 0 || Object.is(f, -0))) rr = -0; return new PyFloat(rr);
  }
  if (isNum(x)) {
    const b = toBig(x);
    if (nd === undefined || nd === null || nd >= 0n) return b;
    const k = 10n ** (-nd), r = modBig(b, k), base = b - r; // half-even
    const twice = r * 2n; if (twice < k) return base; if (twice > k) return base + k;
    return ((base / k) % 2n === 0n) ? base : base + k;
  }
  throw new PyError('TypeError', `type ${typeName(x)} doesn't define __round__ method`);
}

function makeBuiltins(io) {
  const B = new Map();
  const reg = (name, fn) => B.set(name, new PyBuiltin(name, fn));
  reg('print', async (args, kw) => {
    let sep = ' ', end = '\n';
    for (const k of Object.keys(kw)) {
      if (k === 'sep') { if (kw.sep === null) sep = ' '; else if (typeof kw.sep === 'string') sep = kw.sep; else throw new PyError('TypeError', `sep must be None or a string, not ${typeName(kw.sep)}`); }
      else if (k === 'end') { if (kw.end === null) end = '\n'; else if (typeof kw.end === 'string') end = kw.end; else throw new PyError('TypeError', `end must be None or a string, not ${typeName(kw.end)}`); }
      else if (k === 'file' || k === 'flush') { /* ignore */ }
      else throw new PyError('TypeError', `'${k}' is an invalid keyword argument for print()`);
    }
    io.write(args.map(pyStr).join(sep) + end);
    return null;
  });
  reg('input', async (args) => {
    if (args.length > 1) throw new PyError('TypeError', `input expected at most 1 argument, got ${args.length}`);
    const prompt = args.length ? pyStr(args[0]) : '';
    const line = await io.input(prompt);
    if (line === null || line === undefined) throw new PyError('EOFError', 'EOF when reading a line');
    return String(line);
  });
  B.set('int', T_INT); B.set('float', T_FLOAT); B.set('str', T_STR); B.set('bool', T_BOOL); B.set('type', T_TYPE);
  reg('round', async (args, kw) => {
    if (args.length < 1 || args.length > 2) throw new PyError('TypeError', args.length ? `round() takes at most 2 arguments (${args.length} given)` : 'round() missing required argument \'number\' (pos 1)');
    return roundNumber(args[0], args.length === 2 ? args[1] : undefined);
  });
  reg('abs', async (args) => {
    if (args.length !== 1) throw new PyError('TypeError', `abs() takes exactly one argument (${args.length} given)`);
    const v = args[0];
    if (v instanceof PyFloat) return new PyFloat(Math.abs(v.v));
    if (isNum(v)) { const b = toBig(v); return b < 0n ? -b : b; }
    throw new PyError('TypeError', `bad operand type for abs(): '${typeName(v)}'`);
  });
  reg('len', async (args) => {
    if (args.length !== 1) throw new PyError('TypeError', `len() takes exactly one argument (${args.length} given)`);
    if (typeof args[0] === 'string') return BigInt([...args[0]].length);
    throw new PyError('TypeError', `object of type '${typeName(args[0])}' has no len()`);
  });
  const minmax = (name, pick) => reg(name, async (args) => {
    if (args.length === 0) throw new PyError('TypeError', `${name} expected at least 1 argument, got 0`);
    if (args.length === 1) throw new PyError('TypeError', `'${typeName(args[0])}' object is not iterable`);
    let best = args[0];
    for (let i = 1; i < args.length; i++) if (compareOp(pick, args[i], best)) best = args[i];
    return best;
  });
  minmax('max', '>'); minmax('min', '<');
  return B;
}

async function callType(T, args, kw, io) {
  if (Object.keys(kw).length) throw new PyError('TypeError', `${T.name}() takes no keyword arguments`);
  const a = args;
  switch (T.name) {
    case 'int': {
      if (a.length === 0) return 0n;
      if (a.length > 1) throw new PyError('NotInCourse', 'int() with a base is real Python, but not part of this course yet');
      const v = a[0];
      if (typeof v === 'bigint') return v; if (typeof v === 'boolean') return v ? 1n : 0n;
      if (v instanceof PyFloat) return floatToInt(v.v);
      if (typeof v === 'string') return parseIntStr(v);
      throw new PyError('TypeError', `int() argument must be a string, a bytes-like object or a real number, not '${typeName(v)}'`);
    }
    case 'float': {
      if (a.length === 0) return new PyFloat(0);
      if (a.length > 1) throw new PyError('TypeError', `float expected at most 1 argument, got ${a.length}`);
      const v = a[0];
      if (v instanceof PyFloat) return v; if (typeof v === 'boolean') return new PyFloat(v ? 1 : 0);
      if (typeof v === 'bigint') return new PyFloat(bigToNum(v));
      if (typeof v === 'string') return new PyFloat(parseFloatStr(v));
      throw new PyError('TypeError', `float() argument must be a string or a real number, not '${typeName(v)}'`);
    }
    case 'str': if (a.length === 0) return ''; if (a.length > 1) throw new PyError('NotInCourse', 'str() with encoding is not part of this course'); return pyStr(a[0]);
    case 'bool': return a.length ? truthy(a[0]) : false;
    case 'type':
      if (a.length !== 1) throw new PyError('NotInCourse', 'type() with 3 arguments is not part of this course');
      return typeOfValue(a[0]);
  }
  throw new PyError('TypeError', `'${T.name}' object is not callable`);
}
function typeOfValue(v) {
  switch (typeName(v)) { case 'int': return T_INT; case 'float': return T_FLOAT; case 'str': return T_STR; case 'bool': return T_BOOL;
    case 'NoneType': return T_NONE; case 'type': return T_TYPE; default: return T_FUNC; }
}

/* ---------- evaluator ---------- */
async function run(code, io) {
  io = io || {};
  const out = { write: io.write || (() => {}), input: io.input || (async () => null) };
  const builtins = makeBuiltins(out);
  const env = new Map();
  const snapshot = () => [...env].map(([name, v]) => ({ name, type: typeName(v), repr: pyRepr(v), value: v }));
  const result = { ok: true, error: null, vars: [], trace: [] };

  async function ev(n) {
    try { return await evInner(n); }
    catch (e) { if (e instanceof PyError && !e.line) e.line = n.line; throw e; }
  }
  async function evInner(n) {
    switch (n.t) {
      case 'num': case 'str': case 'const': return n.v;
      case 'name': {
        if (env.has(n.id)) return env.get(n.id);
        if (builtins.has(n.id)) return builtins.get(n.id);
        throw new PyError('NameError', `name '${n.id}' is not defined`, n.line);
      }
      case 'fstr': {
        let s = '';
        for (const p of n.parts) {
          if (typeof p === 'string') { s += p; continue; }
          let v = await ev(p.e);
          if (p.conv === 'r') v = pyRepr(v); else if (p.conv === 's') v = pyStr(v);
          let spec = '';
          if (p.spec) for (const sp of p.spec) spec += typeof sp === 'string' ? sp : formatValue(await ev(sp.e), '', n.line);
          s += formatValue(v, spec, n.line);
        }
        return s;
      }
      case 'bin': { const l = await ev(n.l); const r = await ev(n.r); return binop(n.op, l, r); }
      case 'unary': {
        const v = await ev(n.e);
        if (!isNum(v)) throw new PyError('TypeError', `bad operand type for unary ${n.op}: '${typeName(v)}'`);
        if (v instanceof PyFloat) return new PyFloat(n.op === '-' ? -v.v : v.v);
        const b = toBig(v); return n.op === '-' ? -b : b;
      }
      case 'cmp': {
        let l = await ev(n.first);
        for (let k = 0; k < n.ops.length; k++) {
          const r = await ev(n.rest[k]);
          if (!compareOp(n.ops[k], l, r)) return false;
          l = r;
        }
        return true;
      }
      case 'call': {
        const f = await ev(n.f);
        const args = []; for (const a of n.args) args.push(await ev(a));
        const kw = {}; for (const k of n.kwargs) kw[k.name] = await ev(k.e);
        if (f instanceof PyBuiltin) return await f.fn(args, kw);
        if (f instanceof PyType) return await callType(f, args, kw, out);
        throw new PyError('TypeError', `'${typeName(f)}' object is not callable`, n.line);
      }
    }
    throw new PyError('RuntimeError', 'unknown node ' + n.t);
  }

  try {
    const kw = /^(if|elif|else|for|while|def|class|import|from|try|with)\b/m.exec(String(code));
    if (kw) throw new PyError('NotInCourse', `"${kw[1]}" is real Python, but it is not part of this course yet`, String(code).slice(0, kw.index).split('\n').length);
    const { toks, unclosed } = tokenize(String(code));
    const prog = new Parser(toks, unclosed).parseProgram();
    for (const st of prog) {
      if (io.step) await io.step(st.line, snapshot());
      try {
        if (st.t === 'expr') await ev(st.e);
        else if (st.t === 'assign') { const v = await ev(st.value); for (const tg of st.targets) env.set(tg.id, v); }
        else if (st.t === 'aug') {
          if (!env.has(st.target.id)) throw new PyError('NameError', `name '${st.target.id}' is not defined`, st.line);
          const rhs = await ev(st.value); let v;
          try { v = binop(st.op, env.get(st.target.id), rhs); }
          catch (e) { if (e instanceof PyError && e.pyType === 'TypeError' && /^unsupported operand/.test(e.pyMsg)) { e.pyMsg = e.pyMsg.replace(/for (\*\* or pow\(\)|[^:]+): /, (m0, o) => 'for ' + (o === '** or pow()' ? '**= or pow()' : o + '=') + ': '); e.message = e.pyMsg; } throw e; }
          env.set(st.target.id, v);
        }
      } catch (e) { if (e instanceof PyError && !e.line) e.line = st.line; throw e; }
    }
    if (io.step) await io.step(null, snapshot());
  } catch (e) {
    if (!(e instanceof PyError)) {
      if (e && e.message === '__STOPPED__') { result.ok = false; result.stopped = true; result.vars = snapshot(); return result; }
      e = new PyError('RuntimeError', String(e && e.message || e));
    }
    result.ok = false; result.error = { type: e.pyType, msg: e.pyMsg, line: e.line };
  }
  result.vars = snapshot();
  return result;
}

const api = { run, tokenize, floatRepr, pyRepr, pyStr, formatValue, PyError, PyFloat, typeName,
  parse(code) { const { toks, unclosed } = tokenize(code); return new Parser(toks, unclosed).parseProgram(); } };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PyFun = api;
})(typeof window !== 'undefined' ? window : globalThis);
