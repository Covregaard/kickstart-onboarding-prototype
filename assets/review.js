/* ==========================================================================
   Kickstart – tilbakemeldingslinje for prototypene

   Legger en linje nederst som alltid viser hvilken skjerm du står på, og
   en knapp som åpner et Google Skjema med skjermnavn og lenke ferdig utfylt.
   Linja er bevisst mørk og lik i begge temaer, så den ikke forveksles med
   selve prototypen.

   Hver skjerm får en egen lenke (#steg-4), slik at en kommentar kan peke
   rett på skjermen den gjelder.

   Bruk fra en side:
     <script src="../assets/review.js"></script>   (i <head>)
     ...
     KSReview.init({ onRoute: function (id) { go(Number(id)); } });
     KSReview.setScreen(3, "Ukesrapport", "Ukas fokus");
   ========================================================================== */

window.KSReview = (function () {
  "use strict";

  /* =======================================================================
     GOOGLE SKJEMA — fyll inn de tre verdiene under for å koble på skjemaet.

     Slik finner du dem:
       1. Lag skjemaet med feltene: Skjerm, Lenke, Navn, Kommentar.
       2. Trykk ⋮ → "Få forhåndsutfylt lenke", fyll inn noe i Skjerm og
          Lenke, og trykk "Få lenke".
       3. Den kopierte lenken ser slik ut:
          .../viewform?usp=pp_url&entry.1234567=Skjerm&entry.7654321=Lenke
       4. Lim inn adressen fram til "viewform" i url, og de to entry-ID-ene
          i screenField og linkField.

     Uten oppsett kopierer knappen skjerm, lenke og en kort tekst til
     utklippstavla i stedet, så den gjør fortsatt nytte.
     ======================================================================= */
  var FORM = {
    url:         "",   // f.eks. "https://docs.google.com/forms/d/e/1FAIpQL.../viewform"
    screenField: "",   // f.eks. "entry.1234567"
    linkField:   ""    // f.eks. "entry.7654321"
  };

  var current = { id: null, proto: "", label: "" };
  var routeHandler = null;
  var started = false;   /* før init skrives ingenting til adressefeltet */
  var bar, labelEl, toastEl, toastTimer;

  function isConfigured() {
    return !!(FORM.url && FORM.screenField && FORM.linkField);
  }

  /* Full lenke til skjermen man står på */
  function screenLink() {
    return location.origin + location.pathname + location.search +
      (current.id === null ? "" : "#steg-" + current.id);
  }

  function screenName() {
    return current.proto + (current.label ? " · " + current.label : "");
  }

  function formUrl() {
    return FORM.url +
      "?usp=pp_url" +
      "&" + encodeURIComponent(FORM.screenField) + "=" + encodeURIComponent(screenName()) +
      "&" + encodeURIComponent(FORM.linkField) + "=" + encodeURIComponent(screenLink());
  }

  function toast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  function copyFallback() {
    var text = screenName() + "\n" + screenLink() + "\n\nKommentar: ";
    var done = function () { toast(txt("copied")); };
    var failed = function () { toast(txt("copyfail")); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, failed);
      return;
    }
    /* Eldre nettlesere */
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e) { failed(); }
  }

  /* Tekstene i linja. Holdes her så sidene slipper å definere dem. */
  var TEXT = {
    no: {
      screen:   "Skjerm",
      comment:  "Kommenter",
      copied:   "Skjerm og lenke er kopiert. Lim det inn i tilbakemeldingen din.",
      copyfail: "Fikk ikke kopiert. Kopier lenken fra adressefeltet i stedet."
    },
    en: {
      screen:   "Screen",
      comment:  "Comment",
      copied:   "Screen and link copied. Paste it into your feedback.",
      copyfail: "Could not copy. Copy the link from the address bar instead."
    }
  };

  function txt(key) {
    var lang = (window.KS && KS.lang === "en") ? "en" : "no";
    return TEXT[lang][key];
  }

  function build() {
    bar = document.createElement("div");
    bar.className = "reviewbar";
    bar.setAttribute("role", "complementary");

    var left = document.createElement("div");
    left.className = "review-what";

    var k = document.createElement("span");
    k.className = "review-k";

    labelEl = document.createElement("span");
    labelEl.className = "review-label";

    left.appendChild(k);
    left.appendChild(labelEl);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "review-btn";
    btn.addEventListener("click", function () {
      if (isConfigured()) {
        window.open(formUrl(), "_blank", "noopener");
      } else {
        copyFallback();
      }
    });

    bar.appendChild(left);
    bar.appendChild(btn);

    toastEl = document.createElement("p");
    toastEl.className = "review-toast";
    toastEl.setAttribute("role", "status");
    toastEl.hidden = true;

    document.body.appendChild(bar);
    document.body.appendChild(toastEl);
    document.body.classList.add("has-review");

    bar.querySelector(".review-btn").textContent = txt("comment");
    k.textContent = txt("screen");
    bar._k = k;
    bar._btn = btn;
  }

  function paint() {
    if (!bar) { return; }
    bar._k.textContent = txt("screen");
    bar._btn.textContent = txt("comment");
    labelEl.textContent = screenName();
  }

  /* Leser #steg-N ved oppstart, slik at en delt lenke åpner riktig skjerm */
  function restore() {
    var m = (location.hash || "").match(/^#steg-(\d+)$/);
    if (m && routeHandler) {
      try { routeHandler(m[1]); } catch (e) { /* siden avgjør selv */ }
    }
  }

  function syncHash() {
    if (!started) { return; }
    var want = current.id === null ? "" : "#steg-" + current.id;
    if (location.hash !== want) {
      try {
        history.replaceState(null, "", location.pathname + location.search + want);
      } catch (e) { /* file:// tåler ikke replaceState */ }
    }
  }

  return {
    /* Kalles etter at siden har satt sin egen startskjerm, slik at en
       dyplenke i adressefeltet får overstyre den. */
    init: function (options) {
      var opts = options || {};
      routeHandler = opts.onRoute || null;
      build();
      restore();
      started = true;
      syncHash();
      paint();
      if (window.KS && KS.onLang) { KS.onLang(paint); }
      window.addEventListener("hashchange", restore);
    },

    /* Kalles hver gang skjermen endrer seg */
    setScreen: function (id, proto, label) {
      current = { id: id, proto: proto || current.proto, label: label || "" };
      paint();
      syncHash();
    },

    configured: isConfigured
  };
})();
