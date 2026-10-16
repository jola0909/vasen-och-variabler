# Väsen & Variabler

Ett matematikäventyr för årskurs 7, 8 och 9, på svenska. Mörkskogen, fjällen och Dimsjön har tagits över av vilda väsen ur den nordiska folktron. Med matematik som magi besegrar eleven dem, löser trollens vågar och samlar väsen till sitt lag.

Spelet är en enda HTML-fil utan beroenden. Öppna `index.html` i en webbläsare för att spela.

## Spelet

- **Tre världar, en per årskurs.** Mörkskogen (åk 7), Fjällvidderna (åk 8) och Dimsjön (åk 9). Varje värld har 10 nivåer och avslutas med en boss i tre faser: Skogsrået, Bergakungen och Näcken.
- **Strider.** Rätt svar skadar väsendet. Snabba svar ger blixtskada, flera rätt i rad bygger en combo, och den som skriver in svaret själv i stället för att välja gör dubbel skada. Fel svar kostar ett hjärta och visar en lösning steg för steg.
- **Vågpussel.** Ekvationer som en balansvåg: gör samma sak på båda sidor tills x står ensamt. Färre drag ger fler stjärnor.
- **Runkastet.** Träffa väsen i ett koordinatsystem med koordinater (åk 7), y = kx (åk 8) eller y = kx + m (åk 9). En linje genom flera väsen träffar alla på en gång.
- **Samla väsen.** 25 väsen i fyra sällsyntheter, från Gårdstomten till Lindormen. De kommer ur kistor, och dubbletter gör dem starkare. Upp till tre väsen i laget ger förmågor i strid. Bossarnas legendariska väsen får man bara genom att besegra dem.
- **Progression.** Stjärnor (90 totalt) låser upp kistor, spelarnivåer ger titlar och fler platser i laget, Runtornet är ett läge utan slut, och varje dag finns tre nya uppdrag, en dagsbonus och 20 medaljer att jaga.
- **Övningsgläntan.** Träning utan tidspress per område, med brons, silver och guld för hur säker eleven är.

## Matematiken

Uppgifterna genereras slumpmässigt inom det centrala innehållet i Lgr22, med decimalkomma och felsvar som bygger på vanliga missuppfattningar. Spelet väljer oftare de områden där eleven har svårast.

| Årskurs | Områden |
| --- | --- |
| 7 | Negativa tal, prioriteringsregler, bråk, decimaltal, procent, ekvationer, area och omkrets, lägesmått, enheter, koordinatsystem |
| 8 | Potenser, förändringsfaktor, ekvationer med x på båda sidor, algebraiska uttryck, Pythagoras sats, sannolikhet, skala, cirklar och volym, proportionalitet |
| 9 | Räta linjens ekvation, funktioner, ekvationssystem, kvadratrötter, grundpotensform, upprepad procentuell förändring, sannolikhet i flera steg, kvadrerings- och konjugatregeln, likformighet |

## Sparning

Framstegen sparas i webbläsarens `localStorage`. När spelet körs som Claude-artifact sparas det dessutom i molnet för inloggade spelare.

## Utveckling

Källkoden ligger i `src/`:

- `src/head.html` – titel, stilar och sidans grundstruktur
- `src/gen.js` – frågegeneratorerna för alla 26 områden
- `src/game.js` – spelmotorn: strider, våg, kast, väsen, kistor, uppdrag och sparning

Kräver Node.js.

```bash
npm test
```

```bash
npm run build
```

`npm test` slumpar fram 31 200 frågor och kontrollerar att alla har fyra unika alternativ, rätt svar bland dem och ett skrivsvar som går att tolka. `npm run build` slår ihop källfilerna till `index.html` och `dist/vasen-och-variabler.html`.
