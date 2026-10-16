// Bygger spelet till en enda HTML-fil.
//   index.html                     – fristående sida (öppna direkt i webbläsaren eller via GitHub Pages)
//   dist/vasen-och-variabler.html  – sidinnehåll utan <html>/<head>, för publicering som Claude-artifact
const fs = require('fs');
const path = require('path');

const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const gen = src('gen.js').split('\n').filter(l => !l.startsWith('if (typeof module')).join('\n');
const body = `${src('head.html')}<script>\n${gen}\n${src('game.js')}</script>\n`;

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

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'vasen-och-variabler.html'), body);
fs.writeFileSync(path.join(__dirname, 'index.html'), page);

// syntaxkontroll av det sammanslagna skriptet
new Function(body.split('<script>')[1].split('</script>')[0]);
console.log(`Byggt: index.html (${(page.length / 1024).toFixed(0)} kB) och dist/vasen-och-variabler.html`);
