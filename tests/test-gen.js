// Slumpar fram tusentals frågor per område och nivå och kontrollerar att varje fråga går att svara rätt på.
const { T, parseAnswer, shopRound, SHOP_PLAN, SHOP_ITEMS, R, chestRound, chestAsk, CHEST_PLAN } = require('../src/gen.js');

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

// Procentbutiken: varje köp ska gå att räkna ut och felräkning ska kosta mer
let shopChecked = 0;
for (const g of [7, 8, 9]) for (const kind of new Set(SHOP_PLAN[g])) for (let i = 0; i < ROUNDS; i++) {
  let r;
  try { r = shopRound(g, kind, R.pick(SHOP_ITEMS)); } catch (e) { failures.push(`butik ${kind}: kastade ${e.message}`); break; }
  shopChecked++;
  const bad = [];
  const all = [r.q, r.a, r.offer, ...r.opts, ...r.expl].join(' | ');
  if (/NaN|undefined|Infinity|null|\[object/.test(all)) bad.push('ogiltig text');
  if (r.opts.length !== 4) bad.push(`${r.opts.length} alternativ`);
  if (new Set(r.opts.map(strip)).size !== r.opts.length) bad.push('dubbla alternativ');
  if (!r.opts.includes(r.a)) bad.push('rätt svar saknas');
  if (!(r.paid > 0) || !(r.pen > r.paid)) bad.push(`pris ${r.paid} / straff ${r.pen}`);
  if (r.val !== null) for (const o of r.opts) if (o !== r.a) { const v = parseAnswer(strip(o)); if (v !== null && Math.abs(v - r.val) < 1e-9) bad.push(`felalternativ ${strip(o)} är lika med svaret`); }
  if (bad.length) failures.push(`butik ${kind}: ${bad.join('; ')} :: ${strip(r.q)} => ${strip(r.a)} [${r.opts.map(strip).join(' / ')}]`);
}
checked += shopChecked;
// Sannolikhetskistorna: en tydligt bästa kista och en följdfråga per kista som går att besvara
for (const g of [7, 8, 9]) for (const mode of new Set(CHEST_PLAN[g])) for (let i = 0; i < ROUNDS; i++) {
  const rd = chestRound(g, mode);
  const sorted = rd.p.slice().sort((a, b) => b - a);
  const bad = [];
  if (rd.p[rd.best] !== sorted[0] || sorted[0] - sorted[1] < .03) bad.push('ingen tydligt bästa kista');
  if (rd.chests.some(c => c.j < 1 || c.s < 1)) bad.push('kista utan juvel eller sten');
  for (let k = 0; k < 3; k++) {
    const q = chestAsk(rd, k);
    checked++;
    const all = [q.q, q.a, ...q.opts, ...q.expl].join(' | ');
    if (/NaN|undefined|Infinity|null|\[object/.test(all)) bad.push('ogiltig text');
    if (q.opts.length !== 4) bad.push(`${q.opts.length} alternativ`);
    if (new Set(q.opts.map(strip)).size !== q.opts.length) bad.push('dubbla alternativ');
    if (!q.opts.includes(q.a)) bad.push('rätt svar saknas');
    for (const o of q.opts) if (o !== q.a) { const v = parseAnswer(strip(o)); if (v !== null && Math.abs(v - q.val) < 1e-9) bad.push(`felalternativ ${strip(o)} är lika med svaret`); }
  }
  if (bad.length) failures.push(`kistor ${mode}: ${[...new Set(bad)].join('; ')} :: ${rd.chests.map(c => c.j + '/' + (c.j + c.s)).join(' ')}`);
}
if (process.argv.includes('--sample')) {
  for (const g of [7, 8, 9]) for (const kind of new Set(SHOP_PLAN[g])) { const r = shopRound(g, kind, R.pick(SHOP_ITEMS)); console.log(`butik ${kind}`.padEnd(16), strip(r.q), '=>', strip(r.a), `| betala ${r.paid}, fel ${r.pen}`); }
}
if (process.argv.includes('--sample')) {
  for (const id in T) for (let d = 1; d <= 3; d++) { const q = T[id].gen(d); console.log(`${id} d${d}`.padEnd(10), strip(q.q), '=>', strip(q.a)); }
}
console.log(`${checked} frågor kontrollerade i ${Object.keys(T).length} områden, Procentbutiken och Sannolikhetskistorna.`);
if (failures.length) {
  console.log(`${failures.length} fel:`);
  failures.slice(0, 30).forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('Alla frågor OK.');
