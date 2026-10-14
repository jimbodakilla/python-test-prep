const P = require('../src/interp.js'); const nm = m => String(m).replace(/^.* is not in list$/, 'X not in list').replace('list.index(x): x not in list', 'X not in list'); const fs = require('fs');
const { cases, expected } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const SHOW = +process.argv[3] || 12;
(async () => {
  const groups = {}; let ok = 0;
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i], e = expected[i]; let out = ''; const q = [...c.stdin];
    const r = await P.run(c.code, { write: s => out += s, input: async () => q.length ? q.shift() : null });
    const got = r.error ? { type: r.error.type, msg: r.error.msg } : null;
    if (got && (got.type === 'NotInCourse' || got.type === 'MemoryError' || /f-string: expecting/.test(got.msg))) continue;
    const syn = got && ['SyntaxError', 'IndentationError'].includes(got.type);
    const same = out === e.out && ((!got && !e.err) || (got && e.err && got.type === e.err.type && (syn || nm(got.msg) === nm(e.err.msg))));
    if (same) { ok++; continue; }
    const key = `PY=${e.err ? e.err.type + ': ' + e.err.msg.slice(0, 55) : 'ok'}  JS=${got ? got.type + ': ' + got.msg.slice(0, 55) : 'ok'}${out !== e.out ? '  [stdout differs]' : ''}`;
    (groups[key] = groups[key] || []).push({ code: c.code, stdin: c.stdin, py: e, js: { out, got } });
  }
  console.log('ok', ok, 'mismatch groups', Object.keys(groups).length);
  const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  for (const [k, v] of sorted.slice(0, SHOW)) { v.sort((a, b) => a.code.length - b.code.length); console.log(`\n=== (${v.length}) ${k}\n${v[0].code}stdin=${JSON.stringify(v[0].stdin)}\nPY out: ${JSON.stringify(v[0].py.out.slice(0, 150))}\nJS out: ${JSON.stringify(v[0].js.out.slice(0, 150))}`); }
})();
