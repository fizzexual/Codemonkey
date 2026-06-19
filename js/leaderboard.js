/* ============================================================
   leaderboard.js — shared leaderboard data layer (Supabase)
   Talks to Supabase's auto-generated REST API (PostgREST) with
   plain fetch — no SDK, keeping the site dependency-free.
   Exposes window.Leaderboard.
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.LEADERBOARD_CONFIG || {};
  var BASE = (cfg.url || "").replace(/\/+$/, "");
  var KEY = cfg.anonKey || "";
  var NAME_KEY = "codemonkey-name";
  var MAX_WPM = 400; // sanity ceiling, mirrored by a DB check constraint

  function isConfigured() {
    return !!BASE && !!KEY &&
      BASE.indexOf("YOUR_") === -1 &&
      KEY.indexOf("YOUR_") === -1;
  }

  function headers(extra) {
    var h = {
      "apikey": KEY,
      "Authorization": "Bearer " + KEY,
      "Content-Type": "application/json"
    };
    if (extra) { for (var k in extra) { h[k] = extra[k]; } }
    return h;
  }

  function getName() {
    try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
  }
  function setName(n) {
    try { localStorage.setItem(NAME_KEY, n); } catch (e) {}
  }

  // POST a score. Resolves on success, rejects with a readable error.
  function submitScore(s) {
    if (!isConfigured()) return Promise.reject(new Error("Leaderboard is not configured yet."));
    var name = String(s.name || "").trim().slice(0, 24);
    if (!name) return Promise.reject(new Error("Please enter a name."));
    var wpm = Math.round(s.wpm);
    if (!isFinite(wpm) || wpm < 0 || wpm > MAX_WPM) {
      return Promise.reject(new Error("That score (" + wpm + " wpm) is out of range."));
    }
    var body = {
      name: name,
      language: s.language,
      mode: s.mode,
      value: s.value,
      wpm: wpm,
      raw_wpm: Math.round(s.raw || 0),
      accuracy: Math.round(s.accuracy),
      consistency: Math.round(s.consistency || 0)
    };
    return fetch(BASE + "/rest/v1/scores", {
      method: "POST",
      headers: headers({ "Prefer": "return=minimal" }),
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error("Submit failed (" + r.status + "). " + t);
        });
      }
      return true;
    });
  }

  // GET the top scores for one board (language + mode + value).
  function fetchBoard(language, mode, value, limit) {
    if (!isConfigured()) return Promise.reject(new Error("Leaderboard is not configured yet."));
    var url = BASE + "/rest/v1/scores" +
      "?select=name,wpm,accuracy,created_at" +
      "&language=eq." + encodeURIComponent(language) +
      "&mode=eq." + encodeURIComponent(mode) +
      "&value=eq." + encodeURIComponent(value) +
      "&order=wpm.desc,accuracy.desc,created_at.asc" +
      "&limit=" + (limit || 50);
    return fetch(url, { headers: headers() }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error("Could not load board (" + r.status + "). " + t);
        });
      }
      return r.json();
    });
  }

  window.Leaderboard = {
    isConfigured: isConfigured,
    getName: getName,
    setName: setName,
    submitScore: submitScore,
    fetchBoard: fetchBoard,
    MAX_WPM: MAX_WPM
  };
})();
