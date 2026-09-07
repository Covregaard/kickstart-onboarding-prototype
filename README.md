# Kickstart – klikkbare prototyper

Mobilprototyper for flyter vi jobber med. Forsiden er en meny; hver prototype
ligger i sin egen mappe. Norsk og engelsk, med språkvelger.

**Dette er designprototyper.** De lagrer ingenting, sender ingenting og har
ingen backend. Alt en tester taster inn forsvinner når fanen lukkes.

## Struktur

```
index.html              Meny – oversikt over prototypene
onboarding/index.html   Onboarding etter påmelding (9 skjermer)
assets/kickstart.css    Delt design-system (farger, typografi, komponenter)
assets/ks.js            Delt: tilgangskode, språkvalg, oversetting
```

Farger og typografi er hentet fra kickstart.no sine egne CSS-variabler:
navy `#182436`, lime `#f7fe75`, krem `#fffee9`, GT Planar (overskrifter,
vekt 300) med Inter som brødtekst og fallback.

## Tilgang

Sidene er sperret med en enkel tilgangskode. Koden ligger i `assets/ks.js`
og er ment å holde tilfeldige besøkende ute — **den er ikke ekte sikkerhet.**
Bruk aldri et passord dere bruker andre steder.

Lenke som åpner direkte: `.../#kickstart26`

Bytt kode: søk etter `ACCESS_CODE` i `assets/ks.js`, endre verdien, commit og
push. GitHub Pages oppdaterer seg selv i løpet av et minutt eller to.

## Legge til en ny prototype

1. Lag mappa, f.eks. `ukesrapport/`, og kopier `onboarding/index.html` som mal.
2. Pek på det delte oppsettet: `../assets/kickstart.css` og `../assets/ks.js`.
3. Legg tekstene dine inn med `KS.addDict({ ...norsk }, { ...english })` og
   merk markup med `data-i18n="nøkkel"` (`data-i18n-ph` for placeholder,
   `data-i18n-aria` for aria-label). Avslutt med `KS.init()`.
4. Tegner du noe med JavaScript, registrer `KS.onLang(fn)` så det tegnes på
   nytt ved språkbytte.
5. Legg til et kort i `index.html` og flytt det fra «Kommer» til «Klar til test».

## Språk

Førstevalget følger nettleseren: norsk for `nb`/`nn`/`no`, ellers engelsk.
Valget huskes i `localStorage` og gjelder på tvers av prototypene.

## Cache

Filreferansene i HTML-en er versjonert (`assets/kickstart.css?v=2`). GitHub
Pages lar nettleseren cache dem i noen minutter, så **bump tallet når du
endrer CSS eller JS** — ellers ser testere den gamle versjonen en stund.
