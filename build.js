// Bygger spelet till fristående HTML-filer, en per tema (skin). Spelmotor och frågor är gemensamma.
//   index.html, arena/index.html          – fristående sidor (öppna direkt eller via GitHub Pages)
//   dist/<namn>.html                      – sidinnehåll utan <html>/<head>, för publicering som Claude-artifact
const fs = require('fs');
const path = require('path');

const THEMES = [
  { theme: 'klassisk', page: 'index.html', artifact: 'vasen-och-variabler.html' },
  { theme: 'arena', page: 'arena/index.html', artifact: 'vasen-arena.html' }
];

const read = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const gen = read('gen.js').split('\n').filter(l => !l.startsWith('if (typeof module')).join('\n');
const game = read('game.js');
const out = f => { const p = path.join(__dirname, f); fs.mkdirSync(path.dirname(p), { recursive: true }); return p; };

for (const t of THEMES) {
  const body = `${read(`themes/${t.theme}.html`)}<script>\n${gen}\n${game}</script>\n`;
  const page = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head>
<body>
${body}</body>
</html>
`;
  // syntaxkontroll av alla skript på sidan
  for (const m of body.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(m[1]);
  fs.writeFileSync(out(path.join('dist', t.artifact)), body);
  fs.writeFileSync(out(t.page), page);
  console.log(`Byggt ${t.theme}: ${t.page} (${(page.length / 1024).toFixed(0)} kB) och dist/${t.artifact}`);
}
