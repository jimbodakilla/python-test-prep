/* pyfun v2: a Python interpreter for the school course subset.
   Basics (print, input, int, float, str, math, f-strings) + if/elif/else, while, for/range, break/continue,
   lists, slicing, string & list methods, functions (def/return/global/defaults).
   Runs in the browser and in Node. Checked against real CPython by tests/fuzz.js and tests/bank_check.js */
(function (root) {
'use strict';

/* ---------- values ----------
   int -> BigInt, float -> PyFloat, str -> string, bool -> boolean, None -> null, list -> PyList, range -> PyRange */
class PyError extends Error {
  constructor(type, msg, line) { super(msg); this.pyType = type; this.pyMsg = msg; this.line = line || null; }
}
class PyFloat { constructor(v) { this.v = v; } }
class PyType { constructor(name) { this.name = name; } }
class PyBuiltin { constructor(name, fn) { this.name = name; this.fn = fn; } }
class PyList { constructor(items) { this.items = items; } }
class PyRange { constructor(start, stop, step) { this.start = start; this.stop = stop; this.step = step; } }
class PyFunction { constructor(name, params, body, locals, globals, line) { this.name = name; this.params = params; this.body = body; this.locals = locals; this.globalNames = globals; this.line = line; } }
class BoundMethod { constructor(obj, name, fn) { this.obj = obj; this.name = name; this.fn = fn; } }

const T_INT = new PyType('int'), T_FLOAT = new PyType('float'), T_STR = new PyType('str'), T_BOOL = new PyType('bool'),
      T_NONE = new PyType('NoneType'), T_TYPE = new PyType('type'), T_FUNC = new PyType('builtin_function_or_method'),
      T_LIST = new PyType('list'), T_RANGE = new PyType('range'), T_FUNCTION = new PyType('function');

function typeName(v) {
  if (typeof v === 'bigint') return 'int';
  if (v instanceof PyFloat) return 'float';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'boolean') return 'bool';
  if (v === null) return 'NoneType';
  if (v instanceof PyList) return 'list';
  if (v instanceof PyRange) return 'range';
  if (v instanceof PyType) return 'type';
  if (v instanceof PyFunction) return 'function';
  return 'builtin_function_or_method';
}
const isNum = v => typeof v === 'bigint' || v instanceof PyFloat || typeof v === 'boolean';
const toBig = v => typeof v === 'boolean' ? (v ? 1n : 0n) : v;
const isInt = v => typeof v === 'bigint' || typeof v === 'boolean';

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
function roundHalfEven(x) {
  const f = Math.floor(x), d = x - f;
  if (d < 0.5) return f; if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
}

function pyRepr(v, seen) {
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
  if (v instanceof PyList) {
    seen = seen || new Set(); if (seen.has(v)) return '[...]';
    seen.add(v); const s = '[' + v.items.map(x => pyRepr(x, seen)).join(', ') + ']'; seen.delete(v); return s;
  }
  return pyStr(v);
}
function pyStr(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof PyFloat) return floatRepr(v.v);
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (v === null) return 'None';
  if (v instanceof PyList) return pyRepr(v);
  if (v instanceof PyRange) return v.step === 1n ? `range(${v.start}, ${v.stop})` : `range(${v.start}, ${v.stop}, ${v.step})`;
  if (v instanceof PyType) return "<class '" + v.name + "'>";
  if (v instanceof PyFunction) return '<function ' + v.name + '>';
  if (v instanceof BoundMethod) return '<built-in method ' + v.name + '>';
  if (v instanceof PyBuiltin) return '<built-in function ' + v.name + '>';
  return String(v);
}

/* ---------- format() mini-language ---------- */
function groupInt(digits, sep) { return digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
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
      if (t === '') {
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

/* ---------- tokenizer (with INDENT / DEDENT) ---------- */
const KW_NOT_IN_COURSE = new Set(['import', 'from', 'class', 'try', 'except', 'finally', 'with', 'lambda', 'del', 'is', 'assert', 'raise', 'yield', 'async', 'await', 'nonlocal', 'as']);
const KW_USED = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return', 'break', 'continue', 'pass', 'global', 'and', 'or', 'not']);

function se(msg, line, type) { return new PyError(type || 'SyntaxError', msg, line); }

function unescape(s) {
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
  src = src.replace(/\r\n?/g, '\n').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, ' ')
           .replace(/[﻿​‌‍⁠]/g, '');
  const toks = [], stack = [], indents = [0]; let i = 0, line = 1, atStart = true;
  const n = src.length;
  const push = (type, value, extra) => toks.push(Object.assign({ type, value, line, pos: i }, extra));
  while (i < n) {
    if (atStart && stack.length === 0) {
      let j = i, col = 0;
      while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\f')) { col = src[j] === ' ' ? col + 1 : src[j] === '\t' ? (Math.floor(col / 8) + 1) * 8 : 0; j++; }
      if (j >= n) { i = j; break; }
      if (src[j] === '\n') { i = j + 1; line++; continue; }
      if (src[j] === '#') { while (j < n && src[j] !== '\n') j++; i = j < n ? j + 1 : j; line++; continue; }
      const top = indents[indents.length - 1];
      if (col > top) { indents.push(col); push('INDENT', ''); }
      else if (col < top) {
        while (col < indents[indents.length - 1]) { indents.pop(); push('DEDENT', ''); }
        if (col !== indents[indents.length - 1]) throw se('unindent does not match any outer indentation level', line, 'IndentationError');
      }
      i = j; atStart = false;
    }
    const c = src[i];
    if (c === '\n') {
      if (stack.length === 0) { push('NEWLINE', '\n'); atStart = true; }
      i++; line++; continue;
    }
    if (c === ' ' || c === '\t' || c === '\f') { i++; continue; }
    if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '\\' && src[i + 1] === '\n') { i += 2; line++; continue; }
    const pm = /^([fFrR]{1,2})?('''|"""|'|")/.exec(src.slice(i, i + 5));
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
      if (!isF) t.value = isR ? raw : unescape(raw);
      toks.push(t); i = j; atStart = false; continue;
    }
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
    if (op === null) throw se('invalid syntax', line);
    if (op === '(' || op === '[' || op === '{') stack.push({ ch: op, line, pos: i });
    else if (op === ')' || op === ']' || op === '}') {
      if (!stack.length) throw se(`unmatched '${op}'`, line);
      const o = stack.pop(); const want = { '(': ')', '[': ']', '{': '}' }[o.ch];
      if (want !== op) throw se(`closing parenthesis '${op}' does not match opening parenthesis '${o.ch}'` + (o.line !== line ? ` on line ${o.line}` : ''), line);
    }
    push('OP', op); i += op.length; atStart = false;
  }
  const unclosed = stack.length ? stack[0] : null;
  if (toks.length && toks[toks.length - 1].type !== 'NEWLINE') push('NEWLINE', '\n');
  while (indents.length > 1) { indents.pop(); push('DEDENT', ''); }
  toks.push({ type: 'EOF', value: '', line, pos: n });
  return { toks, unclosed };
}

/* ---------- parser ---------- */
const NIC = (what, line) => new PyError('NotInCourse', what, line);
class Parser {
  constructor(toks, unclosed) { this.t = toks; this.i = 0; this.unclosed = unclosed; this.funcDepth = 0; this.loopDepth = 0; }
  get cur() { return this.t[this.i]; }
  peek(k = 1) { return this.t[Math.min(this.i + k, this.t.length - 1)]; }
  fail(msg, tok) {
    tok = tok || this.cur;
    if (this.unclosed && this.unclosed.pos < tok.pos + (tok.type === 'EOF' ? 1 : 0) && (msg === 'invalid syntax' || tok.type === 'EOF'))
      throw se(`'${this.unclosed.ch}' was never closed`, this.unclosed.line);
    throw se(msg || 'invalid syntax', tok.line);
  }
  isOp(v) { return this.cur.type === 'OP' && this.cur.value === v; }
  isKw(v) { return this.cur.type === 'NAME' && this.cur.value === v; }
  eatOp(v) { if (this.isOp(v)) { this.i++; return true; } return false; }
  expectOp(v) { if (!this.eatOp(v)) this.fail('invalid syntax'); }

  parseProgram() {
    const out = [];
    while (this.cur.type !== 'EOF') {
      if (this.cur.type === 'NEWLINE') { this.i++; continue; }
      if (this.cur.type === 'INDENT') throw se('unexpected indent', this.cur.line, 'IndentationError');
      if (this.cur.type === 'DEDENT') { this.i++; continue; }
      out.push(this.statement());
    }
    if (this.unclosed) throw se(`'${this.unclosed.ch}' was never closed`, this.unclosed.line);
    return out;
  }
  endStmt() {
    if (this.cur.type === 'NEWLINE') { this.i++; return; }
    if (this.cur.type === 'EOF') return;
    if (this.isOp(';')) { this.i++; if (this.cur.type === 'NEWLINE') this.i++; return; }
    this.fail('invalid syntax');
  }
  /* block after the ':' of a compound statement */
  block(what, headerLine) {
    if (this.isOp('=')) throw se("invalid syntax. Maybe you meant '==' or ':=' instead of '='?", this.cur.line);
    if (!this.isOp(':')) this.fail("expected ':'");
    this.i++;
    const body = [];
    if (this.cur.type !== 'NEWLINE') {                    // one-line body:  if x: print(1)
      for (;;) { body.push(this.simpleStatement()); if (this.cur.type === 'NEWLINE' || this.cur.type === 'EOF') break; }
      if (this.cur.type === 'NEWLINE') this.i++;
      return body;
    }
    this.i++;
    if (this.cur.type !== 'INDENT') throw se(`expected an indented block after ${what} on line ${headerLine}`, this.cur.line, 'IndentationError');
    this.i++;
    while (this.cur.type !== 'DEDENT' && this.cur.type !== 'EOF') {
      if (this.cur.type === 'NEWLINE') { this.i++; continue; }
      if (this.cur.type === 'INDENT') throw se('unexpected indent', this.cur.line, 'IndentationError');
      body.push(this.statement());
    }
    if (this.cur.type === 'DEDENT') this.i++;
    return body;
  }
  statement() {
    const t = this.cur, line = t.line;
    if (t.type === 'NAME') {
      if (KW_NOT_IN_COURSE.has(t.value)) throw NIC(`"${t.value}" is real Python, but it is not part of this course yet`, line);
      switch (t.value) {
        case 'if': return this.ifStmt();
        case 'while': { this.i++; const test = this.expr(); this.loopDepth++; const body = this.block("'while' statement", line); this.loopDepth--; return { t: 'while', test, body, line }; }
        case 'for': {
          this.i++;
          if (this.cur.type !== 'NAME' || KW_USED.has(this.cur.value) || KW_NOT_IN_COURSE.has(this.cur.value)) this.fail('invalid syntax');
          const v = this.cur.value; this.i++;
          if (this.isOp(',')) throw NIC('Unpacking several loop variables is real Python, but not part of this course yet', line);
          if (!this.isKw('in')) this.fail('invalid syntax'); this.i++;
          const iter = this.expr(); this.loopDepth++; const body = this.block("'for' statement", line); this.loopDepth--;
          return { t: 'for', var: v, iter, body, line };
        }
        case 'def': return this.defStmt();
        case 'else': case 'elif': this.fail('invalid syntax'); break;
        case 'in': case 'and': case 'or': this.fail('invalid syntax'); break;
      }
    }
    if (t.type === 'INDENT') throw se('unexpected indent', line, 'IndentationError');
    return this.simpleStatement();
  }
  ifStmt() {
    const line = this.cur.line; this.i++;
    const branches = []; let orelse = null;
    let test = this.expr(); branches.push({ test, body: this.block("'if' statement", line), line });
    while (this.isKw('elif')) { const l = this.cur.line; this.i++; test = this.expr(); branches.push({ test, body: this.block("'elif' statement", l), line: l }); }
    if (this.isKw('else')) { const l = this.cur.line; this.i++; orelse = this.block("'else' statement", l); }
    return { t: 'if', branches, orelse, line };
  }
  defStmt() {
    const line = this.cur.line; this.i++;
    if (this.funcDepth > 0) throw NIC('A function inside a function is real Python, but not part of this course yet', line);
    if (this.cur.type !== 'NAME' || KW_USED.has(this.cur.value)) this.fail('invalid syntax');
    const name = this.cur.value; this.i++;
    this.expectOp('(');
    const params = []; let sawDefault = false;
    while (!this.isOp(')')) {
      if (this.cur.type !== 'NAME' || KW_USED.has(this.cur.value)) { if (this.isOp('*')) throw NIC('*args is real Python, but not part of this course yet', line); this.fail('invalid syntax'); }
      const pname = this.cur.value; this.i++; let def = null;
      if (this.eatOp('=')) { def = this.expr(); sawDefault = true; }
      else if (sawDefault) throw se('parameter without a default follows parameter with a default', line);
      if (params.some(p => p.name === pname)) throw se(`duplicate argument '${pname}' in function definition`, line);
      params.push({ name: pname, def });
      if (!this.eatOp(',')) break;
    }
    this.expectOp(')');
    this.funcDepth++; const sl = this.loopDepth; this.loopDepth = 0;
    const body = this.block('function definition', line);
    this.funcDepth--; this.loopDepth = sl;
    // names assigned anywhere in the body are local (Python scoping rule)
    const locals = new Set(params.map(p => p.name)), globals = new Set();
    const scan = stmts => { for (const s of stmts) {
      if (s.t === 'global') s.names.forEach(n => globals.add(n));
      else if (s.t === 'assign') s.targets.forEach(tg => { if (tg.t === 'name') locals.add(tg.id); });
      else if (s.t === 'aug' && s.target.t === 'name') locals.add(s.target.id);
      else if (s.t === 'for') { locals.add(s.var); scan(s.body); }
      else if (s.t === 'while') scan(s.body);
      else if (s.t === 'if') { s.branches.forEach(b => scan(b.body)); if (s.orelse) scan(s.orelse); } } };
    scan(body); globals.forEach(g => locals.delete(g));
    return { t: 'def', name, params, body, locals, globals, line };
  }
  simpleStatement() {
    const t = this.cur, line = t.line;
    if (t.type === 'NAME') {
      if (KW_NOT_IN_COURSE.has(t.value)) throw NIC(`"${t.value}" is real Python, but it is not part of this course yet`, line);
      if (t.value === 'pass') { this.i++; this.endStmt(); return { t: 'pass', line }; }
      if (t.value === 'break') { if (!this.loopDepth) throw se("'break' outside loop", line); this.i++; this.endStmt(); return { t: 'break', line }; }
      if (t.value === 'continue') { if (!this.loopDepth) throw se("'continue' not properly in loop", line); this.i++; this.endStmt(); return { t: 'continue', line }; }
      if (t.value === 'return') {
        if (!this.funcDepth) throw se("'return' outside function", line);
        this.i++; let e = null; if (this.cur.type !== 'NEWLINE' && this.cur.type !== 'EOF' && !this.isOp(';')) e = this.exprList();
        this.endStmt(); return { t: 'return', e, line };
      }
      if (t.value === 'global') {
        this.i++; const names = [];
        do { if (this.cur.type !== 'NAME') this.fail('invalid syntax'); names.push(this.cur.value); this.i++; } while (this.eatOp(','));
        this.endStmt(); return { t: 'global', names, line };
      }
      if (t.value === 'print') {
        const nx = this.peek();
        if (nx.type === 'STR' || nx.type === 'FSTR' || nx.type === 'NUM' || (nx.type === 'NAME' && !KW_USED.has(nx.value) && !KW_NOT_IN_COURSE.has(nx.value)))
          throw se("Missing parentheses in call to 'print'. Did you mean print(...)?", line);
      }
      if (KW_USED.has(t.value) && !['not'].includes(t.value)) this.fail('invalid syntax');
    }
    const e = this.expr();
    if (this.isOp(',')) throw NIC('Tuples are real Python, but not part of this course yet', line);
    if (this.cur.type === 'OP' && ['=', '+=', '-=', '*=', '/=', '//=', '%=', '**='].includes(this.cur.value)) {
      const targets = [e]; const op = this.cur.value;
      if (op === '=') {
        let value = null;
        while (this.eatOp('=')) { value = this.expr(); if (this.isOp(',')) throw NIC('Tuples are real Python, but not part of this course yet', line); if (this.isOp('=')) targets.push(value); }
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
  exprList() { const e = this.expr(); if (this.isOp(',')) throw NIC('Tuples are real Python, but not part of this course yet', e.line); return e; }
  checkTarget(tg, aug) {
    if (tg.t === 'name') return;
    if (tg.t === 'index') return;
    if (tg.t === 'slice') throw NIC('Assigning to a slice is real Python, but not part of this course yet', tg.line);
    const what = { num: 'literal', str: 'literal', fstr: 'f-string expression', call: 'function call', bin: 'expression', unary: 'expression', cmp: 'comparison',
      bool: 'expression', not: 'expression', list: 'list', ifexp: 'conditional expression', attr: 'attribute', const: tg.v === null ? 'None' : tg.v ? 'True' : 'False' }[tg.t] || 'expression';
    if (aug) throw se(`'${what}' is an illegal expression for augmented assignment`, tg.line);
    throw se(`cannot assign to ${what} here. Maybe you meant '==' instead of '='?`, tg.line);
  }

  expr() {                                     // conditional expression:  a if c else b
    const e = this.orTest();
    if (this.isKw('if')) {
      const line = this.cur.line; this.i++; const c = this.orTest();
      if (!this.isKw('else')) this.fail('expected \'else\' after \'if\' expression'); this.i++;
      const o = this.expr(); return { t: 'ifexp', test: c, a: e, b: o, line };
    }
    return e;
  }
  orTest() { let l = this.andTest(); while (this.isKw('or')) { const line = this.cur.line; this.i++; l = { t: 'bool', op: 'or', l, r: this.andTest(), line }; } return l; }
  andTest() { let l = this.notTest(); while (this.isKw('and')) { const line = this.cur.line; this.i++; l = { t: 'bool', op: 'and', l, r: this.notTest(), line }; } return l; }
  notTest() { if (this.isKw('not')) { const line = this.cur.line; this.i++; return { t: 'not', e: this.notTest(), line }; } return this.comparison(); }
  comparison() {
    const first = this.arith(); const ops = [], rest = [];
    for (;;) {
      const c = this.cur;
      if (c.type === 'OP' && ['==', '!=', '<', '>', '<=', '>='].includes(c.value)) { ops.push(c.value); this.i++; }
      else if (c.type === 'NAME' && c.value === 'in') { ops.push('in'); this.i++; }
      else if (c.type === 'NAME' && c.value === 'not' && this.peek().type === 'NAME' && this.peek().value === 'in') { ops.push('not in'); this.i += 2; }
      else if (c.type === 'NAME' && c.value === 'is') throw NIC('"is" is real Python, but it is not part of this course yet (use == instead)', c.line);
      else break;
      rest.push(this.arith());
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
    if (this.isOp('**')) { const line = this.cur.line; this.i++; return { t: 'bin', op: '**', l: base, r: this.factor(), line }; }
    return base;
  }
  postfix() {
    let e = this.atom();
    for (;;) {
      if (this.isOp('(')) {
        const line = this.cur.line; this.i++;
        const args = [], kwargs = [];
        while (!this.isOp(')')) {
          if (this.cur.type === 'EOF' || this.cur.type === 'NEWLINE') this.fail('invalid syntax');
          if (this.cur.type === 'NAME' && this.peek().type === 'OP' && this.peek().value === '=' && !KW_USED.has(this.cur.value)) {
            const name = this.cur.value; this.i += 2; if (kwargs.some(k => k.name === name)) throw se(`keyword argument repeated: ${name}`, this.cur.line); kwargs.push({ name, e: this.expr() });
          } else {
            if (kwargs.length) throw se('positional argument follows keyword argument', this.cur.line);
            if (this.isOp('*')) throw NIC('*args unpacking is real Python, but not part of this course yet', this.cur.line);
            args.push(this.expr());
            if (this.isKw('for')) throw NIC('Comprehensions are real Python, but not part of this course yet', this.cur.line);
          }
          if (this.isOp(',')) { this.i++; continue; }
          if (!this.isOp(')')) {
            const c = this.cur;
            if (c.type === 'NAME' && !KW_USED.has(c.value) || c.type === 'NUM' || c.type === 'STR' || c.type === 'FSTR') this.fail('invalid syntax. Perhaps you forgot a comma?');
            this.fail('invalid syntax');
          }
        }
        this.i++;
        e = { t: 'call', f: e, args, kwargs, line };
      } else if (this.isOp('.')) {
        const line = this.cur.line; this.i++;
        if (this.cur.type !== 'NAME') this.fail('invalid syntax');
        e = { t: 'attr', obj: e, name: this.cur.value, line }; this.i++;
      } else if (this.isOp('[')) {
        const line = this.cur.line; this.i++;
        let lo = null, hi = null, step = null, isSlice = false;
        if (!this.isOp(':')) lo = this.expr();
        if (this.isOp(':')) {
          isSlice = true; this.i++;
          if (!this.isOp(']') && !this.isOp(':')) hi = this.expr();
          if (this.isOp(':')) { this.i++; if (!this.isOp(']')) step = this.expr(); }
        }
        if (this.isOp(',')) throw NIC('Tuples/multi-index are real Python, but not part of this course yet', line);
        this.expectOp(']');
        e = isSlice ? { t: 'slice', obj: e, lo, hi, step, line } : { t: 'index', obj: e, idx: lo, line };
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
      if (KW_NOT_IN_COURSE.has(t.value)) throw NIC(`"${t.value}" is real Python, but it is not part of this course yet`, line);
      if (KW_USED.has(t.value)) this.fail('invalid syntax');
      this.i++;
      if (t.value === 'True') return { t: 'const', v: true, line };
      if (t.value === 'False') return { t: 'const', v: false, line };
      if (t.value === 'None') return { t: 'const', v: null, line };
      return { t: 'name', id: t.value, line };
    }
    if (t.type === 'OP' && t.value === '(') {
      this.i++;
      if (this.isOp(')')) throw NIC('Tuples are real Python, but not part of this course yet', line);
      const e = this.expr();
      if (this.isOp(',')) throw NIC('Tuples are real Python, but not part of this course yet', line);
      if (this.isKw('for')) throw NIC('Comprehensions are real Python, but not part of this course yet', line);
      if (!this.isOp(')')) this.fail('invalid syntax');
      this.i++;
      return e;
    }
    if (t.type === 'OP' && t.value === '[') {
      this.i++; const items = [];
      while (!this.isOp(']')) {
        if (this.cur.type === 'EOF') this.fail('invalid syntax');
        items.push(this.expr());
        if (this.isKw('for')) throw NIC('List comprehensions are real Python, but not part of this course yet', line);
        if (this.isOp(',')) { this.i++; continue; }
        if (!this.isOp(']')) { const c = this.cur; if (c.type === 'NAME' || c.type === 'NUM' || c.type === 'STR') this.fail('invalid syntax. Perhaps you forgot a comma?'); this.fail('invalid syntax'); }
      }
      this.i++; return { t: 'list', items, line };
    }
    if (t.type === 'OP' && t.value === '{') throw NIC('Dictionaries and sets are real Python, but not part of this course yet', line);
    this.fail('invalid syntax');
  }
  fparts(raw, isRaw, line, level) {
    const parts = []; let lit = '', i = 0; const n = raw.length;
    const flush = () => { if (lit) { parts.push(isRaw ? lit : unescape(lit)); lit = ''; } };
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
          if (d === 0 && ch === ':' && specStart < 0) {
            if (exprEnd < 0) exprEnd = j; specStart = j + 1;
            let k = j + 1, dd = 0; for (; k < n; k++) { if (raw[k] === '{') dd++; else if (raw[k] === '}') { if (dd === 0) break; dd--; } }
            j = k; break;
          }
        }
        if (j >= n) throw se("f-string: expecting '}'", line);
        const exprText = raw.slice(i + 1, exprEnd);
        if (!exprText.trim()) throw se("f-string: valid expression required before '}'", line);
        const sub = tokenize(exprText.trim());
        for (const tk of sub.toks) tk.line = line;
        const p = new Parser(sub.toks.filter(tk => tk.type !== 'NEWLINE'), sub.unclosed);
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
const isSeq = v => typeof v === 'string' || v instanceof PyList;

function typeErr(op, l, r) {
  const ln = typeName(l), rn = typeName(r);
  if (op === '+' && typeof l === 'string') return new PyError('TypeError', `can only concatenate str (not "${rn}") to str`);
  if (op === '+' && l instanceof PyList) return new PyError('TypeError', `can only concatenate list (not "${rn}") to list`);
  if (op === '*' && (isSeq(l) || isSeq(r))) {
    const other = isSeq(l) ? r : l;
    return new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(other)}'`);
  }
  const shown = op === '**' ? '** or pow()' : op;
  return new PyError('TypeError', `unsupported operand type(s) for ${shown}: '${ln}' and '${rn}'`);
}

function binop(op, l, r) {
  if (op === '+') {
    if (typeof l === 'string' && typeof r === 'string') return l + r;
    if (l instanceof PyList && r instanceof PyList) return new PyList(l.items.concat(r.items));
  }
  if (op === '*' && ((isSeq(l) && isInt(r)) || (isSeq(r) && isInt(l)))) {
    const s = isSeq(l) ? l : r, k = toBig(isSeq(l) ? r : l);
    if (typeof s === 'string') {
      if (k <= 0n) return '';
      if (BigInt(s.length) * k > 2000000n) throw new PyError('MemoryError', 'That text would be too long for this website to build');
      return s.repeat(Number(k));
    }
    if (k <= 0n) return new PyList([]);
    if (BigInt(s.items.length) * k > 1000000n) throw new PyError('MemoryError', 'That list would be too long for this website to build');
    let out = []; for (let i = 0n; i < k; i++) out = out.concat(s.items); return new PyList(out);
  }
  if (!isNum(l) || !isNum(r)) {
    if (op === '%' && typeof l === 'string') throw NIC('% string formatting is real Python, but not part of this course yet');
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
      if (x < 0 && !Number.isInteger(y)) throw NIC('That would give a complex number, which is not part of this course');
      const p = Math.pow(x, y);
      if (!Number.isFinite(p) && Number.isFinite(x) && Number.isFinite(y)) throw new PyError('OverflowError', "(34, 'Numerical result out of range')");
      return new PyFloat(p);
    }
  }
}
function intDiv(a, b) {
  const n = Number(a), d = Number(b);
  if (Number.isFinite(n) && Number.isFinite(d) && Math.abs(n) <= 9007199254740992 && Math.abs(d) <= 9007199254740992) return n / d;
  const neg = (a < 0n) !== (b < 0n); a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  const q = (a << 60n) / b; const v = Number(q) / Math.pow(2, 60);
  return neg ? -v : v;
}
function valuesEqual(a, b) {
  if (isNum(a) && isNum(b)) return (a instanceof PyFloat ? a.v : toBig(a)) == (b instanceof PyFloat ? b.v : toBig(b));
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (a instanceof PyList && b instanceof PyList) { if (a.items.length !== b.items.length) return false; for (let i = 0; i < a.items.length; i++) if (!valuesEqual(a.items[i], b.items[i])) return false; return true; }
  if (a instanceof PyRange && b instanceof PyRange) return pyStr(a) === pyStr(b);
  return a === b;
}
function lessThan(a, b, opText, swap) {
  if (isNum(a) && isNum(b)) return (a instanceof PyFloat ? a.v : toBig(a)) < (b instanceof PyFloat ? b.v : toBig(b));
  if (typeof a === 'string' && typeof b === 'string') return a < b;
  if (a instanceof PyList && b instanceof PyList) {
    const n = Math.min(a.items.length, b.items.length);
    for (let i = 0; i < n; i++) if (!valuesEqual(a.items[i], b.items[i])) return lessThan(a.items[i], b.items[i], opText, swap);
    return a.items.length < b.items.length;
  }
  throw new PyError('TypeError', `'${opText || '<'}' not supported between instances of '${typeName(swap ? b : a)}' and '${typeName(swap ? a : b)}'`);
}
function lessOrEq(a, b, opText, swap) {
  if (isNum(a) && isNum(b)) return (a instanceof PyFloat ? a.v : toBig(a)) <= (b instanceof PyFloat ? b.v : toBig(b));
  if (typeof a === 'string' && typeof b === 'string') return a <= b;
  if (a instanceof PyList && b instanceof PyList) return lessThan(a, b, opText, swap) || valuesEqual(a, b);
  throw new PyError('TypeError', `'${opText}' not supported between instances of '${typeName(swap ? b : a)}' and '${typeName(swap ? a : b)}'`);
}
function compareOp(op, l, r) {
  switch (op) {
    case '==': return valuesEqual(l, r);
    case '!=': return !valuesEqual(l, r);
    case '<': return lessThan(l, r, '<');
    case '>': return lessThan(r, l, '>', true);
    case '<=': return lessOrEq(l, r, '<=');
    case '>=': return lessOrEq(r, l, '>=', true);
  }
}
function contains(container, x) {
  if (typeof container === 'string') {
    if (typeof x !== 'string') throw new PyError('TypeError', `'in <string>' requires string as left operand, not ${typeName(x)}`);
    return container.includes(x);
  }
  if (container instanceof PyList) { for (const it of container.items) if (valuesEqual(it, x)) return true; return false; }
  if (container instanceof PyRange) {
    if (!isNum(x) || x instanceof PyFloat && !Number.isInteger(x.v)) return false;
    const v = x instanceof PyFloat ? BigInt(x.v) : toBig(x);
    return rangeContains(container, v);
  }
  throw new PyError('TypeError', `argument of type '${typeName(container)}' is not iterable`);
}
function rangeLen(r) {
  if (r.step > 0n) return r.stop > r.start ? (r.stop - r.start + r.step - 1n) / r.step : 0n;
  return r.start > r.stop ? (r.start - r.stop - r.step - 1n) / (-r.step) : 0n;
}
function rangeContains(r, v) {
  if (r.step > 0n ? (v < r.start || v >= r.stop) : (v > r.start || v <= r.stop)) return false;
  return (v - r.start) % r.step === 0n;
}

/* ---------- iteration, indexing, slicing ---------- */
function* iterate(v) {
  if (v instanceof PyRange) {
    if (v.step > 0n) for (let i = v.start; i < v.stop; i += v.step) yield i; else for (let i = v.start; i > v.stop; i += v.step) yield i;
  } else if (v instanceof PyList) { for (let i = 0; i < v.items.length; i++) yield v.items[i]; }
  else if (typeof v === 'string') { for (const ch of v) yield ch; }
  else throw new PyError('TypeError', `'${typeName(v)}' object is not iterable`);
}
const toArray = v => v instanceof PyList ? v.items.slice() : [...iterate(v)];
function indexOf(v, i, kind) {
  if (!isInt(i)) throw new PyError('TypeError', kind === 'str' ? `string indices must be integers, not '${typeName(i)}'` : `list indices must be integers or slices, not ${typeName(i)}`);
  return toBig(i);
}
function getIndex(obj, idx) {
  if (obj instanceof PyList || typeof obj === 'string') {
    const isStr = typeof obj === 'string';
    let k = indexOf(obj, idx, isStr ? 'str' : 'list');
    const arr = isStr ? (/[\ud800-\udfff]/.test(obj) ? [...obj] : obj) : obj.items;
    const len = BigInt(arr.length); if (k < 0n) k += len;
    if (k < 0n || k >= len) throw new PyError('IndexError', isStr ? 'string index out of range' : 'list index out of range');
    return arr[Number(k)];
  }
  if (obj instanceof PyRange) { const len = rangeLen(obj); let k = indexOf(obj, idx, 'list'); if (k < 0n) k += len; if (k < 0n || k >= len) throw new PyError('IndexError', 'range object index out of range'); return obj.start + k * obj.step; }
  throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
}
function sliceIndices(len, lo, hi, step) {
  const L = BigInt(len); let st = 1n;
  if (step !== null) { if (!isInt(step)) throw new PyError('TypeError', 'slice indices must be integers or None or have an __index__ method'); st = toBig(step); if (st === 0n) throw new PyError('ValueError', 'slice step cannot be zero'); }
  const conv = (x, dflt, lower, upper) => {
    if (x === null) return dflt;
    if (!isInt(x)) throw new PyError('TypeError', 'slice indices must be integers or None or have an __index__ method');
    let k = toBig(x); if (k < 0n) { k += L; if (k < lower) k = lower; } else if (k > upper) k = upper; return k;
  };
  let start, stop;
  if (st > 0n) { start = conv(lo, 0n, 0n, L); stop = conv(hi, L, 0n, L); }
  else { start = conv(lo, L - 1n, -1n, L - 1n); stop = conv(hi, -1n, -1n, L - 1n); }
  const idxs = [];
  if (st > 0n) for (let i = start; i < stop; i += st) idxs.push(Number(i)); else for (let i = start; i > stop; i += st) idxs.push(Number(i));
  return idxs;
}
function getSlice(obj, lo, hi, step) {
  if (typeof obj === 'string') { const arr = [...obj]; return sliceIndices(arr.length, lo, hi, step).map(i => arr[i]).join(''); }
  if (obj instanceof PyList) return new PyList(sliceIndices(obj.items.length, lo, hi, step).map(i => obj.items[i]));
  throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
}
function setIndex(obj, idx, val) {
  if (obj instanceof PyList) {
    let k = indexOf(obj, idx, 'list'); const len = BigInt(obj.items.length); if (k < 0n) k += len;
    if (k < 0n || k >= len) throw new PyError('IndexError', 'list assignment index out of range');
    obj.items[Number(k)] = val; return;
  }
  if (typeof obj === 'string') throw new PyError('TypeError', "'str' object does not support item assignment");
  throw new PyError('TypeError', `'${typeName(obj)}' object does not support item assignment`);
}

/* ---------- builtins ---------- */
function parseIntStr(s) {
  const t = s.replace(/^[\s]+|[\s]+$/g, '');
  if (!/^[+-]?[0-9]+(?:_[0-9]+)*$/.test(t)) throw new PyError('ValueError', `invalid literal for int() with base 10: ${pyRepr(s).slice(0, 200)}`);
  return BigInt(t.replace(/_/g, ''));
}
function parseFloatStr(s) {
  const t = s.replace(/^[\s]+|[\s]+$/g, ''); const low = t.toLowerCase();
  if (/^[+-]?(inf|infinity)$/.test(low)) return low[0] === '-' ? -Infinity : Infinity;
  if (/^[+-]?nan$/.test(low)) return NaN;
  if (!/^[+-]?(?:[0-9]+(?:_[0-9]+)*\.?(?:[0-9]+(?:_[0-9]+)*)?|\.[0-9]+(?:_[0-9]+)*)(?:[eE][+-]?[0-9]+(?:_[0-9]+)*)?$/.test(t))
    throw new PyError('ValueError', `could not convert string to float: ${pyRepr(s)}`);
  return Number(t.replace(/_/g, ''));
}
function truthy(v) {
  if (v === null) return false; if (typeof v === 'boolean') return v; if (typeof v === 'bigint') return v !== 0n;
  if (v instanceof PyFloat) return v.v !== 0; if (typeof v === 'string') return v.length > 0;
  if (v instanceof PyList) return v.items.length > 0; if (v instanceof PyRange) return rangeLen(v) > 0n; return true;
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
    if (!isInt(nd)) throw new PyError('TypeError', `'${typeName(nd)}' object cannot be interpreted as an integer`);
    const f = x.v; if (!Number.isFinite(f)) return x;
    const n = Number(toBig(nd));
    if (n >= 0) { if (n > 300) return x; const s = (f < 0 || Object.is(f, -0) ? '-' : '') + toFixedExact(Math.abs(f), n); return new PyFloat(Number(s)); }
    const k = Math.pow(10, -n); let rr = roundHalfEven(f / k) * k; if (rr === 0 && (f < 0 || Object.is(f, -0))) rr = -0; return new PyFloat(rr);
  }
  if (isNum(x)) {
    const b = toBig(x);
    if (nd === undefined || nd === null || toBig(nd) >= 0n) return b;
    const k = 10n ** (-toBig(nd)), r = modBig(b, k), base = b - r;
    const twice = r * 2n; if (twice < k) return base; if (twice > k) return base + k;
    return ((base / k) % 2n === 0n) ? base : base + k;
  }
  throw new PyError('TypeError', `type ${typeName(x)} doesn't define __round__ method`);
}
/* stable binary-insertion sort using Python's own < rules (so TypeErrors match) */
function sortValues(arr, reverse) {
  const a = arr.slice(); if (reverse) a.reverse();
  for (let i = 1; i < a.length; i++) {
    const pivot = a[i]; let l = 0, r = i;
    while (l < r) { const p = l + ((r - l) >> 1); if (lessThan(pivot, a[p], '<')) r = p; else l = p + 1; }
    a.splice(i, 1); a.splice(l, 0, pivot);
  }
  if (reverse) a.reverse(); return a;
}
const toIntArg = v => { if (!isInt(v)) throw new PyError('TypeError', `'${typeName(v)}' object cannot be interpreted as an integer`); return toBig(v); };

function makeBuiltins(out) {
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
    out.write(args.map(pyStr).join(sep) + end);
    return null;
  });
  reg('input', async (args) => {
    if (args.length > 1) throw new PyError('TypeError', `input expected at most 1 argument, got ${args.length}`);
    const prompt = args.length ? pyStr(args[0]) : '';
    const line = await out.input(prompt);
    if (line === null || line === undefined) throw new PyError('EOFError', 'EOF when reading a line');
    return String(line);
  });
  B.set('int', T_INT); B.set('float', T_FLOAT); B.set('str', T_STR); B.set('bool', T_BOOL); B.set('type', T_TYPE); B.set('list', T_LIST); B.set('range', T_RANGE);
  reg('round', async (args) => {
    if (args.length < 1 || args.length > 2) throw new PyError('TypeError', args.length ? `round() takes at most 2 arguments (${args.length} given)` : "round() missing required argument 'number' (pos 1)");
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
    const v = args[0];
    if (typeof v === 'string') return BigInt([...v].length);
    if (v instanceof PyList) return BigInt(v.items.length);
    if (v instanceof PyRange) return rangeLen(v);
    throw new PyError('TypeError', `object of type '${typeName(v)}' has no len()`);
  });
  const minmax = (name) => reg(name, async (args, kw) => {
    if (args.length === 0) throw new PyError('TypeError', `${name} expected at least 1 argument, got 0`);
    let arr = args;
    if (args.length === 1) { arr = toArray(args[0]); if (arr.length === 0) { if ('default' in kw) return kw.default; throw new PyError('ValueError', `${name}() iterable argument is empty`); } }
    let best = arr[0];
    for (let i = 1; i < arr.length; i++) if (name === 'max' ? compareOp('>', arr[i], best) : compareOp('<', arr[i], best)) best = arr[i];
    return best;
  });
  minmax('max'); minmax('min');
  reg('sum', async (args) => {
    if (args.length < 1 || args.length > 2) throw new PyError('TypeError', `sum() takes at least 1 positional argument (${args.length} given)`);
    let acc = args.length === 2 ? args[1] : 0n;
    for (const x of iterate(args[0])) acc = binop('+', acc, x);
    return acc;
  });
  reg('sorted', async (args, kw) => {
    if (args.length !== 1) throw new PyError('TypeError', `sorted expected 1 argument, got ${args.length}`);
    for (const k of Object.keys(kw)) if (k !== 'reverse') throw NIC(`sorted(${k}=...) is real Python, but not part of this course yet`);
    return new PyList(sortValues(toArray(args[0]), truthy(kw.reverse === undefined ? false : kw.reverse)));
  });
  return B;
}

async function callType(T, args, kw) {
  const a = args;
  if (Object.keys(kw).length) throw new PyError('TypeError', `${T.name}() takes no keyword arguments`);
  switch (T.name) {
    case 'int': {
      if (a.length === 0) return 0n;
      if (a.length > 1) throw NIC('int() with a base is real Python, but not part of this course yet');
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
    case 'str': if (a.length === 0) return ''; if (a.length > 1) throw NIC('str() with encoding is not part of this course'); return pyStr(a[0]);
    case 'bool': return a.length ? truthy(a[0]) : false;
    case 'list': if (a.length > 1) throw new PyError('TypeError', `list expected at most 1 argument, got ${a.length}`); return new PyList(a.length ? toArray(a[0]) : []);
    case 'type':
      if (a.length !== 1) throw NIC('type() with 3 arguments is not part of this course');
      return typeOfValue(a[0]);
    case 'range': {
      if (a.length < 1) throw new PyError('TypeError', 'range expected at least 1 argument, got 0');
      if (a.length > 3) throw new PyError('TypeError', `range expected at most 3 arguments, got ${a.length}`);
      const n = a.map(x => toIntArg(x));
      const step = n.length === 3 ? n[2] : 1n; if (step === 0n) throw new PyError('ValueError', 'range() arg 3 must not be zero');
      return n.length === 1 ? new PyRange(0n, n[0], 1n) : new PyRange(n[0], n[1], step);
    }
  }
  throw new PyError('TypeError', `'${T.name}' object is not callable`);
}
function typeOfValue(v) {
  switch (typeName(v)) { case 'int': return T_INT; case 'float': return T_FLOAT; case 'str': return T_STR; case 'bool': return T_BOOL; case 'list': return T_LIST;
    case 'range': return T_RANGE; case 'NoneType': return T_NONE; case 'type': return T_TYPE; case 'function': return T_FUNCTION; default: return T_FUNC; }
}

/* ---------- string & list methods ---------- */
const argc = (name, args, lo, hi) => {
  if (args.length < lo || args.length > hi) {
    if (lo === hi) throw new PyError('TypeError', `${name}() takes ${lo === 0 ? 'no' : 'exactly ' + lo} argument${lo === 1 ? '' : 's'} (${args.length} given)`);
    throw new PyError('TypeError', `${name}() takes ${args.length < lo ? 'at least ' + lo : 'at most ' + hi} argument${(args.length < lo ? lo : hi) === 1 ? '' : 's'} (${args.length} given)`);
  }
};
const needStr = (name, v) => { if (typeof v !== 'string') throw new PyError('TypeError', `${name} arg must be str, not ${typeName(v)}`); return v; };
const isLetter = ch => /\p{L}/u.test(ch);
function stripChars(s, chars, left, right) { const set = new Set([...chars]); const c = [...s]; let i = 0, j = c.length; if (left) while (i < j && set.has(c[i])) i++; if (right) while (j > i && set.has(c[j - 1])) j--; return c.slice(i, j).join(''); }
function cpIndex(s, utf16) { return utf16 < 0 ? -1 : [...s.slice(0, utf16)].length; }
const STR_METHODS = {
  upper: (s, a) => (argc('upper', a, 0, 0), s.toUpperCase()), lower: (s, a) => (argc('lower', a, 0, 0), s.toLowerCase()),
  strip: (s, a) => { argc('strip', a, 0, 1); return a.length && a[0] !== null ? stripChars(s, needStr('strip', a[0]), true, true) : s.replace(/^\s+|\s+$/g, ''); },
  lstrip: (s, a) => { argc('lstrip', a, 0, 1); return a.length && a[0] !== null ? stripChars(s, needStr('lstrip', a[0]), true, false) : s.replace(/^\s+/, ''); },
  rstrip: (s, a) => { argc('rstrip', a, 0, 1); return a.length && a[0] !== null ? stripChars(s, needStr('rstrip', a[0]), false, true) : s.replace(/\s+$/, ''); },
  replace: (s, a) => {
    argc('replace', a, 2, 3);
    if (typeof a[0] !== 'string') throw new PyError('TypeError', `replace() argument 1 must be str, not ${typeName(a[0])}`);
    if (typeof a[1] !== 'string') throw new PyError('TypeError', `replace() argument 2 must be str, not ${typeName(a[1])}`);
    const o = a[0]; let cnt = a.length === 3 ? Number(toIntArg(a[2])) : -1;
    if (o === '') { const chars = [...s]; let res = '', c = cnt; for (let i = 0; i <= chars.length; i++) { if (c !== 0) { res += a[1]; c--; } if (i < chars.length) res += chars[i]; } return res; }
    if (cnt < 0) return s.split(o).join(a[1]);
    let res = '', idx = 0; while (cnt > 0) { const p = s.indexOf(o, idx); if (p < 0) break; res += s.slice(idx, p) + a[1]; idx = p + o.length; cnt--; } return res + s.slice(idx);
  },
  count: (s, a) => { argc('count', a, 1, 1); if (typeof a[0] !== 'string') throw new PyError('TypeError', `must be str, not ${typeName(a[0])}`); if (a[0] === '') return BigInt([...s].length + 1); return BigInt(s.split(a[0]).length - 1); },
  find: (s, a) => { argc('find', a, 1, 1); if (typeof a[0] !== 'string') throw new PyError('TypeError', `must be str, not ${typeName(a[0])}`); return BigInt(cpIndex(s, s.indexOf(a[0]))); },
  index: (s, a) => { argc('index', a, 1, 1); if (typeof a[0] !== 'string') throw new PyError('TypeError', `must be str, not ${typeName(a[0])}`); const p = s.indexOf(a[0]); if (p < 0) throw new PyError('ValueError', 'substring not found'); return BigInt(cpIndex(s, p)); },
  startswith: (s, a) => { argc('startswith', a, 1, 1); if (typeof a[0] !== 'string') throw new PyError('TypeError', `startswith first arg must be str or a tuple of str, not ${typeName(a[0])}`); return s.startsWith(a[0]); },
  endswith: (s, a) => { argc('endswith', a, 1, 1); if (typeof a[0] !== 'string') throw new PyError('TypeError', `endswith first arg must be str or a tuple of str, not ${typeName(a[0])}`); return s.endsWith(a[0]); },
  isdigit: (s, a) => (argc('isdigit', a, 0, 0), /^[0-9]+$/.test(s)), isalpha: (s, a) => (argc('isalpha', a, 0, 0), /^\p{L}+$/u.test(s)),
  isalnum: (s, a) => (argc('isalnum', a, 0, 0), /^[\p{L}0-9]+$/u.test(s)), isspace: (s, a) => (argc('isspace', a, 0, 0), /^\s+$/.test(s)),
  isupper: (s, a) => (argc('isupper', a, 0, 0), s.toUpperCase() === s && s.toLowerCase() !== s), islower: (s, a) => (argc('islower', a, 0, 0), s.toLowerCase() === s && s.toUpperCase() !== s),
  title: (s, a) => { argc('title', a, 0, 0); let prev = false, o = ''; for (const ch of s) { if (isLetter(ch)) { o += prev ? ch.toLowerCase() : ch.toUpperCase(); prev = true; } else { o += ch; prev = false; } } return o; },
  swapcase: (s, a) => (argc('swapcase', a, 0, 0), [...s].map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join('')),
  capitalize: (s, a) => { argc('capitalize', a, 0, 0); const c = [...s]; return c.length ? c[0].toUpperCase() + c.slice(1).join('').toLowerCase() : ''; },
  split: (s, a, kw) => {
    argc('split', a, 0, 2);
    const sep = a.length ? a[0] : (kw.sep !== undefined ? kw.sep : null);
    const mx = a.length > 1 ? Number(toIntArg(a[1])) : (kw.maxsplit !== undefined ? Number(toIntArg(kw.maxsplit)) : -1);
    if (sep !== null && typeof sep !== 'string') throw new PyError('TypeError', `must be str or None, not ${typeName(sep)}`);
    if (sep === '') throw new PyError('ValueError', 'empty separator');
    let parts;
    if (sep === null) {
      let rest = s.replace(/^\s+/, ''); parts = [];
      while (rest !== '') {
        if (mx >= 0 && parts.length >= mx) { parts.push(rest.replace(/\s+$/, '')); rest = ''; break; }
        const m = /\s+/.exec(rest); if (!m) { parts.push(rest); rest = ''; break; }
        parts.push(rest.slice(0, m.index)); rest = rest.slice(m.index + m[0].length);
      }
    } else { parts = s.split(sep); if (mx >= 0 && parts.length > mx + 1) parts = parts.slice(0, mx).concat(parts.slice(mx).join(sep)); }
    return new PyList(parts);
  },
  join: (s, a) => {
    argc('join', a, 1, 1); let arr; try { arr = toArray(a[0]); } catch (e) { throw new PyError('TypeError', 'can only join an iterable'); }
    arr.forEach((x, i) => { if (typeof x !== 'string') throw new PyError('TypeError', `sequence item ${i}: expected str instance, ${typeName(x)} found`); });
    return arr.join(s);
  },
};
const LIST_METHODS = {
  append: (l, a) => { argc('append', a, 1, 1); l.items.push(a[0]); return null; },
  extend: (l, a) => { argc('extend', a, 1, 1); const src = toArray(a[0]); for (const x of src) l.items.push(x); return null; },
  insert: (l, a) => { argc('insert', a, 2, 2); let k = Number(toIntArg(a[0])); const n = l.items.length; if (k < 0) k = Math.max(0, k + n); else if (k > n) k = n; l.items.splice(k, 0, a[1]); return null; },
  remove: (l, a) => { argc('remove', a, 1, 1); for (let i = 0; i < l.items.length; i++) if (valuesEqual(l.items[i], a[0])) { l.items.splice(i, 1); return null; } throw new PyError('ValueError', 'list.remove(x): x not in list'); },
  pop: (l, a) => {
    argc('pop', a, 0, 1); if (l.items.length === 0) throw new PyError('IndexError', 'pop from empty list');
    let k = a.length ? toIntArg(a[0]) : -1n; const n = BigInt(l.items.length); if (k < 0n) k += n;
    if (k < 0n || k >= n) throw new PyError('IndexError', 'pop index out of range'); return l.items.splice(Number(k), 1)[0];
  },
  sort: (l, a, kw) => { if (a.length) throw new PyError('TypeError', 'sort() takes no positional arguments'); for (const k of Object.keys(kw)) if (k !== 'reverse') throw NIC(`sort(${k}=...) is real Python, but not part of this course yet`); l.items = sortValues(l.items, truthy(kw.reverse === undefined ? false : kw.reverse)); return null; },
  reverse: (l, a) => { argc('reverse', a, 0, 0); l.items.reverse(); return null; },
  index: (l, a) => { argc('index', a, 1, 1); for (let i = 0; i < l.items.length; i++) if (valuesEqual(l.items[i], a[0])) return BigInt(i); throw new PyError('ValueError', `${pyRepr(a[0])} is not in list`); },
  count: (l, a) => { argc('count', a, 1, 1); let c = 0n; for (const x of l.items) if (valuesEqual(x, a[0])) c++; return c; },
  copy: (l, a) => { argc('copy', a, 0, 0); return new PyList(l.items.slice()); },
  clear: (l, a) => { argc('clear', a, 0, 0); l.items.length = 0; return null; },
};
function getMethod(obj, name, line) {
  const table = typeof obj === 'string' ? STR_METHODS : obj instanceof PyList ? LIST_METHODS : null;
  if (table && Object.prototype.hasOwnProperty.call(table, name)) { const f = table[name]; return new BoundMethod(obj, name, async (args, kw) => f(obj, args, kw || {})); }
  throw new PyError('AttributeError', `'${typeName(obj)}' object has no attribute '${name}'`, line);
}

/* ---------- evaluator ---------- */
const BREAK = { sig: 'break' }, CONTINUE = { sig: 'continue' };
let yieldNow = () => new Promise(r => setTimeout(r, 0));
if (typeof MessageChannel !== 'undefined') {
  const ch = new MessageChannel(); const q = [];
  ch.port1.onmessage = () => { const r = q.shift(); if (!q.length && ch.port1.unref) ch.port1.unref(); r && r(); };
  yieldNow = () => new Promise(r => { q.push(r); if (ch.port1.ref) ch.port1.ref(); ch.port2.postMessage(0); });
  if (ch.port1.unref) { ch.port1.unref(); ch.port2.unref(); }
}

async function run(code, io) {
  io = io || {};
  let written = 0; const rawWrite = io.write || (() => {});
  const out = { input: io.input || (async () => null),
    write(s) { written += s.length; if (written > 100000) throw new PyError('MemoryError', 'Your program printed way too much text, so it was stopped'); rawWrite(s); } };
  const builtins = makeBuiltins(out);
  const globalsMap = new Map();
  const frames = [{ vars: globalsMap, name: '', locals: null, globalDecl: null }];
  const frame = () => frames[frames.length - 1];
  const LIMIT = io.limit || 3000000; let ticks = 0;
  const snapshot = () => {
    const f = frame();
    const vars = [...f.vars].filter(([, v]) => !(v instanceof PyFunction)).map(([name, v]) => ({ name, type: typeName(v), repr: pyRepr(v),
      cells: v instanceof PyList ? v.items.map(x => ({ repr: pyRepr(x), type: typeName(x) })) : null }));
    vars.frame = f.name; return vars;
  };
  const result = { ok: true, error: null, vars: [] };
  async function tick() {
    if (++ticks > LIMIT) throw new PyError('TimeLimit', 'Your program ran for too long. It may be stuck in a loop that never ends');
    if ((ticks & 1023) === 0) { await yieldNow(); if (io.shouldStop && io.shouldStop()) throw new Error('__STOPPED__'); }
  }
  async function stepHook(line) { if (io.step) await io.step(line, snapshot); }       // snapshot is a function: callers take one only when they need it

  function lookup(name, line) {
    const f = frame();
    if (f.locals && f.locals.has(name)) {
      if (f.vars.has(name)) return f.vars.get(name);
      throw new PyError('UnboundLocalError', `cannot access local variable '${name}' where it is not associated with a value`, line);
    }
    if (globalsMap.has(name)) return globalsMap.get(name);
    if (builtins.has(name)) return builtins.get(name);
    throw new PyError('NameError', `name '${name}' is not defined`, line);
  }
  function assignName(name, v) {
    const f = frame();
    if (f.globalDecl && f.globalDecl.has(name)) globalsMap.set(name, v); else f.vars.set(name, v);
  }

  async function ev(n) {
    try { return await evInner(n); }
    catch (e) { if (e instanceof PyError && !e.line) e.line = n.line; throw e; }
  }
  async function evInner(n) {
    switch (n.t) {
      case 'num': case 'str': case 'const': return n.v;
      case 'name': return lookup(n.id, n.line);
      case 'list': { const items = []; for (const it of n.items) items.push(await ev(it)); return new PyList(items); }
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
      case 'not': return !truthy(await ev(n.e));
      case 'bool': { const l = await ev(n.l); if (n.op === 'and') return truthy(l) ? await ev(n.r) : l; return truthy(l) ? l : await ev(n.r); }
      case 'ifexp': return truthy(await ev(n.test)) ? await ev(n.a) : await ev(n.b);
      case 'cmp': {
        let l = await ev(n.first);
        for (let k = 0; k < n.ops.length; k++) {
          const r = await ev(n.rest[k]); const op = n.ops[k]; let ok;
          if (op === 'in') ok = contains(r, l); else if (op === 'not in') ok = !contains(r, l); else ok = compareOp(op, l, r);
          if (!ok) return false;
          l = r;
        }
        return true;
      }
      case 'index': { const o = await ev(n.obj); const i = await ev(n.idx); return getIndex(o, i); }
      case 'slice': {
        const o = await ev(n.obj); const lo = n.lo ? await ev(n.lo) : null, hi = n.hi ? await ev(n.hi) : null, st = n.step ? await ev(n.step) : null;
        return getSlice(o, lo, hi, st);
      }
      case 'attr': { const o = await ev(n.obj); return getMethod(o, n.name, n.line); }
      case 'call': {
        const f = await ev(n.f);
        const args = []; for (const a of n.args) args.push(await ev(a));
        const kw = {}; for (const k of n.kwargs) kw[k.name] = await ev(k.e);
        await tick();
        if (f instanceof BoundMethod) return await f.fn(args, kw);
        if (f instanceof PyBuiltin) return await f.fn(args, kw);
        if (f instanceof PyType) return await callType(f, args, kw);
        if (f instanceof PyFunction) return await callFunction(f, args, kw, n.line);
        throw new PyError('TypeError', `'${typeName(f)}' object is not callable`, n.line);
      }
    }
    throw new PyError('RuntimeError', 'unknown node ' + n.t);
  }

  const nameList = names => names.length === 1 ? `'${names[0]}'` : names.length === 2 ? `'${names[0]}' and '${names[1]}'` : names.slice(0, -1).map(x => `'${x}'`).join(', ') + `, and '${names[names.length - 1]}'`;
  async function callFunction(fn, args, kw, line) {
    if (frames.length > 400) throw new PyError('RecursionError', 'maximum recursion depth exceeded', line);
    const np = fn.params.length, nreq = fn.params.filter(p => p.value === undefined).length;
    if (args.length > np) throw new PyError('TypeError', `${fn.name}() takes ${nreq === np ? np : `from ${nreq} to ${np}`} positional argument${(nreq === np ? np : 2) === 1 ? '' : 's'} but ${args.length} ${args.length === 1 ? 'was' : 'were'} given`, line);
    const vars = new Map(); fn.params.forEach((p, i) => { if (i < args.length) vars.set(p.name, args[i]); });
    for (const k of Object.keys(kw)) {
      if (!fn.params.some(p => p.name === k)) throw new PyError('TypeError', `${fn.name}() got an unexpected keyword argument '${k}'`, line);
      if (vars.has(k)) throw new PyError('TypeError', `${fn.name}() got multiple values for argument '${k}'`, line);
      vars.set(k, kw[k]);
    }
    const missing = []; for (const p of fn.params) if (!vars.has(p.name)) { if (p.value !== undefined) vars.set(p.name, p.value); else missing.push(p.name); }
    if (missing.length) throw new PyError('TypeError', `${fn.name}() missing ${missing.length} required positional argument${missing.length === 1 ? '' : 's'}: ${nameList(missing)}`, line);
    frames.push({ vars, name: fn.name + '()', locals: fn.locals, globalDecl: fn.globalNames });
    try {
      const r = await execBlock(fn.body);
      return r && r.ret !== undefined ? r.ret : null;
    } finally { frames.pop(); }
  }

  async function execBlock(stmts) {
    for (const st of stmts) { const r = await execStmt(st); if (r !== undefined) return r; }
    return undefined;
  }
  async function loopBody(body) {                 // -> undefined | BREAK | {ret}
    const r = await execBlock(body);
    if (r === undefined || r === CONTINUE) return undefined;
    return r;
  }
  async function execStmt(st) {
    await tick();
    try {
      switch (st.t) {
        case 'expr': await stepHook(st.line); await ev(st.e); return;
        case 'pass': await stepHook(st.line); return;
        case 'assign': {
          await stepHook(st.line);
          const v = await ev(st.value);
          for (const tg of st.targets) {
            if (tg.t === 'name') assignName(tg.id, v);
            else { const o = await ev(tg.obj); const i = await ev(tg.idx); setIndex(o, i, v); }
          }
          return;
        }
        case 'aug': {
          await stepHook(st.line);
          let obj = null, idx = null, cur;
          if (st.target.t === 'name') cur = lookup(st.target.id, st.line);
          else { obj = await ev(st.target.obj); idx = await ev(st.target.idx); cur = getIndex(obj, idx); }
          const rhs = await ev(st.value); let v;
          try { v = binop(st.op, cur, rhs); }
          catch (e) { if (e instanceof PyError && e.pyType === 'TypeError' && /^unsupported operand/.test(e.pyMsg)) { e.pyMsg = e.pyMsg.replace(/for (\*\* or pow\(\)|[^:]+): /, (m0, o) => 'for ' + (o === '** or pow()' ? '**= or pow()' : o + '=') + ': '); e.message = e.pyMsg; } throw e; }
          if (st.op === '+' && cur instanceof PyList && rhs instanceof PyList) { for (const x of rhs.items.slice()) cur.items.push(x); v = cur; }
          if (st.target.t === 'name') assignName(st.target.id, v); else setIndex(obj, idx, v);
          return;
        }
        case 'global': return;
        case 'def': {
          await stepHook(st.line);
          const params = []; for (const p of st.params) params.push({ name: p.name, value: p.def ? await ev(p.def) : undefined });
          assignName(st.name, new PyFunction(st.name, params, st.body, st.locals, st.globals, st.line)); return;
        }
        case 'return': { await stepHook(st.line); return { ret: st.e ? await ev(st.e) : null }; }
        case 'break': await stepHook(st.line); return BREAK;
        case 'continue': await stepHook(st.line); return CONTINUE;
        case 'if': {
          for (const b of st.branches) {
            await stepHook(b.line);
            if (truthy(await ev(b.test))) return await execBlock(b.body);
          }
          if (st.orelse) return await execBlock(st.orelse);
          return;
        }
        case 'while': {
          for (;;) {
            await tick(); await stepHook(st.line);
            if (!truthy(await ev(st.test))) return;
            const r = await loopBody(st.body);
            if (r === BREAK) return; if (r !== undefined) return r;
          }
        }
        case 'for': {
          const it = await ev(st.iter);
          for (const v of iterate(it)) {
            await tick(); assignName(st.var, v); await stepHook(st.line);
            const r = await loopBody(st.body);
            if (r === BREAK) return; if (r !== undefined) return r;
          }
          return;
        }
      }
    } catch (e) { if (e instanceof PyError && !e.line) e.line = st.line; throw e; }
    throw new PyError('RuntimeError', 'unknown statement ' + st.t);
  }

  try {
    const { toks, unclosed } = tokenize(String(code));
    const prog = new Parser(toks, unclosed).parseProgram();
    await execBlock(prog);
    if (io.step) await io.step(null, snapshot);
  } catch (e) {
    if (!(e instanceof PyError)) {
      if (e && e.message === '__STOPPED__') { result.ok = false; result.stopped = true; frames.length = 1; result.vars = snapshot(); return result; }
      e = new PyError(e instanceof RangeError ? 'RecursionError' : 'RuntimeError', e instanceof RangeError ? 'maximum recursion depth exceeded' : String(e && e.message || e));
    }
    result.ok = false; result.error = { type: e.pyType, msg: e.pyMsg, line: e.line };
  }
  frames.length = 1;
  result.vars = snapshot();
  return result;
}

const api = { run, tokenize, floatRepr, pyRepr, pyStr, formatValue, PyError, PyFloat, PyList, typeName,
  parse(code) { const { toks, unclosed } = tokenize(code); return new Parser(toks, unclosed).parseProgram(); } };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PyFun = api;
})(typeof window !== 'undefined' ? window : globalThis);
