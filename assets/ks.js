/* ==========================================================================
   Kickstart – delt modul for prototypene
   Håndterer tilgangskode, språkvalg (no/en) og oversetting av markup.

   Bruk fra en side:
     <script src="../assets/ks.js"></script>   (i <head>)
     ...
     <script>
       KS.addDict({ nokkel: "norsk tekst" }, { nokkel: "english text" });
       KS.onLang(function (lang) { ...tegn dynamisk innhold på nytt... });
       KS.init();
     </script>

   Marker tekst i HTML slik:
     <span data-i18n="nokkel">norsk tekst</span>   → textContent
     <input data-i18n-ph="nokkel">                 → placeholder
     <button data-i18n-aria="nokkel">              → aria-label
   ========================================================================== */

window.KS = (function () {
  "use strict";

  /* =======================================================================
     TILGANGSKODE — endre verdien under for å bytte kode.
     Merk: dette er en enkel sperre mot tilfeldige besøkende, ikke ekte
     sikkerhet. Koden ligger i kildekoden og kan leses av den som ser etter.
     Prototypene inneholder ingen persondata, så det er ingenting å lekke.
     ======================================================================= */
  var ACCESS_CODE = "kickstart26";

  var LANG_KEY = "ks-lang";
  var OPEN_KEY = "ks-open";

  /* Felles tekster: låseskjerm og navigasjon. Sidene legger til sine egne. */
  var dict = {
    no: {
      "gate.eyebrow":  "Kickstart · Prototyper",
      "gate.title":    "Klikkbar prototype",
      "gate.lede":     "Prototypene er under arbeid og deles bare med utvalgte. Skriv inn koden du har fått for å åpne dem.",
      "gate.label":    "Tilgangskode",
      "gate.submit":   "Åpne",
      "gate.error":    "Feil kode. Sjekk lenken eller meldingen du fikk fra Kickstart.",
      "gate.fine":     "Prototypene lagrer ingenting. Alt du taster inn forsvinner når du lukker fanen.",
      "nav.back":      "Tilbake",
      "nav.menu":      "Alle prototyper",
      "lang.label":    "Språk"
    },
    en: {
      "gate.eyebrow":  "Kickstart · Prototypes",
      "gate.title":    "Clickable prototype",
      "gate.lede":     "These prototypes are work in progress and shared with a small group. Enter the code you were given to open them.",
      "gate.label":    "Access code",
      "gate.submit":   "Open",
      "gate.error":    "Wrong code. Check the link or message you got from Kickstart.",
      "gate.fine":     "Nothing is stored. Anything you type disappears when you close the tab.",
      "nav.back":      "Back",
      "nav.menu":      "All prototypes",
      "lang.label":    "Language"
    }
  };

  var lang = "no";
  var listeners = [];

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* privat vindu */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function markOpen() {
    try { sessionStorage.setItem(OPEN_KEY, "1"); } catch (e) { /* privat vindu */ }
  }
  function wasOpened() {
    try { return sessionStorage.getItem(OPEN_KEY) === "1"; } catch (e) { return false; }
  }

  function detectLang() {
    var saved = read(LANG_KEY);
    if (saved === "no" || saved === "en") { return saved; }
    /* Norsk er standard. EN-bryteren står alltid i toppen, og valget huskes. */
    return "no";
  }

  function t(key) {
    var table = dict[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) { return table[key]; }
    var fallback = dict.no || {};
    return Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : key;
  }

  function apply(root) {
    var scope = root || document;
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n]"), function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-ph]"), function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-aria]"), function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
  }

  function paintSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll(".langswitch button[data-lang]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  function setLang(next) {
    if (next !== "no" && next !== "en") { return; }
    lang = next;
    store(LANG_KEY, next);
    document.documentElement.lang = next === "no" ? "no" : "en";
    apply();
    paintSwitches();
    listeners.forEach(function (fn) {
      try { fn(lang); } catch (e) { /* en sides feil skal ikke stoppe resten */ }
    });
  }

  function unlock() {
    document.body.classList.add("is-open");
    var gate = document.getElementById("gate");
    if (gate) { gate.setAttribute("aria-hidden", "true"); }
  }

  function wireGate() {
    var form = document.getElementById("gate-form");
    if (!form) { return; }
    var input = document.getElementById("code");
    var err = document.getElementById("gate-err");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var given = (input.value || "").trim().toLowerCase();
      if (given === ACCESS_CODE.toLowerCase()) {
        if (err) { err.hidden = true; }
        markOpen();
        unlock();
      } else if (err) {
        err.hidden = false;
        input.select();
      }
    });

    /* Kode i lenka. To former:
         ?kode=kickstart26        anbefalt — lar hash-en peke på en skjerm
         #kickstart26             beholdt, så gamle lenker fortsatt virker  */
    var wanted = ACCESS_CODE.toLowerCase();
    var fromQuery = "";
    try {
      fromQuery = (new URLSearchParams(location.search).get("kode") || "").trim().toLowerCase();
    } catch (e) { /* svært gamle nettlesere */ }
    var fromHash = (location.hash || "").replace(/^#/, "").trim().toLowerCase();

    if (fromQuery === wanted) {
      markOpen(); unlock();
    } else if (fromHash === wanted) {
      markOpen(); unlock();
      /* Frigjør hash-en, ellers kan den ikke peke på en skjerm */
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* file:// */ }
    } else if (wasOpened()) {
      unlock();
    } else {
      setTimeout(function () { input.focus(); }, 60);
    }
  }

  function wireSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll(".langswitch button[data-lang]"), function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
  }

  return {
    addDict: function (no, en) {
      Object.keys(no || {}).forEach(function (k) { dict.no[k] = no[k]; });
      Object.keys(en || {}).forEach(function (k) { dict.en[k] = en[k]; });
    },
    onLang: function (fn) { listeners.push(fn); },
    get lang() { return lang; },
    t: t,
    apply: apply,
    setLang: setLang,
    /* Bygger lenker som beholder språkvalget når man navigerer mellom sider. */
    init: function () {
      lang = detectLang();
      document.documentElement.lang = lang === "no" ? "no" : "en";
      wireSwitches();
      wireGate();
      apply();
      paintSwitches();
      listeners.forEach(function (fn) {
        try { fn(lang); } catch (e) { /* ignorer */ }
      });
    }
  };
})();
