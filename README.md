# Kickstart – klikkbare prototyper

Mobilprototyper for flyter vi jobber med. Forsiden er en meny; hver prototype
ligger i sin egen mappe. Norsk og engelsk, med språkvelger.

**Dette er designprototyper.** De lagrer ingenting, sender ingenting og har
ingen backend. Alt en tester taster inn forsvinner når fanen lukkes.

## Struktur

```
index.html              Meny – oversikt over prototypene
onboarding/index.html   Onboarding etter påmelding (9 skjermer)
ukesrapport/index.html  Ukentlig innsjekk (10 skjermer, to veier inn)
assets/kickstart.css    Delt design-system (farger, typografi, komponenter)
assets/ks.js            Delt: tilgangskode, språkvalg, oversetting
```

## Designsystem

Prototypene følger designsystemet **Kickstart Health** (skillen `kickstart-design`
på claude.ai). `assets/kickstart.css` bruker designsystemets egne tokennavn –
`--brand-primary`, `--surface-cream`, `--text-tertiary`, `--radius-pill` osv. –
og komponentreglene for knapper, skjemafelt og badges. Bruk de samme navnene i
nye prototyper.

Designsystemet har ingen app-mønstre (stegindikator, valgkort, merkelapper,
skala, teller, oppsummering). Disse er laget av de samme tokenene og merket
«tilpasset for app» i stilarket. Det har heller ikke mørkt tema.

**Fonter:** GT Planar er en lisensiert Grilli Type-font som Kickstart har lisens
på. Den lastes fra kickstart.no (serveren tillater det med CORS), og fontfilene
skal **ikke** legges i dette repoet – det er offentlig. Inter kommer fra
Google Fonts. Logoen lastes også fra kickstart.no.

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

**Norsk er standard.** EN-bryteren står alltid i toppen — også på låseskjermen —
og valget huskes i `localStorage` på tvers av prototypene.

## Eksempeldata

Ukesrapporten viser en trend over egenvurderingen og en vektendring. Ukene før
denne er hardkodet eksempeldata (`HISTORY` og `LAST_WEIGHT` øverst i skriptet),
og er merket som det i grensesnittet. Det er ingen backend bak noen av tallene.

## Cache

Filreferansene i HTML-en er versjonert (`assets/kickstart.css?v=11`). GitHub
Pages lar nettleseren cache dem i noen minutter, så **bump tallet når du
endrer CSS eller JS** — ellers ser testere den gamle versjonen en stund.

## Tilbakemelding fra ansatte

Nederst på hver side ligger en mørk linje som viser hvilken skjerm du står på,
med en **Kommenter**-knapp. Linja er bevisst mørk og lik i begge temaer, så den
ikke forveksles med prototypen over.

Hver skjerm har sin egen lenke, så en kommentar kan peke rett på skjermen den
gjelder:

```
.../ukesrapport/?kode=kickstart26#steg-4
```

Adressefeltet oppdaterer seg mens du klikker deg gjennom — kopier lenken der og
del den, så åpner mottakeren nøyaktig samme skjerm.

### Google Skjema

Knappen åpner skjemaet **Ukesrapport – tilbakemelding** med **Skjerm** og
**Lenke** ferdig utfylt, så den ansatte bare skriver navn og kommentar.
Feltene er koblet på i `assets/review.js`:

| Felt | entry-ID |
|---|---|
| Skjerm | `entry.501586322` |
| Lenke | `entry.878069715` |
| Navn | `entry.187012233` (fylles av den ansatte) |
| Kommentar | `entry.1849973500` (fylles av den ansatte) |

Skal du bytte til et annet skjema, finner du de nye ID-ene slik:

1. Lag et Google Skjema med fire spørsmål, i denne rekkefølgen:
   **Skjerm** (kort svar), **Lenke** (kort svar), **Navn** (kort svar),
   **Kommentar** (langt svar).
2. Trykk ⋮ → **Få forhåndsutfylt lenke**. Skriv hva som helst i Skjerm og Lenke,
   og trykk **Få lenke**.
3. Den kopierte adressen ser slik ut:
   `.../viewform?usp=pp_url&entry.1234567=Skjerm&entry.7654321=Lenke`
4. Åpne `assets/review.js` og fyll inn `FORM` øverst:
   `url` er alt fram til og med `viewform`, og de to `entry.`-ID-ene i
   `screenField` og `linkField`.
5. Bump `?v=` i de tre HTML-filene, commit og push.

Er skjemaet ikke koblet på, kopierer knappen skjermnavn og lenke til
utklippstavla i stedet — så den gjør fortsatt nytte fra dag én.
