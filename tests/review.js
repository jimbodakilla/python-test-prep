const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp';
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(1200, 900); await p.goto(URL);
    const rows = await p.eval(`(async()=>{
      const progs=[['print("Age: " + 11)',[]],['x=input()\\nprint(x*x)',['3']],['a="5"\\nprint(a-1)',[]],['print("5"*2.5)',[]],['int("3.5")',[]],['int("")',['']],['x=int(input())',['3 4']],['float("1,5")',[]],['print(Hello)',[]],['Print("hi")',[]],['score=1\\nprint(Score)',[]],['print("hi)',[]],['print("hi"',[]],['print "hi"',[]],['5 = x',[]],['print("a" 5)',[]],['  print(1)',[]],['x = 007',[]],['print(1/0)',[]],['x = input()\\nint(x)',[]],['for i in range(3):\\n    print(i)',[]],['print(prnt)',[]],['name = "a"\\nprint(nam)',[]],['x=5\\nx.upper()',[]]];
      const out=[]; for(const [c,s] of progs){const q=[...s]; const r=await PyFun.run(c,{write(){},input:async()=>q.length?q.shift():null}); if(!r.error){out.push([c,'NO ERROR']);continue;} const e=explainError(r.error,r.vars,c); out.push([c.replace(/\\n/g,' ⏎ '), r.error.type+': '+r.error.msg, e.what.replace(/<[^>]+>/g,''), e.fix.replace(/<[^>]+>/g,'')]);} return out;})()`);
    for (const r of rows) console.log(r.join('\n   ') + '\n');
    await p.viewport(390, 844, true); await p.eval('location.hash="#/drill/4"'); await p.wait(700); await p.shot(OUT + '/m-drill.png');
    await p.eval('location.hash="#/learn/4"'); await p.wait(600); await p.shot(OUT + '/m-lesson.png');
    await p.eval('location.hash="#/play"'); await p.wait(600); await p.shot(OUT + '/m-play.png');
    console.log('overflowX on mobile:', await p.eval('document.documentElement.scrollWidth > innerWidth'), await p.eval('document.documentElement.scrollWidth'));
  } finally { p.close(); b.kill(); }
})();
