/* ==========================================================================
   Kickstart – lenke til hver skjerm

   Hver skjerm får sin egen adresse (#steg-4), og adressefeltet oppdaterer seg
   mens man klikker seg gjennom. En delt lenke åpner dermed riktig skjerm.

   Bruk fra en side:
     <script src="../assets/route.js"></script>   (i <head>)
     ...
     go(0);                                        // sett startskjermen først
     KSRoute.init({ onRoute: function (id) { go(Number(id)); } });
     KSRoute.setScreen(3);                         // kalles hver gang skjermen byttes
   ========================================================================== */

window.KSRoute = (function () {
  "use strict";

  var current = null;
  var routeHandler = null;
  var started = false;   /* før init skrives ingenting til adressefeltet */

  function syncHash() {
    if (!started) { return; }
    var want = current === null ? "" : "#steg-" + current;
    if (location.hash !== want) {
      try {
        history.replaceState(null, "", location.pathname + location.search + want);
      } catch (e) { /* file:// tåler ikke replaceState */ }
    }
  }

  /* Leser #steg-N, slik at en delt lenke åpner riktig skjerm */
  function restore() {
    var m = (location.hash || "").match(/^#steg-(\d+)$/);
    if (m && routeHandler) {
      try { routeHandler(m[1]); } catch (e) { /* siden avgjør selv */ }
    }
  }

  return {
    /* Kalles etter at siden har satt sin egen startskjerm, slik at en
       lenke i adressefeltet får overstyre den. */
    init: function (options) {
      routeHandler = (options || {}).onRoute || null;
      restore();
      started = true;
      syncHash();
      window.addEventListener("hashchange", restore);
    },

    setScreen: function (id) {
      current = id;
      syncHash();
    }
  };
})();
