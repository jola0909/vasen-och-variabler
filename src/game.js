'use strict';
/* ===== Väsen & Variabler – spelmotor ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2, '0');
const dateStr = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const today = () => dateStr(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); };
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));

/* ===== Väsen (samlarobjekten) ===== */
const RAR = { c: 'Vanlig', r: 'Sällsynt', e: 'Episk', l: 'Legendarisk' };
const V = [
  { id: 'tomte', n: 'Gårdstomten', e: '🎅', r: 'c', lore: 'Vaktar gården om nätterna. Glöm inte grötfatet på julafton.', fx: l => ({ hp: 1 + (l >= 3) + (l >= 5) }) },
  { id: 'pyssling', n: 'Pysslingen', e: '🧚', r: 'c', lore: 'Småfolket som bor under golvplankorna och lånar dina strumpor.', fx: l => ({ time: 1 + l }) },
  { id: 'mus', n: 'Mossmusen', e: '🐭', r: 'c', lore: 'Samlar allt som glittrar i sitt bo under granroten.', fx: l => ({ gold: .08 + .04 * l }) },
  { id: 'korp', n: 'Korpen Hugin', e: '🐦', r: 'c', lore: 'Flyger över världen varje dag och kommer hem med nyheter.', fx: l => ({ xp: .08 + .04 * l }) },
  { id: 'lykt', n: 'Lyktgubben', e: '🏮', r: 'c', lore: 'Ett ljus i mossen. Följ det bara om du vet vart du ska.', fx: l => ({ hints: 1 + (l >= 4) }) },
  { id: 'ekorre', n: 'Ekorren Rask', e: '🐿️', r: 'c', lore: 'Springer upp och ner längs världsträdet med budskap.', fx: l => ({ dmg: .06 + .03 * l }) },
  { id: 'uggla', n: 'Ugglan Visa', e: '🦉', r: 'c', lore: 'Ser i mörker och svarar alltid med en motfråga.', fx: l => ({ crit: .15 + .05 * l }) },
  { id: 'groda', n: 'Grodan Kväk', e: '🐸', r: 'c', lore: 'Kväker kraftigare ju fler rätt du får i rad.', fx: l => ({ healEvery: Math.max(3, 7 - l) }) },
  { id: 'vittra', n: 'Vittran', e: '🧝', r: 'r', lore: 'Bor under jorden och lever precis som vi, fast upp och ner.', fx: l => ({ comboGuard: 1 + (l >= 4) }) },
  { id: 'backahast', n: 'Bäckahästen', e: '🐴', r: 'r', lore: 'En vit häst vid bäcken. Sitt inte upp på den.', fx: l => ({ dmg: .12 + .04 * l }) },
  { id: 'gloson', n: 'Gloson', e: '🐗', r: 'r', lore: 'Spöksuggan med glödande ögon som springer mellan benen på folk.', fx: l => ({ shield: 1 + (l >= 4) }) },
  { id: 'myling', n: 'Mylingen', e: '👻', r: 'r', lore: 'Ett litet spöke som ber om att bli buren till kyrkogården.', fx: l => ({ time: 3 + l }) },
  { id: 'trollkatt', n: 'Trollkatten', e: '🐈', r: 'r', lore: 'Häxans katt som stjäl mjölk från grannens kor.', fx: l => ({ gold: .2 + .05 * l }) },
  { id: 'mara', n: 'Maran', e: '🌙', r: 'r', lore: 'Sätter sig på bröstet på sovande. Hon ger drömmar som lär dig saker.', fx: l => ({ xp: .2 + .05 * l }) },
  { id: 'lindormunge', n: 'Lindormsungen', e: '🦎', r: 'r', lore: 'En liten orm som en dag blir en drake. Om den äter ordentligt.', fx: l => ({ healEvery: Math.max(3, 6 - l) }) },
  { id: 'irrbloss', n: 'Irrblosset', e: '🔥', r: 'r', lore: 'Dansande lågor som visar var skatten är gömd.', fx: l => ({ hints: 2 + (l >= 4) }) },
  { id: 'huldran', n: 'Huldran', e: '🌿', r: 'e', lore: 'Vacker framifrån, ihålig som en murken stubbe bakifrån.', fx: l => ({ hp: 1, healEvery: Math.max(3, 6 - l) }) },
  { id: 'havsfrun', n: 'Havsfrun', e: '🧜‍♀️', r: 'e', lore: 'Styr vind och fiske. Hälsa artigt när du ror förbi.', fx: l => ({ shield: 2 + (l >= 4) }) },
  { id: 'jatten', n: 'Jätten Finn', e: '🗿', r: 'e', lore: 'Byggde Lunds domkyrka och ville ha solen och månen som lön.', fx: l => ({ hp: 2 + (l >= 4) }) },
  { id: 'draugen', n: 'Draugen', e: '💀', r: 'e', lore: 'Sjöns vålnad som seglar ett halvt båtskrov i stormen.', fx: l => ({ crit: .4 + .1 * l }) },
  { id: 'norrsken', n: 'Norrskensräven', e: '🦊', r: 'e', lore: 'Svansen sveper över fjällen och lämnar gnistor på himlen.', fx: l => ({ comboRate: .25 * l }) },
  { id: 'skogsra', n: 'Skogsrået', e: '🧝‍♀️', r: 'l', boss: 1, lore: 'Skogens härskarinna. Nu kämpar hon på din sida.', fx: l => ({ revive: 1, dmg: .1 + .05 * l }) },
  { id: 'bergakung', n: 'Bergakungen', e: '👑', r: 'l', boss: 2, lore: 'Kungen i berget med salar fulla av silver.', fx: l => ({ dmg: .2 + .05 * l, gold: .2 + .05 * l }) },
  { id: 'nacken', n: 'Näcken', e: '🎻', r: 'l', boss: 3, lore: 'Spelar fiol i forsen så vackert att ingen kan sluta lyssna.', fx: l => ({ time: 4 + l, healEvery: Math.max(3, 6 - l) }) },
  { id: 'lindorm', n: 'Lindormen', e: '🐉', r: 'l', lore: 'Den fullvuxna draken. Bara de modigaste öppnar kistan där den sover.', fx: l => ({ dmg: .25 + .05 * l, crit: .25 + .1 * l }) }
];
const VB = Object.fromEntries(V.map(v => [v.id, v]));
/* Tema: en skin kan byta namn, bilder, texter, ljud och effekter (window.THEME sätts i temats head-fil) */
const TH = window.THEME || {};
const tx = (k, d) => (TH.text && TH.text[k] !== undefined ? TH.text[k] : d);
if (TH.vasen) for (const id in TH.vasen) if (VB[id]) Object.assign(VB[id], TH.vasen[id]);
const BRAND = TH.brand || 'Väsen <span>&amp;</span> Variabler';
/* Specialkrafter: rätt svar laddar kraftmätaren, full mätare = välj ett väsens kraft */
const CHARGE_MAX = 5;
const POWERS = {
  heal: { n: 'Läkning', ic: '💚', d: v => `Läker ${v} ${v > 1 ? 'hjärtan' : 'hjärta'}` },
  shield: { n: 'Skyddssköld', ic: '🛡️', d: v => `Ger ${v} ${v > 1 ? 'sköldar' : 'sköld'} mot träffar` },
  freeze: { n: 'Tidsstopp', ic: '⏸️', d: () => 'Stoppar tiden för frågan' },
  fifty: { n: 'Siarblick', ic: '🔮', d: () => 'Tar bort två fel svar' },
  smite: { n: 'Kraftslag', ic: '💥', d: v => `${v} skada direkt` },
  triple: { n: 'Trippelslag', ic: '⚔️', d: () => 'Nästa träff gör ×3 skada' },
  loot: { n: 'Skattfynd', ic: '🪙', d: v => `+${v} guld direkt` },
  combo: { n: 'Comboboost', ic: '🔥', d: v => `+${v} i combo` }
};
const PW = {
  tomte: ['heal', 1, .25], pyssling: ['freeze'], mus: ['loot', 30, 10], korp: ['fifty'], lykt: ['fifty'], ekorre: ['smite', 40, 10], uggla: ['triple'], groda: ['heal', 1, .25],
  vittra: ['combo', 3, 1], backahast: ['smite', 55, 12], gloson: ['shield', 1, .25], myling: ['freeze'], trollkatt: ['loot', 50, 15], mara: ['triple'], lindormunge: ['heal', 1, .25], irrbloss: ['fifty'],
  huldran: ['heal', 2, .25], havsfrun: ['shield', 2, .25], jatten: ['smite', 80, 15], draugen: ['triple'], norrsken: ['combo', 5, 1],
  skogsra: ['heal', 3, 0], bergakung: ['smite', 110, 20], nacken: ['freeze'], lindorm: ['smite', 140, 25]
};
function powerOf(id, l = 1) {
  const pw = PW[id]; if (!pw) return null;
  const v = Math.floor((pw[1] || 0) + (pw[2] || 0) * (l - 1));
  return Object.assign({ kind: pw[0], v }, POWERS[pw[0]], { text: POWERS[pw[0]].d(v) });
}
const powerLine = (id, l) => { const pw = powerOf(id, l); return pw ? `<span class="ab pwline">${pw.ic} <b>${pw.n}:</b> ${pw.text}</span>` : ''; };
const STARTERS = ['tomte', 'pyssling', 'ekorre'];
function fxText(fx) {
  const pc = v => Math.round(v * 100) + ' %';
  const out = [];
  if (fx.hp) out.push(`+${fx.hp} ${fx.hp > 1 ? 'hjärtan' : 'hjärta'}`);
  if (fx.time) out.push(`+${fx.time} s betänketid`);
  if (fx.gold) out.push(`+${pc(fx.gold)} guld`);
  if (fx.xp) out.push(`+${pc(fx.xp)} XP`);
  if (fx.dmg) out.push(`+${pc(fx.dmg)} skada`);
  if (fx.crit) out.push(`+${pc(fx.crit)} blixtskada`);
  if (fx.hints) out.push(`+${fx.hints} ${fx.hints > 1 ? 'ledtrådar' : 'ledtråd'}`);
  if (fx.healEvery) out.push(`Läker ♥ var ${fx.healEvery}:e rätt i rad`);
  if (fx.comboGuard) out.push(`${fx.comboGuard} fel bryter inte combon`);
  if (fx.shield) out.push(`Sköld mot ${fx.shield} ${fx.shield > 1 ? 'träffar' : 'träff'}`);
  if (fx.comboRate) out.push(`Combon växer ${pc(fx.comboRate)} snabbare`);
  if (fx.revive) out.push('Räddar dig en gång per strid');
  return out.join(' · ');
}

/* ===== Världar & nivåer ===== */
const WORLDS = [
  { id: 1, n: 'Mörkskogen', grade: 7, col: '#5fe3b3', boss: { n: 'Skogsrået', e: '🧝‍♀️', v: 'skogsra', title: 'Mörkskogens drottning', forms: ['🧝‍♀️', '🦊', '🌳'],
      attacks: [['Rotpiskan', '🌿'], ['Rävklon', '🦊'], ['Lövstormen', '🍂']],
      lines: { intro: 'Välkommen till min skog! Här är det jag som bestämmer!', hit: ['Aj! Mina löv!', 'Det där kändes ända ner i rötterna!', 'Grrr… men jag är fortfarande starkast!'], laugh: ['Hihihi! Skogen är på min sida!', 'Ingen är snabbare än jag!', 'Jag är skogens drottning!'], phase: ['Nu ska du få se min rävsvans!', 'Se min ihåliga rygg… min allra sista form!'], defeat: 'Nej… skogen… är din…' } }, troll: 'Mosstrollet',
    intro: 'Granarna står tätt och något viskar mellan stammarna. Här tränar du taluppfattning, bråk, procent och dina första ekvationer.',
    foes: [['Gråvargen', '🐺'], ['Skuggfladdermusen', '🦇'], ['Flugsvampen', '🍄'], ['Mossspindeln', '🕷️'], ['Vildgalten', '🐗'], ['Grävlingen', '🦡']],
    levels: [
      { n: 'Stigen in', t: 'battle', topics: ['neg', 'prio'], d: 1 },
      { n: 'Mossiga stenar', t: 'battle', topics: ['brak', 'deci'], d: 1 },
      { n: 'Svampringen', t: 'battle', topics: ['proc1', 'deci', 'neg'], d: 1 },
      { n: 'Trollets bro', t: 'balance' },
      { n: 'Spindelsnåret', t: 'battle', topics: ['ekv1', 'prio', 'neg'], d: 2 },
      { n: 'Ängsgläntan', t: 'battle', topics: ['geo1', 'enh'], d: 2 },
      { n: 'Runkastet', t: 'cannon' },
      { n: 'Myrens mitt', t: 'battle', topics: ['stat', 'proc1', 'brak'], d: 2 },
      { n: 'Vargflocken', t: 'battle', elite: true, topics: ['neg', 'brak', 'ekv1', 'geo1', 'proc1', 'deci'], d: 3 },
      { n: 'Skogsråets glänta', t: 'boss', topics: ['neg', 'prio', 'brak', 'deci', 'proc1', 'ekv1', 'geo1', 'stat', 'enh'], d: 3 }
    ] },
  { id: 2, n: 'Fjällvidderna', grade: 8, col: '#7cc7ff', boss: { n: 'Bergakungen', e: '👑', v: 'bergakung', title: 'Härskaren i berget', forms: ['👑', '👹', '🗻'],
      attacks: [['Silverregnet', '🪙'], ['Trollnäven', '👊'], ['Lavinen', '❄️']],
      lines: { intro: 'Ingen rör mitt silver! Jag är den mäktigaste kungen i hela berget!', hit: ['Mitt berg skakar!', 'Omöjligt!', 'Grmpf! Min krona sitter snett!'], laugh: ['HAHA! Jag är mäktigast i hela fjället!', 'Mitt silver är säkert!', 'Ingen är starkare än berget!'], phase: ['Nu vaknar trollet i mig!', 'JAG ÄR BERGET!'], defeat: 'Mitt silver… är ditt…' } }, troll: 'Istrollet',
    intro: 'Kalla vindar sveper över kalfjället. Potenser, förändringsfaktor, Pythagoras och sannolikhet väntar.',
    foes: [['Fjällörnen', '🦅'], ['Grottbjörnen', '🐻'], ['Myskoxen', '🐂'], ['Bergsväduren', '🐏'], ['Isvätten', '🧊'], ['Järven', '🦡']],
    levels: [
      { n: 'Snöfältet', t: 'battle', topics: ['pot', 'ff'], d: 1 },
      { n: 'Isgrottan', t: 'battle', topics: ['ekv2', 'utt'], d: 1 },
      { n: 'Kartstugan', t: 'battle', topics: ['pyth', 'skala'], d: 1 },
      { n: 'Isvågen', t: 'balance' },
      { n: 'Tärningsklippan', t: 'battle', topics: ['sann', 'cirk'], d: 2 },
      { n: 'Renvaktarns läger', t: 'battle', topics: ['ff', 'pyth', 'pot'], d: 2 },
      { n: 'Lavinkastet', t: 'cannon' },
      { n: 'Glaciärkanten', t: 'battle', topics: ['utt', 'skala', 'ekv2'], d: 2 },
      { n: 'Stormtoppen', t: 'battle', elite: true, topics: ['pot', 'ff', 'ekv2', 'pyth', 'sann', 'cirk'], d: 3 },
      { n: 'Bergakungens sal', t: 'boss', topics: ['pot', 'ff', 'ekv2', 'utt', 'pyth', 'sann', 'skala', 'cirk'], d: 3 }
    ] },
  { id: 3, n: 'Dimsjön', grade: 9, col: '#b48cff', boss: { n: 'Näcken', e: '🎻', v: 'nacken', title: 'Forsens spelman', forms: ['🎻', '🐴', '🌊'],
      attacks: [['Fiolslingan', '🎵'], ['Bäckahästens spark', '🐴'], ['Forsvirveln', '🌊']],
      lines: { intro: 'Lyssna på min fiol! Ingen i hela världen spelar vackrare än jag!', hit: ['En sträng gick av!', 'Falsk ton!', 'Aj, min fiol!'], laugh: ['Tralala! Min musik är oslagbar!', 'Forsen lyder bara mig!', 'Jag är forsens mästare!'], phase: ['Nu tar jag hästens skepnad!', 'Se forsens hela kraft!'], defeat: 'Min fiol… tystnar…' } }, troll: 'Dimtrollet',
    intro: 'Dimman ligger tung över vattnet och någon spelar fiol i forsen. Funktioner, ekvationssystem och sannolikhet i flera steg.',
    foes: [['Träskpaddan', '🐸'], ['Djupbläckfisken', '🦑'], ['Sjöormen', '🐍'], ['Gäddkungen', '🐟'], ['Klokräftan', '🦀'], ['Dimslöjan', '🌫️']],
    levels: [
      { n: 'Strandkanten', t: 'battle', topics: ['linje', 'fun'], d: 1 },
      { n: 'Vassen', t: 'battle', topics: ['ekvsys', 'rot'], d: 1 },
      { n: 'Fiskeläget', t: 'battle', topics: ['tiop', 'proc3'], d: 1 },
      { n: 'Dimvågen', t: 'balance' },
      { n: 'Näckrosbladen', t: 'battle', topics: ['sann2', 'kvad'], d: 2 },
      { n: 'Speglingen', t: 'battle', topics: ['likf', 'linje', 'rot'], d: 2 },
      { n: 'Ljuskastet', t: 'cannon' },
      { n: 'Djupet', t: 'battle', topics: ['fun', 'proc3', 'ekvsys'], d: 2 },
      { n: 'Virvelströmmen', t: 'battle', elite: true, topics: ['linje', 'ekvsys', 'kvad', 'sann2', 'tiop', 'likf'], d: 3 },
      { n: 'Forsen', t: 'boss', topics: ['linje', 'fun', 'ekvsys', 'rot', 'tiop', 'proc3', 'sann2', 'kvad', 'likf'], d: 3 }
    ] }
];
if (TH.worlds) TH.worlds.forEach((o, i) => {
  if (!o) return;
  const { levelNames, boss, ...rest } = o;
  Object.assign(WORLDS[i], rest);
  if (boss) Object.assign(WORLDS[i].boss, boss);
  if (levelNames) levelNames.forEach((n, j) => { if (n) WORLDS[i].levels[j].n = n; });
});
const lvlKey = (w, i) => `${w}-${i}`;

/* ===== Kistor ===== */
const CHESTS = {
  tra: { n: 'Träkista', e: '📦', cost: 120, odds: { c: 75, r: 22, e: 3, l: 0 } },
  silver: { n: 'Silverkista', e: '🧰', cost: 350, odds: { c: 35, r: 45, e: 18, l: 2 } },
  guld: { n: 'Guldkista', e: '💰', cost: 900, odds: { c: 0, r: 50, e: 42, l: 8 } }
};

/* ===== Uppdrag, medaljer, titlar ===== */
const QUESTS = {
  correct: { t: 'Svara rätt på 25 frågor', g: 25, gold: 80 },
  streak: { t: 'Få 8 rätt i rad', g: 8, gold: 80 },
  win: { t: 'Vinn 3 strider', g: 3, gold: 70 },
  write: { t: 'Skriv in 5 rätta svar själv', g: 5, gold: 90 },
  three: { t: 'Ta tre stjärnor på en nivå', g: 1, gold: 100 },
  chest: { t: 'Öppna en kista', g: 1, gold: 50 },
  practice: { t: 'Svara rätt på 10 frågor i Övningsgläntan', g: 10, gold: 60 },
  tower: { t: 'Klättra 5 våningar i Runtornet', g: 5, gold: 90 },
  topic: { t: 'Svara rätt på 8 frågor om {t}', g: 8, gold: 80 }
};
const ownedCount = s => Object.keys(s.vasen).length;
const totalStars = s => Object.values(s.stars).reduce((a, b) => a + b, 0);
const ACH = [
  { id: 'first', ic: '⚔️', n: 'Första segern', d: 'Vinn din första strid', test: s => s.stats.wins >= 1 },
  { id: 's10', ic: '🔥', n: 'Glödande', d: 'Få 10 rätt i rad', test: s => s.stats.bestStreak >= 10 },
  { id: 's25', ic: '☄️', n: 'Eldstorm', d: 'Få 25 rätt i rad', test: s => s.stats.bestStreak >= 25 },
  { id: 'b1', ic: '🌲', n: 'Skogens befriare', d: 'Besegra Skogsrået', test: s => !!s.boss[1] },
  { id: 'b2', ic: '🏔️', n: 'Fjällens hjälte', d: 'Besegra Bergakungen', test: s => !!s.boss[2] },
  { id: 'b3', ic: '🌊', n: 'Sjöns mästare', d: 'Besegra Näcken', test: s => !!s.boss[3] },
  { id: 'c8', ic: '📖', n: 'Samlare', d: 'Samla 8 olika väsen', test: s => ownedCount(s) >= 8 },
  { id: 'c16', ic: '📚', n: 'Väsenkännare', d: 'Samla 16 olika väsen', test: s => ownedCount(s) >= 16 },
  { id: 'call', ic: '🐉', n: 'Väsenmästare', d: `Samla alla ${V.length} väsen`, test: s => ownedCount(s) >= V.length },
  { id: 'k10', ic: '🗝️', n: 'Kistknäckare', d: 'Öppna 10 kistor', test: s => s.stats.chests >= 10 },
  { id: 'st30', ic: '⭐', n: 'Stjärnfångare', d: 'Samla 30 stjärnor', test: s => totalStars(s) >= 30 },
  { id: 'st90', ic: '🌟', n: 'Stjärnregn', d: 'Samla alla 90 stjärnor', test: s => totalStars(s) >= 90 },
  { id: 'r500', ic: '🧮', n: 'Räknekämpe', d: 'Svara rätt 500 gånger', test: s => s.stats.correct >= 500 },
  { id: 'pow25', ic: '💥', n: 'Kraftfull', d: 'Använd 25 specialkrafter', test: s => (s.stats.powers || 0) >= 25 },
  { id: 'rev10', ic: '🔁', n: 'Revanschen', d: 'Klara 10 revanschfrågor', test: s => (s.stats.revenge || 0) >= 10 },
  { id: 'blixt50', ic: '⚡', n: 'Blixten', d: 'Svara blixtsnabbt 50 gånger', test: s => (s.stats.blixt || 0) >= 50 },
  { id: 'w50', ic: '✍️', n: 'Runristare', d: 'Skriv in 50 rätta svar själv', test: s => s.stats.writes >= 50 },
  { id: 'bal', ic: '⚖️', n: 'Vågmästare', d: 'Klara en våg utan ett enda onödigt drag', test: s => !!s.flags.bal },
  { id: 'snipe', ic: '🎯', n: 'Prickskytt', d: 'Träffa 3 mål med ett enda kast', test: s => !!s.flags.snipe },
  { id: 't10', ic: '🗼', n: 'Tornklättrare', d: 'Nå våning 10 i Runtornet', test: s => s.tower.best >= 10 },
  { id: 't25', ic: '🏰', n: 'Tornets topp', d: 'Nå våning 25 i Runtornet', test: s => s.tower.best >= 25 },
  { id: 'd7', ic: '📅', n: 'Trogen', d: 'Spela 7 dagar i rad', test: s => s.login.best >= 7 },
  { id: 'master', ic: '🥇', n: 'Guldfärdighet', d: 'Nå guldnivå i en färdighet', test: s => Object.keys(s.mastery).some(t => masteryMedal(s, t) === 3) }
];
const TITLES = TH.titles || [[1, 'Lärling'], [3, 'Runläsare'], [5, 'Talväktare'], [8, 'Ekvationsjägare'], [12, 'Runmästare'], [16, 'Väsenviskare'], [20, 'Matemagiker']];
const titleFor = l => TITLES.filter(t => l >= t[0]).pop()[1];
const tierFor = l => TITLES.filter(t => l >= t[0]).length - 1;
const xpFor = l => 60 + l * 40;
const teamSlots = () => (S.level >= 6 ? 3 : S.level >= 3 ? 2 : 1);

/* ===== Spelläge ===== */
const SAVE_KEY = 'vasen-variabler-v1';
let S = null;           // sparat läge
const G = { screen: 'setup', arg: null, b: null, bal: null, can: null, result: null, prac: null, setup: { grade: 7, starter: null, name: '' }, mapWorld: 1 };

function newState(name, grade, starter) {
  const s = {
    v: 1, name: name || 'Runjägare', grade, gold: 100, xp: 0, level: 1, sound: true,
    stars: {}, boss: {}, vasen: {}, team: [starter], chests: { tra: 1, silver: 0, guld: 0 }, claimedMs: {},
    stats: { correct: 0, answered: 0, bestStreak: 0, wins: 0, chests: 0, writes: 0, blixt: 0, powers: 0, revenge: 0 }, revenge: [], qCount: 0,
    mastery: {}, ach: {}, flags: {}, tower: { best: 0 },
    daily: null, login: { last: null, streak: 0, best: 0 }, savedAt: 0
  };
  s.vasen[starter] = { l: 1, s: 0 };
  return s;
}
function migrate(s) {
  const base = newState(s.name, s.grade || 7, (s.team && s.team[0]) || 'tomte');
  for (const k in base) if (s[k] === undefined) s[k] = base[k];
  for (const k in base.stats) if (s.stats[k] === undefined) s.stats[k] = 0;
  return s;
}

/* ===== Spara: lokalt + molnet när det finns ===== */
function loadLocal() { try { const raw = localStorage.getItem(SAVE_KEY); return raw ? migrate(JSON.parse(raw)) : null; } catch (e) { return null; } }
function saveLocal() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat läge */ } }
const cloud = { doc: null, busy: false, pending: false, timer: null, on: false };
function save() { if (!S) return; S.savedAt = Date.now(); saveLocal(); if (cloud.doc) { clearTimeout(cloud.timer); cloud.timer = setTimeout(pushCloud, 2500); } }
async function pushCloud() {
  if (!cloud.doc || !S) return;
  if (cloud.busy) { cloud.pending = true; return; }
  cloud.busy = true;
  try { await cloud.doc.set({ state: JSON.parse(JSON.stringify(S)), savedAt: S.savedAt }); cloud.on = true; }
  catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { cloud.doc = null; cloud.on = false; } }
  cloud.busy = false;
  if (cloud.pending) { cloud.pending = false; pushCloud(); }
  renderTop();
}
async function initCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    cloud.doc = db.doc('data/users/' + id + '/save');
    const snap = await cloud.doc.get();
    cloud.on = true;
    if (snap.exists) {
      const d = snap.data();
      if (d && d.state && (d.savedAt || 0) > ((S && S.savedAt) || 0) && !(G.b || G.bal || G.can)) {
        S = migrate(JSON.parse(JSON.stringify(d.state)));
        saveLocal();
        if (G.screen === 'setup') G.screen = 'hub';
        dailyCheck();
        render();
        toast('☁ Din sparning hämtades från molnet.');
        return;
      }
    }
    if (S) pushCloud();
    renderTop();
  } catch (e) { cloud.doc = null; }
}

/* ===== Ljud ===== */
const SFX = {
  ctx: null,
  play(kind) {
    if (!S || !S.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx;
      const seq = { right: [[660, .07], [990, .12]], wrong: [[220, .16], [160, .24]], hit: TH.sfx === 'arena' ? [[140, .16]] : [[180, .08]], coin: [[988, .05], [1319, .12]], chest: [[523, .09], [659, .09], [784, .09], [1047, .32]],
        win: [[523, .11], [659, .11], [784, .11], [1047, .45]], lose: [[392, .2], [330, .2], [262, .4]], click: [[620, .03]], star: [[1175, .08], [1568, .14]], shot: [[880, .05], [440, .1]], roar: [[140, .25], [95, .45]], zap: [[1568, .05], [2093, .09]] }[kind];
      if (!seq) return;
      let t = c.currentTime;
      for (const [f, d] of seq) {
        const o = c.createOscillator(), g = c.createGain();
        const bad = kind === 'wrong' || kind === 'lose' || kind === 'roar';
        const arena = TH.sfx === 'arena';
        o.type = bad ? 'sawtooth' : arena ? (kind === 'hit' ? 'sine' : 'square') : 'triangle';
        o.frequency.value = f;
        if (arena && kind === 'hit') o.frequency.exponentialRampToValueAtTime(38, t + d);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(arena ? (kind === 'hit' ? .35 : bad ? .07 : .06) : (kind === 'wrong' ? .07 : .13), t + .01);
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(c.destination);
        o.start(t); o.stop(t + d + .03);
        t += d * .85;
      }
    } catch (e) { /* inget ljud */ }
  }
};

/* ===== Små effekter ===== */
function toast(html, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}
function callout(text, cls = '') {
  const el = document.createElement('div');
  el.className = 'callout ' + cls; el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2300);
}
function burst(x, y, n = 12) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const sp = document.createElement('i');
    const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 70;
    sp.className = 'spark';
    sp.style.left = x + 'px'; sp.style.top = y + 'px';
    sp.style.setProperty('--dx', Math.cos(a) * r + 'px');
    sp.style.setProperty('--dy', Math.sin(a) * r + 'px');
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 700);
  }
}
function banner(text, sub = '') {
  const el = document.createElement('div');
  el.className = 'banner'; el.innerHTML = esc(text) + (sub ? `<small>${esc(sub)}</small>` : '');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2900);
}
function confetti(n = 60) {
  if (reduceMotion) return;
  const cols = ['#5fe3b3', '#f3b54a', '#7cc7ff', '#b48cff', '#ec5670', '#ece6d6'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = cols[i % cols.length];
    c.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
    c.style.animationDelay = Math.random() * .4 + 's';
    c.style.borderRadius = Math.random() < .5 ? '50%' : '2px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
function floatText(x, y, text, crit) {
  const el = document.createElement('div');
  el.className = 'float' + (crit ? ' crit' : '');
  el.style.left = x + 'px'; el.style.top = y + 'px'; el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
function flash() { const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 500); }
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function bolt(fromEl, toEl, glyph = '✦') {
  return new Promise(res => {
    if (!fromEl || !toEl || reduceMotion) return res();
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'bolt'; el.textContent = glyph;
    el.style.left = (a.left + a.width / 2 - 14) + 'px'; el.style.top = (a.top + a.height / 2 - 14) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(1.5)`; });
    setTimeout(() => { el.remove(); res(); }, 400);
  });
}

/* ===== Progression ===== */
function teamFx() {
  const fx = {};
  for (const id of S.team.slice(0, teamSlots())) {
    const v = VB[id], o = S.vasen[id]; if (!v || !o) continue;
    const f = v.fx(o.l);
    for (const k in f) {
      if (k === 'healEvery') fx[k] = fx[k] ? Math.min(fx[k], f[k]) : f[k];
      else fx[k] = (fx[k] || 0) + Number(f[k]);
    }
  }
  return fx;
}
function addGold(n) { n = Math.round(n); S.gold += n; return n; }
function addXP(n) {
  n = Math.round(n); S.xp += n;
  const ups = [];
  while (S.xp >= xpFor(S.level)) {
    S.xp -= xpFor(S.level); S.level++;
    const g = addGold(40 + S.level * 10);
    let extra = '';
    if (S.level % 5 === 0) { S.chests.silver++; extra = ' + Silverkista'; }
    else if (S.level % 3 === 0) { S.chests.tra++; extra = ' + Träkista'; }
    ups.push(S.level);
    setTimeout(() => {
      banner(`${tx('levelUp', 'Nivå')} ${S.level}!`, titleFor(S.level));
      SFX.play('win');
      toast(`<b>Ny nivå ${S.level}</b> · +${g} guld${extra}${S.level === 3 || S.level === 6 ? '<br>En ny plats i ditt lag har öppnats!' : ''}${S.level === 2 ? '<br>Runtornet är upplåst!' : ''}`, 5000);
    }, 600);
  }
  return { n, ups };
}
function grantVasen(id) {
  const o = S.vasen[id];
  if (!o) { S.vasen[id] = { l: 1, s: 0 }; return { id, isNew: true }; }
  if (o.l >= 5) { const g = addGold(VB[id].r === 'l' ? 200 : VB[id].r === 'e' ? 90 : 35); return { id, isNew: false, maxed: true, gold: g }; }
  o.s++;
  let leveled = false;
  if (o.s >= o.l) { o.s -= o.l; o.l++; leveled = true; }
  return { id, isNew: false, leveled, l: o.l };
}
function rollChest(type) {
  const odds = CHESTS[type].odds;
  let r = Math.random() * 100, rar = 'c';
  for (const k of ['c', 'r', 'e', 'l']) { if (r < odds[k]) { rar = k; break; } r -= odds[k]; }
  let pool = V.filter(v => v.r === rar && !v.boss);
  if (!pool.length) pool = V.filter(v => v.r === 'e');
  // lite medlut mot väsen man saknar
  const missing = pool.filter(v => !S.vasen[v.id]);
  const pickFrom = missing.length && Math.random() < .55 ? missing : pool;
  return R.pick(pickFrom).id;
}
function masteryMedal(s, t) {
  const m = s.mastery[t]; if (!m) return 0;
  const rec = m.rec || [], acc = rec.length ? rec.reduce((a, b) => a + b, 0) / rec.length : 0;
  if (m.n >= 30 && rec.length >= 15 && acc >= .9) return 3;
  if (m.n >= 20 && acc >= .8) return 2;
  if (m.n >= 10 && acc >= .6) return 1;
  return 0;
}
function masteryAcc(t) { const m = S.mastery[t]; if (!m || !m.rec.length) return null; return m.rec.reduce((a, b) => a + b, 0) / m.rec.length; }
function recordAnswer(t, ok) {
  const m = S.mastery[t] || (S.mastery[t] = { n: 0, c: 0, rec: [] });
  const before = masteryMedal(S, t);
  m.n++; if (ok) m.c++;
  m.rec.push(ok ? 1 : 0); if (m.rec.length > 20) m.rec.shift();
  const after = masteryMedal(S, t);
  if (after > before) setTimeout(() => toast(`${['', '🥉', '🥈', '🥇'][after]} <b>${['', 'Brons', 'Silver', 'Guld'][after]}</b> i ${esc(T[t].name)}!`), 300);
}
function pickTopic(list, last) {
  const w = list.map(t => { const a = masteryAcc(t); return (t === last && list.length > 1 ? .25 : 1) * (1 + (a === null ? .6 : (1 - a) * 2)); });
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { if (r < w[i]) return list[i]; r -= w[i]; }
  return list[0];
}

/* Dagliga uppdrag & inloggningsbonus */
function seeded(seed) { let x = 0; for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
function dailyCheck() {
  if (!S) return;
  const t = today();
  if (!S.daily || S.daily.date !== t) {
    const rnd = seeded(t + S.name);
    let ids = Object.keys(QUESTS).filter(id => id !== 'tower' || S.level >= 2);
    const picked = [];
    while (picked.length < 3) { const id = ids[Math.floor(rnd() * ids.length)]; if (!picked.includes(id)) picked.push(id); }
    const topics = Object.values(T).filter(x => x.grade <= S.grade);
    S.daily = { date: t, bonus: false, q: picked.map(id => ({ id, p: 0, g: QUESTS[id].g, done: false, claimed: false, t: id === 'topic' ? topics[Math.floor(rnd() * topics.length)].id : null })) };
  }
  if (S.login.last !== t) {
    S.login.streak = S.login.last === yesterday() ? S.login.streak + 1 : 1;
    S.login.best = Math.max(S.login.best, S.login.streak);
    S.login.last = t;
    G.loginBonus = true;
  }
  save();
}
function quest(id, amount = 1, topicId = null) {
  if (!S || !S.daily) return;
  for (const q of S.daily.q) {
    if (q.done || q.id !== id) continue;
    if (id === 'topic' && q.t !== topicId) continue;
    q.p = id === 'streak' ? Math.max(q.p, amount) : q.p + amount;
    if (q.p >= q.g) { q.p = q.g; q.done = true; toast(`📜 Uppdrag klart: <b>${esc(questText(q))}</b>. Hämta belöningen i byn!`); }
  }
}
const questText = q => QUESTS[q.id].t.replace('{t}', q.t ? T[q.t].name.toLowerCase() : '');
function checkAch() {
  for (const a of ACH) {
    if (S.ach[a.id]) continue;
    if (a.test(S)) {
      S.ach[a.id] = today();
      addGold(50);
      setTimeout(() => { toast(`🏅 Medalj: <b>${esc(a.n)}</b> · +50 guld`, 4500); SFX.play('star'); }, 900);
    }
  }
}

/* ===== Nivålåsning ===== */
function worldOpen(w) { return w <= S.grade - 6 || !!S.boss[w - 1]; }
function levelOpen(w, i) { if (!worldOpen(w)) return false; return i === 0 || (S.stars[lvlKey(w, i - 1)] || 0) > 0; }
function nextLevel() {
  for (const W of [...WORLDS].sort((a, b) => (a.id === S.grade - 6 ? -1 : b.id === S.grade - 6 ? 1 : a.id - b.id))) {
    if (!worldOpen(W.id)) continue;
    for (let i = 0; i < W.levels.length; i++) if (levelOpen(W.id, i) && !S.stars[lvlKey(W.id, i)]) return { w: W.id, i };
  }
  return null;
}
function foeFor(W, i) { const f = W.foes[i % W.foes.length]; return { n: f[0], e: f[1] }; }
function levelIcon(W, i) {
  const L = W.levels[i];
  if (L.t === 'boss') return W.boss.e;
  if (L.t === 'balance') return '⚖️';
  if (L.t === 'cannon') return '🎯';
  return foeFor(W, i).e;
}

/* ===== Rendering ===== */
function render() {
  renderTop();
  const fn = SCREENS[G.screen] || SCREENS.hub;
  $('#screen').innerHTML = fn();
  (AFTER[G.screen] || (() => { }))();
  if (G.loginBonus && G.screen === 'hub') showLoginBonus();
}
function go(screen, arg) { stopTimer(); G.screen = screen; G.arg = arg; render(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
function renderTop() {
  const top = $('#top');
  if (!S) { top.innerHTML = `<span class="brand">${BRAND}</span>`; return; }
  const pct = Math.round(S.xp / xpFor(S.level) * 100);
  top.innerHTML = `
    <button class="brand" data-act="hub" aria-label="Till byn">${BRAND}</button>
    <div class="stats">
      <div class="lvlchip" title="${S.xp} / ${xpFor(S.level)} XP"><span class="badge" data-tier="${tierFor(S.level)}">${S.level}</span><div><small>${esc(titleFor(S.level))}</small><div class="xp"><i style="width:${pct}%"></i></div></div></div>
      <span class="chip gold" title="Guld">🪙 <b>${S.gold}</b></span>
      <span class="chip star" title="Stjärnor">★ <b>${totalStars(S)}</b></span>
      <button class="iconbtn" data-act="sound" aria-label="${S.sound ? 'Stäng av ljud' : 'Slå på ljud'}">${S.sound ? '🔊' : '🔇'}</button>
      ${cloud.on ? '<span class="cloud" title="Sparas i molnet">☁</span>' : ''}
    </div>`;
}
const starsHTML = (n, max = 3) => Array.from({ length: max }, (_, i) => `<span class="${i < n ? '' : 'off'}">★</span>`).join('');

const SCREENS = {};
const AFTER = {};

/* ---------- Start ---------- */
SCREENS.setup = () => {
  const st = G.setup;
  return `<section class="stack">
    <div class="hero">
      <div class="eyebrow">${tx('heroEyebrow', 'Ett matteäventyr för åk 7–9')}</div>
      <h1>${BRAND}</h1>
      <p>${tx('heroText', 'Mörkskogen, fjällen och Dimsjön har tagits över av vilda väsen. Med matematik som magi besegrar du dem, löser trollens vågar och samlar väsen från den nordiska folktron till ditt lag.')}</p>
    </div>
    <div class="panel stack">
      <div><label class="eyebrow" for="pname">Vad heter du?</label>
      <input class="field" id="pname" maxlength="18" placeholder="Runjägare" value="${esc(st.name)}" autocomplete="off"></div>
      <div><div class="eyebrow" style="margin-bottom:6px">Vilken årskurs går du i?</div>
        <div class="grades">${[7, 8, 9].map(g => `<button class="grade ${st.grade === g ? 'sel' : ''}" data-act="pickgrade" data-arg="${g}"><b>Åk ${g}</b><small class="muted">${WORLDS[g - 7].n}</small></button>`).join('')}</div>
        <p class="muted" style="margin:8px 0 0;font-size:13px">Du får tillgång till alla världar upp till din årskurs. Tidigare världar finns kvar för repetition, stjärnor och väsen.</p>
      </div>
      <div><div class="eyebrow" style="margin-bottom:6px">Välj ditt första väsen</div>
        <div class="starters">${STARTERS.map(id => { const v = VB[id]; return `<button class="card c-${v.r} ${st.starter === id ? 'inteam' : ''}" data-act="pickstarter" data-arg="${id}"><span class="em">${v.e}</span><span class="nm">${v.n}</span><span class="ab">${fxText(v.fx(1))}</span>${powerLine(id, 1)}</button>`; }).join('')}</div>
      </div>
      <button class="btn primary" data-act="begin" ${st.starter ? '' : 'disabled'}>Börja äventyret</button>
    </div>
  </section>`;
};

/* ---------- Byn (hub) ---------- */
SCREENS.hub = () => {
  const nx = nextLevel();
  const W = nx ? WORLDS[nx.w - 1] : null;
  const chestN = S.chests.tra + S.chests.silver + S.chests.guld;
  const qs = S.daily ? S.daily.q : [];
  const claimable = qs.filter(q => q.done && !q.claimed).length;
  const team = Array.from({ length: 3 }, (_, i) => {
    if (i >= teamSlots()) return `<span class="mini empty" title="Låses upp på nivå ${i === 1 ? 3 : 6}">🔒</span>`;
    const id = S.team[i]; return id ? `<span class="mini" title="${esc(VB[id].n)}">${VB[id].e}</span>` : `<span class="mini empty">+</span>`;
  }).join('');
  return `<section class="stack">
    <div class="hubgrid">
      <div class="stack">
        ${nx ? `<div class="continue" style="background:linear-gradient(135deg, ${W.col}33, transparent 65%), var(--pine)">
          <span class="big" aria-hidden="true">${levelIcon(W, nx.i)}</span>
          <div class="eyebrow">Fortsätt · ${W.n} · nivå ${nx.i + 1}</div>
          <h2>${esc(W.levels[nx.i].n)}</h2>
          <p class="muted" style="margin:0;max-width:36ch">${levelBlurb(W, nx.i)}</p>
          <div class="row"><button class="btn primary" data-act="play" data-arg="${nx.w}-${nx.i}">Spela</button><button class="btn ghost" data-act="map" data-arg="${nx.w}">Kartan</button></div>
        </div>` : `<div class="continue"><div class="eyebrow">Alla nivåer klara</div><h2>Du har besegrat alla väsen!</h2><p class="muted">Jaga tre stjärnor, klättra i Runtornet och samla resten av väsendena.</p><div class="row"><button class="btn primary" data-act="tower">Runtornet</button></div></div>`}
        <div class="tiles">
          <button class="tile" data-act="map"><span class="ic">🗺️</span><b>Kartan</b><small>${totalStars(S)} / 90 ★</small></button>
          <button class="tile" data-act="vasen"><span class="ic">📖</span><b>Väsenboken</b><small>${ownedCount(S)} / ${V.length} väsen</small></button>
          <button class="tile" data-act="chests">${chestN ? `<span class="dot">${chestN}</span>` : ''}<span class="ic">🧰</span><b>Kistor</b><small>Öppna &amp; köp</small></button>
          <button class="tile ${S.level >= 2 ? '' : 'locked'}" data-act="tower"><span class="ic">🗼</span><b>Runtornet</b><small>${S.level >= 2 ? `Rekord: våning ${S.tower.best}` : 'Låses upp på nivå 2'}</small></button>
          <button class="tile" data-act="practice">${(S.revenge || []).length ? `<span class="dot">${S.revenge.length}</span>` : ''}<span class="ic">🌿</span><b>Övningsgläntan</b><small>${(S.revenge || []).length ? '🔁 Revanscher väntar' : 'Träna utan tidspress'}</small></button>
          <button class="tile" data-act="medals"><span class="ic">🏅</span><b>Medaljer</b><small>${Object.keys(S.ach).length} / ${ACH.length}</small></button>
        </div>
      </div>
      <div class="stack">
        <div class="panel">
          <div class="screenhead"><h3>Dagens uppdrag</h3>${claimable ? `<span class="chip" style="border-color:var(--ember)">${claimable} att hämta</span>` : ''}</div>
          ${qs.map((q, i) => `<div class="quest ${q.done ? 'done' : ''}"><span>${esc(questText(q))}</span>
            ${q.claimed ? '<span class="muted">✓</span>' : q.done ? `<button class="btn gold small" data-act="claimq" data-arg="${i}">+${QUESTS[q.id].gold} 🪙</button>` : `<span class="muted" style="font-variant-numeric:tabular-nums">${q.p}/${q.g}</span>`}
            <div class="bar"><i style="width:${q.p / q.g * 100}%"></i></div></div>`).join('')}
          <p class="muted" style="font-size:12px;margin:8px 0 0">Klara alla tre för en extra Träkista. Nya uppdrag varje dag. 🔥 ${S.login.streak} ${S.login.streak === 1 ? 'dag' : 'dagar'} i rad.</p>
        </div>
        <div class="panel stack" style="gap:10px">
          <div class="screenhead"><h3>${tx('team', 'Ditt lag')}</h3><button class="btn small ghost" data-act="vasen">Byt väsen</button></div>
          <div class="teamrow">${team}</div>
          <p class="muted" style="margin:0;font-size:13px">${fxText(teamFx()) || 'Välj väsen till laget i Väsenboken.'}</p>
        </div>
      </div>
    </div>
    <details class="panel"><summary><b>För lärare och föräldrar: vad tränas?</b></summary>
      <div class="stack" style="margin-top:10px;gap:10px">
        <p class="muted" style="margin:0">Uppgifterna genereras slumpmässigt inom det centrala innehållet i Lgr22 för matematik åk 7–9. Varje felsvar visar en lösning steg för steg. Spelet anpassar sig och visar oftare de områden där eleven har svårast. Framsteg per område syns i Övningsgläntan.</p>
        ${[7, 8, 9].map(g => `<div><b>Åk ${g}:</b> <span class="muted">${Object.values(T).filter(t => t.grade === g).map(t => t.name).join(', ')}${g === 7 ? ', koordinatsystem' : g === 8 ? ', proportionalitet y = kx' : ', grafer till räta linjer'}.</span></div>`).join('')}
      </div>
    </details>
    <div class="row" style="justify-content:flex-end"><button class="btn small ghost" data-act="resetask">Byt spelare</button></div>
  </section>`;
};
function levelBlurb(W, i) {
  const L = W.levels[i];
  if (L.t === 'balance') return `${W.troll} vaktar bron med en våg. Gör samma sak på båda sidor tills x står ensamt.`;
  if (L.t === 'cannon') return W.id === 1 ? 'Väsen gömmer sig i koordinatsystemet. Ange rätt koordinater för att träffa dem.' : W.id === 2 ? 'Rikta runstrålen genom origo med rätt lutning k.' : 'Hitta linjen y = kx + m som träffar flera väsen på en gång.';
  const names = L.topics.slice(0, 3).map(t => T[t].name.toLowerCase()).join(', ');
  if (L.t === 'boss') return `${W.boss.n} väntar. Tre faser, allt du lärt dig i ${W.n}.`;
  return `${foeFor(W, i).n}${L.elite ? ' leder en flock' : ''}. Frågor om ${names}.`;
}

/* ---------- Karta ---------- */
SCREENS.map = () => {
  const w = Number(G.arg) || G.mapWorld || nextLevel()?.w || 1;
  G.mapWorld = w;
  const W = WORLDS[w - 1];
  const open = worldOpen(w);
  const n = W.levels.length, rowH = 96, H = n * rowH + 40;
  const pos = i => ({ x: 50 + Math.sin(i * 1.15) * 30, y: H - 50 - i * rowH });
  const pts = W.levels.map((_, i) => pos(i));
  const worldStars = W.levels.reduce((a, _, i) => a + (S.stars[lvlKey(w, i)] || 0), 0);
  const nx = nextLevel();
  return `<section class="stack">
    <button class="back" data-act="hub">← Byn</button>
    <div class="wtabs">${WORLDS.map(x => `<button class="wtab ${x.id === w ? 'sel' : ''} ${worldOpen(x.id) ? '' : 'locked'}" data-act="map" data-arg="${x.id}">${worldOpen(x.id) ? '' : '🔒 '}${x.n} · åk ${x.grade}</button>`).join('')}</div>
    <div class="worldhead" style="background:linear-gradient(135deg, ${W.col}2e, transparent 70%), var(--pine)">
      <div class="eyebrow">Värld ${w} · Åk ${W.grade} · ${worldStars} / 30 ★</div>
      <h2>${W.n}</h2>
      <p class="muted" style="margin:0;max-width:60ch">${open ? W.intro : `Besegra ${WORLDS[w - 2].boss.n} i ${WORLDS[w - 2].n} för att ta dig hit.`}</p>
    </div>
    <div class="milestones">${[[10, 'tra'], [20, 'silver'], [30, 'guld']].map(([need, type]) => {
      const key = `${w}-${need}`, claimed = S.claimedMs[key], can = worldStars >= need && !claimed;
      return `<div class="ms ${can ? 'claimable' : ''} ${claimed ? 'claimed' : ''}"><span class="ic">${CHESTS[type].e}</span><span>${need} ★ · ${CHESTS[type].n}</span>${can ? `<button class="btn gold small" data-act="claimms" data-arg="${key}|${type}">Hämta</button>` : `<small class="muted">${claimed ? 'Hämtad' : Math.min(worldStars, need) + ' / ' + need}</small>`}</div>`;
    }).join('')}</div>
    <div class="map" style="height:${H}px">
      <svg class="path" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="${W.col}" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" style="stroke-width:5px"/></svg>
      ${W.levels.map((L, i) => {
        const p = pos(i), st = S.stars[lvlKey(w, i)] || 0, op = levelOpen(w, i);
        const isNext = nx && nx.w === w && nx.i === i;
        return `<button class="node ${op ? 'open' : 'locked'} ${L.t === 'boss' ? 'boss' : ''} ${isNext ? 'next' : ''}" style="left:${p.x}%;top:${p.y}px" data-act="${op ? 'play' : 'lockedlvl'}" data-arg="${w}-${i}" aria-label="${esc(L.n)}${op ? '' : ' (låst)'}">
          <span class="disc">${op ? levelIcon(W, i) : '🔒'}</span><span class="nm">${i + 1}. ${esc(L.n)}</span><span class="st">${starsHTML(st)}</span></button>`;
      }).join('')}
    </div>
  </section>`;
};

/* ---------- Strid ---------- */
function startLevel(w, i) {
  const W = WORLDS[w - 1], L = W.levels[i];
  if (L.t === 'balance') return startBalance(w, i);
  if (L.t === 'cannon') return startCannon(w, i);
  const boss = L.t === 'boss';
  const foe = boss ? { n: W.boss.n, e: W.boss.e } : L.elite ? { n: L.n, e: W.foes[0][1] } : foeFor(W, i);
  startBattle({ kind: 'level', w, i, topics: L.topics, d: L.d, boss, elite: !!L.elite, foe, hp: boss ? 330 : L.elite ? 160 : 110 });
}
function makeFighter() {
  const fx = teamFx();
  const hearts = 3 + (fx.hp || 0);
  return { fx, hearts, maxHearts: hearts, shield: fx.shield || 0, guard: fx.comboGuard || 0, revive: fx.revive || 0, hints: 1 + (fx.hints || 0) };
}
function startBattle(cfg) {
  const b = G.b = Object.assign({ streak: 0, best: 0, correct: 0, answered: 0, writes: 0, blixt: 0, phase: 0, write: false, wrongTopics: {}, floor: 1, towerGold: 0, charge: 0, triple: false, frozen: false, revengeWon: 0 }, makeFighter(), cfg, { max: cfg.hp });
  if (b.boss) { b.bd = WORLDS[b.w - 1].boss; b.forms = [b.bd.e, ...b.bd.forms.slice(1)]; }
  G.tipQ = [];
  G.screen = 'battle'; render();
  (b.boss ? bossIntro(b) : Promise.resolve()).then(battleIntro).then(() => { if (G.b === b) nextQuestion(); });
}
/* ---- Bossens liv: entré, pratbubblor, reaktioner, förvandlingar ---- */
function bossIntro(b) {
  return new Promise(res => {
    const ov = document.createElement('div');
    ov.className = 'bossintro';
    ov.innerHTML = `<div class="bi-inner"><div class="bi-face">${b.foe.e}</div><div class="bi-title">${esc(b.bd.title)}</div><div class="bi-name">${esc(b.foe.n)}</div>
      <div class="bi-line">”${esc(b.bd.lines.intro)}”</div><div class="bi-go">${tx('fight', 'Strid!')}</div><small class="bi-skip">Tryck för att börja</small></div>`;
    document.body.appendChild(ov);
    SFX.play('roar');
    let done = false;
    const end = () => { if (done) return; done = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); res(); }, 280); };
    ov.addEventListener('click', end);
    setTimeout(end, reduceMotion ? 1800 : 4500);
  });
}
/* ---- Tips första gången något händer ---- */
function tipOnce(id, html) {
  S.flags.tips = S.flags.tips || {};
  if (S.flags.tips[id]) return;
  S.flags.tips[id] = true; save();
  G.tipQ = G.tipQ || [];
  G.tipQ.push(html);
  if (!$('#tipbox .tip')) showNextTip();
}
function showNextTip() {
  const box = $('#tipbox'); if (!box) { G.tipQ = []; return; }
  const html = (G.tipQ || []).shift();
  box.innerHTML = html ? `<div class="coach hint tip" role="status"><span>${html}</span><button class="btn small" data-act="tipok">OK</button></div>` : '';
}
function battleIntro() {
  S.flags.tips = S.flags.tips || {};
  if (S.flags.tips.intro) return Promise.resolve();
  return new Promise(res => {
    G.introDone = () => { S.flags.tips.intro = true; save(); res(); };
    modal(`<div class="eyebrow">Första striden</div><h2>Så funkar striden</h2>
      <ul class="rules" style="text-align:left">
        <li><b>Svara rätt</b> så skadar du fienden. Fel svar eller slut på tid kostar ett hjärta.</li>
        <li><b>Snabbt svar ger mer skada.</b> Titta på tidsmätaren: ⚡ Snabbt ×1,5 och ⚡⚡ Blixt ×2.</li>
        <li><b>Flera rätt i rad</b> bygger en 🔥 combo som ökar skadan ännu mer.</li>
        <li><b>Varje rätt svar laddar kraftmätaren.</b> När den är full trycker du på ett väsen i ditt lag och använder dess specialkraft.</li>
      </ul>
      <button class="btn primary" data-m="battleintro">Kör!</button>`);
  });
}
function bubble(text, ms = 3000) {
  const el = $('#bubble'); if (!el) return;
  el.textContent = text; el.hidden = false;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  clearTimeout(bubble.t); bubble.t = setTimeout(() => { el.hidden = true; }, ms);
}
function foeFx(glyph) {
  const host = $('#foefx'); if (!host || reduceMotion) return;
  const sp = document.createElement('span');
  sp.textContent = glyph; sp.style.left = (20 + Math.random() * 55) + '%';
  host.appendChild(sp); setTimeout(() => sp.remove(), 950);
}
async function bossPhase(b, ph) {
  b.phase = ph;
  $$('#phases span').forEach((x, i) => x.classList.toggle('on', i <= ph));
  const face = $('#face'), arena = $('#arena');
  await wait(250);
  if (face) face.classList.add('roar');
  SFX.play('roar'); shake(arena); flash();
  bubble(b.bd.lines.phase[ph - 1], 4000);
  await wait(800);
  b.foe.e = b.forms[ph];
  if (face) face.textContent = b.foe.e;
  if (arena) { arena.classList.remove('phase-0', 'phase-1', 'phase-2'); arena.classList.add('phase-' + ph); }
  if (face) { const r = face.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 26); }
  banner(`Fas ${ph + 1}`, `${b.foe.n} förvandlas! Attackerna laddas snabbare.`);
  await wait(1100);
  if (face) face.classList.remove('roar');
}
SCREENS.battle = () => {
  const b = G.b;
  return `<section class="arena ${b.boss ? 'bossfight phase-' + b.phase : ''}" id="arena">
    <div class="row" style="justify-content:space-between"><button class="back" data-act="quitask">← Fly</button>
      <span class="muted" style="font-size:13px">${b.kind === 'tower' ? `Runtornet · våning ${b.floor}` : `${WORLDS[b.w - 1].n} · nivå ${b.i + 1}`}</span></div>
    <div class="foe ${b.boss ? 'boss' : ''}" id="foe">
      <div class="bubble" id="bubble" hidden></div><div class="foefx" id="foefx" aria-hidden="true"></div>
      <div class="face" id="face">${b.foe.e}</div>
      <div class="stack" style="gap:6px">
        <div class="row" style="justify-content:space-between"><b id="foename">${esc(b.foe.n)}</b>${b.boss ? `<span class="phases" id="phases">${[0, 1, 2].map(p => `<span class="${p <= b.phase ? 'on' : ''}"></span>`).join('')}</span>` : ''}</div>
        <div class="hpbar ${b.boss ? 'notched' : ''}" id="hpbar"><i class="ghost" id="hpghost" style="width:${b.hp / b.max * 100}%"></i><i id="hp" style="width:${b.hp / b.max * 100}%"></i></div>
        <small class="muted" id="hptext">${Math.max(0, Math.ceil(b.hp))} / ${b.max}</small>
      </div>
    </div>
    <div class="me"><span class="hearts" id="hearts"></span><span class="combo" id="combo"></span></div>
    <div class="powers" id="powers"></div>
    <div class="timerwrap">
      ${b.boss ? `<div class="charge" id="charge"></div>` : ''}
      <div class="timer"><i id="tbar"></i><span class="mark" style="left:75%"></span><span class="mark" style="left:50%"></span></div>
      <div class="zones" aria-hidden="true"><span></span><span></span><span class="z1">⚡ Snabbt ×1,5</span><span class="z2">⚡⚡ Blixt ×2</span></div>
    </div>
    <div id="tipbox"></div>
    <div id="qzone"></div>
  </section>`;
};
function updateHUD() {
  const b = G.b; if (!b) return;
  const h = $('#hearts');
  if (h) h.innerHTML = Array.from({ length: b.maxHearts }, (_, i) => `<span class="${i < b.hearts ? '' : 'lost'}">❤️</span>`).join('') + (b.shield ? ` <span class="sh" title="Sköld">🛡️×${b.shield}</span>` : '');
  const c = $('#combo');
  if (c) { c.textContent = b.streak >= 2 ? `🔥 ${b.streak} i rad · ×${comboMult(b).toFixed(1).replace('.', ',')}` : ''; c.classList.toggle('hot', b.streak >= 5); }
  const pct = Math.max(0, b.hp / b.max * 100);
  if ($('#hp')) { $('#hp').style.width = pct + '%'; $('#hpghost').style.width = pct + '%'; $('#hptext').textContent = `${Math.max(0, Math.ceil(b.hp))} / ${b.max}`; }
  $('#face')?.classList.toggle('weak', b.hp > 0 && pct < 25);
  const pw = $('#powers');
  if (pw) {
    const ready = b.charge >= CHARGE_MAX;
    pw.innerHTML = `<div class="pmeter ${ready ? 'full' : ''}" title="Kraftmätare ${b.charge} av ${CHARGE_MAX}"><span>💥 Kraft</span><div class="pbar"><i style="width:${b.charge / CHARGE_MAX * 100}%"></i></div></div>`
      + S.team.slice(0, teamSlots()).map(id => {
        const p = powerOf(id, S.vasen[id].l);
        return `<button class="pw ${ready ? 'ready' : ''}" data-act="power" data-arg="${id}" ${ready ? '' : 'disabled'} title="${esc(VB[id].n)}: ${esc(p.n)}. ${esc(p.text)}"><span class="pe">${VB[id].e}</span><span class="pt"><b>${p.ic} ${esc(p.n)}</b><small>${esc(p.text)}</small></span></button>`;
      }).join('')
      + (b.triple ? '<span class="tripletag">⚔️ ×3 laddat</span>' : '');
  }
}
const comboMult = b => 1 + Math.min(1, Math.max(0, b.streak - 1) * .1 * (1 + (b.fx.comboRate || 0)));
function nextQuestion() {
  const b = G.b; if (!b) return;
  const topic = pickTopic(b.topics, b.lastTopic);
  b.lastTopic = topic;
  let d = b.d;
  if (b.kind === 'tower') d = b.floor < 5 ? 1 : b.floor < 12 ? (Math.random() < .5 ? 1 : 2) : b.floor < 20 ? (Math.random() < .5 ? 2 : 3) : 3;
  else if (d > 1 && Math.random() < .25) d--;
  let q = T[topic].gen(d); q.topic = topic; q.d = d;
  const rv = (S.revenge || []).filter(r => b.topics.includes(r.t) && r.after <= S.qCount && (!b.q || r.q.q !== b.q.q));
  if (rv.length && Math.random() < .35) { const r = R.pick(rv); q = Object.assign({}, r.q, { opts: R.shuffle(r.q.opts), topic: r.t, d: r.d, revenge: true }); d = r.d; }
  b.q = q; b.locked = false; b.removed = []; b.frozen = false;
  const tm = (T[q.topic].time * (d === 3 ? 1.15 : d === 1 ? .9 : 1) + (b.fx.time || 0)) * (1 - .12 * b.phase);
  b.tMax = tm * 1000; b.tStart = performance.now(); b.zone = null;
  renderQ();
  const ch = $('#charge');
  if (ch && b.bd) { const atk = b.bd.attacks[b.phase]; ch.className = 'charge'; ch.innerHTML = `${esc(b.foe.n)} laddar <b>${esc(atk[0])}</b> ${atk[1]}`; }
  $('#face')?.classList.remove('charging');
  if (q.revenge) tipOnce('revenge', '🔁 <b>Revansch!</b> Den här frågan svarade du fel på tidigare. Klara den nu för +10 guld.');
  else if (q.write && b.answered >= 1) tipOnce('write', '✍ <b>Kan du svaret utan alternativ?</b> Tryck <b>Skriv svaret själv</b> så gör du dubbel skada.');
  startTimer();
}
function qcardHTML(q, extra = '') {
  const long = q.q.replace(/<[^>]+>/g, '').length > 70;
  return `<div class="qcard ${q.revenge ? 'rev' : ''}"><div class="topic"><span>${q.revenge ? '<span class="revtag">🔁 Revansch</span> ' : ''}${esc(T[q.topic].name)}</span><span>${'◆'.repeat(q.d)}${'◇'.repeat(3 - q.d)}</span></div>
    <div class="qtext ${long ? 'long' : ''}">${q.q}</div>${q.fig || ''}${extra}</div>`;
}
function answersHTML(q, removed = [], write = false) {
  if (write) return `<form class="writebox" data-form="write" autocomplete="off"><input class="field" id="wans" inputmode="decimal" placeholder="Ditt svar" aria-label="Skriv ditt svar"><button class="btn primary" type="submit">Svara</button></form>
    <p class="muted" style="margin:0;font-size:12px">Skriv decimaltal med komma, t.ex. 0,75. Bråk som 3/4 och minustecken fungerar också.</p>`;
  return `<div class="answers">${q.opts.map((o, i) => `<button class="ans ${removed.includes(i) ? 'gone' : ''}" data-act="ans" data-arg="${i}"><kbd>${i + 1}</kbd>${o}</button>`).join('')}</div>`;
}
function renderQ() {
  const b = G.b, q = b.q, z = $('#qzone'); if (!z) return;
  if (!q.write) b.write = false;
  z.innerHTML = `<div class="stack" style="gap:12px">${qcardHTML(q)}${answersHTML(q, b.removed, b.write)}
    <div class="tools">${q.write ? `<button class="toggle ${b.write ? 'on' : ''}" data-act="writemode">✍ ${b.write ? 'Skriver själv · dubbel skada' : 'Skriv svaret själv · dubbel skada'}</button>` : '<span></span>'}
    <button class="btn small ghost" data-act="hint" ${b.hints > 0 && !b.write ? '' : 'disabled'}>🏮 Ledtråd (${b.hints})</button></div></div>`;
  updateHUD();
  if (b.write) setTimeout(() => $('#wans')?.focus(), 30);
}
let timerRAF = null, hiddenAt = 0;
function startTimer() { stopTimer(); timerRAF = requestAnimationFrame(tick); }
function stopTimer() { if (timerRAF) cancelAnimationFrame(timerRAF); timerRAF = null; }
function tick() {
  const b = G.b; if (!b || b.locked || G.screen !== 'battle') return;
  if (b.frozen) b.tStart = performance.now() - b.frozenEl;
  const left = 1 - (performance.now() - b.tStart) / b.tMax;
  const bar = $('#tbar');
  const el = 1 - left;
  const zone = el < .25 ? 'blixt' : el < .5 ? 'snabb' : left < .2 ? 'crit' : left < .45 ? 'warn' : '';
  if (bar) { bar.style.width = Math.max(0, left * 100) + '%'; if (zone !== b.zone) { bar.className = zone; b.zone = zone; if (b.boss) { $('#charge')?.classList.toggle('danger', zone === 'crit'); $('#face')?.classList.toggle('charging', zone === 'crit'); } } }
  if (left <= 0) { answer(null, true); return; }
  timerRAF = requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hiddenAt = performance.now();
  else if (hiddenAt && G.b && !G.b.locked) { G.b.tStart += performance.now() - hiddenAt; hiddenAt = 0; }
});
function isRight(q, choice, typed) {
  if (typed !== undefined) { const v = parseAnswer(typed); return v !== null && q.val !== null && Math.abs(v - q.val) <= 1e-6 * Math.max(1, Math.abs(q.val)); }
  return choice === q.a;
}
async function answer(idx, timeout = false, typed) {
  const b = G.b; if (!b || b.locked) return;
  b.locked = true; stopTimer();
  const q = b.q;
  const ratio = (performance.now() - b.tStart) / b.tMax;
  const wrote = typed !== undefined;
  const ok = !timeout && isRight(q, idx !== null ? q.opts[idx] : null, typed);
  recordAnswer(q.topic, ok);
  b.answered++; S.stats.answered++;
  trackRevenge(q, ok);
  const btns = $$('.ans');
  if (ok) {
    b.correct++; b.streak++; b.best = Math.max(b.best, b.streak);
    S.stats.correct++; S.stats.bestStreak = Math.max(S.stats.bestStreak, b.streak);
    quest('correct'); quest('streak', b.streak); quest('topic', 1, q.topic);
    if (wrote) { b.writes++; S.stats.writes++; quest('write'); }
    if (idx !== null && btns[idx]) btns[idx].classList.add('right');
    if (wrote) $('#wans')?.classList.add('right');
    const tier = ratio < .25 ? 2 : ratio < .5 ? 1 : 0;
    const crit = tier === 2;
    if (crit) { b.blixt++; S.stats.blixt = (S.stats.blixt || 0) + 1; }
    const speed = tier === 2 ? 2 + (b.fx.crit || 0) : tier === 1 ? 1.5 : 1;
    const dmg = Math.round(24 * (1 + (b.fx.dmg || 0)) * comboMult(b) * speed * (wrote ? 2 : 1) * (b.triple ? 3 : 1));
    const wasTriple = b.triple; b.triple = false;
    const wasFull = b.charge >= CHARGE_MAX;
    b.charge = Math.min(CHARGE_MAX, b.charge + (crit ? 2 : 1));
    if (q.revenge) { b.revengeWon++; addGold(10); }
    const ch = $('#charge'); if (ch) { ch.className = 'charge broken'; ch.textContent = crit ? 'Attacken krossad!' : 'Attacken avbruten!'; }
    $('#face')?.classList.remove('charging');
    SFX.play(crit ? 'zap' : 'right');
    await bolt(idx !== null ? btns[idx] : $('#wans'), $('#face'), wrote ? '✸' : '✦');
    SFX.play('hit');
    const face = $('#face');
    if (face) { face.classList.remove('hit'); void face.offsetWidth; face.classList.add('hit'); const r = face.getBoundingClientRect(); floatText(r.left + r.width / 2, r.top, (wasTriple ? '×3! ' : '') + (tier === 2 ? tx('crit', 'BLIXTSNABBT! ') : tier === 1 ? tx('fast', 'SNABBT! ') : '') + dmg, tier > 0 || wasTriple); if (q.revenge) setTimeout(() => floatText(r.left + r.width / 2, r.top + 50, '🔁 +10 guld', false), 350); burst(r.left + r.width / 2, r.top + r.height / 2, crit ? 20 : tier ? 12 : 8); if (crit) { shake($('#foe')); face.classList.add('crit'); setTimeout(() => face.classList.remove('crit'), 300); } }
    const hb = $('#hpbar'); if (hb) { hb.classList.remove('jolt'); void hb.offsetWidth; hb.classList.add('jolt'); }
    foeFx(crit ? '💫' : '💢');
    if (b.bd && b.hp - dmg > 0 && (crit || Math.random() < .35)) bubble(R.pick(b.bd.lines.hit), 2800);
    b.hp -= dmg;
    if (TH.announce && TH.announce[b.streak]) callout(TH.announce[b.streak], 'streak');
    if (b.fx.healEvery && b.streak % b.fx.healEvery === 0 && b.hearts < b.maxHearts) { b.hearts++; toast('💚 Ditt väsen läkte ett hjärta!'); }
    updateHUD();
    if (crit) tipOnce('blixt', '⚡ <b>Blixtsnabbt!</b> Svarar du medan tidsmätaren är i den gula zonen gör du dubbel skada och får bonusguld.');
    else if (b.streak === 2) tipOnce('combo', '🔥 <b>Combo!</b> Varje rätt svar i rad ökar skadan. Ett fel nollställer den.');
    if (!wasFull && b.charge >= CHARGE_MAX) tipOnce('power', '💥 <b>Kraftmätaren är full!</b> Tryck på ett väsen i ditt lag för att använda dess specialkraft.');
    if (b.boss) {
      const ph = b.hp <= b.max / 3 ? 2 : b.hp <= b.max * 2 / 3 ? 1 : 0;
      if (ph > b.phase && b.hp > 0) await bossPhase(b, ph);
    }
    await wait(550);
    if (b.hp <= 0) return foeDefeated();
    if (G.b === b) nextQuestion();
    return;
  }
  // fel svar
  b.wrongTopics[q.topic] = (b.wrongTopics[q.topic] || 0) + 1;
  if (b.guard > 0 && b.streak > 0) { b.guard--; toast('🧝 Vittran skyddade din combo!'); }
  else b.streak = 0;
  btns.forEach((el, i) => { if (q.opts[i] === q.a) el.classList.add('right'); });
  if (idx !== null && btns[idx]) btns[idx].classList.add('wrong');
  SFX.play('wrong');
  const face = $('#face'); if (face) { face.classList.remove('lunge', 'charging'); void face.offsetWidth; face.classList.add('lunge'); }
  if (b.bd) {
    const atk = b.bd.attacks[b.phase];
    bubble(timeout ? `${atk[0]}!` : R.pick(b.bd.lines.laugh), 3200);
    const ch = $('#charge'); if (ch) { ch.className = 'charge hit'; ch.innerHTML = `<b>${esc(atk[0])}</b> träffar! ${atk[1]}`; }
    await bolt(face, $('#hearts'), atk[1]);
  } else bubble(R.pick(['Haha! Jag är snabbast!', 'Hehe! Jag är starkast!', 'Jag är oslagbar!', 'Ha! Mina klor är vassast!', 'Haha! Testa igen!']), 2600);
  if (b.shield > 0) { b.shield--; toast('🛡️ Skölden tog smällen!'); }
  else { b.hearts--; flash(); shake($('#arena')); }
  if (b.hearts <= 0 && b.revive > 0) { b.revive--; b.hearts = 1; setTimeout(() => banner('Skogsrået räddar dig!', 'Ett hjärta kvar'), 200); }
  updateHUD();
  showExplain(q, timeout, typed);
  if (b.hints > 0) tipOnce('hint', `🏮 <b>Kör du fast?</b> Ledtråden tar bort två fel svar. Du har ${b.hints} kvar i den här striden.`);
}
/* ---- Revanschfrågor: fel svar kommer tillbaka några frågor senare ---- */
function trackRevenge(q, ok) {
  S.qCount = (S.qCount || 0) + 1;
  S.revenge = S.revenge || [];
  const i = S.revenge.findIndex(r => r.q.q === q.q && r.t === q.topic);
  if (ok) {
    if (q.revenge || i >= 0) { if (i >= 0) S.revenge.splice(i, 1); if (q.revenge) S.stats.revenge = (S.stats.revenge || 0) + 1; }
    return;
  }
  if (i >= 0) { S.revenge[i].after = S.qCount + 4; return; }
  const { q: text, a, val, opts, expl, write, fig } = q;
  S.revenge.push({ t: q.topic, d: q.d, after: S.qCount + 3, q: JSON.parse(JSON.stringify({ q: text, a, val, opts, expl, write: !!write, fig: fig || '' })) });
  if (S.revenge.length > 30) S.revenge.shift();
}
async function usePower(id) {
  const b = G.b;
  if (!b || b.locked || !b.q || b.charge < CHARGE_MAX || !S.team.slice(0, teamSlots()).includes(id)) return;
  const p = powerOf(id, S.vasen[id].l);
  b.charge = 0;
  S.stats.powers = (S.stats.powers || 0) + 1;
  SFX.play('zap');
  callout(`${p.ic} ${p.n}!`, 'power');
  const btn = document.querySelector(`.pw[data-arg="${id}"]`);
  if (btn) { const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 14); }
  if (p.kind === 'heal') b.hearts = Math.min(b.maxHearts, b.hearts + p.v);
  else if (p.kind === 'shield') b.shield += p.v;
  else if (p.kind === 'freeze') { b.frozen = true; b.frozenEl = performance.now() - b.tStart; $('#tbar')?.classList.add('frozen'); }
  else if (p.kind === 'fifty') { b.write = false; const wrong = b.q.opts.map((o, i) => i).filter(i => b.q.opts[i] !== b.q.a && !b.removed.includes(i)); b.removed.push(...R.shuffle(wrong).slice(0, 2)); renderQ(); }
  else if (p.kind === 'triple') b.triple = true;
  else if (p.kind === 'loot') { addGold(p.v); renderTop(); if (btn) { const r = btn.getBoundingClientRect(); floatText(r.left + r.width / 2, r.top, `+${p.v} guld`, false); } }
  else if (p.kind === 'combo') { b.streak += p.v; b.best = Math.max(b.best, b.streak); S.stats.bestStreak = Math.max(S.stats.bestStreak, b.streak); }
  else if (p.kind === 'smite') {
    b.locked = true; stopTimer();
    await bolt(btn, $('#face'), '💥');
    const face = $('#face');
    SFX.play('hit');
    if (face) { face.classList.remove('hit'); void face.offsetWidth; face.classList.add('hit'); const r = face.getBoundingClientRect(); floatText(r.left + r.width / 2, r.top, `${p.n.toUpperCase()}! ${p.v}`, true); burst(r.left + r.width / 2, r.top + r.height / 2, 22); }
    foeFx('💥');
    b.hp -= p.v;
    updateHUD();
    if (b.boss) { const ph = b.hp <= b.max / 3 ? 2 : b.hp <= b.max * 2 / 3 ? 1 : 0; if (ph > b.phase && b.hp > 0) await bossPhase(b, ph); }
    await wait(500);
    if (b.hp <= 0) return foeDefeated();
    if (G.b === b) nextQuestion();
    save();
    return;
  }
  updateHUD();
  save();
}
function explainHTML(q, timeout, typed, good = false) {
  return `<div class="explain ${good ? 'good' : ''}">
    <div class="eyebrow">${good ? 'Rätt!' : timeout ? 'Tiden tog slut' : typed !== undefined ? `Du skrev ${esc(typed || '–')}` : 'Inte riktigt'}</div>
    <div>Rätt svar: <span class="right">${q.a}</span></div>
    <div><b>Så här tänker du</b><ol>${q.expl.map(s => `<li>${s}</li>`).join('')}</ol></div>
  </div>`;
}
function showExplain(q, timeout, typed) {
  const z = $('#qzone'); if (!z) return;
  const dead = G.b.hearts <= 0;
  z.querySelector('.tools')?.remove();
  z.querySelector('.writebox')?.remove();
  z.firstElementChild.insertAdjacentHTML('beforeend', explainHTML(q, timeout, typed) + `<button class="btn ${dead ? '' : 'primary'}" data-act="cont" id="contbtn">${dead ? 'Se resultat' : 'Jag fattar, fortsätt'}</button>`);
  setTimeout(() => { $('#contbtn')?.focus({ preventScroll: true }); $('#contbtn')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); }, 50);
}
async function foeDefeated() {
  const b = G.b;
  const face = $('#face'); if (face && !b.bd) face.classList.add('dead');
  SFX.play('win');
  if (b.kind === 'tower') {
    const g = 6 + b.floor * 2; b.towerGold += g;
    b.floor++;
    quest('tower');
    if (b.floor - 1 > S.tower.best) S.tower.best = b.floor - 1;
    await wait(700);
    if ((b.floor - 1) % 5 === 0) { if (b.hearts < b.maxHearts) b.hearts++; banner(`Våning ${b.floor}`, 'Vilostopp: +1 hjärta'); }
    const pool = WORLDS.flatMap(W => W.foes.map(f => ({ n: f[0], e: f[1] })));
    b.foe = b.floor % 10 === 0 ? (() => { const W = R.pick(WORLDS); return { n: W.boss.n, e: W.boss.e }; })() : R.pick(pool);
    b.max = b.hp = 70 + b.floor * 7 + (b.floor % 10 === 0 ? 80 : 0);
    checkAch(); save();
    render(); nextQuestion();
    return;
  }
  if (b.bd) {
    bubble(b.bd.lines.defeat, 3800);
    if (face) { face.classList.remove('dead', 'weak'); face.classList.add('ko'); }
    SFX.play('roar');
    await wait(900);
    banner(tx('ko', 'Besegrad!'), `${b.foe.n} har fallit`);
    if (face) { const r = face.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40); }
    confetti(80);
    await wait(2400);
  } else await wait(800);
  finishLevel(true);
}
function rewardFor(kind, correct, win, extra = 0) {
  const fx = teamFx();
  const gold = (correct * 4 + (win ? ({ boss: 120, elite: 60, normal: 30 })[kind] : 5) + extra) * (1 + (fx.gold || 0));
  const xp = (correct * 10 + (win ? 30 : 8)) * (1 + (fx.xp || 0));
  return { gold: Math.round(gold), xp: Math.round(xp) };
}
function finishLevel(win, special) {
  // special: {stars, correct, answered, best, label} för våg/kast
  const b = G.b || {};
  const w = special ? special.w : b.w, i = special ? special.i : b.i;
  const W = WORLDS[w - 1], L = W.levels[i];
  const correct = special ? special.correct : b.correct, answered = special ? special.answered : b.answered;
  const acc = answered ? correct / answered : 0;
  const stars = !win ? 0 : special ? special.stars : acc >= .9 ? 3 : acc >= .75 ? 2 : 1;
  const key = lvlKey(w, i), prev = S.stars[key] || 0;
  const kind = L.t === 'boss' ? 'boss' : L.elite ? 'elite' : 'normal';
  const firstClear = win && !prev;
  const blixt = special ? 0 : (b.blixt || 0);
  const rw = rewardFor(kind, correct, win, (firstClear ? 40 : 0) + blixt * 3);
  addGold(rw.gold);
  const xpRes = addXP(rw.xp);
  const res = { win, stars, prev, gold: rw.gold, xp: rw.xp, correct, answered, blixt, best: special ? special.best : b.best, w, i, unlocks: [], weak: null, label: special && special.label };
  if (win) {
    S.stars[key] = Math.max(prev, stars);
    S.stats.wins++; quest('win'); if (stars === 3) quest('three');
    if (L.t === 'boss' && !S.boss[w]) {
      S.boss[w] = today();
      const g = grantVasen(W.boss.v); res.unlocks.push(g);
      S.chests.silver++;
      res.bossFirst = true;
    }
    if (firstClear && i + 1 < W.levels.length) res.nextOpen = true;
  } else {
    const wt = Object.entries(b.wrongTopics || {}).sort((a, c) => c[1] - a[1])[0];
    res.weak = wt ? wt[0] : null;
  }
  res.levelUps = xpRes.ups;
  checkAch();
  save();
  G.b = null; G.bal = null; G.can = null;
  G.result = res;
  go('result');
  if (win) { setTimeout(() => confetti(res.bossFirst ? 140 : 60), 150); for (let k = 0; k < stars; k++) setTimeout(() => SFX.play('star'), 300 + k * 260); }
  else SFX.play('lose');
}
SCREENS.result = () => {
  const r = G.result;
  if (r.tower) {
    return `<section class="result"><div class="eyebrow">Runtornet</div><h1>Våning ${r.floor}</h1>
      <p class="muted">${r.floor > r.prevBest ? 'Nytt rekord!' : `Ditt rekord är våning ${S.tower.best}.`}</p>
      <div class="rewards"><div class="reward"><b>+${r.gold}</b><small>guld</small></div><div class="reward"><b>+${r.xp}</b><small>XP</small></div><div class="reward"><b>${r.correct}</b><small>rätt svar</small></div><div class="reward"><b>${r.best}</b><small>bästa combo</small></div>${r.blixt ? `<div class="reward"><b>⚡ ${r.blixt}</b><small>blixtsnabba · +${r.blixt * 3} guld</small></div>` : ''}</div>
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="tower">Klättra igen</button><button class="btn ghost" data-act="hub">Till byn</button></div></section>`;
  }
  const W = WORLDS[r.w - 1];
  const hasNext = r.win && r.i + 1 < W.levels.length;
  return `<section class="result">
    <div class="eyebrow">${W.n} · ${esc(W.levels[r.i].n)}</div>
    <h1>${r.win ? (r.bossFirst ? `${W.boss.n} är besegrad!` : tx('win', 'Seger!')) : tx('lose', 'Du föll i striden')}</h1>
    ${r.win ? `<div class="bigstars">${[0, 1, 2].map(k => `<span class="${k < r.stars ? 'on' : ''}" style="animation-delay:${.25 + k * .26}s">★</span>`).join('')}</div>` : `<p class="muted" style="max-width:46ch;margin:0">Varje fel är en ledtråd till vad du ska öva på. Du behåller guld och XP för dina rätta svar.</p>`}
    <div class="rewards">
      <div class="reward"><b>+${r.gold}</b><small>guld</small></div>
      <div class="reward"><b>+${r.xp}</b><small>XP</small></div>
      <div class="reward"><b>${r.correct} / ${r.answered}</b><small>${r.label || 'rätt svar'}</small></div>
      ${r.best !== undefined && r.best !== null ? `<div class="reward"><b>${r.best}</b><small>bästa combo</small></div>` : ''}
      ${r.blixt ? `<div class="reward"><b>⚡ ${r.blixt}</b><small>blixtsnabba · +${r.blixt * 3} guld</small></div>` : ''}
    </div>
    ${TH.rankOnResult ? `<div class="rankbar"><span class="badge" data-tier="${tierFor(S.level)}">${S.level}</span><div><b>${esc(titleFor(S.level))}</b><small>${S.xp} / ${xpFor(S.level)} XP till nästa nivå</small><div class="xp"><i style="width:${Math.round(S.xp / xpFor(S.level) * 100)}%"></i></div></div></div>` : ''}
    ${r.win && !r.prev ? '<p class="muted" style="margin:0">Första gången du klarar nivån: +40 guld extra.</p>' : ''}
    ${r.win && r.stars < 3 ? `<p class="muted" style="margin:0">${r.label ? 'Färre missar ger fler stjärnor.' : '90 % rätt ger tre stjärnor, 75 % ger två.'}</p>` : ''}
    ${r.unlocks.map(u => { const v = VB[u.id]; return `<div class="card c-${v.r} l" style="width:min(260px,80vw)"><span class="tag">NYTT VÄSEN</span><span class="em">${v.e}</span><span class="nm">${v.n}</span><span class="rar">${RAR[v.r]}</span><span class="ab">${fxText(v.fx(1))}</span></div>
      <p class="muted" style="margin:0">Du fick också en Silverkista!${r.w < 3 ? ` ${WORLDS[r.w].n} är upplåst.` : ''}</p>`; }).join('')}
    <div class="row" style="justify-content:center">
      ${hasNext ? `<button class="btn primary" data-act="play" data-arg="${r.w}-${r.i + 1}">Nästa nivå →</button>` : ''}
      ${r.win && r.bossFirst && r.w < 3 ? `<button class="btn primary" data-act="map" data-arg="${r.w + 1}">Vidare till ${WORLDS[r.w].n} →</button>` : ''}
      ${!r.win && r.weak ? `<button class="btn primary" data-act="practopic" data-arg="${r.weak}">Öva på ${esc(T[r.weak].name.toLowerCase())}</button>` : ''}
      <button class="btn ${hasNext || (!r.win && r.weak) ? 'ghost' : 'primary'}" data-act="play" data-arg="${r.w}-${r.i}">${r.win ? 'Spela igen' : 'Försök igen'}</button>
      <button class="btn ghost" data-act="map" data-arg="${r.w}">Kartan</button>
    </div>
  </section>`;
};

/* ---------- Runtornet ---------- */
function startTower() {
  const topics = Object.values(T).filter(t => t.grade <= Math.max(S.grade, 7) || worldOpen(t.grade - 6)).map(t => t.id);
  const pool = WORLDS.flatMap(W => W.foes.map(f => ({ n: f[0], e: f[1] })));
  startBattle({ kind: 'tower', topics, d: 1, foe: R.pick(pool), hp: 77, boss: false, startBest: S.tower.best });
}
function finishTower() {
  const b = G.b;
  const floor = b.floor - 1;
  const prevBest = b.startBest || 0;
  S.tower.best = Math.max(S.tower.best, floor);
  const fx = teamFx();
  const gold = addGold((b.towerGold + b.correct * 3 + b.blixt * 3) * (1 + (fx.gold || 0)));
  const xpr = addXP((b.correct * 10 + floor * 6) * (1 + (fx.xp || 0)));
  checkAch(); save();
  G.result = { tower: true, floor, prevBest, gold, xp: xpr.n, correct: b.correct, best: b.best, blixt: b.blixt };
  G.b = null;
  go('result');
  if (floor > prevBest) confetti(80);
}

/* ---------- Vågen (ekvationer som balans) ---------- */
function genEq(g) {
  for (let tries = 0; tries < 200; tries++) {
    let a, b, c, d, x;
    if (g === 7) {
      x = R.int(1, 12);
      if (Math.random() < .3) { a = 1; b = R.int(2, 15); } else { a = R.int(2, 6); b = R.int(1, 15); }
      c = 0; d = a * x + b;
    } else if (g === 8) {
      x = R.int(-5, 10); a = R.int(2, 7); c = R.int(1, a - 1); b = R.int(-10, 12); d = a * x + b - c * x;
      if (Math.random() < .4) { [a, b, c, d] = [c, d, a, b]; }
    } else {
      x = R.nz(-8, 8); a = R.nz(-6, 6); c = R.nz(-6, 6); if (a === c) continue; b = R.int(-14, 14); d = a * x + b - c * x;
    }
    const st = { a, b, c, d };
    const par = solvePar(st);
    if (par >= 2 && par <= 4 && Math.abs(d) <= 80) return { st, par, x };
  }
  return { st: { a: 2, b: 3, c: 0, d: 11 }, par: 2, x: 4 };
}
function coreOps(st) {
  const o = [];
  if (st.b !== 0) o.push({ k: 0, n: -st.b });
  if (st.d !== 0) o.push({ k: 0, n: -st.d });
  if (st.c !== 0 && st.a !== 0) { o.push({ k: -st.c, n: 0 }); o.push({ k: -st.a, n: 0 }); }
  if (st.b === 0 && st.c === 0 && st.a !== 1 && st.a !== 0) o.push({ div: st.a });
  if (st.d === 0 && st.a === 0 && st.c !== 1 && st.c !== 0) o.push({ div: st.c });
  return o;
}
function applyOp(st, op) {
  if (op.div) { if ([st.a, st.b, st.c, st.d].some(v => v % op.div !== 0)) return null; return { a: st.a / op.div, b: st.b / op.div, c: st.c / op.div, d: st.d / op.div }; }
  return { a: st.a + op.k, b: st.b + op.n, c: st.c + op.k, d: st.d + op.n };
}
const solvedEq = st => (st.a === 1 && st.b === 0 && st.c === 0) || (st.c === 1 && st.d === 0 && st.a === 0);
function solvePar(st0) {
  let frontier = [st0], seen = new Set([JSON.stringify(st0)]);
  for (let depth = 0; depth <= 6; depth++) {
    if (frontier.some(solvedEq)) return depth;
    const nextF = [];
    for (const st of frontier) for (const op of coreOps(st)) { const n = applyOp(st, op); if (!n) continue; const k = JSON.stringify(n); if (!seen.has(k)) { seen.add(k); nextF.push(n); } }
    frontier = nextF;
  }
  return 9;
}
function opLabel(op) {
  if (op.div) return op.div < 0 ? `÷ (${MINUS}${-op.div})` : `÷ ${op.div}`;
  if (op.k) return (op.k > 0 ? '+ ' : `${MINUS} `) + (Math.abs(op.k) === 1 ? '' : Math.abs(op.k)) + 'x';
  return (op.n > 0 ? '+ ' : `${MINUS} `) + Math.abs(op.n);
}
function opsFor(st) {
  const list = coreOps(st);
  const extra = [{ k: 0, n: R.nz(-9, 9) }, { k: R.pick([1, -1, 2]), n: 0 }, { div: R.pick([2, 3]) }, { k: 0, n: R.nz(-5, 5) }];
  for (const e of R.shuffle(extra)) { if (list.length >= 6) break; if (!list.some(o => opLabel(o) === opLabel(e))) list.push(e); }
  return R.shuffle(list.filter((o, i, arr) => arr.findIndex(p => opLabel(p) === opLabel(o)) === i)).slice(0, 6);
}
function startBalance(w, i) {
  const W = WORLDS[w - 1];
  const eqs = [genEq(W.grade), genEq(W.grade), genEq(W.grade)];
  G.bal = Object.assign({ w, i, eqs, k: 0, st: { ...eqs[0].st }, hist: [], moves: 0, extraTotal: 0, hp: 3, foe: { n: W.troll, e: '🧌' } }, makeFighter());
  G.bal.ops = opsFor(G.bal.st);
  balStartCoach();
  G.screen = 'balance'; render();
  if (!S.flags.balIntro) balIntro();
}
/* ---- Hjälp till vågen: genomgång, tips och återkoppling ---- */
const eqStr = st => `${lin(st.a, st.b)} = ${lin(st.c, st.d)}`;
const balGuided = () => !S.flags.balTut && G.bal && G.bal.k === 0;
function balBestOp(st) {
  // kortaste vägen först; vid lika långa vägar undviks drag som lämnar x med negativ koefficient
  const negX = n => (n.a < 0 && n.c === 0) || (n.c < 0 && n.a === 0) || (n.a < 0 && n.c < 0);
  const ends = st0 => { let s = st0, guard = 0; while (!solvedEq(s) && guard++ < 6) { let nx = null, np = 99; for (const op of coreOps(s)) { const n = applyOp(s, op); if (n && solvePar(n) < np) { np = solvePar(n); nx = n; } } if (!nx) break; if (negX(nx)) return 1; s = nx; } return 0; };
  let best = null, bs = 999;
  for (const op of coreOps(st)) {
    const n = applyOp(st, op); if (!n) continue;
    const score = solvePar(n) * 10 + (negX(n) ? 2 : 0) + ends(n);
    if (score < bs) { bs = score; best = op; }
  }
  return best;
}
function balHint(st) {
  const op = balBestOp(st); if (!op) return null;
  const L = `<b>${opLabel(op)}</b>`;
  let why;
  if (op.div) {
    const coef = st.a !== 0 ? st.a : st.c;
    why = `${lin(coef, 0)} betyder ${fmt(coef)} gånger x. Gör ${L} på båda sidor så står x ensamt.`;
  } else if (op.k) {
    why = `x finns på båda sidorna. Gör ${L} på båda sidor så försvinner x från den ena sidan.`;
  } else {
    const left = op.n === -st.b, t = left ? st.b : st.d;
    const term = t > 0 ? `+ ${fmt(t)}` : `${MINUS} ${fmt(-t)}`;
    const hasX = left ? st.a !== 0 : st.c !== 0;
    why = `På ${left ? 'vänster' : 'höger'} sida står ${term}${hasX ? ' bredvid x' : ''}. Gör ${L} på båda sidor, så blir det 0 där och talet försvinner.`;
  }
  return { op, html: why };
}
function balSuggest() {
  const B = G.bal, h = balHint(B.st); if (!h) return null;
  B.suggest = opLabel(h.op);
  if (!B.ops.some(o => opLabel(o) === B.suggest)) { B.ops[0] = h.op; B.ops = R.shuffle(B.ops); }
  return h;
}
function balStartCoach() {
  const B = G.bal;
  B.suggest = null;
  if (balGuided()) {
    const h = balSuggest();
    B.coach = { kind: 'hint', html: `<b>Mål:</b> få x helt ensamt, till exempel x = 4.<br>${h ? h.html : ''}` };
  } else {
    B.coach = { kind: 'info', html: `<b>Mål:</b> få x helt ensamt. Det går på ${B.eqs[B.k].par} drag. Kör du fast? Tryck 💡 Tips.` };
  }
}
function balTip() {
  const B = G.bal; if (!B || B.busy) return;
  const h = balSuggest(); if (!h) return;
  B.coach = { kind: 'hint', html: h.html };
  SFX.play('click');
  render();
}
function balIntro() {
  const B = G.bal;
  const ex = rows => `<div class="exsteps">${rows.map(([eq, op, note]) => `<div class="exrow"><b>${eq}</b>${op ? `<span class="exop">${op} på båda sidor</span>` : ''}${note ? `<small>${note}</small>` : ''}</div>`).join('')}</div>`;
  const second = B && B.w > 1 ? `<p style="margin:0">Om x finns på <b>båda</b> sidor samlar du först x på en sida:</p>${ex([
    ['5x + 1 = 2x + 7', '', 'Trollets våg'],
    ['3x + 1 = 7', `${MINUS} 2x`, 'Nu finns x bara till vänster'],
    ['3x = 6', `${MINUS} 1`, 'Talet bredvid x är borta'],
    ['x = 2', '÷ 3', 'Klart!']])}` : '';
  modal(`<div class="eyebrow">Så besegrar du trollet</div><h2>Vågen</h2>
    <div class="stack" style="gap:10px;text-align:left">
      <p style="margin:0">Ekvationen är en våg. Båda sidorna väger <b>exakt lika mycket</b>. Knapparna gör samma sak på båda sidor samtidigt, så vågen håller balansen.</p>
      <p style="margin:0"><b>Ditt mål:</b> få x helt ensamt på ena sidan. Då ser du vad x är.</p>
      <p style="margin:0">Exempel:</p>
      ${ex([['2x + 3 = 11', '', 'Trollets våg'], ['2x = 8', `${MINUS} 3`, '+ 3 och − 3 tar ut varandra'], ['x = 4', '÷ 2', 'Klart! 2x delat med 2 är x']])}
      ${second}
      <ul class="rules">
        <li>Ta bort det som står i vägen för x först. <b>Dela sist.</b></li>
        <li>Om ett drag inte hjälpte: tryck <b>↶ Ångra</b>.</li>
        <li>Fler än två onödiga drag och trollet slår till.</li>
        <li>Kör du fast: tryck <b>💡 Tips</b>.</li>
      </ul>
    </div>
    <button class="btn primary" data-m="balintro">Jag fattar, kör!</button>`);
}
SCREENS.balance = () => {
  const B = G.bal, eq = B.eqs[B.k];
  return `<section class="arena" id="arena">
    <div class="row" style="justify-content:space-between"><button class="back" data-act="quitask">← Fly</button><span class="muted" style="font-size:13px">${WORLDS[B.w - 1].n} · nivå ${B.i + 1}</span></div>
    <div class="foe" id="foe"><div class="face" id="face">${B.foe.e}</div>
      <div class="stack" style="gap:6px"><b>${esc(B.foe.n)}</b><div class="hpbar"><i id="hp" style="width:${B.hp / 3 * 100}%"></i></div>
      <small class="muted">Lös tre vågor genom att få x ensamt. Det du gör på ena sidan händer också på den andra.</small></div></div>
    <div class="me"><span class="hearts" id="hearts"></span><span class="muted">Våg ${B.k + 1} av 3 · drag: <b style="color:var(--birch)">${B.moves}</b> · minsta möjliga: ${eq.par}</span></div>
    <div class="panel stack" style="gap:8px">
      <div class="scale" aria-label="Våg">
        <div class="base"></div><div class="post"></div><div class="beam" id="beam"></div>
        <div class="pan l" id="panl"><div class="rope"></div><div class="dish">${lin(B.st.a, B.st.b)}</div></div>
        <div class="pan r" id="panr"><div class="rope"></div><div class="dish">${lin(B.st.c, B.st.d)}</div></div>
      </div>
      ${B.coach ? `<div class="coach ${B.coach.kind}" role="status">${B.coach.html}</div>` : ''}
      <div class="eyebrow" style="text-align:center">Välj vad du gör på båda sidor</div>
      <div class="ops">${B.ops.map((o, idx) => `<button class="op ${B.suggest === opLabel(o) ? 'suggest' : ''}" data-act="balop" data-arg="${idx}">${opLabel(o)}</button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn small ghost" data-act="balundo" ${B.hist.length ? '' : 'disabled'}>↶ Ångra</button><button class="btn small ghost" data-act="baltip">💡 Tips</button><button class="btn small ghost" data-act="balintro">❓ Hur gör man?</button></div>
    </div>
    <div class="panel"><div class="eyebrow">Din uträkning</div><div class="steps">
      <div><b>${lin(eq.st.a, eq.st.b)} = ${lin(eq.st.c, eq.st.d)}</b></div>
      ${B.hist.map(h => `<div><b>${lin(h.st.a, h.st.b)} = ${lin(h.st.c, h.st.d)}</b><span class="opl">(${h.label} på båda sidor)</span></div>`).join('')}
    </div></div>
  </section>`;
};
AFTER.balance = () => {
  updateBalHUD();
  const B = G.bal;
  if (B && B.flyLabel && !reduceMotion) {
    for (const id of ['#panl', '#panr']) { const d = $(id + ' .dish'); if (d) d.insertAdjacentHTML('beforeend', `<span class="opfly">${B.flyLabel}</span>`); }
  }
  if (B) B.flyLabel = null;
};
AFTER.map = () => { const n = $('.node.next') || $('.node.open:last-of-type'); if (n) setTimeout(() => n.scrollIntoView({ block: 'center', behavior: 'auto' }), 30); };
function updateBalHUD() {
  const B = G.bal; if (!B) return;
  const h = $('#hearts');
  if (h) h.innerHTML = Array.from({ length: B.maxHearts }, (_, i) => `<span class="${i < B.hearts ? '' : 'lost'}">❤️</span>`).join('') + (B.shield ? ` <span class="sh">🛡️×${B.shield}</span>` : '');
}
async function balOp(idx) {
  const B = G.bal; if (!B || B.busy) return;
  const op = B.ops[idx]; if (!op) return;
  const n = applyOp(B.st, op);
  if (!n) {
    const bad = [B.st.a, B.st.b, B.st.c, B.st.d].find(v => v % op.div !== 0);
    B.coach = { kind: 'bad', html: `${opLabel(op)} går inte jämnt ut: ${fmt(bad)} / ${fmt(op.div)} blir ett bråk. Ta först bort talen som står i vägen för x, och <b>dela sist</b>.` };
    SFX.play('wrong'); render(); shake($('.scale'));
    return;
  }
  SFX.play('click');
  const parBefore = solvePar(B.st), parAfter = solvePar(n);
  B.hist.push({ st: n, prev: B.st, label: opLabel(op) });
  B.st = n; B.moves++;
  B.flyLabel = opLabel(op);
  B.suggest = null;
  const eq = B.eqs[B.k];
  if (!solvedEq(n)) {
    if (parAfter < parBefore) {
      B.coach = { kind: 'good', html: `<b>${R.pick(['Bra drag!', 'Snyggt!', 'Rätt riktning!'])}</b> Nu står det ${eqStr(n)}.` };
    } else {
      B.coach = { kind: 'bad', html: `Vågen är fortfarande i balans, men x kom inte närmare att stå ensamt. Tryck <b>↶ Ångra</b> och prova något annat.${B.moves === eq.par + 2 ? `<br><b>Varning:</b> ett onödigt drag till och ${esc(B.foe.n)} slår till!` : ''}` };
    }
  }
  if (B.moves > eq.par + 2) {
    if (B.shield > 0) { B.shield--; toast('🛡️ Skölden skyddade dig när trollet tröttnade.'); }
    else { B.hearts--; flash(); toast(`🧌 ${B.foe.n} tappar tålamodet! Försök hitta en kortare väg.`); }
    if (B.hearts <= 0 && B.revive > 0) { B.revive--; B.hearts = 1; banner('Skogsrået räddar dig!'); }
  }
  B.ops = opsFor(B.st);
  if (balGuided() && !solvedEq(n) && B.coach.kind === 'good') { const h = balSuggest(); if (h) B.coach.html += `<br>${h.html}`; }
  render();
  $('#panl')?.classList.add('bump'); $('#panr')?.classList.add('bump');
  if (B.hearts <= 0) { await wait(500); return finishLevel(false, { w: B.w, i: B.i, stars: 0, correct: B.k, answered: 3, best: null, label: 'vågor lösta' }); }
  if (solvedEq(n)) {
    B.busy = true;
    const extra = Math.max(0, B.moves - eq.par);
    B.extraTotal += extra;
    const x = n.a === 1 ? n.d : n.b;
    await wait(250);
    banner(`x = ${fmt(x)}`, extra === 0 ? 'Perfekt! Minsta antal drag' : `${B.moves} drag (minst ${eq.par})`);
    SFX.play('right');
    const face = $('#face'); if (face) { face.classList.add('hit'); }
    B.hp--; $('#hp') && ($('#hp').style.width = B.hp / 3 * 100 + '%');
    S.stats.correct++; S.stats.answered++; quest('correct'); recordAnswer(['ekv1', 'ekv2', 'ekv2'][B.w - 1], true);
    await wait(1200);
    B.busy = false;
    if (B.hp <= 0) {
      if (B.extraTotal === 0) S.flags.bal = true;
      return finishLevel(true, { w: B.w, i: B.i, stars: B.extraTotal === 0 ? 3 : B.extraTotal <= 3 ? 2 : 1, correct: 3, answered: 3, best: null, label: 'vågor lösta' });
    }
    if (B.k === 0 && !S.flags.balTut) { S.flags.balTut = true; save(); }
    B.k++; B.st = { ...B.eqs[B.k].st }; B.hist = []; B.moves = 0; B.ops = opsFor(B.st);
    balStartCoach();
    render();
  }
}
function balUndo() {
  const B = G.bal; if (!B || !B.hist.length || B.busy) return;
  const h = B.hist.pop(); B.st = h.prev; B.ops = opsFor(B.st);
  B.suggest = null;
  B.coach = { kind: 'info', html: `Ångrat. Nu står det ${eqStr(B.st)} igen.` };
  if (balGuided()) { const t = balSuggest(); if (t) B.coach = { kind: 'hint', html: t.html }; }
  render();
}

/* ---------- Runkastet (koordinatsystem) ---------- */
const KSET = [-3, -2, -1.5, -1, -.5, .5, 1, 1.5, 2, 3];
function genTargets(mode) {
  const key = p => p.x + ',' + p.y;
  const used = new Set(['0,0']);
  const pts = [];
  const add = (x, y, line) => { const k = key({ x, y }); if (used.has(k) || Math.abs(x) > 6 || Math.abs(y) > 6) return false; used.add(k); pts.push({ x, y, alive: true, line }); return true; };
  if (mode === 'coord') {
    while (pts.length < 5) add(R.int(-6, 6), R.int(-6, 6));
    return { pts, lines: [] };
  }
  const lines = [];
  const counts = mode === 'prop' ? [2, 2, 1] : [3, 2];
  for (let li = 0; li < counts.length; li++) {
    for (let tries = 0; tries < 100; tries++) {
      const k = R.pick(KSET), m = mode === 'prop' ? 0 : R.int(-4, 4);
      if (lines.some(L => L.k === k && L.m === m)) continue;
      const xs = R.shuffle([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]).filter(x => Number.isInteger(k * x + m) && Math.abs(k * x + m) <= 6 && (mode !== 'line' || x !== 0));
      if (xs.length < counts[li]) continue;
      const before = pts.length;
      for (const x of xs) { if (pts.length - before >= counts[li]) break; add(x, k * x + m, li); }
      if (pts.length - before === counts[li]) { lines.push({ k, m }); break; }
      while (pts.length > before) { const p = pts.pop(); used.delete(key(p)); }
    }
  }
  return { pts, lines };
}
function startCannon(w, i) {
  const W = WORLDS[w - 1];
  const mode = ['coord', 'prop', 'line'][w - 1];
  const t = genTargets(mode);
  G.can = Object.assign({ w, i, mode, pts: t.pts, shots: [], x: 0, y: 0, k: 1, m: 0, misses: 0, hits: 0, foeE: W.foes[0][1], busy: false }, makeFighter());
  G.screen = 'cannon'; render();
}
function canFormula(C) {
  if (C.mode === 'coord') return `(${fmt(C.x)}, ${fmt(C.y)})`;
  if (C.mode === 'prop') return `y = ${C.k === 1 ? '' : C.k === -1 ? MINUS : fmt(C.k)}x`;
  return `y = ${lin(C.k, C.m)}`;
}
SCREENS.cannon = () => {
  const C = G.can, W = WORLDS[C.w - 1];
  const left = C.pts.filter(p => p.alive).length;
  const stepper = (id, label, val) => `<div class="stepper"><label for="${id}">${label}</label><button data-act="step" data-arg="${id}|-1" aria-label="Minska ${label}">−</button><output id="${id}">${fmt(val)}</output><button data-act="step" data-arg="${id}|1" aria-label="Öka ${label}">+</button></div>`;
  const tip = C.mode === 'coord' ? 'Första talet är x (åt höger), andra är y (uppåt). Negativa tal går åt vänster och nedåt.'
    : C.mode === 'prop' ? 'Linjen går alltid genom origo. Välj ett väsen och räkna k = y / x.'
    : 'm är där linjen skär y-axeln. Välj två väsen som ligger på rad och räkna k = Δy / Δx.';
  return `<section class="arena" id="arena">
    <div class="row" style="justify-content:space-between"><button class="back" data-act="quitask">← Fly</button><span class="muted" style="font-size:13px">${W.n} · nivå ${C.i + 1}</span></div>
    <div class="me"><span class="hearts" id="hearts"></span><span class="muted">${left} väsen kvar · missar: ${C.misses}</span></div>
    <div class="cannon">
      <canvas id="cv" width="520" height="520" aria-label="Koordinatsystem med väsen att träffa"></canvas>
      <div class="aim panel">
        <div class="eyebrow">${C.mode === 'coord' ? 'Sikta på en punkt' : 'Rikta runstrålen'}</div>
        <div class="formula" id="formula">${canFormula(C)}</div>
        ${C.mode === 'coord' ? stepper('sx', 'x', C.x) + stepper('sy', 'y', C.y) : stepper('sk', 'k', C.k) + (C.mode === 'line' ? stepper('sm', 'm', C.m) : '')}
        <button class="btn primary" data-act="fire" ${C.busy ? 'disabled' : ''}>${C.mode === 'coord' ? '✦ Kasta runan' : '✦ Skjut strålen'}</button>
        <p class="muted" style="margin:0;font-size:13px">${tip}</p>
        <p class="muted" style="margin:0;font-size:12px">Varje kast som missar kostar ett hjärta. Träffa flera på en gång för bonus!</p>
      </div>
    </div>
  </section>`;
};
AFTER.cannon = () => { drawCannon(); updateCanHUD(); };
function updateCanHUD() {
  const C = G.can; const h = $('#hearts'); if (!C || !h) return;
  h.innerHTML = Array.from({ length: C.maxHearts }, (_, i) => `<span class="${i < C.hearts ? '' : 'lost'}">❤️</span>`).join('') + (C.shield ? ` <span class="sh">🛡️×${C.shield}</span>` : '');
}
function drawCannon(anim) {
  const C = G.can, cv = $('#cv'); if (!C || !cv) return;
  const ctx = cv.getContext('2d'), S2 = 520, N = 7, u = S2 / (2 * N), cx = S2 / 2;
  const X = x => cx + x * u, Y = y => cx - y * u;
  ctx.clearRect(0, 0, S2, S2);
  ctx.lineWidth = 1;
  for (let i = -N; i <= N; i++) {
    ctx.strokeStyle = 'rgba(157,178,172,.16)';
    ctx.beginPath(); ctx.moveTo(X(i), 0); ctx.lineTo(X(i), S2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, Y(i)); ctx.lineTo(S2, Y(i)); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(236,230,214,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cx); ctx.lineTo(S2, cx); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, S2); ctx.stroke();
  ctx.fillStyle = 'rgba(236,230,214,.75)'; ctx.font = '600 13px Lexend, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let i = -6; i <= 6; i++) { if (!i) continue; ctx.fillText(fmt(i), X(i), cx + 5); }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i = -6; i <= 6; i++) { if (!i) continue; ctx.fillText(fmt(i), cx - 6, Y(i)); }
  ctx.font = '700 15px Lexend, sans-serif'; ctx.fillText('y', cx - 8, 12); ctx.textAlign = 'left'; ctx.fillText('x', S2 - 14, cx - 12);
  // tidigare skott
  for (const s of C.shots) {
    ctx.strokeStyle = s.hit ? 'rgba(95,227,179,.35)' : 'rgba(236,86,112,.35)'; ctx.lineWidth = 2;
    if (s.mode === 'coord') { ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), 10, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(X(-N), Y(s.k * -N + s.m)); ctx.lineTo(X(N), Y(s.k * N + s.m)); ctx.stroke(); }
  }
  // väsen
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  for (const p of C.pts) {
    if (!p.alive) { ctx.fillStyle = 'rgba(95,227,179,.5)'; ctx.font = '16px sans-serif'; ctx.fillText('✦', X(p.x), Y(p.y)); ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; continue; }
    ctx.fillStyle = 'rgba(12,22,24,.6)'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(C.foeE, X(p.x), Y(p.y) + 1);
  }
  // pågående skott
  if (anim) {
    ctx.strokeStyle = '#5fe3b3'; ctx.lineWidth = 5; ctx.shadowColor = '#5fe3b3'; ctx.shadowBlur = 18;
    if (anim.mode === 'coord') { ctx.beginPath(); ctx.arc(X(anim.x), Y(anim.y), 8 + anim.t * 14, 0, Math.PI * 2); ctx.stroke(); }
    else { const x1 = -N + anim.t * 2 * N; ctx.beginPath(); ctx.moveTo(X(-N), Y(anim.k * -N + anim.m)); ctx.lineTo(X(x1), Y(anim.k * x1 + anim.m)); ctx.stroke(); }
    ctx.shadowBlur = 0;
  }
}
function canStep(id, dir) {
  const C = G.can; if (!C || C.busy) return;
  if (id === 'sx') C.x = clamp(C.x + dir, -6, 6);
  if (id === 'sy') C.y = clamp(C.y + dir, -6, 6);
  if (id === 'sk') { let k = clamp(Math.round((C.k + dir * .5) * 2) / 2, -4, 4); if (k === 0) k = dir * .5; C.k = k; }
  if (id === 'sm') C.m = clamp(C.m + dir, -6, 6);
  SFX.play('click');
  const out = $('#' + id); if (out) out.textContent = fmt({ sx: C.x, sy: C.y, sk: C.k, sm: C.m }[id]);
  $('#formula').textContent = canFormula(C);
}
async function canFire() {
  const C = G.can; if (!C || C.busy) return;
  C.busy = true; $('[data-act="fire"]')?.setAttribute('disabled', '');
  SFX.play('shot');
  const shot = C.mode === 'coord' ? { mode: 'coord', x: C.x, y: C.y } : { mode: C.mode, k: C.k, m: C.mode === 'line' ? C.m : 0 };
  const dur = reduceMotion ? 1 : 420, t0 = performance.now();
  await new Promise(res => { const step = () => { const t = Math.min(1, (performance.now() - t0) / dur); drawCannon(Object.assign({ t }, shot)); if (t < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  const hits = C.pts.filter(p => p.alive && (shot.mode === 'coord' ? p.x === shot.x && p.y === shot.y : Math.abs(shot.k * p.x + shot.m - p.y) < 1e-9));
  hits.forEach(p => { p.alive = false; });
  shot.hit = hits.length > 0;
  C.shots.push(shot);
  if (hits.length) {
    C.hits += hits.length; SFX.play('right');
    S.stats.correct++; S.stats.answered++; quest('correct');
    if (C.w === 3) recordAnswer('linje', true);
    banner(hits.length >= 3 ? `${hits.length} på en gång!` : hits.length === 2 ? 'Dubbelträff!' : 'Träff!');
    if (hits.length >= 3) S.flags.snipe = true;
  } else {
    C.misses++; SFX.play('wrong'); S.stats.answered++;
    if (C.shield > 0) { C.shield--; toast('🛡️ Skölden tog smällen!'); }
    else { C.hearts--; flash(); shake($('#arena')); }
    if (C.hearts <= 0 && C.revive > 0) { C.revive--; C.hearts = 1; banner('Skogsrået räddar dig!'); }
    toast(C.mode === 'coord' ? `Ingen där. Runan landade i (${fmt(shot.x)}, ${fmt(shot.y)}).` : `Strålen ${canFormula(C)} missade. Jämför med ett väsens koordinater.`);
  }
  await wait(500);
  C.busy = false;
  const left = C.pts.filter(p => p.alive).length;
  if (C.hearts <= 0) return finishLevel(false, { w: C.w, i: C.i, stars: 0, correct: C.hits, answered: C.pts.length, best: null, label: 'väsen träffade' });
  if (!left) {
    await wait(300);
    return finishLevel(true, { w: C.w, i: C.i, stars: C.misses === 0 ? 3 : C.misses === 1 ? 2 : 1, correct: C.hits, answered: C.pts.length, best: null, label: 'väsen träffade' });
  }
  render();
}

/* ---------- Väsenboken ---------- */
SCREENS.vasen = () => {
  const slots = teamSlots();
  return `<section class="stack">
    <button class="back" data-act="hub">← Byn</button>
    <div class="screenhead"><div><div class="eyebrow">${ownedCount(S)} av ${V.length} väsen</div><h2>Väsenboken</h2></div></div>
    <div class="panel stack" style="gap:10px"><b>${tx('team', 'Ditt lag')}</b>
      <div class="slots">${[0, 1, 2].map(i => {
        if (i >= slots) return `<div class="slot">🔒<br>Låses upp på nivå ${i === 1 ? 3 : 6}</div>`;
        const id = S.team[i]; if (!id) return `<div class="slot">Tom plats<br>Välj ett väsen nedan</div>`;
        return `<div class="slot full"><span><span class="em">${VB[id].e}</span><br><b>${VB[id].n}</b></span></div>`;
      }).join('')}</div>
      <small class="muted">Väsen i laget ger dig sina krafter i strid. Dubbletter från kistor gör dina väsen starkare (max nivå 5).</small>
    </div>
    ${['l', 'e', 'r', 'c'].map(r => `<div class="stack" style="gap:8px"><h3 style="color:var(--r-${r})">${RAR[r]}</h3><div class="cards">${V.filter(v => v.r === r).map(v => vasenCard(v)).join('')}</div></div>`).join('')}
  </section>`;
};
function vasenCard(v) {
  const o = S.vasen[v.id];
  if (!o) {
    const where = v.boss ? `Besegra ${v.n} i ${WORLDS[v.boss - 1].n}` : v.r === 'l' ? 'Sover i Silver- och Guldkistor' : v.r === 'e' ? 'Finns oftast i Guldkistor' : 'Finns i alla kistor';
    return `<div class="card c-${v.r} unknown"><span class="em">${v.e}</span><span class="nm">???</span><span class="rar">${RAR[v.r]}</span><span class="ab">${where}</span></div>`;
  }
  const inTeam = S.team.includes(v.id);
  return `<div class="card c-${v.r} ${v.r === 'l' ? 'l' : ''} ${inTeam ? 'inteam' : ''}">${inTeam ? '<span class="tag">I LAGET</span>' : ''}
    <span class="em">${v.e}</span><span class="nm">${v.n}</span><span class="rar">${RAR[v.r]}</span>
    <span class="lv">${'★'.repeat(o.l)}${'☆'.repeat(5 - o.l)}</span>
    ${o.l < 5 ? `<div class="shard" title="${o.s} / ${o.l} dubbletter till nästa nivå"><i style="width:${o.s / o.l * 100}%"></i></div>` : '<small class="muted">Maxnivå</small>'}
    <span class="ab">${fxText(v.fx(o.l))}</span>
    ${powerLine(v.id, o.l)}
    <span class="ab" style="font-style:italic">${esc(v.lore)}</span>
    <button class="btn small ${inTeam ? 'ghost' : 'primary'}" data-act="team" data-arg="${v.id}">${inTeam ? 'Ta ur laget' : 'Till laget'}</button></div>`;
}
function toggleTeam(id) {
  const i = S.team.indexOf(id);
  if (i >= 0) { if (S.team.length === 1) { toast('Du behöver minst ett väsen i laget.'); return; } S.team.splice(i, 1); }
  else { if (S.team.length >= teamSlots()) S.team[teamSlots() - 1] = id; else S.team.push(id); }
  S.team = S.team.slice(0, teamSlots());
  save(); render();
}

/* ---------- Kistor ---------- */
SCREENS.chests = () => `<section class="stack">
  <button class="back" data-act="hub">← Byn</button>
  <div class="screenhead"><div><div class="eyebrow">Du har ${S.gold} guld</div><h2>Kistor</h2></div></div>
  <div class="chests">${Object.entries(CHESTS).map(([k, c]) => `<div class="chest"><span class="ic">${c.e}</span><b>${c.n}</b>
    <span class="odds">${Object.entries(c.odds).filter(([, p]) => p > 0).map(([r, p]) => `${RAR[r]} ${p} %`).join(' · ')}</span>
    <span>Du har: <b>${S.chests[k]}</b></span>
    <div class="row" style="justify-content:center"><button class="btn primary small" data-act="openchest" data-arg="${k}" ${S.chests[k] ? '' : 'disabled'}>Öppna</button>
    <button class="btn gold small" data-act="buychest" data-arg="${k}" ${S.gold >= c.cost ? '' : 'disabled'}>Köp · ${c.cost} 🪙</button></div></div>`).join('')}</div>
  <p class="muted" style="margin:0">Du får kistor när du går upp i nivå, samlar stjärnor i varje värld, klarar alla dagens uppdrag och besegrar bossar. Bossarnas legendariska väsen får du bara genom att besegra dem.</p>
</section>`;
function openChest(type) {
  if (!S.chests[type]) return;
  S.chests[type]--; S.stats.chests++; quest('chest');
  const id = rollChest(type);
  const res = grantVasen(id);
  checkAch(); save();
  const v = VB[id];
  const ov = document.createElement('div');
  ov.className = 'reveal';
  ov.innerHTML = `<div class="inner"><button class="box" id="box" aria-label="Öppna kistan">${CHESTS[type].e}</button><p class="muted">Tryck på kistan!</p></div>`;
  document.body.appendChild(ov);
  let taps = 0;
  const box = ov.querySelector('#box');
  box.focus();
  box.addEventListener('click', () => {
    taps++; SFX.play('click'); box.classList.add('shake2');
    if (taps < 3 && !reduceMotion) return;
    SFX.play('chest');
    if (v.r === 'l' || v.r === 'e') confetti(v.r === 'l' ? 160 : 80);
    ov.innerHTML = `<div class="inner c-${v.r}"><div class="rays"></div>
      <div class="card c-${v.r} ${v.r === 'l' ? 'l' : ''}">${res.isNew ? '<span class="tag">NY!</span>' : ''}<span class="em">${v.e}</span><span class="nm">${v.n}</span><span class="rar">${RAR[v.r]}</span>
      <span class="ab">${fxText(v.fx(S.vasen[id].l))}</span>${powerLine(id, S.vasen[id].l)}<span class="ab" style="font-style:italic">${esc(v.lore)}</span></div>
      <p style="margin:0;font-weight:600">${res.isNew ? 'Ett nytt väsen till Väsenboken!' : res.maxed ? `Redan på maxnivå: +${res.gold} guld` : res.leveled ? `Dubblett! ${v.n} nådde nivå ${res.l}!` : `Dubblett! ${S.vasen[id].s} / ${S.vasen[id].l} mot nästa nivå`}</p>
      <div class="row" style="justify-content:center">${res.isNew && !S.team.includes(id) ? `<button class="btn primary" data-close="team" data-id="${id}">Sätt i laget</button>` : ''}<button class="btn ${res.isNew && !S.team.includes(id) ? 'ghost' : 'primary'}" data-close="ok">Fortsätt</button></div></div>`;
    ov.addEventListener('click', e => {
      const btn = e.target.closest('[data-close]'); if (!btn) return;
      if (btn.dataset.close === 'team') { if (S.team.length < teamSlots()) S.team.push(id); else S.team[teamSlots() - 1] = id; save(); }
      ov.remove(); render();
    });
    ov.querySelector('[data-close]')?.focus();
  });
}

/* ---------- Medaljer ---------- */
SCREENS.medals = () => `<section class="stack">
  <button class="back" data-act="hub">← Byn</button>
  <div class="screenhead"><div><div class="eyebrow">${Object.keys(S.ach).length} av ${ACH.length}</div><h2>Medaljer</h2></div></div>
  <div class="medals">${ACH.map(a => `<div class="medal ${S.ach[a.id] ? 'on' : ''}"><span class="ic">${a.ic}</span><div><b>${a.n}</b><small>${a.d}</small></div></div>`).join('')}</div>
  <div class="panel"><b>Statistik</b><p class="muted" style="margin:6px 0 0">Rätta svar: ${S.stats.correct} · Besvarade: ${S.stats.answered} · Träffsäkerhet: ${S.stats.answered ? Math.round(S.stats.correct / S.stats.answered * 100) : 0} % · Bästa combo: ${S.stats.bestStreak} · Segrar: ${S.stats.wins} · Kistor: ${S.stats.chests} · Bästa våning: ${S.tower.best}</p></div>
</section>`;

/* ---------- Övningsgläntan ---------- */
SCREENS.practice = () => {
  if (G.prac && G.prac.q) return practiceQ();
  return `<section class="stack">
    <button class="back" data-act="hub">← Byn</button>
    <div class="screenhead"><div><div class="eyebrow">Ingen tidspress · inga hjärtan</div><h2>Övningsgläntan</h2></div>
      <div class="seg" role="group" aria-label="Svårighet">${[1, 2, 3].map(d => `<button class="${(G.pracD || 1) === d ? 'sel' : ''}" data-act="pracd" data-arg="${d}">${['Lätt', 'Mellan', 'Svår'][d - 1]}</button>`).join('')}</div></div>
    ${(S.revenge || []).length ? `<div class="panel row" style="justify-content:space-between"><div><b>🔁 Revanschfrågor</b><p class="muted" style="margin:2px 0 0">${S.revenge.length} ${S.revenge.length === 1 ? 'fråga' : 'frågor'} du svarat fel på väntar. Varje klarad revansch ger +10 guld.</p></div><button class="btn gold" data-act="pracrevenge">Ta revansch</button></div>` : ''}
    <p class="muted" style="margin:0;max-width:62ch">Välj ett område. Medaljen visar hur säker du är: 🥉 brons, 🥈 silver och 🥇 guld bygger på dina senaste 20 svar, i strider och här.</p>
    ${[7, 8, 9].map(g => `<div class="stack" style="gap:8px"><h3>Åk ${g}</h3><div class="topics">${Object.values(T).filter(t => t.grade === g).map(t => {
      const m = S.mastery[t.id], acc = masteryAcc(t.id), med = masteryMedal(S, t.id);
      return `<button class="topicbtn" data-act="practopic" data-arg="${t.id}"><span class="ic">${t.icon}</span><span><b>${t.name}</b><small>${m ? `${m.n} svar · ${Math.round(acc * 100)} % senaste` : 'Inte testat än'}</small><div class="mbar"><i style="width:${acc === null ? 0 : acc * 100}%"></i></div></span><span class="medalpip">${['', '🥉', '🥈', '🥇'][med]}</span></button>`;
    }).join('')}</div></div>`).join('')}
  </section>`;
};
function practiceNext() {
  const P = G.prac;
  let q;
  if (P.revenge) {
    const list = S.revenge || [];
    if (!list.length || P.n >= P.total) { G.prac = null; toast(list.length ? `🔁 Bra jobbat! ${list.length} revanscher finns kvar till nästa gång.` : '🔁 Alla revanscher klara!'); render(); return; }
    const r = list[0];
    q = Object.assign({}, r.q, { opts: R.shuffle(r.q.opts), topic: r.t, d: r.d, revenge: true });
  } else { q = T[P.topic].gen(P.d); q.topic = P.topic; q.d = P.d; }
  P.q = q; P.done = false; P.write = P.write && q.write;
  render();
}
function practiceQ() {
  const P = G.prac, q = P.q;
  return `<section class="stack">
    <div class="row" style="justify-content:space-between"><button class="back" data-act="pracexit">← Alla områden</button><span class="muted">${P.revenge ? `Revansch ${Math.min(P.n + (P.done ? 0 : 1), P.total)} av ${P.total} · ` : ''}Rätt: ${P.right} / ${P.n}</span></div>
    ${qcardHTML(q)}
    ${P.done ? explainHTML(q, false, P.typed, P.ok) + `<button class="btn primary" data-act="pracnext" id="pracnext">Nästa fråga</button>`
      : answersHTML(q, [], P.write) + (q.write ? `<div class="tools"><button class="toggle ${P.write ? 'on' : ''}" data-act="pracwrite">✍ Skriv svaret själv</button></div>` : '')}
  </section>`;
}
AFTER.practice = () => { if (G.prac && G.prac.q && !G.prac.done && G.prac.write) $('#wans')?.focus(); if (G.prac && G.prac.done) $('#pracnext')?.focus({ preventScroll: true }); };
function practiceAnswer(idx, typed) {
  const P = G.prac; if (!P || P.done) return;
  const q = P.q;
  const ok = isRight(q, idx !== null ? q.opts[idx] : null, typed);
  P.n++; if (ok) { P.right++; quest('practice'); quest('correct'); quest('topic', 1, q.topic); S.stats.correct++; addXP(4); if (q.revenge) addGold(10); }
  S.stats.answered++;
  recordAnswer(q.topic, ok);
  if (P.revenge && !ok) { const i = S.revenge.findIndex(r => r.q.q === q.q); if (i >= 0) S.revenge.push(S.revenge.splice(i, 1)[0]); }
  trackRevenge(q, ok);
  P.ok = ok; P.typed = typed; P.done = true;
  SFX.play(ok ? 'right' : 'wrong');
  checkAch(); save();
  render();
}

/* ---------- Dialoger ---------- */
function modal(html) {
  const m = document.createElement('div');
  m.className = 'modal'; m.innerHTML = `<div class="panel">${html}</div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; const a = b.dataset.m; m.remove(); if (MODAL_ACT[a]) MODAL_ACT[a](); });
  m.querySelector('[data-m]')?.focus();
  return m;
}
const MODAL_ACT = {
  quit: () => { const b = G.b; if (b && b.kind === 'tower') return finishTower(); G.b = null; G.bal = null; G.can = null; go('hub'); },
  resume: () => { if (G.b && !G.b.locked) { G.b.tStart += performance.now() - (G.pausedAt || performance.now()); startTimer(); } },
  balintro: () => { S.flags.balIntro = true; save(); },
  reset: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = null; G.setup = { grade: 7, starter: null, name: '' }; go('setup'); },
  battleintro: () => { if (G.introDone) { const f = G.introDone; G.introDone = null; f(); } },
  close: () => { }
};
function showLoginBonus() {
  G.loginBonus = false;
  const day = ((S.login.streak - 1) % 7) + 1;
  const gold = 30 + day * 10;
  addGold(gold);
  let extra = '';
  if (day === 7) { S.chests.silver++; extra = ' och en Silverkista'; }
  checkAch(); save(); renderTop();
  modal(`<div class="eyebrow">Dagsbonus</div><h2>Välkommen tillbaka${S.name ? ', ' + esc(S.name) : ''}!</h2>
    <div class="days">${[1, 2, 3, 4, 5, 6, 7].map(d => `<span class="${d <= day ? 'on' : ''}">Dag ${d}</span>`).join('')}</div>
    <p style="margin:0">Du spelar ${S.login.streak} ${S.login.streak === 1 ? 'dag' : 'dagar'} i rad och får <b style="color:var(--ember)">${gold} guld</b>${extra}.</p>
    <p class="muted" style="margin:0;font-size:13px">Dag 7 i rad ger en Silverkista.</p>
    <button class="btn primary" data-m="close">Tack!</button>`);
  SFX.play('coin');
}

/* ===== Händelser ===== */
const ACT = {
  hub: () => { if (G.screen === 'setup') return; if (G.b || G.bal || G.can) return ACT.quitask(); go('hub'); },
  sound: () => { S.sound = !S.sound; save(); renderTop(); SFX.play('click'); },
  pickgrade: a => { G.setup.name = $('#pname')?.value || G.setup.name; G.setup.grade = Number(a); render(); },
  pickstarter: a => { G.setup.name = $('#pname')?.value || G.setup.name; G.setup.starter = a; render(); },
  begin: () => {
    const st = G.setup; if (!st.starter) return;
    const name = ($('#pname')?.value || '').trim().slice(0, 18);
    S = newState(name, st.grade, st.starter);
    G.mapWorld = st.grade - 6;
    dailyCheck(); G.loginBonus = false;
    save(); SFX.play('win');
    go('hub');
    toast(`Välkommen, <b>${esc(S.name)}</b>! Du har fått en Träkista. Öppna den under Kistor.`, 5000);
    if (cloud.doc) pushCloud();
  },
  map: a => go('map', a),
  lockedlvl: () => toast('Klara nivån innan för att låsa upp den här.'),
  play: a => { const [w, i] = a.split('-').map(Number); if (!levelOpen(w, i)) return ACT.lockedlvl(); startLevel(w, i); },
  cont: () => { const b = G.b; if (!b) return; if (b.hearts <= 0) return b.kind === 'tower' ? finishTower() : finishLevel(false); nextQuestion(); },
  writemode: () => { const b = G.b; if (!b || b.locked) return; b.write = !b.write; renderQ(); },
  hint: () => {
    const b = G.b; if (!b || b.locked || b.hints <= 0 || b.write) return;
    b.hints--;
    const wrong = b.q.opts.map((o, i) => i).filter(i => b.q.opts[i] !== b.q.a && !b.removed.includes(i));
    b.removed.push(...R.shuffle(wrong).slice(0, 2));
    renderQ(); SFX.play('click');
  },
  quitask: () => {
    G.pausedAt = performance.now(); stopTimer();
    const tower = G.b && G.b.kind === 'tower';
    modal(`<h3>${tower ? 'Lämna tornet?' : 'Fly från striden?'}</h3><p class="muted" style="margin:0">${tower ? 'Du får belöningen för våningarna du klarat.' : 'Du får ingen belöning för den här nivån.'}</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-m="resume">Stanna kvar</button><button class="btn ghost" data-m="quit">${tower ? 'Lämna' : 'Fly'}</button></div>`);
  },
  claimq: a => {
    const q = S.daily.q[Number(a)]; if (!q || !q.done || q.claimed) return;
    q.claimed = true; const g = addGold(QUESTS[q.id].gold); SFX.play('coin'); toast(`+${g} guld`);
    if (!S.daily.bonus && S.daily.q.every(x => x.claimed)) { S.daily.bonus = true; S.chests.tra++; toast('🎁 Alla dagens uppdrag klara: <b>Träkista</b>!', 4500); }
    save(); render();
  },
  claimms: a => { const [key, type] = a.split('|'); if (S.claimedMs[key]) return; S.claimedMs[key] = true; S.chests[type]++; SFX.play('coin'); toast(`${CHESTS[type].e} <b>${CHESTS[type].n}</b> tillagd under Kistor.`); save(); render(); },
  vasen: () => go('vasen'),
  team: a => toggleTeam(a),
  chests: () => go('chests'),
  openchest: a => openChest(a),
  buychest: a => { const c = CHESTS[a]; if (S.gold < c.cost) return; S.gold -= c.cost; S.chests[a]++; save(); SFX.play('coin'); render(); },
  medals: () => go('medals'),
  tower: () => { if (S.level < 2) return toast('Runtornet låses upp när du når nivå 2.'); startTower(); },
  practice: () => { G.prac = null; go('practice'); },
  pracd: a => { G.pracD = Number(a); render(); },
  practopic: a => { G.prac = { topic: a, d: G.pracD || (masteryAcc(a) > .8 ? 2 : 1), n: 0, right: 0, write: false }; G.screen = 'practice'; practiceNext(); window.scrollTo({ top: 0 }); },
  pracnext: () => practiceNext(),
  pracexit: () => { G.prac = null; render(); },
  pracwrite: () => { G.prac.write = !G.prac.write; render(); },
  balop: a => balOp(Number(a)),
  balundo: () => balUndo(),
  baltip: () => balTip(),
  power: a => usePower(a),
  tipok: () => showNextTip(),
  pracrevenge: () => { G.prac = { revenge: true, total: Math.min(10, (S.revenge || []).length), d: 1, n: 0, right: 0, write: false }; G.screen = 'practice'; practiceNext(); window.scrollTo({ top: 0 }); },
  balintro: () => balIntro(),
  step: a => { const [id, d] = a.split('|'); canStep(id, Number(d)); },
  fire: () => canFire(),
  resetask: () => modal(`<h3>Byta spelare?</h3><p class="muted" style="margin:0">All framgång för ${esc(S.name)} på den här enheten raderas och går inte att få tillbaka.</p>
    <div class="row" style="justify-content:center"><button class="btn primary" data-m="close">Avbryt</button><button class="btn ghost" data-m="reset">Radera och börja om</button></div>`)
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el.dataset.arg, el); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form="write"]'); if (!f) return;
  e.preventDefault();
  const val = ($('#wans')?.value || '').trim(); if (!val) return;
  if (G.screen === 'battle') answer(null, false, val);
  else if (G.screen === 'practice') practiceAnswer(null, val);
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input')) return;
  if (document.querySelector('.modal, .reveal')) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 4) {
    if (G.screen === 'battle' && G.b && !G.b.locked && !G.b.write) { const btn = $$('.ans')[n - 1]; if (btn && !btn.classList.contains('gone')) answer(n - 1); }
    else if (G.screen === 'practice' && G.prac && G.prac.q && !G.prac.done && !G.prac.write) practiceAnswer(n - 1);
  }
});
// svarsknappar i övningsläget går via egen handler
ACT.ans = a => { if (G.screen === 'practice') return practiceAnswer(Number(a)); answer(Number(a)); };

/* ===== Bakgrund ===== */
function drawBackdrop() {
  const sv = $('#forestsvg');
  if (sv && TH.backdrop === 'peaks') {
    // taggiga fjälltoppar i två lager + glödande gnistor som stiger
    let s = '';
    [['#0d1424', 120, 14], ['#070a12', 80, 9]].forEach(([col, hMax, steps]) => {
      let pts = '0,160', x = 0;
      while (x < 1200) { x += 40 + Math.random() * 70; pts += ` ${x},${160 - (hMax * .35 + Math.random() * hMax * .65)}`; x += 30 + Math.random() * 50; pts += ` ${x},${160 - Math.random() * steps * 3}`; }
      s += `<polygon fill="${col}" points="${pts} 1200,160"/>`;
    });
    sv.innerHTML = s;
    const sb = $('#starsbg');
    if (sb && !reduceMotion) sb.innerHTML = Array.from({ length: 26 }, () => `<i class="ember" style="left:${Math.random() * 100}%;animation-duration:${7 + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s;--drift:${(Math.random() - .5) * 120}px"></i>`).join('');
    return;
  }
  if (sv) {
    let s = '';
    for (let layer = 0; layer < 2; layer++) {
      const col = layer ? '#0a1315' : '#11211f';
      let x = -20;
      while (x < 1220) {
        const w = 26 + Math.random() * 30, h = (layer ? 70 : 100) + Math.random() * (layer ? 50 : 55);
        s += `<polygon fill="${col}" points="${x},160 ${x + w / 2},${160 - h} ${x + w},160"/>`;
        x += w * (.55 + Math.random() * .3);
      }
    }
    sv.innerHTML = s;
  }
  const sb = $('#starsbg');
  if (sb) sb.innerHTML = Array.from({ length: 50 }, () => `<i style="position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 55}%;width:2px;height:2px;border-radius:50%;background:#ece6d6;opacity:${.15 + Math.random() * .45}"></i>`).join('');
}

/* ===== Start ===== */
function boot() {
  drawBackdrop();
  S = loadLocal();
  if (S) { dailyCheck(); G.screen = 'hub'; } else G.screen = 'setup';
  render();
  initCloud();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
