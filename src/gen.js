/* ===== Frågegeneratorer: Lgr22 matematik åk 7–9 ===== */
const R = {
  int(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  nz(a, b) { let v; do { v = R.int(a, b); } while (v === 0); return v; },
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  chance(p) { return Math.random() < p; }
};
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const MINUS = '−';
const round = (n, dec = 4) => { const f = Math.pow(10, dec); let r = Math.round(n * f) / f; if (Object.is(r, -0)) r = 0; return r; };

/* Svenskt talformat: decimalkomma, riktigt minustecken, mellanslag i stora tal */
function fmt(n, dec = 6) {
  if (typeof n === 'string') return n;
  const r = round(n, dec);
  let s = Math.abs(r).toFixed(dec).replace(/0+$/, '').replace(/\.$/, '');
  let [i, d] = s.split('.');
  if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (r < 0 ? MINUS : '') + i + (d ? ',' + d : '');
}
const p = n => (n < 0 ? `(${fmt(n)})` : fmt(n));           // parentes runt negativa tal
const sup = (b, e) => `${b}<sup>${typeof e === 'number' ? fmt(e) : e}</sup>`;
function frac(n, d, simplify = true) {
  if (typeof n === 'string' || typeof d === 'string') return `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  if (simplify) { const g = gcd(n, d); n /= g; d /= g; }
  if (d < 0) { n = -n; d = -d; }
  if (d === 1) return fmt(n);
  return (n < 0 ? MINUS : '') + `<span class="fr"><i>${Math.abs(n)}</i><i>${d}</i></span>`;
}
/* Linjärt uttryck ax + b */
function lin(a, b, v = 'x') {
  let s = '';
  if (a !== 0) s = (a === 1 ? '' : a === -1 ? MINUS : fmt(a)) + v;
  if (b !== 0) s += s ? (b > 0 ? ' + ' : ` ${MINUS} `) + fmt(Math.abs(b)) : fmt(b);
  return s || '0';
}
function quad(a, b, c) { // ax² + bx + c
  const parts = [];
  if (a) parts.push([a, (Math.abs(a) === 1 ? '' : fmt(Math.abs(a))) + 'x<sup>2</sup>']);
  if (b) parts.push([b, (Math.abs(b) === 1 ? '' : fmt(Math.abs(b))) + 'x']);
  if (c) parts.push([c, fmt(Math.abs(c))]);
  if (!parts.length) return '0';
  return parts.map(([v, t], i) => (i === 0 ? (v < 0 ? MINUS : '') : (v < 0 ? ` ${MINUS} ` : ' + ')) + t).join('');
}

/* Bygger frågeobjekt. wrongs = felsvar (helst typiska missuppfattningar). */
function mk({ q, ans, val = null, wrongs = [], expl = [], unit = '', fig = '', write = val !== null }) {
  const show = v => (typeof v === 'number' ? fmt(v) + unit : v);
  const a = show(ans);
  // mall för utfyllnadssvar, t.ex. "x = §" eller "§ cm²"
  const tpl = typeof ans === 'string' && val !== null && ans.split(fmt(val)).length === 2 ? ans.replace(fmt(val), '§') : null;
  const fill = w => (tpl ? tpl.replace('§', fmt(w)) : show(w));
  const seen = new Set([a]);
  const seenVal = new Set(val !== null ? [round(val, 6)] : []);
  const opts = [a];
  for (const w of wrongs) {
    if (w === null || w === undefined || (typeof w === 'number' && !isFinite(w))) continue;
    const s = show(w);
    if (seen.has(s)) continue;
    if (typeof w === 'number' && seenVal.has(round(w, 6))) continue;
    seen.add(s); if (typeof w === 'number') seenVal.add(round(w, 6));
    opts.push(s);
    if (opts.length === 4) break;
  }
  // fyll på med närliggande tal om det behövs
  let guard = 0;
  while (opts.length < 4 && typeof val === 'number' && guard++ < 60) {
    const step = Number.isInteger(val) ? R.pick([1, 2, 3, 5, 10]) : R.pick([0.1, 0.5, 1, 2]);
    const w = round(val + R.pick([-1, 1]) * step * R.int(1, 3), 4);
    const s = fill(w);
    if (seen.has(s)) continue;
    seen.add(s); opts.push(s);
  }
  return { q, a, val, opts: R.shuffle(opts), expl, write: write && val !== null, fig };
}

/* ===== Små SVG-figurer ===== */
const svgWrap = (w, h, inner) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${inner}</svg>`;
const lab = (x, y, t, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
function figRect(a, b, u) { return svgWrap(200, 120, `<rect x="30" y="15" width="140" height="80" class="shape"/>${lab(100, 112, a + ' ' + u)}${lab(178, 60, b + ' ' + u, 'start')}`); }
function figRightTri(a, b, c) { return svgWrap(240, 140, `<polygon points="70,110 200,110 70,20" class="shape"/><rect x="70" y="98" width="12" height="12" class="ra"/>${lab(135, 130, a)}${lab(62, 70, b, 'end')}${lab(145, 58, c, 'start')}`); }
function figTri(b, h, u) { return svgWrap(210, 140, `<polygon points="25,110 185,110 120,20" class="shape"/><line x1="120" y1="20" x2="120" y2="110" class="dash"/>${lab(105, 130, b + ' ' + u)}${lab(126, 72, h + ' ' + u, 'start')}`); }
function figTrap(a, b, h, u) { return svgWrap(220, 140, `<polygon points="20,110 200,110 150,30 60,30" class="shape"/><line x1="105" y1="30" x2="105" y2="110" class="dash"/>${lab(105, 22, a + ' ' + u)}${lab(105, 130, b + ' ' + u)}${lab(111, 75, h + ' ' + u, 'start')}`); }
function figCircle(r, u, label = 'r') { return svgWrap(140, 130, `<circle cx="70" cy="62" r="50" class="shape"/><line x1="70" y1="62" x2="120" y2="62" class="dash"/><circle cx="70" cy="62" r="3" class="dot"/>${lab(95, 55, label + ' = ' + r + ' ' + u)}`); }
function figBox(l, b, h, u) { return svgWrap(220, 140, `<polygon points="30,50 150,50 150,120 30,120" class="shape"/><polygon points="30,50 70,20 190,20 150,50" class="shape s2"/><polygon points="150,50 190,20 190,90 150,120" class="shape s3"/>${lab(90, 136, l + ' ' + u)}${lab(196, 60, h + ' ' + u, 'start')}${lab(178, 34, b + ' ' + u, 'start')}`); }
function figCyl(r, h, u) { return svgWrap(170, 150, `<ellipse cx="70" cy="125" rx="50" ry="14" class="shape"/><rect x="20" y="30" width="100" height="95" class="shape s2" stroke="none"/><line x1="20" y1="30" x2="20" y2="125" class="edge"/><line x1="120" y1="30" x2="120" y2="125" class="edge"/><ellipse cx="70" cy="30" rx="50" ry="14" class="shape s3"/><line x1="70" y1="30" x2="120" y2="30" class="dash"/>${lab(95, 24, 'r = ' + r)}${lab(126, 82, 'h = ' + h + ' ' + u, 'start')}`); }

/* ===== Ämnesregister ===== */
const T = {};
function topic(id, name, grade, icon, time, gen) { T[id] = { id, name, grade, icon, time, gen }; }

/* ---------- ÅK 7 ---------- */
topic('neg', 'Negativa tal', 7, '±', 20, d => {
  if (d === 1) {
    const a = R.nz(-12, 12), b = R.int(-12, -1);
    if (R.chance(0.5)) {
      const v = a + b;
      return mk({ q: `${fmt(a)} + ${p(b)}`, ans: v, val: v, wrongs: [a - b, -v, Math.abs(a) + Math.abs(b)],
        expl: [`Att lägga till ett negativt tal är samma sak som att dra bort: ${fmt(a)} ${MINUS} ${fmt(-b)}`, `= ${fmt(v)}`] });
    }
    const v = a - b;
    return mk({ q: `${fmt(a)} ${MINUS} ${p(b)}`, ans: v, val: v, wrongs: [a + b, -v, -Math.abs(a) - Math.abs(b)],
      expl: [`Minus minus blir plus: ${fmt(a)} + ${fmt(-b)}`, `= ${fmt(v)}`] });
  }
  if (d === 2) {
    const a = R.pick([-1, 1]) * R.int(2, 9), b = R.nz(-9, 9);
    if (R.chance(0.5)) {
      const v = a * b;
      return mk({ q: `${p(a)} · ${p(b)}`, ans: v, val: v, wrongs: [-v, a + b, -(Math.abs(a) + Math.abs(b))],
        expl: [`Olika tecken ger negativt svar, lika tecken ger positivt.`, `${fmt(Math.abs(a))} · ${fmt(Math.abs(b))} = ${fmt(Math.abs(v))}`, `Svaret blir ${fmt(v)}`] });
    }
    const prod = a * b;
    return mk({ q: `${p(prod)} / ${p(a)}`, ans: b, val: b, wrongs: [-b, prod - a, a],
      expl: [`Division följer samma teckenregel som multiplikation.`, `${fmt(Math.abs(prod))} / ${fmt(Math.abs(a))} = ${fmt(Math.abs(b))}`, `Svaret blir ${fmt(b)}`] });
  }
  const a = R.int(2, 6), b = R.int(2, 6), c = R.int(2, 9);
  if (R.chance(0.5)) {
    const v = (-a) * (-b) - c;
    return mk({ q: `${p(-a)} · ${p(-b)} ${MINUS} ${c}`, ans: v, val: v, wrongs: [-a * b - c, a * b + c, -(a * b) + c],
      expl: [`Multiplikation först: ${p(-a)} · ${p(-b)} = ${a * b}`, `${a * b} ${MINUS} ${c} = ${fmt(v)}`] });
  }
  const v = a * a - 2 * (-b);
  return mk({ q: `${p(-a)}<sup>2</sup> ${MINUS} 2 · ${p(-b)}`, ans: v, val: v, wrongs: [-a * a + 2 * b, a * a - 2 * b, -a * a - 2 * b],
    expl: [`${p(-a)}<sup>2</sup> = ${p(-a)} · ${p(-a)} = ${a * a}`, `2 · ${p(-b)} = ${fmt(-2 * b)}`, `${a * a} ${MINUS} ${p(-2 * b)} = ${a * a} + ${2 * b} = ${fmt(v)}`] });
});

topic('prio', 'Prioriteringsregler', 7, '÷', 22, d => {
  if (d === 1) {
    const a = R.int(2, 15), b = R.int(2, 9), c = R.int(2, 9), v = a + b * c;
    return mk({ q: `${a} + ${b} · ${c}`, ans: v, val: v, wrongs: [(a + b) * c, a + b + c, a * b + c],
      expl: [`Multiplikation går före addition.`, `${b} · ${c} = ${b * c}`, `${a} + ${b * c} = ${v}`] });
  }
  if (d === 2) {
    const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 6), e = R.int(1, 9), v = (a + b) * c - e;
    return mk({ q: `(${a} + ${b}) · ${c} ${MINUS} ${e}`, ans: v, val: v, wrongs: [a + b * c - e, (a + b) * (c - e), (a + b) * c + e],
      expl: [`Parentesen först: ${a} + ${b} = ${a + b}`, `Sedan multiplikation: ${a + b} · ${c} = ${(a + b) * c}`, `Sist subtraktion: ${(a + b) * c} ${MINUS} ${e} = ${v}`] });
  }
  const a = R.int(10, 30), b = R.int(2, 5), c = R.int(2, 4), dd = R.int(2, 5), e = R.int(2, 6), f = dd * e;
  const v = a - b * b * c + f / dd;
  return mk({ q: `${a} ${MINUS} ${b}<sup>2</sup> · ${c} + ${f} / ${dd}`, ans: v, val: v,
    wrongs: [(a - b * b) * c + f / dd, a - b * 2 * c + e, a - (b * c) * (b * c) + e, a - b * b * c - e],
    expl: [`Potenser först: ${b}<sup>2</sup> = ${b * b}`, `Multiplikation och division: ${b * b} · ${c} = ${b * b * c} och ${f} / ${dd} = ${e}`, `Sist från vänster: ${a} ${MINUS} ${b * b * c} + ${e} = ${fmt(v)}`] });
});

topic('brak', 'Bråk', 7, '½', 25, d => {
  if (d === 1) {
    if (R.chance(0.5)) {
      const n = R.int(1, 4), dn = R.int(n + 1, 7), k = R.int(2, 6);
      if (gcd(n, dn) !== 1) return T.brak.gen(1);
      const N = n * k, D = dn * k;
      const half = gcd(N, D) > k ? null : (k % 2 === 0 ? frac(N / 2, D / 2, false) : null);
      return mk({ q: `Förkorta så långt som möjligt: ${frac(N, D, false)}`, ans: frac(n, dn), val: n / dn, write: false,
        wrongs: [half, frac(dn, n), frac(n + 1, dn + 1), frac(n, dn + 1), frac(N - n, D - dn, false)],
        expl: [`Hitta största tal som delar både ${N} och ${D}: ${k}`, `${N} / ${k} = ${n} och ${D} / ${k} = ${dn}`, `Svar: ${frac(n, dn)}`] });
    }
    const dn = R.pick([2, 3, 4, 5, 6, 8, 10]), n = R.int(1, dn - 1), X = dn * R.int(2, 12), v = X / dn * n;
    return mk({ q: `Hur mycket är ${frac(n, dn, false)} av ${X}?`, ans: v, val: v, wrongs: [X / dn, X * n, X - v, X / n],
      expl: [`${frac(1, dn)} av ${X} är ${X} / ${dn} = ${X / dn}`, `${frac(n, dn, false)} är ${n} gånger så mycket: ${n} · ${X / dn} = ${v}`] });
  }
  if (d === 2) {
    const b = R.pick([2, 3, 4, 5]), m = R.pick([2, 3]), dd = b * m;
    const a = R.int(1, b - 1), c = R.int(1, dd - 1);
    const num = a * m + c;
    return mk({ q: `${frac(a, b, false)} + ${frac(c, dd, false)}`, ans: frac(num, dd), val: num / dd,
      wrongs: [frac(a + c, b + dd), frac(a + c, dd), frac(a * c, b * dd), frac(num + 1, dd)],
      expl: [`Gör nämnarna lika: ${frac(a, b, false)} = ${frac(a * m, dd, false)}`, `${frac(a * m, dd, false)} + ${frac(c, dd, false)} = ${frac(num, dd, false)}`, `Förkortat: ${frac(num, dd)}`] });
  }
  const a = R.int(1, 5), b = R.int(a + 1, 8), c = R.int(1, 5), dd = R.int(c + 1, 9);
  if (R.chance(0.5)) {
    return mk({ q: `${frac(a, b, false)} · ${frac(c, dd, false)}`, ans: frac(a * c, b * dd), val: a * c / (b * dd),
      wrongs: [frac(a * dd, b * c), frac(a + c, b + dd), frac(a * c, b + dd), frac(a * c + 1, b * dd)],
      expl: [`Täljare gånger täljare och nämnare gånger nämnare.`, `${frac(a + ' · ' + c, b + ' · ' + dd)} = ${frac(a * c, b * dd, false)}`, `Förkortat: ${frac(a * c, b * dd)}`] });
  }
  return mk({ q: `${frac(a, b, false)} / ${frac(c, dd, false)}`, ans: frac(a * dd, b * c), val: a * dd / (b * c),
    wrongs: [frac(a * c, b * dd), frac(b * c, a * dd), frac(a + dd, b + c), frac(a * dd + 1, b * c)],
    expl: [`Att dela med ett bråk är samma sak som att multiplicera med det inverterade bråket.`, `${frac(a, b, false)} · ${frac(dd, c, false)} = ${frac(a * dd, b * c, false)}`, `Förkortat: ${frac(a * dd, b * c)}`] });
});

topic('deci', 'Decimaltal', 7, ',', 20, d => {
  if (d === 1) {
    const x = R.int(12, 999) / R.pick([10, 100]), f = R.pick([10, 100, 1000]);
    if (R.chance(0.5)) {
      const v = round(x * f);
      return mk({ q: `${fmt(x)} · ${fmt(f)}`, ans: v, val: v, wrongs: [x / f, x * f * 10, x * f / 10],
        expl: [`Vid multiplikation med ${fmt(f)} flyttas decimaltecknet ${String(f).length - 1} steg åt höger.`, `${fmt(x)} · ${fmt(f)} = ${fmt(v)}`] });
    }
    const v = round(x / f, 6);
    return mk({ q: `${fmt(x)} / ${fmt(f)}`, ans: v, val: v, wrongs: [x * f, v * 10, v / 10],
      expl: [`Vid division med ${fmt(f)} flyttas decimaltecknet ${String(f).length - 1} steg åt vänster.`, `${fmt(x)} / ${fmt(f)} = ${fmt(v, 6)}`] });
  }
  if (d === 2) {
    if (R.chance(0.5)) {
      const a = R.int(2, 9), b = R.int(2, 9), v = round(a * b / 100);
      return mk({ q: `0,${a} · 0,${b}`, ans: v, val: v, wrongs: [a * b / 10, a * b / 1000, (a + b) / 10],
        expl: [`Räkna först ${a} · ${b} = ${a * b}`, `Faktorerna har tillsammans två decimaler, så svaret får två decimaler.`, `0,${a} · 0,${b} = ${fmt(v)}`] });
    }
    const x = round(R.int(1000, 9999) / 1000, 3), v = Math.round(x * 10) / 10;
    if (Math.abs(x * 100 % 10 - 5) < 0.0001) return T.deci.gen(2);
    return mk({ q: `Avrunda ${fmt(x)} till en decimal`, ans: v, val: v, wrongs: [Math.floor(x * 10) / 10 === v ? v + 0.1 : Math.floor(x * 10) / 10, Math.round(x * 100) / 100, Math.round(x)],
      expl: [`Titta på andra decimalen: ${fmt(x)} har ${String(Math.floor(round(x * 100)) % 10)} där.`, `0–4 avrundas nedåt, 5–9 uppåt.`, `${fmt(x)} ≈ ${fmt(v)}`] });
  }
  const div = R.pick([0.5, 0.2, 0.25, 0.1]), x = R.int(2, 20) * (div === 0.25 ? 1 : 1), v = round(x / div);
  return mk({ q: `${fmt(x)} / ${fmt(div)}`, ans: v, val: v, wrongs: [x * div, v / 10, v * 10],
    expl: [`Hur många ${fmt(div)} får plats i ${fmt(x)}?`, `I 1 får ${fmt(1 / div)} st plats, alltså ${fmt(x)} · ${fmt(1 / div)} = ${fmt(v)}`] });
});

topic('proc1', 'Procent', 7, '%', 25, d => {
  if (d === 1) {
    const pc = R.pick([10, 25, 50, 20, 5, 75]), X = R.pick([20, 40, 60, 80, 120, 200, 240, 400, 360]);
    const v = X * pc / 100;
    if (!Number.isInteger(v)) return T.proc1.gen(1);
    return mk({ q: `Hur mycket är ${pc} % av ${X} kr?`, ans: v, val: v, unit: ' kr', wrongs: [X / pc, X - v, v * 10, X * pc / 10],
      expl: [`${pc} % = ${fmt(pc / 100)}`, `${fmt(pc / 100)} · ${X} = ${fmt(v)} kr`] });
  }
  if (d === 2) {
    if (R.chance(0.5)) {
      const b = R.pick([20, 25, 40, 50, 80, 200, 300]), pc = R.pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
      const a = b * pc / 100;
      if (!Number.isInteger(a)) return T.proc1.gen(2);
      return mk({ q: `${a} elever av ${b} cyklar till skolan. Hur många procent är det?`, ans: pc, val: pc, unit: ' %', wrongs: [100 - pc, a, round(b / a, 1), pc / 10],
        expl: [`Andelen är delen / det hela = ${a} / ${b}`, `${a} / ${b} = ${fmt(pc / 100)} = ${pc} %`] });
    }
    const pc = R.pick([12, 15, 35, 45, 8]), X = R.pick([20, 40, 60, 80, 200, 300, 500]), v = round(X * pc / 100);
    return mk({ q: `Hur mycket är ${pc} % av ${X}?`, ans: v, val: v, wrongs: [X * pc / 10, X - v, v * 10, pc + X / 100],
      expl: [`${pc} % = ${fmt(pc / 100)}`, `${fmt(pc / 100)} · ${X} = ${fmt(v)}`] });
  }
  if (R.chance(0.5)) {
    const P = R.pick([200, 250, 400, 500, 640, 800, 1200]), r = R.pick([10, 20, 25, 30, 40]), v = P * (1 - r / 100);
    return mk({ q: `En jacka kostar ${P} kr. Den säljs med ${r} % rabatt. Vad blir det nya priset?`, ans: v, val: v, unit: ' kr', wrongs: [P * r / 100, P * (1 + r / 100), P - r],
      expl: [`Rabatten är ${r} % av ${P} = ${P * r / 100} kr`, `${P} ${MINUS} ${P * r / 100} = ${v} kr`, `Snabbare: ${P} · ${fmt(1 - r / 100)} = ${v} kr`] });
  }
  const dec = R.int(1, 99) / 100;
  return mk({ q: `Skriv ${fmt(dec)} i procent`, ans: round(dec * 100), val: round(dec * 100), unit: ' %', wrongs: [dec * 10, dec, dec * 1000],
    expl: [`1 = 100 %, så multiplicera med 100.`, `${fmt(dec)} · 100 = ${fmt(dec * 100)} %`] });
});

topic('ekv1', 'Ekvationer', 7, 'x', 25, d => {
  const x = R.int(1, 12);
  if (d === 1) {
    if (R.chance(0.5)) {
      const a = R.int(2, 20), b = x + a;
      return mk({ q: `x + ${a} = ${b}`, ans: `x = ${x}`, val: x, wrongs: [`x = ${b + a}`, `x = ${a}`, `x = ${b}`, `x = ${x + 1}`],
        expl: [`Dra bort ${a} från båda sidor.`, `x = ${b} ${MINUS} ${a} = ${x}`] });
    }
    const a = R.int(2, 9), b = a * x;
    return mk({ q: `${a}x = ${b}`, ans: `x = ${x}`, val: x, wrongs: [`x = ${b - a}`, `x = ${b * a}`, `x = ${b + a}`, `x = ${x + 1}`],
      expl: [`Dela båda sidor med ${a}.`, `x = ${b} / ${a} = ${x}`] });
  }
  if (d === 2) {
    const a = R.int(2, 6), b = R.int(1, 15), c = a * x + b;
    return mk({ q: `${a}x + ${b} = ${c}`, ans: `x = ${x}`, val: x, wrongs: [`x = ${fmt(round((c + b) / a, 2))}`, `x = ${c - b}`, `x = ${fmt(round(c / a - b, 2))}`, `x = ${x + 1}`],
      expl: [`Dra bort ${b} från båda sidor: ${a}x = ${c - b}`, `Dela med ${a}: x = ${x}`] });
  }
  if (R.chance(0.5)) {
    const xx = R.int(-8, 8) || 3, a = R.int(2, 6), b = R.int(1, 15), c = a * xx - b;
    return mk({ q: `${a}x ${MINUS} ${b} = ${fmt(c)}`, ans: `x = ${fmt(xx)}`, val: xx, wrongs: [`x = ${fmt(round((c - b) / a, 2))}`, `x = ${fmt(-xx)}`, `x = ${fmt(c + b)}`, `x = ${fmt(xx + 1)}`],
      expl: [`Lägg till ${b} på båda sidor: ${a}x = ${fmt(c + b)}`, `Dela med ${a}: x = ${fmt(xx)}`] });
  }
  const a = R.int(2, 5), b = R.int(1, 9), c = R.int(1, 6), xx = a * c;
  return mk({ q: `${frac('x', a, false)} + ${b} = ${c + b}`, ans: `x = ${xx}`, val: xx, wrongs: [`x = ${c}`, `x = ${fmt(round(c / a, 2))}`, `x = ${(c + b) * a}`, `x = ${xx + a}`],
    expl: [`Dra bort ${b}: ${frac('x', a, false)} = ${c}`, `Multiplicera med ${a}: x = ${xx}`] });
});

topic('geo1', 'Area & omkrets', 7, '▭', 30, d => {
  const u = R.pick(['cm', 'm']);
  if (d === 1) {
    const a = R.int(3, 15), b = R.int(2, 12);
    if (R.chance(0.5)) {
      return mk({ q: `Vad är rektangelns area?`, fig: figRect(a, b, u), ans: `${a * b} ${u}<sup>2</sup>`, val: a * b,
        wrongs: [`${2 * a + 2 * b} ${u}<sup>2</sup>`, `${a + b} ${u}<sup>2</sup>`, `${a * b} ${u}`, `${a * b * 2} ${u}<sup>2</sup>`],
        expl: [`Area = basen · höjden`, `${a} · ${b} = ${a * b} ${u}<sup>2</sup>`] });
    }
    return mk({ q: `Vad är rektangelns omkrets?`, fig: figRect(a, b, u), ans: `${2 * a + 2 * b} ${u}`, val: 2 * a + 2 * b,
      wrongs: [`${a * b} ${u}`, `${a + b} ${u}`, `${2 * a + b} ${u}`, `${2 * a + 2 * b + 2} ${u}`],
      expl: [`Omkretsen är summan av alla sidor.`, `${a} + ${b} + ${a} + ${b} = ${2 * a + 2 * b} ${u}`] });
  }
  if (d === 2) {
    const b = R.int(2, 14) * 2, h = R.int(3, 12);
    return mk({ q: `Vad är triangelns area?`, fig: figTri(b, h, u), ans: `${b * h / 2} ${u}<sup>2</sup>`, val: b * h / 2,
      wrongs: [`${b * h} ${u}<sup>2</sup>`, `${b + h} ${u}<sup>2</sup>`, `${b * h / 4} ${u}<sup>2</sup>`, `${(b + h) * 2} ${u}<sup>2</sup>`],
      expl: [`Area = ${frac('basen · höjden', 2, false)}`, `${frac(b + ' · ' + h, 2, false)} = ${frac(b * h, 2, false)} = ${b * h / 2} ${u}<sup>2</sup>`] });
  }
  const a = R.int(2, 8), b = a + R.int(2, 8), h = R.int(1, 5) * 2;
  return mk({ q: `Vad är parallelltrapetsets area?`, fig: figTrap(a, b, h, u), ans: `${(a + b) * h / 2} ${u}<sup>2</sup>`, val: (a + b) * h / 2,
    wrongs: [`${(a + b) * h} ${u}<sup>2</sup>`, `${a * b * h / 2} ${u}<sup>2</sup>`, `${b * h} ${u}<sup>2</sup>`, `${a * h} ${u}<sup>2</sup>`],
    expl: [`Area = ${frac('(a + b) · h', 2, false)}`, `${frac(`(${a} + ${b}) · ${h}`, 2, false)} = ${frac((a + b) * h, 2, false)} = ${(a + b) * h / 2} ${u}<sup>2</sup>`] });
});

topic('stat', 'Lägesmått', 7, '📊', 30, d => {
  const n = R.pick([5, 7]);
  if (d === 3) {
    const m = R.int(5, 12), k = 4, vals = [R.int(1, 15), R.int(1, 15), R.int(1, 15)];
    const last = m * k - vals.reduce((s, v) => s + v, 0);
    if (last < 0 || last > 30) return T.stat.gen(3);
    return mk({ q: `Medelvärdet av fyra tal är ${m}. Tre av talen är ${vals.join(', ')}. Vilket är det fjärde talet?`, ans: last, val: last,
      wrongs: [m, m * k - vals[0], Math.round(vals.reduce((s, v) => s + v, 0) / 3), last + m],
      expl: [`Summan av de fyra talen är ${m} · ${k} = ${m * k}`, `${m * k} ${MINUS} (${vals.join(' + ')}) = ${last}`] });
  }
  let list = Array.from({ length: n }, () => R.int(1, 20));
  const sorted = list.slice().sort((a, b) => a - b), sum = list.reduce((s, v) => s + v, 0);
  const median = sorted[(n - 1) / 2];
  if (d === 1) {
    if (sum % n !== 0) return T.stat.gen(1);
    const mean = sum / n;
    return mk({ q: `Vad är medelvärdet av talen ${list.join(', ')}?`, ans: mean, val: mean, wrongs: [median, sum, list[(n - 1) / 2], mean + 1],
      expl: [`Summan: ${list.join(' + ')} = ${sum}`, `Dela med antalet tal (${n}): ${sum} / ${n} = ${mean}`] });
  }
  if (R.chance(0.6)) {
    if (list[(n - 1) / 2] === median) return T.stat.gen(2);
    return mk({ q: `Vad är medianen av talen ${list.join(', ')}?`, ans: median, val: median, wrongs: [list[(n - 1) / 2], round(sum / n, 1), sorted[(n - 1) / 2 + 1], sorted[n - 1] - sorted[0]],
      expl: [`Sortera talen: ${sorted.join(', ')}`, `Medianen är talet i mitten: ${median}`] });
  }
  const range = sorted[n - 1] - sorted[0];
  return mk({ q: `Vad är variationsbredden för talen ${list.join(', ')}?`, ans: range, val: range, wrongs: [sorted[n - 1], median, Math.abs(list[n - 1] - list[0]), range + 1],
    expl: [`Variationsbredd = största ${MINUS} minsta`, `${sorted[n - 1]} ${MINUS} ${sorted[0]} = ${range}`] });
});

topic('enh', 'Enheter', 7, '📏', 22, d => {
  const pools = {
    1: [
      () => { const x = R.int(12, 95) / 10; return [`${fmt(x)} m = ? cm`, x * 100, ' cm', [x * 10, x * 1000, x / 100], `1 m = 100 cm, så ${fmt(x)} · 100`]; },
      () => { const x = R.int(2, 9) + R.pick([0, 0.5, 0.25]); return [`${fmt(x)} kg = ? g`, x * 1000, ' g', [x * 100, x * 10, x * 10000], `1 kg = 1000 g, så ${fmt(x)} · 1000`]; },
      () => { const x = R.int(120, 980); return [`${x} cm = ? m`, x / 100, ' m', [x / 10, x / 1000, x * 100], `100 cm = 1 m, så ${x} / 100`]; }
    ],
    2: [
      () => { const x = R.int(3, 45) / 10; return [`${fmt(x)} liter = ? dl`, x * 10, ' dl', [x * 100, x / 10, x * 1000], `1 liter = 10 dl, så ${fmt(x)} · 10`]; },
      () => { const x = R.int(1200, 9800); return [`${fmt(x)} m = ? km`, x / 1000, ' km', [x / 100, x / 10, x * 1000], `1000 m = 1 km, så ${fmt(x)} / 1000`]; },
      () => { const x = R.pick([1.5, 2.5, 0.75, 1.25, 0.5, 3.5]); return [`${fmt(x)} timmar = ? minuter`, x * 60, ' min', [x * 100, x * 10, x * 60 + 10], `1 h = 60 min, så ${fmt(x)} · 60`]; }
    ],
    3: [
      () => { const x = R.int(2, 9); return [`${x} m<sup>2</sup> = ? dm<sup>2</sup>`, x * 100, ' dm²', [x * 10, x * 1000, x / 100], `1 m = 10 dm, så 1 m² = 10 · 10 = 100 dm²`]; },
      () => { const x = R.int(1, 9) * 100; return [`${x} cm<sup>3</sup> = ? dl`, x / 100, ' dl', [x / 10, x / 1000, x * 10], `1 dl = 100 cm³ (1 liter = 1 dm³ = 1000 cm³)`]; },
      () => { const x = R.int(2, 6); return [`${x} m<sup>2</sup> = ? cm<sup>2</sup>`, x * 10000, ' cm²', [x * 100, x * 1000, x * 100000], `1 m² = 100 · 100 = 10 000 cm²`]; }
    ]
  };
  const [q, v, unit, wrongs, why] = R.pick(pools[d])();
  return mk({ q, ans: v, val: v, unit, wrongs, expl: [why, `= ${fmt(v)}${unit}`] });
});

/* ---------- ÅK 8 ---------- */
topic('pot', 'Potenser', 8, 'xⁿ', 22, d => {
  if (d === 1) {
    const [b, e] = R.pick([[2, R.int(2, 6)], [3, R.int(2, 4)], [5, R.int(2, 3)], [10, R.int(2, 6)], [4, 3], [6, 2]]);
    const v = Math.pow(b, e);
    return mk({ q: `${sup(b, e)}`, ans: v, val: v, wrongs: [b * e, Math.pow(b, e - 1), Math.pow(e, b), Math.pow(b, e + 1)],
      expl: [`${sup(b, e)} betyder ${b} multiplicerat med sig självt ${e} gånger.`, `${Array(e).fill(b).join(' · ')} = ${fmt(v)}`] });
  }
  if (d === 2) {
    if (R.chance(0.5)) {
      const m = R.int(2, 7), n = R.int(2, 7), v = R.pick(['a', 'x', 'y']);
      return mk({ q: `Förenkla ${sup(v, m)} · ${sup(v, n)}`, ans: sup(v, m + n), wrongs: [sup(v, m * n), sup(v, Math.abs(m - n) || 1), `${2}${sup(v, m + n)}`, sup(2 * v === v ? v : v, m + n + 1)],
        expl: [`Vid multiplikation med samma bas adderas exponenterna.`, `${sup(v, m)} · ${sup(v, n)} = ${sup(v, `${m}+${n}`)} = ${sup(v, m + n)}`] });
    }
    const b = R.int(2, 5), e = R.pick([2, 3]), v = Math.pow(-b, e);
    return mk({ q: `${sup(`(${MINUS}${b})`, e)}`, ans: v, val: v, wrongs: [-v, -b * e, b * e],
      expl: [`${sup(`(${MINUS}${b})`, e)} = ${Array(e).fill(`(${MINUS}${b})`).join(' · ')}`, e % 2 ? `Udda antal minustecken ger negativt svar: ${fmt(v)}` : `Jämnt antal minustecken ger positivt svar: ${fmt(v)}`] });
  }
  const kind = R.int(0, 2);
  if (kind === 0) {
    const e = R.int(1, 4), v = Math.pow(10, -e);
    return mk({ q: `${sup(10, -e)} = ?`, ans: v, val: v, wrongs: [-Math.pow(10, e), v * 10, v / 10, -10 * e],
      expl: [`Negativ exponent betyder 1 delat med potensen.`, `${sup(10, -e)} = ${frac(1, Math.pow(10, e), false)} = ${fmt(v)}`] });
  }
  if (kind === 1) {
    const m = R.int(5, 10), n = R.int(2, m - 1);
    return mk({ q: `Förenkla ${frac(sup('a', m), sup('a', n), false)}`, ans: sup('a', m - n), wrongs: [sup('a', m + n), sup('a', m), sup('a', m * n), sup('a', m - n + 1)],
      expl: [`Vid division med samma bas subtraheras exponenterna.`, `${sup('a', `${m}${MINUS}${n}`)} = ${sup('a', m - n)}`] });
  }
  const b = R.int(2, 9);
  return mk({ q: `${sup(b, 0)} = ?`, ans: 1, val: 1, wrongs: [0, b, 10],
    expl: [`Alla tal (utom 0) upphöjt till 0 blir 1.`, `T.ex. ${sup(b, 2)} / ${sup(b, 2)} = ${sup(b, 0)} = 1`] });
});

topic('ff', 'Förändringsfaktor', 8, '×', 28, d => {
  if (d === 1) {
    const pc = R.pick([5, 10, 15, 20, 25, 30, 40, 50]);
    if (R.chance(0.5)) {
      const v = round(1 + pc / 100);
      return mk({ q: `Vilken förändringsfaktor motsvarar en ökning med ${pc} %?`, ans: v, val: v, wrongs: [pc / 100, 1 - pc / 100, 1 + pc / 10],
        expl: [`Ökning: 100 % + ${pc} % = ${100 + pc} %`, `${100 + pc} % = ${fmt(v)}`] });
    }
    const v = round(1 - pc / 100);
    return mk({ q: `Vilken förändringsfaktor motsvarar en minskning med ${pc} %?`, ans: v, val: v, wrongs: [pc / 100, 1 + pc / 100, 100 - pc],
      expl: [`Minskning: 100 % ${MINUS} ${pc} % = ${100 - pc} %`, `${100 - pc} % = ${fmt(v)}`] });
  }
  if (d === 2) {
    const P = R.pick([200, 240, 400, 450, 600, 800, 1500]), pc = R.pick([5, 10, 15, 20, 25, 30]), up = R.chance(0.6);
    const f = up ? 1 + pc / 100 : 1 - pc / 100, v = round(P * f, 2);
    return mk({ q: `En vara kostar ${P} kr. Priset ${up ? 'höjs' : 'sänks'} med ${pc} %. Vad blir det nya priset?`, ans: v, val: v, unit: ' kr',
      wrongs: [round(P * pc / 100), round(P * (up ? 1 - pc / 100 : 1 + pc / 100)), up ? P + pc : P - pc],
      expl: [`Förändringsfaktorn är ${fmt(f)}`, `${P} · ${fmt(f)} = ${fmt(v)} kr`] });
  }
  const A = R.pick([40, 50, 80, 120, 200, 250, 400]), pc = R.pick([10, 20, 25, 30, 40, 50]) * (R.chance(0.6) ? 1 : -1), B = A * (1 + pc / 100);
  if (!Number.isInteger(B)) return T.ff.gen(3);
  const ans = (pc > 0 ? '+' : MINUS) + Math.abs(pc) + ' %';
  const bad1 = round((B - A) / B * 100, 1), bad2 = B - A;
  return mk({ q: `Ett pris ändras från ${A} kr till ${B} kr. Hur stor är förändringen i procent?`, ans, val: pc,
    wrongs: [(bad1 > 0 ? '+' : MINUS) + fmt(Math.abs(bad1)) + ' %', (bad2 > 0 ? '+' : MINUS) + Math.abs(bad2) + ' %', (pc > 0 ? MINUS : '+') + Math.abs(pc) + ' %', '+' + fmt(round(B / A * 100)) + ' %'],
    expl: [`Förändringsfaktor = nytt / gammalt = ${B} / ${A} = ${fmt(B / A)}`, `${fmt(B / A)} = ${fmt(100 + pc)} %, alltså ${pc > 0 ? 'en ökning' : 'en minskning'} med ${Math.abs(pc)} %`] });
});

topic('ekv2', 'Ekvationer med x på båda sidor', 8, '=', 35, d => {
  const x = R.int(-6, 10) || 2;
  if (d === 1) {
    const b = R.int(1, 6), a = b + R.int(1, 5), c = (a - b) * x;
    return mk({ q: `${a}x = ${lin(b, c)}`, ans: `x = ${fmt(x)}`, val: x,
      wrongs: [`x = ${fmt(round(c / (a + b), 2))}`, `x = ${fmt(-x)}`, `x = ${fmt(c)}`, `x = ${fmt(x + 1)}`],
      expl: [`Dra bort ${b}x från båda sidor: ${a - b}x = ${fmt(c)}`, `Dela med ${a - b}: x = ${fmt(x)}`] });
  }
  if (d === 2) {
    const c = R.int(1, 5), a = c + R.int(1, 4), b = R.int(-9, 12), dd = a * x + b - c * x;
    return mk({ q: `${lin(a, b)} = ${lin(c, dd)}`, ans: `x = ${fmt(x)}`, val: x,
      wrongs: [`x = ${fmt(round((dd + b) / (a - c), 2))}`, `x = ${fmt(round((dd - b) / (a + c), 2))}`, `x = ${fmt(-x)}`, `x = ${fmt(x + 1)}`],
      expl: [`Samla x på vänster sida: ${lin(a - c, b)} = ${fmt(dd)}`, `Flytta konstanten: ${a - c}x = ${fmt(dd - b)}`, `x = ${fmt(x)}`] });
  }
  const a = R.int(2, 5), b = R.int(-5, 5) || 1, c = R.pick([1, 2, 3, 4, 5, 6].filter(v => v !== a)), dd = a * (x + b) - c * x;
  return mk({ q: `${a}(${lin(1, b)}) = ${lin(c, dd)}`, ans: `x = ${fmt(x)}`, val: x,
    wrongs: [`x = ${fmt(round((dd - b) / (a - c), 2))}`, `x = ${fmt(round((dd - a * b) / (a + c), 2))}`, `x = ${fmt(-x)}`, `x = ${fmt(x + 2)}`],
    expl: [`Multiplicera in: ${lin(a, a * b)} = ${lin(c, dd)}`, `Samla x: ${lin(a - c, a * b)} = ${fmt(dd)}`, `${a - c}x = ${fmt(dd - a * b)} ⇒ x = ${fmt(x)}`] });
});

topic('utt', 'Algebraiska uttryck', 8, 'ab', 30, d => {
  if (d === 1) {
    if (R.chance(0.5)) {
      const a = R.int(2, 9), b = R.int(2, 9), c = R.int(1, a + b - 1);
      return mk({ q: `Förenkla ${a}x + ${b}x ${MINUS} ${c}x`, ans: lin(a + b - c, 0), wrongs: [lin(a + b + c, 0), `${a + b - c}x<sup>2</sup>`, lin(a + b, -c), lin(a - b - c, 0)],
        expl: [`Alla termer är x-termer, så räkna ihop koefficienterna.`, `${a} + ${b} ${MINUS} ${c} = ${a + b - c}, alltså ${lin(a + b - c, 0)}`] });
    }
    const a = R.int(2, 9), b = R.int(1, 12), x = R.int(2, 9), v = a * x + b;
    return mk({ q: `Vad är värdet av ${lin(a, b)} om x = ${x}?`, ans: v, val: v, wrongs: [Number(`${a}${x}`) + b, a + x + b, a * (x + b)],
      expl: [`Byt x mot ${x}: ${a} · ${x} + ${b}`, `= ${a * x} + ${b} = ${v}`] });
  }
  if (d === 2) {
    if (R.chance(0.5)) {
      const a = R.int(2, 7), b = R.nz(-8, 9);
      return mk({ q: `Multiplicera in: ${a}(${lin(1, b)})`, ans: lin(a, a * b), wrongs: [lin(a, b), lin(1, a * b), lin(a, -a * b), lin(a + 1, a * b)],
        expl: [`Multiplicera ${a} med varje term i parentesen.`, `${a} · x = ${a}x och ${a} · ${p(b)} = ${fmt(a * b)}`, `= ${lin(a, a * b)}`] });
    }
    const a = R.int(4, 9), b = R.int(1, a - 1), c = R.int(1, 9);
    return mk({ q: `Förenkla ${a}x ${MINUS} (${b}x ${MINUS} ${c})`, ans: lin(a - b, c), wrongs: [lin(a - b, -c), lin(a + b, -c), lin(a - b + c, 0), lin(a - b, c + 1)],
      expl: [`Minus framför parentes byter tecken på allt inuti: ${a}x ${MINUS} ${b}x + ${c}`, `= ${lin(a - b, c)}`] });
  }
  if (R.chance(0.5)) {
    const a = R.nz(-6, 6);
    return mk({ q: `Multiplicera in: x(${lin(1, a)})`, ans: quad(1, a, 0), wrongs: [quad(1, 0, a), quad(0, 1 + a, 0), quad(1, a, a), quad(2, a, 0)],
      expl: [`x · x = x<sup>2</sup> och x · ${p(a)} = ${lin(a, 0)}`, `= ${quad(1, a, 0)}`] });
  }
  const a = R.int(2, 3), b = R.int(2, 5), x = -R.int(1, 4), v = a * x * x - b * x;
  return mk({ q: `Vad är värdet av ${quad(a, -b, 0)} om x = ${fmt(x)}?`, ans: v, val: v, wrongs: [-a * x * x - b * x, a * x * x + b * x, (a * x) * (a * x) - b * x],
    expl: [`${a} · ${p(x)}<sup>2</sup> = ${a} · ${x * x} = ${a * x * x}`, `${b} · ${p(x)} = ${fmt(b * x)}`, `${a * x * x} ${MINUS} ${p(b * x)} = ${fmt(v)}`] });
});

topic('pyth', 'Pythagoras sats', 8, '◺', 40, d => {
  const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [15, 20, 25]];
  if (d === 1) {
    const [a, b, c] = R.pick(triples);
    return mk({ q: `Hur lång är hypotenusan c?`, fig: figRightTri(a + ' cm', b + ' cm', 'c'), ans: c, val: c, unit: ' cm', wrongs: [a + b, a * a + b * b, c + 1, Math.abs(b - a)],
      expl: [`c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> = ${a * a} + ${b * b} = ${c * c}`, `c = √${c * c} = ${c} cm`] });
  }
  if (d === 2) {
    const [a, b, c] = R.pick(triples);
    return mk({ q: `Hur lång är kateten x?`, fig: figRightTri(a + ' cm', 'x', c + ' cm'), ans: b, val: b, unit: ' cm', wrongs: [c - a, round(Math.sqrt(a * a + c * c), 1), c + a, b + 1],
      expl: [`x<sup>2</sup> = c<sup>2</sup> ${MINUS} a<sup>2</sup> = ${c * c} ${MINUS} ${a * a} = ${b * b}`, `x = √${b * b} = ${b} cm`] });
  }
  const a = R.int(2, 9), b = R.int(2, 9);
  const c = Math.sqrt(a * a + b * b);
  if (Number.isInteger(c) || a === b) return T.pyth.gen(3);
  const v = round(c, 1);
  return mk({ q: `Hur lång är hypotenusan c? Avrunda till en decimal.`, fig: figRightTri(a + ' m', b + ' m', 'c'), ans: v, val: v, unit: ' m',
    wrongs: [a + b, round(Math.sqrt(Math.abs(a * a - b * b)), 1), a * a + b * b, round(v + 0.3, 1)],
    expl: [`c<sup>2</sup> = ${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a * a + b * b}`, `c = √${a * a + b * b} ≈ ${fmt(v)} m`] });
});

topic('sann', 'Sannolikhet', 8, '🎲', 28, d => {
  if (d === 1) {
    const ev = R.pick([['en sexa', 1], ['ett jämnt tal', 3], ['ett tal större än 4', 2], ['en etta eller en tvåa', 2], ['ett udda tal', 3], ['ett tal mindre än 6', 5]]);
    return mk({ q: `Du kastar en vanlig tärning. Hur stor är sannolikheten att få ${ev[0]}?`, ans: frac(ev[1], 6), val: ev[1] / 6,
      wrongs: [frac(ev[1], 5), frac(1, ev[1] === 1 ? 2 : ev[1]), frac(6 - ev[1], 6), frac(ev[1] + 1, 6)],
      expl: [`Gynnsamma utfall: ${ev[1]}, möjliga utfall: 6`, `P = ${frac(ev[1], 6, false)} ${gcd(ev[1], 6) > 1 ? '= ' + frac(ev[1], 6) : ''}`] });
  }
  const r = R.int(1, 6), b = R.int(1, 6), g = R.int(1, 6), t = r + b + g;
  if (d === 2) {
    if (R.chance(0.5)) {
      return mk({ q: `I en påse finns ${r} röda, ${b} blå och ${g} gröna kulor. Du drar en kula. Hur stor är sannolikheten att den är blå?`, ans: frac(b, t), val: b / t,
        wrongs: [frac(b, r + g), frac(1, 3), frac(r + g, t), frac(b + 1, t)],
        expl: [`Det finns ${t} kulor totalt, varav ${b} blå.`, `P(blå) = ${frac(b, t, false)}${gcd(b, t) > 1 ? ' = ' + frac(b, t) : ''}`] });
    }
    return mk({ q: `I en påse finns ${r} röda, ${b} blå och ${g} gröna kulor. Hur stor är sannolikheten att du INTE drar en röd?`, ans: frac(b + g, t), val: (b + g) / t,
      wrongs: [frac(r, t), frac(b + g, r), frac(2, 3), frac(b + g, t + 1)],
      expl: [`Kulor som inte är röda: ${b} + ${g} = ${b + g}`, `P(inte röd) = ${frac(b + g, t, false)}${gcd(b + g, t) > 1 ? ' = ' + frac(b + g, t) : ''}`] });
  }
  if (R.chance(0.5)) {
    const pc = R.int(5, 95);
    return mk({ q: `Sannolikheten att det regnar i morgon är ${fmt(pc / 100)}. Hur stor är sannolikheten att det inte regnar, i procent?`, ans: 100 - pc, val: 100 - pc, unit: ' %',
      wrongs: [pc, round(1 - pc / 100, 2), 100 - pc + 10],
      expl: [`Det regnar eller inte, summan av sannolikheterna är 1 = 100 %.`, `${fmt(pc / 100)} = ${pc} %, så 100 % ${MINUS} ${pc} % = ${100 - pc} %`] });
  }
  const n = R.pick([60, 120, 180, 300, 600]);
  return mk({ q: `Du kastar en tärning ${n} gånger. Ungefär hur många sexor kan du förvänta dig?`, ans: n / 6, val: n / 6, wrongs: [n / 2, n / 10, 6, n / 3],
    expl: [`P(sexa) = ${frac(1, 6)}`, `${frac(1, 6)} · ${n} = ${n / 6}`] });
});

topic('skala', 'Skala', 8, '🗺', 30, d => {
  if (d === 1) {
    const s = R.pick([50, 100, 200, 500]), a = R.int(2, 12), v = a * s / 100;
    return mk({ q: `En ritning har skalan 1:${s}. En vägg är ${a} cm på ritningen. Hur lång är den i verkligheten?`, ans: v, val: v, unit: ' m',
      wrongs: [a * s, a * s / 10, a * s / 1000, a / s],
      expl: [`Verkligheten är ${s} gånger större: ${a} · ${s} = ${a * s} cm`, `${a * s} cm = ${fmt(v)} m`] });
  }
  if (d === 2) {
    const s = R.pick([10000, 25000, 50000, 100000]), a = R.int(2, 12), v = round(a * s / 100000, 2);
    return mk({ q: `En karta har skalan 1:${fmt(s)}. Avståndet på kartan är ${a} cm. Hur långt är det i verkligheten?`, ans: v, val: v, unit: ' km',
      wrongs: [v * 10, v / 10, a * s / 1000, v * 100],
      expl: [`${a} cm · ${fmt(s)} = ${fmt(a * s)} cm`, `${fmt(a * s)} cm = ${fmt(a * s / 100)} m = ${fmt(v)} km`] });
  }
  if (R.chance(0.5)) {
    const k = R.pick([2, 4, 5, 10, 20]), b = R.int(2, 9), v = k * b;
    return mk({ q: `En insekt är ritad i skala ${k}:1. Insekten är ${b} mm i verkligheten. Hur lång är den på bilden?`, ans: v, val: v, unit: ' mm',
      wrongs: [round(b / k, 2), b + k, v * 10],
      expl: [`Skala ${k}:1 betyder att bilden är ${k} gånger större än verkligheten.`, `${b} · ${k} = ${v} mm`] });
  }
  const cm = R.int(2, 8), km = cm * R.pick([0.5, 1, 2, 5]), s = km * 100000 / cm;
  return mk({ q: `${cm} cm på en karta motsvarar ${fmt(km)} km i verkligheten. Vilken skala har kartan?`, ans: `1:${fmt(s)}`,
    wrongs: [`1:${fmt(s / 10)}`, `1:${fmt(s * 10)}`, `${fmt(s)}:1`, `1:${fmt(s / 100)}`],
    expl: [`${fmt(km)} km = ${fmt(km * 100000)} cm`, `${fmt(km * 100000)} / ${cm} = ${fmt(s)}, alltså 1:${fmt(s)}`] });
});

topic('cirk', 'Cirklar & volym', 8, '◯', 40, d => {
  if (d === 1) {
    const l = R.int(2, 10), b = R.int(2, 8), h = R.int(2, 9), v = l * b * h;
    return mk({ q: `Vad är rätblockets volym?`, fig: figBox(l, b, h, 'cm'), ans: `${v} cm<sup>3</sup>`, val: v,
      wrongs: [`${l + b + h} cm<sup>3</sup>`, `${2 * (l * b + b * h + l * h)} cm<sup>3</sup>`, `${l * b} cm<sup>3</sup>`, `${v} cm<sup>2</sup>`],
      expl: [`Volym = längd · bredd · höjd`, `${l} · ${b} · ${h} = ${v} cm<sup>3</sup>`] });
  }
  if (d === 2) {
    const r = R.int(2, 10);
    if (R.chance(0.5)) {
      const v = round(3.14 * r * r, 1);
      return mk({ q: `Beräkna cirkelns area. Använd π ≈ 3,14.`, fig: figCircle(r, 'cm'), ans: `${fmt(v)} cm<sup>2</sup>`, val: v,
        wrongs: [`${fmt(round(2 * 3.14 * r, 1))} cm<sup>2</sup>`, `${fmt(round(3.14 * 2 * r * 2 * r, 1))} cm<sup>2</sup>`, `${fmt(round(3.14 * r, 1))} cm<sup>2</sup>`, `${fmt(r * r)} cm<sup>2</sup>`],
        expl: [`A = π · r<sup>2</sup>`, `3,14 · ${r}<sup>2</sup> = 3,14 · ${r * r} ≈ ${fmt(v)} cm<sup>2</sup>`] });
    }
    const v = round(2 * 3.14 * r, 2);
    return mk({ q: `Beräkna cirkelns omkrets. Använd π ≈ 3,14.`, fig: figCircle(r, 'cm'), ans: `${fmt(v)} cm`, val: v,
      wrongs: [`${fmt(round(3.14 * r * r, 2))} cm`, `${fmt(round(3.14 * r, 2))} cm`, `${fmt(2 * r)} cm`, `${fmt(round(v + 3.14, 2))} cm`],
      expl: [`O = 2 · π · r  (eller π · d)`, `2 · 3,14 · ${r} = ${fmt(v)} cm`] });
  }
  const r = R.int(1, 5), h = R.int(2, 10), v = Math.round(3.14 * r * r * h);
  return mk({ q: `Beräkna cylinderns volym, avrunda till heltal. Använd π ≈ 3,14.`, fig: figCyl(r, h, 'cm'), ans: `${v} cm<sup>3</sup>`, val: v,
    wrongs: [`${Math.round(2 * 3.14 * r * h)} cm<sup>3</sup>`, `${Math.round(3.14 * r * h)} cm<sup>3</sup>`, `${Math.round(3.14 * 4 * r * r * h)} cm<sup>3</sup>`, `${v + 10} cm<sup>3</sup>`],
    expl: [`V = π · r<sup>2</sup> · h (basytan gånger höjden)`, `3,14 · ${r * r} · ${h} ≈ ${v} cm<sup>3</sup>`] });
});

/* ---------- ÅK 9 ---------- */
topic('linje', 'Räta linjens ekvation', 9, '⟋', 35, d => {
  if (d === 1) {
    const k = R.nz(-5, 5), m = R.int(-8, 8);
    if (R.chance(0.5)) {
      const x = R.int(-4, 6), v = k * x + m;
      return mk({ q: `y = ${lin(k, m)}. Vad är y när x = ${fmt(x)}?`, ans: v, val: v, wrongs: [k + x + m, k * x - m, k * (x + m), -v],
        expl: [`Byt x mot ${fmt(x)}: y = ${fmt(k)} · ${p(x)} ${m >= 0 ? '+ ' + m : MINUS + ' ' + (-m)}`, `y = ${fmt(v)}`] });
    }
    return mk({ q: `Vilket k-värde har linjen y = ${lin(k, m)}?`, ans: k, val: k, wrongs: [m, -k, k + 1, m === 0 ? 1 : -m],
      expl: [`I y = kx + m är k talet framför x.`, `k = ${fmt(k)}  (lutningen)`] });
  }
  if (d === 2) {
    const k = R.nz(-4, 4), x1 = R.int(-4, 3), dx = R.int(1, 4), y1 = R.int(-5, 5);
    const x2 = x1 + dx, y2 = y1 + k * dx;
    return mk({ q: `En linje går genom punkterna (${fmt(x1)}, ${fmt(y1)}) och (${fmt(x2)}, ${fmt(y2)}). Vad är k-värdet?`, ans: k, val: k,
      wrongs: [frac(dx, k * dx), -k, k * dx, y2 - x2].map(w => (typeof w === 'number' ? w : w)),
      expl: [`k = ${frac('Δy', 'Δx', false)} = ${frac(`${fmt(y2)} ${MINUS} ${p(y1)}`, `${fmt(x2)} ${MINUS} ${p(x1)}`, false)}`, `= ${frac(y2 - y1, dx, false)} = ${fmt(k)}`] });
  }
  const k = R.nz(-3, 3), m = R.nz(-5, 5), x2 = R.int(1, 3), y2 = k * x2 + m;
  return mk({ q: `Vilken linje går genom punkterna (0, ${fmt(m)}) och (${x2}, ${fmt(y2)})?`, ans: `y = ${lin(k, m)}`,
    wrongs: [`y = ${lin(m, k)}`, `y = ${lin(-k, m)}`, `y = ${lin(k, -m)}`, `y = ${lin(k + 1, m)}`],
    expl: [`Punkten (0, ${fmt(m)}) ger m = ${fmt(m)}`, `k = ${frac(`${fmt(y2)} ${MINUS} ${p(m)}`, `${x2} ${MINUS} 0`, false)} = ${fmt(k)}`, `y = ${lin(k, m)}`] });
});

topic('fun', 'Funktioner', 9, 'f', 30, d => {
  if (d === 1) {
    const a = R.nz(-5, 6), b = R.int(-9, 9), x = R.int(-3, 6), v = a * x + b;
    return mk({ q: `f(x) = ${lin(a, b)}. Beräkna f(${fmt(x)}).`, ans: v, val: v, wrongs: [a + x + b, a * x - b, -v, Number(`${Math.abs(a)}${Math.abs(x)}`) + b],
      expl: [`Byt x mot ${fmt(x)}: f(${fmt(x)}) = ${fmt(a)} · ${p(x)} ${b >= 0 ? '+ ' + b : MINUS + ' ' + (-b)}`, `= ${fmt(v)}`] });
  }
  if (d === 2) {
    const a = R.int(1, 3), b = R.int(-6, 6), x = -R.int(1, 5), v = a * x * x + b;
    return mk({ q: `f(x) = ${quad(a, 0, b)}. Beräkna f(${fmt(x)}).`, ans: v, val: v, wrongs: [-a * x * x + b, a * 2 * x + b, (a * x) * (a * x) + b],
      expl: [`${p(x)}<sup>2</sup> = ${x * x} (minus gånger minus blir plus)`, `f(${fmt(x)}) = ${a === 1 ? '' : a + ' · '}${x * x} ${b >= 0 ? '+ ' + b : MINUS + ' ' + (-b)} = ${fmt(v)}`] });
  }
  const a = R.int(2, 6), b = R.int(-9, 9), x = R.int(-4, 8), v = a * x + b;
  return mk({ q: `f(x) = ${lin(a, b)}. För vilket x är f(x) = ${fmt(v)}?`, ans: `x = ${fmt(x)}`, val: x,
    wrongs: [`x = ${fmt(a * v + b)}`, `x = ${fmt(round((v + b) / a, 2))}`, `x = ${fmt(-x)}`, `x = ${fmt(x + 1)}`],
    expl: [`Lös ekvationen ${lin(a, b)} = ${fmt(v)}`, `${a}x = ${fmt(v - b)}`, `x = ${fmt(x)}`] });
});

topic('ekvsys', 'Ekvationssystem', 9, '{', 45, d => {
  const x = R.int(-3, 8), y = R.int(-3, 8);
  const askX = R.chance(0.5), ans = askX ? x : y, nm = askX ? 'x' : 'y';
  const sys = (e1, e2) => `<span class="sys"><span>${e1}</span><span>${e2}</span></span>`;
  if (d === 1) {
    const s = x + y, t = x - y;
    return mk({ q: `Lös systemet. Vad är ${nm}?<br>${sys(`x + y = ${fmt(s)}`, `x ${MINUS} y = ${fmt(t)}`)}`, ans: `${nm} = ${fmt(ans)}`, val: ans,
      wrongs: [`${nm} = ${fmt(askX ? y : x)}`, `${nm} = ${fmt(s)}`, `${nm} = ${fmt(t)}`, `${nm} = ${fmt(ans + 1)}`],
      expl: [`Addera ekvationerna: 2x = ${fmt(s + t)} ⇒ x = ${fmt(x)}`, `Sätt in: ${fmt(x)} + y = ${fmt(s)} ⇒ y = ${fmt(y)}`] });
  }
  if (d === 2) {
    const k = R.int(2, 4), yy = k * x, s = x + yy, a2 = askX ? x : yy;
    return mk({ q: `Lös systemet. Vad är ${nm}?<br>${sys(`y = ${k}x`, `x + y = ${fmt(s)}`)}`, ans: `${nm} = ${fmt(a2)}`, val: a2,
      wrongs: [`${nm} = ${fmt(askX ? yy : x)}`, `${nm} = ${fmt(round(s / k, 2))}`, `${nm} = ${fmt(s)}`, `${nm} = ${fmt(a2 + 1)}`],
      expl: [`Sätt in y = ${k}x i andra ekvationen: x + ${k}x = ${fmt(s)}`, `${k + 1}x = ${fmt(s)} ⇒ x = ${fmt(x)}`, `y = ${k} · ${p(x)} = ${fmt(yy)}`] });
  }
  const a = R.int(1, 3), b = R.int(1, 3), c = a * x + b * y, e = x - y;
  return mk({ q: `Lös systemet. Vad är ${nm}?<br>${sys(`${lin(a, 0)} + ${lin(b, 0, 'y')} = ${fmt(c)}`, `x ${MINUS} y = ${fmt(e)}`)}`, ans: `${nm} = ${fmt(ans)}`, val: ans,
    wrongs: [`${nm} = ${fmt(askX ? y : x)}`, `${nm} = ${fmt(-ans)}`, `${nm} = ${fmt(e)}`, `${nm} = ${fmt(ans + 2)}`],
    expl: [`Från andra ekvationen: x = y + ${p(e)}`, `Sätt in: ${a}(y + ${p(e)}) + ${b}y = ${fmt(c)} ⇒ ${a + b}y = ${fmt(c - a * e)}`, `y = ${fmt(y)} och x = ${fmt(x)}`] });
});

topic('rot', 'Kvadratrötter', 9, '√', 25, d => {
  if (d === 1) {
    const n = R.int(2, 15);
    return mk({ q: `√${n * n}`, ans: n, val: n, wrongs: [n * n / 2, n * n, n + 1, n - 1],
      expl: [`Vilket positivt tal gånger sig självt blir ${n * n}?`, `${n} · ${n} = ${n * n}, så √${n * n} = ${n}`] });
  }
  if (d === 2) {
    const n = R.int(2, 12);
    return mk({ q: `Lös ekvationen x<sup>2</sup> = ${n * n}`, ans: `x = ±${n}`, wrongs: [`x = ${n}`, `x = ±${fmt(n * n / 2)}`, `x = ${MINUS}${n}`, `x = ±${n * n}`],
      expl: [`x<sup>2</sup> = ${n * n} har två lösningar eftersom både ${n} · ${n} och (${MINUS}${n}) · (${MINUS}${n}) = ${n * n}`, `x = ±${n}`] });
  }
  if (R.chance(0.5)) {
    const n = R.int(2, 7), a = R.int(2, 4);
    return mk({ q: `Lös ekvationen ${a}x<sup>2</sup> = ${a * n * n}`, ans: `x = ±${n}`, wrongs: [`x = ±${n * n}`, `x = ${n}`, `x = ±${fmt(round(Math.sqrt(a * n * n), 1))}`, `x = ±${n + 1}`],
      expl: [`Dela med ${a}: x<sup>2</sup> = ${n * n}`, `x = ±√${n * n} = ±${n}`] });
  }
  const n = R.int(1, 9), sq = round(n * n / 100, 4), v = n / 10;
  return mk({ q: `√${fmt(sq)}`, ans: v, val: v, wrongs: [round(sq / 2, 4), n / 100, n, round(v * 10, 2) / 1000],
    expl: [`${fmt(v)} · ${fmt(v)} = ${fmt(sq)}`, `Alltså √${fmt(sq)} = ${fmt(v)}`] });
});

topic('tiop', 'Grundpotensform', 9, '10ⁿ', 30, d => {
  const gp = (m, e) => `${fmt(m)} · ${sup(10, e)}`;
  if (d === 1) {
    const m = R.pick([2, 3, 4, 5, 7, 8, 9, 1.5, 2.5, 3.2, 4.8, 6.4]), e = R.int(3, 8), n = round(m * Math.pow(10, e));
    return mk({ q: `Skriv ${fmt(n)} i grundpotensform`, ans: gp(m, e), wrongs: [gp(m, e - 1), gp(m * 10, e - 1), gp(m, e + 1), gp(m / 10, e + 1)],
      expl: [`Grundpotensform: ett tal mellan 1 och 10 gånger en tiopotens.`, `Flytta decimaltecknet ${e} steg: ${fmt(n)} = ${gp(m, e)}`] });
  }
  if (d === 2) {
    const m = R.pick([2, 4.5, 3.6, 7, 1.2, 8.1]), e = -R.int(2, 5), n = round(m * Math.pow(10, e), 8);
    return mk({ q: `Skriv ${fmt(n, 8)} i grundpotensform`, ans: gp(m, e), wrongs: [gp(m, -e), gp(m, e - 1), gp(m * 10, e - 1), gp(m, e + 1)],
      expl: [`Talet är mindre än 1, så exponenten blir negativ.`, `Flytta decimaltecknet ${-e} steg åt höger: ${gp(m, e)}`] });
  }
  const a = R.int(2, 4), b = R.int(2, 3), e1 = R.int(2, 6), e2 = R.int(2, 6);
  if (R.chance(0.5)) {
    return mk({ q: `Beräkna (${gp(a, e1)}) · (${gp(b, e2)})`, ans: gp(a * b, e1 + e2), wrongs: [gp(a * b, e1 * e2), gp(a + b, e1 + e2), gp(a * b, e1 + e2 - 1), gp(a * b * 10, e1 + e2), gp(a * b, e1 + e2 + 1), gp(a + b, e1 * e2 + 1)],
      expl: [`Multiplicera talen: ${a} · ${b} = ${a * b}`, `Addera exponenterna: ${e1} + ${e2} = ${e1 + e2}`, `= ${gp(a * b, e1 + e2)}`] });
  }
  const A = a * b;
  return mk({ q: `Beräkna (${gp(A, e1 + e2)}) / (${gp(b, e2)})`, ans: gp(a, e1), wrongs: [gp(a, e1 + 2 * e2), gp(A - b, e1), gp(a, round((e1 + e2) / e2, 1)), gp(a, e1 + 1), gp(a, e1 - 1), gp(A, e1)],
    expl: [`Dela talen: ${A} / ${b} = ${a}`, `Subtrahera exponenterna: ${e1 + e2} ${MINUS} ${e2} = ${e1}`, `= ${gp(a, e1)}`] });
});

topic('proc3', 'Upprepad procentuell förändring', 9, '📈', 40, d => {
  if (d === 1) {
    const K = R.pick([1000, 2000, 5000, 10000]), pc = R.pick([5, 10, 20]), v = round(K * Math.pow(1 + pc / 100, 2), 2);
    return mk({ q: `Du sätter in ${fmt(K)} kr på ett konto med ${pc} % ränta per år. Hur mycket finns efter 2 år?`, ans: v, val: v, unit: ' kr',
      wrongs: [K * (1 + 2 * pc / 100), K * pc / 100 * 2, round(K * Math.pow(1 + pc / 100, 3), 2), K + pc * 2],
      expl: [`Förändringsfaktor per år: ${fmt(1 + pc / 100)}`, `${fmt(K)} · ${sup(fmt(1 + pc / 100), 2)} = ${fmt(v)} kr`] });
  }
  if (d === 2) {
    const V = R.pick([50000, 100000, 200000, 80000]), pc = R.pick([10, 20, 25]), n = R.pick([2, 3]), f = 1 - pc / 100, v = Math.round(V * Math.pow(f, n));
    return mk({ q: `En bil värd ${fmt(V)} kr minskar i värde med ${pc} % per år. Vad är den värd efter ${n} år?`, ans: v, val: v, unit: ' kr',
      wrongs: [V * (1 - n * pc / 100), Math.round(V * Math.pow(f, n + 1)), Math.round(V * Math.pow(1 + pc / 100, n))],
      expl: [`Förändringsfaktor per år: ${fmt(f)}`, `${fmt(V)} · ${sup(fmt(f), n)} ≈ ${fmt(v)} kr`] });
  }
  if (R.chance(0.5)) {
    const pc = R.pick([10, 20, 30]), v = round((Math.pow(1 + pc / 100, 2) - 1) * 100, 2);
    return mk({ q: `Ett pris höjs med ${pc} % två år i rad. Hur många procent har det ökat totalt?`, ans: v, val: v, unit: ' %', wrongs: [2 * pc, pc, pc * pc],
      expl: [`${sup(fmt(1 + pc / 100), 2)} = ${fmt(Math.pow(1 + pc / 100, 2))}`, `${fmt(Math.pow(1 + pc / 100, 2))} = ${fmt(100 + v)} %, alltså en ökning med ${fmt(v)} %`] });
  }
  const pc = R.pick([10, 20, 25, 50]), v = round((1 + pc / 100) * (1 - pc / 100) * 100, 2);
  return mk({ q: `Ett pris höjs med ${pc} % och sänks sedan med ${pc} %. Hur många procent av ursprungspriset är det nya priset?`, ans: v, val: v, unit: ' %', wrongs: [100, 100 + pc, 100 - pc],
    expl: [`${fmt(1 + pc / 100)} · ${fmt(1 - pc / 100)} = ${fmt(v / 100)}`, `= ${fmt(v)} %. Sänkningen räknas på det högre priset!`] });
});

topic('sann2', 'Sannolikhet i flera steg', 9, '🎯', 40, d => {
  if (d === 1) {
    const [q, n, dd, w, e] = R.pick([
      ['Du singlar slant två gånger. Hur stor är sannolikheten att få krona båda gångerna?', 1, 4, [frac(1, 2), frac(1, 3), frac(2, 4, false)], `${frac(1, 2)} · ${frac(1, 2)} = ${frac(1, 4)}`],
      ['Du singlar slant två gånger. Hur stor är sannolikheten att få minst en krona?', 3, 4, [frac(1, 2), frac(1, 4), frac(2, 3)], `1 ${MINUS} P(ingen krona) = 1 ${MINUS} ${frac(1, 4)} = ${frac(3, 4)}`],
      ['Du singlar slant tre gånger. Hur stor är sannolikheten att få krona alla gånger?', 1, 8, [frac(1, 6), frac(1, 3), frac(3, 8)], `${frac(1, 2)} · ${frac(1, 2)} · ${frac(1, 2)} = ${frac(1, 8)}`]
    ]);
    return mk({ q, ans: frac(n, dd), val: n / dd, wrongs: w, expl: [`Multiplicera sannolikheterna för varje steg.`, e] });
  }
  if (d === 2) {
    const sum = R.pick([2, 3, 4, 7, 10, 11, 12]);
    let cnt = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sum) cnt++;
    return mk({ q: `Du kastar två tärningar. Hur stor är sannolikheten att summan blir ${sum}?`, ans: frac(cnt, 36), val: cnt / 36,
      wrongs: [frac(1, 11), frac(1, 12), frac(cnt, 12), frac(cnt + 1, 36)],
      expl: [`Det finns 6 · 6 = 36 lika troliga utfall.`, `Summan ${sum} kan fås på ${cnt} sätt.`, `P = ${frac(cnt, 36, false)}${gcd(cnt, 36) > 1 ? ' = ' + frac(cnt, 36) : ''}`] });
  }
  const r = R.int(2, 5), b = R.int(2, 5), t = r + b;
  return mk({ q: `En påse har ${r} röda och ${b} blå kulor. Du drar två kulor utan att lägga tillbaka. Hur stor är sannolikheten att båda är röda?`,
    ans: frac(r * (r - 1), t * (t - 1)), val: r * (r - 1) / (t * (t - 1)),
    wrongs: [frac(r * r, t * t), frac(r * (r - 1), t * t), frac(2 * r, t), frac(r - 1, t - 1)],
    expl: [`Första dragningen: ${frac(r, t, false)}. Sedan finns ${r - 1} röda av ${t - 1}: ${frac(r - 1, t - 1, false)}`, `${frac(r, t, false)} · ${frac(r - 1, t - 1, false)} = ${frac(r * (r - 1), t * (t - 1), false)} = ${frac(r * (r - 1), t * (t - 1))}`] });
});

topic('kvad', 'Kvadrerings- & konjugatregeln', 9, '(²)', 35, d => {
  const a = R.int(2, 9);
  if (d === 1) {
    return mk({ q: `Utveckla (x + ${a})<sup>2</sup>`, ans: quad(1, 2 * a, a * a), wrongs: [quad(1, 0, a * a), quad(1, a, a * a), quad(1, 2 * a, 2 * a), quad(2, 2 * a, a * a)],
      expl: [`Kvadreringsregeln: (a + b)<sup>2</sup> = a<sup>2</sup> + 2ab + b<sup>2</sup>`, `x<sup>2</sup> + 2 · ${a} · x + ${a}<sup>2</sup> = ${quad(1, 2 * a, a * a)}`] });
  }
  if (d === 2) {
    if (R.chance(0.5)) {
      return mk({ q: `Utveckla (x ${MINUS} ${a})<sup>2</sup>`, ans: quad(1, -2 * a, a * a), wrongs: [quad(1, 0, -a * a), quad(1, -2 * a, -a * a), quad(1, 2 * a, a * a), quad(1, -a, a * a)],
        expl: [`(a ${MINUS} b)<sup>2</sup> = a<sup>2</sup> ${MINUS} 2ab + b<sup>2</sup>`, `= ${quad(1, -2 * a, a * a)}`] });
    }
    return mk({ q: `Utveckla (x + ${a})(x ${MINUS} ${a})`, ans: quad(1, 0, -a * a), wrongs: [quad(1, 0, a * a), quad(1, -2 * a, -a * a), quad(1, 2 * a, -a * a), quad(1, 0, -2 * a)],
      expl: [`Konjugatregeln: (a + b)(a ${MINUS} b) = a<sup>2</sup> ${MINUS} b<sup>2</sup>`, `= x<sup>2</sup> ${MINUS} ${a * a}`] });
  }
  if (R.chance(0.5)) {
    return mk({ q: `Faktorisera x<sup>2</sup> ${MINUS} ${a * a}`, ans: `(x + ${a})(x ${MINUS} ${a})`, wrongs: [`(x ${MINUS} ${a})<sup>2</sup>`, `(x + ${a})<sup>2</sup>`, `(x + ${a * a})(x ${MINUS} 1)`, `x(x ${MINUS} ${a * a})`],
      expl: [`${a * a} = ${a}<sup>2</sup>, så använd konjugatregeln baklänges.`, `x<sup>2</sup> ${MINUS} ${a}<sup>2</sup> = (x + ${a})(x ${MINUS} ${a})`] });
  }
  const base = R.pick([20, 30, 40, 50, 60, 70]), t = R.pick([1, 2]), n = base + t, v = n * n;
  return mk({ q: `Beräkna ${n}<sup>2</sup> med kvadreringsregeln`, ans: v, val: v, wrongs: [base * base + t * t, base * base + base * t + t * t, v + 10],
    expl: [`${n}<sup>2</sup> = (${base} + ${t})<sup>2</sup> = ${base}<sup>2</sup> + 2 · ${base} · ${t} + ${t}<sup>2</sup>`, `= ${base * base} + ${2 * base * t} + ${t * t} = ${fmt(v)}`] });
});

topic('likf', 'Likformighet', 9, '△', 40, d => {
  if (d === 1) {
    const [a, b, c] = R.pick([[3, 4, 5], [2, 3, 4], [4, 5, 6], [5, 6, 8]]), k = R.pick([2, 3, 1.5, 2.5]);
    const v = round(c * k, 2);
    return mk({ q: `Två trianglar är likformiga. Den lilla har sidorna ${a}, ${b} och ${c} cm. I den stora är sidan som motsvarar ${a} cm lång ${fmt(a * k)} cm. Hur lång är sidan som motsvarar ${c} cm?`,
      ans: v, val: v, unit: ' cm', wrongs: [c + (a * k - a), c * 2 === v ? c * 3 : c * 2, round(c / k, 2), round(v + 1, 2)],
      expl: [`Skalfaktor: ${fmt(a * k)} / ${a} = ${fmt(k)}`, `${c} · ${fmt(k)} = ${fmt(v)} cm`] });
  }
  if (d === 2) {
    const h1 = R.pick([1, 1.5, 2]), s1 = R.pick([2, 3, 0.5, 1.5]), k = R.int(3, 10), s2 = round(s1 * k, 2), v = round(h1 * k, 2);
    return mk({ q: `En pinne som är ${fmt(h1)} m hög ger en skugga på ${fmt(s1)} m. Samtidigt ger ett träd en skugga på ${fmt(s2)} m. Hur högt är trädet?`,
      ans: v, val: v, unit: ' m', wrongs: [round(s2 * s1 / h1, 2), round(s2 - s1 + h1, 2), round(s2 / h1, 2), round(v + h1, 2)],
      expl: [`Trianglarna är likformiga. Skuggan är ${fmt(k)} gånger längre (${fmt(s2)} / ${fmt(s1)}).`, `Trädet: ${fmt(h1)} · ${k} = ${fmt(v)} m`] });
  }
  const k = R.int(2, 4), A = R.int(2, 12), v = k * k * A;
  return mk({ q: `En figur förstoras så att alla längder blir ${k} gånger större. Den lilla figuren har arean ${A} cm<sup>2</sup>. Vilken area får den stora?`,
    ans: v, val: v, unit: ' cm²', wrongs: [k * A, 2 * k * A, k * k * k * A, A + k * k],
    expl: [`Längdskala ${k} ger areaskala ${k}<sup>2</sup> = ${k * k}`, `${A} · ${k * k} = ${v} cm<sup>2</sup>`] });
});

/* ===== Procentbutiken: köp varor och räkna ut priset ===== */
const SHOP_ITEMS = [['Runsvärd', '🗡️'], ['Sköld', '🛡️'], ['Läkedryck', '🧪'], ['Trollstav', '🪄'], ['Lykta', '🏮'], ['Rep', '🪢'], ['Karta', '🗺️'], ['Stövlar', '🥾'],
  ['Mantel', '🧥'], ['Pilbåge', '🏹'], ['Kompass', '🧭'], ['Ryggsäck', '🎒'], ['Yxa', '🪓'], ['Kristall', '💎'], ['Fiskespö', '🎣'], ['Tältduk', '⛺']];
/* Ordning per årskurs: lätt först, svårast sist */
const SHOP_PLAN = {
  7: ['rabatt', 'rabatt', 'procent', 'jamfor', 'rabatt', 'jamfor'],
  8: ['rabatt8', 'moms', 'hojning', 'jamfor8', 'rabatt8', 'moms'],
  9: ['dubbel', 'tillbaka', 'dagspris', 'jamfor9', 'dubbel', 'tillbaka']
};
const kr = v => fmt(v) + ' kr';
const pct = v => fmt(v) + ' %';
const tag = (main, badge, cls = '') => `<span class="ptag ${cls}">${main}<b>${badge}</b></span>`;
const pickInt = (fn, tries = 200) => { for (let i = 0; i < tries; i++) { const r = fn(); if (r) return r; } return null; };

function shopRound(grade, kind, item) {
  const [name, emoji] = item, lc = name.toLowerCase();
  const topic = grade === 7 ? 'proc1' : grade === 8 ? 'ff' : 'proc3';
  const done = (o, offer, paid, pen) => Object.assign(mk(o), { kind, item, offer, paid, pen, topic });

  if (kind === 'rabatt' || kind === 'rabatt8') {
    const Ps = kind === 'rabatt' ? [80, 120, 160, 200, 240, 300, 400, 500, 600, 800, 1000, 1200] : [240, 360, 450, 640, 750, 880, 1250, 1500, 1800];
    const rs = kind === 'rabatt' ? [10, 20, 25, 30, 40, 50] : [5, 12, 15, 35, 45, 8];
    const { P, r, pay } = pickInt(() => { const P = R.pick(Ps), r = R.pick(rs), pay = round(P * (100 - r) / 100, 2); return Number.isInteger(pay) ? { P, r, pay } : null; });
    return done({ q: `${name} kostar ${kr(P)}. Nu är det ${r} % rabatt. Vad kostar ${lc} nu?`, ans: pay, val: pay, unit: ' kr',
      wrongs: [round(P * r / 100, 2), P - r, round(P * (100 + r) / 100, 2), round(P * (1 - r / 10), 2)].filter(v => v > 0),
      expl: kind === 'rabatt'
        ? [`Rabatten är ${r} % av ${kr(P)} = ${kr(round(P * r / 100, 2))}`, `${kr(P)} ${MINUS} ${kr(round(P * r / 100, 2))} = ${kr(pay)}`]
        : [`${r} % rabatt ger förändringsfaktorn 1 ${MINUS} ${fmt(r / 100)} = ${fmt(1 - r / 100)}`, `${fmt(P)} · ${fmt(1 - r / 100)} = ${kr(pay)}`] },
      tag(`<s>${kr(P)}</s>`, `${MINUS}${r} %`), pay, P);
  }
  if (kind === 'procent') {
    const { P, r, N } = pickInt(() => { const P = R.pick([200, 250, 400, 500, 800, 120, 160, 300]), r = R.pick([10, 20, 25, 30, 40, 50]), N = P * (100 - r) / 100; return Number.isInteger(N) ? { P, r, N } : null; });
    return done({ q: `Handlaren sänker priset på ${lc} från ${kr(P)} till ${kr(N)}. Hur många procent rabatt är det?`, ans: r, val: r, unit: ' %',
      wrongs: [100 - r, P - N, round((P - N) / N * 100, 1), r / 10],
      expl: [`Sänkningen är ${kr(P)} ${MINUS} ${kr(N)} = ${kr(P - N)}`, `Jämför med det gamla priset: ${fmt(P - N)} / ${fmt(P)} = ${fmt((P - N) / P)} = ${r} %`] },
      tag(`<s>${kr(P)}</s> ${kr(N)}`, '? %'), N, P);
  }
  if (kind === 'moms') {
    const P = R.pick([80, 120, 200, 240, 320, 360, 400, 480, 600, 800]), pay = P * 1.25, pen = Math.round(pay * 1.25);
    return done({ q: `${name} kostar ${kr(P)} utan moms. Momsen är 25 %. Vad kostar ${lc} med moms?`, ans: pay, val: pay, unit: ' kr',
      wrongs: [P * .25, P + 25, P * .75, round(P * 1.025, 2)],
      expl: [`Momsen är 25 % av ${kr(P)} = ${kr(P * .25)}`, `${kr(P)} + ${kr(P * .25)} = ${kr(pay)}`, `Snabbare: ${fmt(P)} · 1,25 = ${kr(pay)}`] },
      tag(kr(P), '+25 % moms', 'up'), pay, pen);
  }
  if (kind === 'hojning') {
    const { P, r, pay } = pickInt(() => { const P = R.pick([160, 200, 240, 400, 500, 800, 1200]), r = R.pick([5, 10, 15, 20, 25, 30, 40]), pay = P * (100 + r) / 100; return Number.isInteger(pay) ? { P, r, pay } : null; });
    return done({ q: `Vinterpriset på ${lc} har höjts med ${r} % från ${kr(P)}. Vad är det nya priset?`, ans: pay, val: pay, unit: ' kr',
      wrongs: [P * r / 100, P + r, P * (100 - r) / 100, round(P * (1 + r / 10), 2)],
      expl: [`En höjning med ${r} % ger förändringsfaktorn ${fmt(1 + r / 100)}`, `${fmt(P)} · ${fmt(1 + r / 100)} = ${kr(pay)}`] },
      tag(`<s>${kr(P)}</s>`, `+${r} %`, 'up'), pay, Math.round(pay * 1.25));
  }
  if (kind === 'dubbel') {
    const { P, r1, r2, pay } = pickInt(() => { const P = R.pick([400, 500, 800, 1000, 1200, 2000]), r1 = R.pick([10, 20, 25, 30, 40, 50]), r2 = R.pick([10, 20, 25, 50]), pay = P * (100 - r1) * (100 - r2) / 10000; return Number.isInteger(pay) ? { P, r1, r2, pay } : null; });
    const first = P * (100 - r1) / 100;
    return done({ q: `${name} kostar ${kr(P)}. Först får du ${r1} % rabatt och sedan ${r2} % extra rabatt på det nya priset. Vad blir slutpriset?`, ans: pay, val: pay, unit: ' kr',
      wrongs: [P * (100 - r1 - r2) / 100, first, round(first - P * r2 / 100, 2), round(P * r1 * r2 / 10000, 2)].filter(v => v > 0),
      expl: [`Efter ${r1} % rabatt: ${fmt(P)} · ${fmt(1 - r1 / 100)} = ${kr(first)}`, `Sedan ${r2} % på det nya priset: ${fmt(first)} · ${fmt(1 - r2 / 100)} = ${kr(pay)}`, `Obs! ${r1} % + ${r2} % i två steg är inte samma sak som ${r1 + r2} % på en gång.`] },
      `<span class="ptags">${tag(`<s>${kr(P)}</s>`, `${MINUS}${r1} %`)}${tag('sedan', `${MINUS}${r2} %`)}</span>`, pay, first);
  }
  if (kind === 'tillbaka') {
    const { P, r, N } = pickInt(() => { const P = R.pick([400, 500, 600, 800, 1000, 1200]), r = R.pick([10, 20, 25, 40, 50]), N = P * (100 - r) / 100; return Number.isInteger(N) ? { P, r, N } : null; });
    return done({ q: `Efter ${r} % rabatt kostar ${lc} ${kr(N)}. Vad var det ordinarie priset?`, ans: P, val: P, unit: ' kr',
      wrongs: [round(N * (100 + r) / 100, 2), N + r, round(N * (100 - r) / 100, 2), round(N / (r / 100), 2)],
      expl: [`${r} % rabatt betyder att ${kr(N)} är ${100 - r} % av det ordinarie priset.`, `Ordinarie pris = ${fmt(N)} / ${fmt(1 - r / 100)} = ${kr(P)}`, `Vanligt fel: ${fmt(N)} · ${fmt(1 + r / 100)} = ${kr(round(N * (100 + r) / 100, 2))} blir för lite.`] },
      tag(kr(N), `efter ${MINUS}${r} %`), N, P);
  }
  if (kind === 'dagspris') {
    const P = R.pick([800, 1000, 1600, 2000, 5000]), r = R.pick([10, 20, 25]), n = R.pick([2, 3]);
    const pay = Math.round(P * Math.pow(1 - r / 100, n)), before = Math.round(P * Math.pow(1 - r / 100, n - 1));
    return done({ q: `Handlaren sänker priset på ${lc} med ${r} % varje dag. I dag kostar ${lc} ${kr(P)}. Vad kostar ${lc} om ${n} dagar? Avrunda till hela kronor.`, ans: pay, val: pay, unit: ' kr',
      wrongs: [Math.round(P * (1 - n * r / 100)), before, Math.round(P * Math.pow(1 - r / 100, n + 1)), P - n * r],
      expl: [`Varje dag multipliceras priset med ${fmt(1 - r / 100)}`, `${fmt(P)} · ${fmt(1 - r / 100)}<sup>${n}</sup> ≈ ${kr(pay)}`] },
      tag(kr(P), `${MINUS}${r} % per dag`), pay, before);
  }
  // jämför två bodar
  const g = kind === 'jamfor' ? 7 : kind === 'jamfor8' ? 8 : 9;
  const offer = pickInt(() => {
    if (g === 9) {
      const P = R.pick([400, 500, 800, 1000, 1200, 2000]), r1 = R.pick([10, 20, 30]), r2 = R.pick([10, 20, 25]), rA = r1 + r2 - R.pick([0, 0, 5, 10]);
      const fA = P * (100 - rA) / 100, fB = P * (100 - r1) * (100 - r2) / 10000;
      if (!Number.isInteger(fA) || !Number.isInteger(fB) || fA === fB) return null;
      return { fA, fB, tA: tag(kr(P), `${MINUS}${rA} %`), tB: `<span class="ptags">${tag(kr(P), `${MINUS}${r1} %`)}${tag('sedan', `${MINUS}${r2} %`)}</span>`,
        eA: `A: ${fmt(P)} · ${fmt(1 - rA / 100)} = ${kr(fA)}`, eB: `B: ${fmt(P)} · ${fmt(1 - r1 / 100)} · ${fmt(1 - r2 / 100)} = ${kr(fB)}`,
        wA: P - rA, wB: P * (100 - r1 - r2) / 100 };
    }
    const Ps = [200, 240, 300, 400, 500, 600, 800], rs = [10, 20, 25, 30, 40, 50];
    const P1 = R.pick(Ps), r1 = R.pick(rs), P2 = R.pick(Ps), r2 = R.pick(rs);
    if (P1 === P2) return null;
    const fA = P1 * (100 - r1) / 100;
    if (g === 8) {
      const f = R.pick([.75, .8, .85, .9, .6]), fB = P2 * f;
      if (!Number.isInteger(fA) || !Number.isInteger(fB) || fA === fB || Math.abs(fA - fB) > 150) return null;
      return { fA, fB, tA: tag(`<s>${kr(P1)}</s>`, `${MINUS}${r1} %`), tB: tag(`${kr(P2)}`, `faktor ${fmt(f)}`),
        eA: `A: ${fmt(P1)} · ${fmt(1 - r1 / 100)} = ${kr(fA)}`, eB: `B: ${fmt(P2)} · ${fmt(f)} = ${kr(fB)}`, wA: P1 - r1, wB: round(P2 * (1 - f), 2) };
    }
    const fB = P2 * (100 - r2) / 100;
    if (!Number.isInteger(fA) || !Number.isInteger(fB) || fA === fB || Math.abs(fA - fB) > 150) return null;
    return { fA, fB, tA: tag(`<s>${kr(P1)}</s>`, `${MINUS}${r1} %`), tB: tag(`<s>${kr(P2)}</s>`, `${MINUS}${r2} %`),
      eA: `A: ${fmt(P1)} ${MINUS} ${r1} % = ${kr(fA)}`, eB: `B: ${fmt(P2)} ${MINUS} ${r2} % = ${kr(fB)}`, wA: P1 * r1 / 100, wB: P2 * r2 / 100 };
  });
  const best = offer.fA < offer.fB ? 'A' : 'B', cheap = Math.min(offer.fA, offer.fB), dear = Math.max(offer.fA, offer.fB);
  return done({ q: `Två bodar säljer ${lc}. Vilken bod är billigast, och vad kostar ${lc} där?`, ans: `Bod ${best}: ${kr(cheap)}`,
    wrongs: [`Bod ${best === 'A' ? 'B' : 'A'}: ${kr(dear)}`, `Bod A: ${kr(offer.wA)}`, `Bod B: ${kr(offer.wB)}`, `Bod ${best === 'A' ? 'B' : 'A'}: ${kr(cheap)}`,
      `Bod ${best}: ${kr(dear)}`, `Bod ${best === 'A' ? 'B' : 'A'}: ${kr(Math.round((cheap + dear) / 2))}`, `Bod ${best}: ${kr(cheap + 50)}`],
    expl: [offer.eA, offer.eB, `Bod ${best} är billigast.`] },
    `<span class="offers"><span class="shopcard"><b>Bod A</b>${offer.tA}</span><span class="shopcard"><b>Bod B</b>${offer.tB}</span></span>`, cheap, dear);
}

/* Parsning av skrivna svar: 0,75  3/4  −2  x = 5  45 kr */
function parseAnswer(s) {
  if (s === null || s === undefined) return null;
  s = String(s).toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/^[a-z]=/, '').replace(/(kr|%|cm²|cm2|cm³|cm3|dm²|m²|cm|mm|km|dl|m|g|kg|l|min|h)$/, '').replace(',', '.');
  if (!s) return null;
  if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : null; }
  if (/^[+-]?\d*\.?\d+$/.test(s)) return Number(s);
  return null;
}

if (typeof module !== 'undefined') module.exports = { T, R, fmt, frac, lin, quad, parseAnswer, gcd, round, shopRound, SHOP_PLAN, SHOP_ITEMS };
