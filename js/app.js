/* ============================================================
   app.js — codemonkey typing engine
   Vanilla JS, no dependencies. Handles config, the typing test
   itself (with auto-indentation for code), live + final stats,
   the WPM graph, and localStorage persistence.
   ============================================================ */
(function () {
  "use strict";

  var Themes = window.CodemonkeyThemes;
  var SNIPPETS = window.CODE_SNIPPETS;
  var LANGUAGES = window.LANGUAGES;

  /* ---------- config (persisted) ---------- */
  var TIME_VALUES = [15, 30, 60, 120];
  var SNIPPET_VALUES = [1, 3, 5];
  var CONFIG_KEY = "codemonkey-config";
  var STATS_KEY = "codemonkey-stats";

  var config = {
    mode: "time",        // "time" | "snippet"
    timeLimit: 60,       // seconds
    snippetCount: 3,     // snippets
    language: "javascript"
  };

  /* ---------- runtime state ---------- */
  var st = null;
  function freshState() {
    return {
      target: "",
      chars: [],          // span elements
      charState: [],      // "pending" | "correct" | "incorrect"
      auto: [],           // boolean: auto-filled (leading indentation)
      pos: 0,
      started: false,
      finished: false,
      startTime: 0,
      correct: 0,         // user keystrokes that matched (drives wpm)
      incorrect: 0,       // user keystrokes that missed (drives accuracy)
      snippetsDone: 0,
      samples: [],        // { t, wpm, raw, errors }
      lastSecond: 0,
      errorsThisSecond: 0,
      timerId: null
    };
  }

  /* ---------- element refs ---------- */
  var el = {};
  function cacheEls() {
    el.modeGroup = document.getElementById("mode-group");
    el.valueGroup = document.getElementById("value-group");
    el.langGroup = document.getElementById("lang-group");
    el.themeSelect = document.getElementById("theme-select");
    el.display = document.getElementById("code-display");
    el.caret = document.getElementById("caret");
    el.liveBar = document.querySelector(".live-bar");
    el.liveProgress = document.getElementById("live-progress");
    el.liveWpm = document.getElementById("live-wpm");
    el.liveAcc = document.getElementById("live-acc");
    el.liveLang = document.getElementById("live-lang");
    el.testPanel = document.getElementById("test-panel");
    el.results = document.getElementById("results");
    el.restartBtn = document.getElementById("restart-btn");
    el.nextBtn = document.getElementById("next-btn");
    el.repeatBtn = document.getElementById("repeat-btn");
    el.rWpm = document.getElementById("r-wpm");
    el.rAcc = document.getElementById("r-acc");
    el.rRaw = document.getElementById("r-raw");
    el.rChars = document.getElementById("r-chars");
    el.rConsistency = document.getElementById("r-consistency");
    el.rTime = document.getElementById("r-time");
    el.rTest = document.getElementById("r-test");
    el.rPb = document.getElementById("r-pb");
    el.pbFlag = document.getElementById("pb-flag");
    el.graph = document.getElementById("wpm-graph");
    el.historyDrawer = document.getElementById("history-drawer");
    el.historyBody = document.getElementById("history-body");
    el.historyToggle = document.getElementById("history-toggle");
    el.closeHistory = document.getElementById("close-history");
    el.clearHistory = document.getElementById("clear-history");
  }

  /* ---------- persistence ---------- */
  function loadConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem(CONFIG_KEY));
      if (saved && typeof saved === "object") {
        if (saved.mode === "time" || saved.mode === "snippet") config.mode = saved.mode;
        if (TIME_VALUES.indexOf(saved.timeLimit) >= 0) config.timeLimit = saved.timeLimit;
        if (SNIPPET_VALUES.indexOf(saved.snippetCount) >= 0) config.snippetCount = saved.snippetCount;
        if (SNIPPETS[saved.language]) config.language = saved.language;
      }
    } catch (e) { /* ignore */ }
  }
  function saveConfig() {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch (e) {}
  }
  function loadStats() {
    try {
      var s = JSON.parse(localStorage.getItem(STATS_KEY));
      if (s && typeof s === "object") {
        return { pb: s.pb || {}, history: s.history || [] };
      }
    } catch (e) {}
    return { pb: {}, history: [] };
  }
  function saveStats(s) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function configKeyStr() {
    var v = config.mode === "time" ? config.timeLimit : config.snippetCount;
    return config.language + ":" + config.mode + ":" + v;
  }

  /* ---------- snippet handling ---------- */
  function normalize(code) {
    var lines = code.replace(/\t/g, "  ").split("\n");
    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\s+$/, ""); // strip trailing whitespace
    }
    while (lines.length && lines[0] === "") lines.shift();
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines.join("\n");
  }

  var lastSnippetIndex = -1;
  function pickSnippet() {
    var pool = SNIPPETS[config.language] || SNIPPETS.javascript;
    var idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === lastSnippetIndex) {
      idx = (idx + 1) % pool.length;
    }
    lastSnippetIndex = idx;
    return normalize(pool[idx]);
  }

  /* ---------- rendering ---------- */
  function renderCode(target) {
    el.display.innerHTML = "";
    el.display.appendChild(el.caret);
    st.chars = [];
    st.charState = [];
    st.auto = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < target.length; i++) {
      var ch = target[i];
      var span = document.createElement("span");
      span.className = "ch";
      if (ch === "\n") {
        span.classList.add("nl");
        span.textContent = "↵\n"; // visible return glyph + real newline
      } else if (ch === " ") {
        span.classList.add("space");
        span.textContent = " ";
      } else {
        span.textContent = ch;
      }
      frag.appendChild(span);
      st.chars.push(span);
      st.charState.push("pending");
      st.auto.push(false);
    }
    el.display.appendChild(frag);
  }

  function paint(i) {
    var span = st.chars[i];
    if (!span) return;
    span.classList.remove("correct", "incorrect");
    var s = st.charState[i];
    if (s === "correct") span.classList.add("correct");
    else if (s === "incorrect") span.classList.add("incorrect");
  }

  function updateCaret() {
    var idx = st.pos;
    var atEnd = idx >= st.chars.length;
    var ref = atEnd ? st.chars[st.chars.length - 1] : st.chars[idx];
    if (!ref) { el.caret.style.left = "0px"; el.caret.style.top = "0px"; return; }
    var base = el.display.getBoundingClientRect();
    var r = ref.getBoundingClientRect();
    var x = (atEnd ? r.right : r.left) - base.left + el.display.scrollLeft;
    var y = r.top - base.top + el.display.scrollTop;
    el.caret.style.left = x + "px";
    el.caret.style.top = y + "px";
    // keep caret in view for tall snippets
    if (r.bottom > base.bottom - 8) {
      el.display.scrollTop += r.bottom - base.bottom + 40;
    } else if (r.top < base.top + 8) {
      el.display.scrollTop -= base.top - r.top + 40;
    }
  }

  /* ---------- auto-indent ---------- */
  function skipAutoIndent() {
    while (st.pos < st.target.length) {
      var c = st.target[st.pos];
      if (c === " " || c === "\t") {
        st.charState[st.pos] = "correct";
        st.auto[st.pos] = true;
        paint(st.pos);
        st.pos++;
      } else {
        break;
      }
    }
  }

  /* ---------- test lifecycle ---------- */
  function loadTest(keepSnippet) {
    if (st && st.timerId) clearInterval(st.timerId);
    var prevTarget = st && keepSnippet ? st.target : null;
    st = freshState();
    st.target = prevTarget || pickSnippet();
    renderCode(st.target);
    skipAutoIndent();
    el.results.hidden = true;
    el.testPanel.hidden = false;
    el.display.classList.remove("typing");
    el.liveBar.classList.add("dim");
    updateProgress();
    el.liveWpm.textContent = "0 wpm";
    el.liveAcc.textContent = "100%";
    el.liveLang.textContent = langName(config.language);
    updateCaret();
  }

  function loadNextSnippet() {
    st.target = pickSnippet();
    renderCode(st.target);
    st.pos = 0;
    skipAutoIndent();
    updateCaret();
  }

  function start() {
    st.started = true;
    st.startTime = performance.now();
    st.lastSecond = 0;
    el.display.classList.add("typing");
    el.liveBar.classList.remove("dim");
    st.timerId = setInterval(tick, 200);
  }

  function tick() {
    var elapsed = elapsedSec();
    updateLive();
    var sec = Math.floor(elapsed);
    if (sec > st.lastSecond) {
      st.lastSecond = sec;
      st.samples.push({ t: sec, wpm: netWpm(), raw: rawWpm(), errors: st.errorsThisSecond });
      st.errorsThisSecond = 0;
    }
    if (config.mode === "time" && elapsed >= config.timeLimit) {
      finish();
    }
  }

  /* ---------- typing handlers ---------- */
  function typeChar(ch) {
    if (st.finished) return;
    if (!st.started) start();
    var exp = st.target[st.pos];
    if (exp === undefined) return;
    if (exp === "\n") {
      // a newline is owed: typing a normal char is a miss, no advance
      st.charState[st.pos] = "incorrect";
      paint(st.pos);
      st.incorrect++;
      st.errorsThisSecond++;
      updateLive();
      return;
    }
    var ok = ch === exp;
    st.charState[st.pos] = ok ? "correct" : "incorrect";
    paint(st.pos);
    if (ok) st.correct++;
    else { st.incorrect++; st.errorsThisSecond++; }
    st.pos++;
    afterAdvance();
  }

  function typeNewline() {
    if (st.finished) return;
    if (!st.started) start();
    var exp = st.target[st.pos];
    if (exp === undefined) return;
    if (exp === "\n") {
      st.charState[st.pos] = "correct";
      paint(st.pos);
      st.correct++;
      st.pos++;
      skipAutoIndent();
      afterAdvance();
    } else {
      // enter pressed mid-line: a miss, no advance
      st.incorrect++;
      st.errorsThisSecond++;
      updateLive();
    }
  }

  function doBackspace() {
    if (st.finished || st.pos <= 0) return;
    st.pos--;
    if (st.auto[st.pos]) {
      // unwind the whole auto-indent run + the newline that produced it
      while (st.pos > 0 && st.auto[st.pos]) {
        st.auto[st.pos] = false;
        st.charState[st.pos] = "pending";
        paint(st.pos);
        st.pos--;
      }
      st.charState[st.pos] = "pending"; // the newline (or first char)
      paint(st.pos);
    } else {
      st.charState[st.pos] = "pending";
      paint(st.pos);
    }
    updateCaret();
    updateLive();
  }

  function afterAdvance() {
    updateCaret();
    updateLive();
    if (st.pos >= st.target.length) {
      st.snippetsDone++;
      if (config.mode === "snippet") {
        updateProgress();
        if (st.snippetsDone >= config.snippetCount) finish();
        else loadNextSnippet();
      } else {
        loadNextSnippet(); // time mode: keep feeding snippets
      }
    }
  }

  /* ---------- stats math ---------- */
  function elapsedSec() { return (performance.now() - st.startTime) / 1000; }
  function netWpm() {
    var m = elapsedSec() / 60;
    return m > 0 ? (st.correct / 5) / m : 0;
  }
  function rawWpm() {
    var m = elapsedSec() / 60;
    return m > 0 ? ((st.correct + st.incorrect) / 5) / m : 0;
  }
  function accuracy() {
    var total = st.correct + st.incorrect;
    return total > 0 ? (st.correct / total) * 100 : 100;
  }
  function consistency() {
    var vals = st.samples.map(function (s) { return s.raw; }).filter(function (v) { return v > 0; });
    if (vals.length < 2) return 100;
    var mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    if (mean === 0) return 0;
    var variance = vals.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / vals.length;
    var cv = Math.sqrt(variance) / mean;
    return Math.max(0, Math.min(100, (1 - cv) * 100));
  }

  /* ---------- live display ---------- */
  function updateProgress() {
    if (config.mode === "time") {
      var remaining = config.timeLimit;
      if (st.started) remaining = Math.max(0, Math.ceil(config.timeLimit - elapsedSec()));
      el.liveProgress.textContent = String(remaining);
    } else {
      var current = Math.min(st.snippetsDone + 1, config.snippetCount);
      el.liveProgress.textContent = current + "/" + config.snippetCount;
    }
  }
  function updateLive() {
    updateProgress();
    el.liveWpm.textContent = Math.round(netWpm()) + " wpm";
    el.liveAcc.textContent = Math.round(accuracy()) + "%";
  }

  /* ---------- finish + results ---------- */
  function finish() {
    if (st.finished) return;
    st.finished = true;
    if (st.timerId) clearInterval(st.timerId);
    el.display.classList.remove("typing");
    // capture a final sample
    st.samples.push({ t: elapsedSec(), wpm: netWpm(), raw: rawWpm(), errors: st.errorsThisSecond });

    var wpm = Math.round(netWpm());
    var raw = Math.round(rawWpm());
    var acc = Math.round(accuracy());
    var cons = Math.round(consistency());
    var secs = elapsedSec();

    el.rWpm.textContent = wpm;
    el.rAcc.textContent = acc + "%";
    el.rRaw.textContent = raw;
    el.rChars.textContent = st.correct + "/" + st.incorrect;
    el.rConsistency.textContent = cons + "%";
    el.rTime.textContent = secs.toFixed(1) + "s";
    el.rTest.textContent = testLabel();

    var record = recordResult(wpm, acc, raw, cons);
    el.rPb.textContent = record.pb ? record.pb.wpm + " wpm" : "—";
    el.pbFlag.hidden = !record.isNewPb;

    el.testPanel.hidden = true;
    el.results.hidden = false;
    drawGraph(st.samples);
  }

  function testLabel() {
    var v = config.mode === "time" ? config.timeLimit + "s" : config.snippetCount + " snip";
    return langName(config.language) + " · " + v;
  }
  function langName(id) {
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].id === id) return LANGUAGES[i].name;
    }
    return id;
  }

  function recordResult(wpm, acc, raw, cons) {
    var stats = loadStats();
    var key = configKeyStr();
    var prev = stats.pb[key];
    var isNewPb = !prev || wpm > prev.wpm;
    if (isNewPb) {
      stats.pb[key] = { wpm: wpm, acc: acc, date: Date.now() };
    }
    stats.history.unshift({
      date: Date.now(),
      language: config.language,
      mode: config.mode,
      value: config.mode === "time" ? config.timeLimit : config.snippetCount,
      wpm: wpm, raw: raw, acc: acc, consistency: cons
    });
    if (stats.history.length > 50) stats.history.length = 50;
    saveStats(stats);
    return { pb: stats.pb[key], isNewPb: isNewPb };
  }

  /* ---------- graph ---------- */
  function drawGraph(samples) {
    var canvas = el.graph;
    var rect = canvas.getBoundingClientRect();
    if (rect.width === 0) { setTimeout(function () { drawGraph(samples); }, 50); return; }
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);

    var padL = 36, padR = 12, padT = 14, padB = 22;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var colSub = Themes.color("--sub");
    var colAccent = Themes.color("--accent");
    var colError = Themes.color("--error");
    var colGrid = Themes.color("--sub-alt");

    var pts = samples.filter(function (s) { return isFinite(s.wpm); });
    if (pts.length === 0) return;
    if (pts.length === 1) pts = [{ t: 0, wpm: pts[0].wpm, raw: pts[0].raw, errors: 0 }, pts[0]];

    var maxWpm = 10;
    var maxT = 0;
    pts.forEach(function (p) {
      maxWpm = Math.max(maxWpm, p.wpm, p.raw);
      maxT = Math.max(maxT, p.t);
    });
    maxWpm = Math.ceil(maxWpm / 20) * 20;
    if (maxT === 0) maxT = 1;

    function px(t) { return padL + (t / maxT) * plotW; }
    function py(w) { return padT + plotH - (w / maxWpm) * plotH; }

    // grid + y labels
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = colGrid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    var steps = 4;
    for (var i = 0; i <= steps; i++) {
      var val = (maxWpm / steps) * i;
      var y = py(val);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colSub;
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(val)), padL - 8, y);
      ctx.globalAlpha = 0.4;
    }
    ctx.globalAlpha = 1;

    // raw line (faint)
    drawLine(ctx, pts, px, py, "raw", colSub, 1.5, 0.5);
    // wpm line (accent)
    drawLine(ctx, pts, px, py, "wpm", colAccent, 2.5, 1);

    // error markers
    pts.forEach(function (p) {
      if (p.errors && p.errors > 0) {
        var x = px(p.t), y = py(p.wpm);
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3);
        ctx.strokeStyle = colError;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // legend
    ctx.textAlign = "left";
    ctx.fillStyle = colAccent;
    ctx.fillText("wpm", padL + 4, padT + 6);
    ctx.fillStyle = colSub;
    ctx.fillText("raw", padL + 44, padT + 6);
  }

  function drawLine(ctx, pts, px, py, field, color, width, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach(function (p, i) {
      var x = px(p.t), y = py(p[field]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- history drawer ---------- */
  function openHistory() {
    renderHistory();
    el.historyDrawer.hidden = false;
  }
  function closeHistoryDrawer() { el.historyDrawer.hidden = true; }
  function renderHistory() {
    var stats = loadStats();
    var h = stats.history || [];
    if (h.length === 0) {
      el.historyBody.innerHTML = '<div class="history-empty">no tests yet — go type some code!</div>';
      return;
    }
    var html = "";
    for (var i = 0; i < h.length; i++) {
      var r = h[i];
      var v = r.mode === "time" ? r.value + "s" : r.value + " snip";
      html +=
        '<div class="history-row">' +
          '<div class="h-meta">' +
            '<span class="h-lang">' + langName(r.language) + " · " + v + "</span>" +
            '<span class="h-date">' + formatDate(r.date) + "</span>" +
          "</div>" +
          '<span class="h-wpm">' + r.wpm + "</span>" +
          '<span class="h-acc">' + r.acc + "%</span>" +
        "</div>";
    }
    el.historyBody.innerHTML = html;
  }
  function formatDate(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  /* ---------- config UI ---------- */
  function buildValueButtons() {
    var values = config.mode === "time" ? TIME_VALUES : SNIPPET_VALUES;
    var current = config.mode === "time" ? config.timeLimit : config.snippetCount;
    el.valueGroup.innerHTML = "";
    values.forEach(function (v) {
      var b = document.createElement("button");
      b.className = "config-btn" + (v === current ? " active" : "");
      b.textContent = String(v);
      b.dataset.value = v;
      el.valueGroup.appendChild(b);
    });
  }
  function buildLangButtons() {
    el.langGroup.innerHTML = "";
    LANGUAGES.forEach(function (l) {
      var b = document.createElement("button");
      b.className = "config-btn" + (l.id === config.language ? " active" : "");
      b.textContent = l.name;
      b.dataset.lang = l.id;
      el.langGroup.appendChild(b);
    });
  }
  function buildThemeOptions() {
    el.themeSelect.innerHTML = "";
    Themes.list.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.name;
      el.themeSelect.appendChild(o);
    });
  }
  function syncModeButtons() {
    var btns = el.modeGroup.querySelectorAll("[data-mode]");
    btns.forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === config.mode);
    });
  }

  /* ---------- key handling ---------- */
  function onKeyDown(e) {
    var tag = e.target && e.target.tagName;
    if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // an open panel swallows typing; Escape closes it
    if (!el.historyDrawer.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeHistoryDrawer(); }
      return;
    }

    // results screen shortcuts
    if (st && st.finished) {
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); loadTest(false); }
      return;
    }

    if (e.key === "Tab") { e.preventDefault(); loadTest(false); return; }
    if (e.key === "Escape") { e.preventDefault(); loadTest(false); return; }
    if (e.key === "Backspace") { e.preventDefault(); doBackspace(); return; }
    if (e.key === "Enter") { e.preventDefault(); typeNewline(); return; }
    if (e.key.length === 1) { e.preventDefault(); typeChar(e.key); return; }
    // ignore everything else (arrows, function keys, modifiers alone)
  }

  /* ---------- wiring ---------- */
  function wire() {
    el.modeGroup.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-mode]");
      if (!btn) return;
      config.mode = btn.dataset.mode;
      saveConfig();
      syncModeButtons();
      buildValueButtons();
      loadTest(false);
      btn.blur();
    });

    el.valueGroup.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-value]");
      if (!btn) return;
      var v = parseInt(btn.dataset.value, 10);
      if (config.mode === "time") config.timeLimit = v;
      else config.snippetCount = v;
      saveConfig();
      buildValueButtons();
      loadTest(false);
      btn.blur();
    });

    el.langGroup.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (!btn) return;
      config.language = btn.dataset.lang;
      saveConfig();
      buildLangButtons();
      loadTest(false);
      btn.blur();
    });

    el.themeSelect.addEventListener("change", function (e) {
      Themes.apply(e.target.value);
      e.target.blur();
    });

    el.restartBtn.addEventListener("click", function () { loadTest(false); el.restartBtn.blur(); });
    el.nextBtn.addEventListener("click", function () { loadTest(false); el.nextBtn.blur(); });
    el.repeatBtn.addEventListener("click", function () { loadTest(true); el.repeatBtn.blur(); });

    el.historyToggle.addEventListener("click", openHistory);
    el.closeHistory.addEventListener("click", closeHistoryDrawer);
    el.clearHistory.addEventListener("click", function () {
      var stats = loadStats();
      stats.history = [];
      saveStats(stats);
      renderHistory();
    });

    document.addEventListener("keydown", onKeyDown);

    window.addEventListener("resize", function () {
      if (st && st.finished) drawGraph(st.samples);
      else if (st) updateCaret();
    });
  }

  /* ---------- init ---------- */
  function init() {
    cacheEls();
    loadConfig();
    var theme = Themes.load();
    Themes.apply(theme);
    buildThemeOptions();
    el.themeSelect.value = theme;
    syncModeButtons();
    buildValueButtons();
    buildLangButtons();
    wire();
    loadTest(false);
    // reposition the caret once the web font has loaded (metrics change)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (st && !st.finished) updateCaret(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
