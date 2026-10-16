// Slumpar fram tusentals frågor per område och nivå och kontrollerar att varje fråga går att svara rätt på.
const { T, parseAnswer } = require('../src/gen.js');

const ROUNDS = 400;
const strip = h => h
  .replace(/<span class="fr"><i>([^<]*)<\/i><i>([^<]*)<\/i><\/span>/g, '$1/$2')
  .replace(/<sup>2<\/sup>/g, '²').replace(/<sup>3<\/sup>/g, '³')
  .replace(/<[^>]+>/g, '');
const unitOf = s => (s.match(/[a-zåäö²³%]+$/i) || [''])[0];

let checked = 0;
const failures = [];
for (const id in T) for (let d = 1; d <= 3; d++) {
  for (let i = 0; i < ROUNDS; i++) {
    let q;
    try { q = T[id].gen(d); } catch (e) { failures.push(`${id} d${d}: kastade ${e.message}`); break; }
    checked++;
    const all = [q.q, q.a, ...q.opts, ...q.expl].join(' | ');
    const bad = [];
    if (/NaN|undefined|Infinity|null|\[object/.test(all)) bad.push('ogiltig text');
    if (q.opts.length !== 4) bad.push(`${q.opts.length} alternativ`);
    if (new Set(q.opts.map(strip)).size !== q.opts.length) bad.push('dubbla alternativ');
    if (!q.opts.includes(q.a)) bad.push('rätt svar saknas bland alternativen');
    if (q.val !== null && !isFinite(q.val)) bad.push('ogiltigt värde');
    if (q.write) {
      const pv = parseAnswer(strip(q.a));
      if (pv === null || Math.abs(pv - q.val) > 1e-6) bad.push(`skrivsvaret ${strip(q.a)} tolkas inte som ${q.val}`);
      // ett felalternativ får inte ha samma värde som svaret, utom när bara enheten skiljer (avsiktlig distraktor)
      for (const o of q.opts) if (o !== q.a) {
        const v = parseAnswer(strip(o));
        if (v !== null && Math.abs(v - q.val) < 1e-9 && unitOf(strip(o)) === unitOf(strip(q.a))) bad.push(`felalternativ ${strip(o)} är lika med svaret`);
      }
    }
    if (bad.length) failures.push(`${id} d${d}: ${bad.join('; ')} :: ${strip(q.q)} => ${strip(q.a)} [${q.opts.map(strip).join(' / ')}]`);
  }
}

if (process.argv.includes('--sample')) {
  for (const id in T) for (let d = 1; d <= 3; d++) { const q = T[id].gen(d); console.log(`${id} d${d}`.padEnd(10), strip(q.q), '=>', strip(q.a)); }
}
console.log(`${checked} frågor kontrollerade i ${Object.keys(T).length} områden.`);
if (failures.length) {
  console.log(`${failures.length} fel:`);
  failures.slice(0, 30).forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('Alla frågor OK.');
