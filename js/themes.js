/* ============================================================
   themes.js — theme registry + apply/persist helpers
   The actual color values live in css/style.css under
   [data-theme="…"]; this file only knows the ids + labels and
   handles applying / remembering the choice.
   ============================================================ */
(function () {
  "use strict";

  let THEMES = [
    { id: "serika_dark",  name: "serika dark" },
    { id: "dracula",      name: "dracula" },
    { id: "nord",         name: "nord" },
    { id: "gruvbox_dark", name: "gruvbox dark" },
    { id: "monokai",      name: "monokai" },
    { id: "tokyo_night",  name: "tokyo night" },
    { id: "coral",        name: "coral" },
    { id: "matrix",       name: "matrix" },
    { id: "serika_light", name: "serika light" }
  ];

  let STORAGE_KEY = "codemonkey-theme";
  let DEFAULT = "serika_dark";

  function isValid(id) {
    for (let i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return true;
    }
    return false;
  }

  function apply(id) {
    if (!isValid(id)) id = DEFAULT;
    document.documentElement.setAttribute("data-theme", id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* private mode */ }
    return id;
  }

  function load() {
    let saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
    return isValid(saved) ? saved : DEFAULT;
  }

  // read a resolved color value from CSS variables (used by the graph)
  function color(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || "#888";
  }

  window.CodemonkeyThemes = {
    list: THEMES,
    apply: apply,
    load: load,
    color: color,
    DEFAULT: DEFAULT
  };
})();
