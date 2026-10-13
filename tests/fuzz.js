const P = require('../src/interp.js'); const fs = require('fs');
const { cases, expected } = JSON.parse(fs.readFileSync(process.argv[2] || 'tests/fuzz.json', 'utf8'));
(async () => {
  let bad = 0, skipped = 0, ok = 0; const shown = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i], e = expected[i]; let out = ''; const q = [...c.stdin];
    const r = await P.run(c.code, { write: s => out += s, input: async () => q.length ? q.shift() : null });
    const got = r.error ? { type: r.error.type, msg: r.error.msg } : null;
    if (got && (got.type === 'NotInCourse' || got.type === 'MemoryError')) { skipped++; continue; }
    let same = out === e.out && ((!got && !e.err) || (got && e.err && got.type === e.err.type &&
       (['SyntaxError', 'IndentationError'].includes(got.type) || got.msg === e.err.msg)));
    // a program with a syntax error never runs in CPython -> no partial output
    if (same) ok++; else { bad++; if (shown.length < 25) shown.push({ code: c.code, stdin: c.stdin, py: e, js: { out, err: got } }); }
  }
  console.log(`match ${ok}  MISMATCH ${bad}  skipped(not-in-course/guard) ${skipped}  of ${cases.length}`);
  for (const s of shown) console.log('\n---\n' + s.code + 'stdin=' + JSON.stringify(s.stdin) + '\nPY: ' + JSON.stringify(s.py) + '\nJS: ' + JSON.stringify(s.js));
  process.exit(bad ? 1 : 0);
})();
