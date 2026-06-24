/* ============================================================
   snippets.js — bootstrap for the typing content.
   The actual snippets live in js/snippets/<language>.js, each of
   which populates window.CODE_SNIPPETS[<id>]. This keeps the pool
   easy to grow toward "endless" — just add more to those files.
   ============================================================ */
window.CODE_SNIPPETS = window.CODE_SNIPPETS || {};

window.LANGUAGES = [
  { id: "javascript", name: "javascript" },
  { id: "python",     name: "python" },
  { id: "typescript", name: "typescript" },
  { id: "java",       name: "java" },
  { id: "cpp",        name: "c++" },
  { id: "go",         name: "go" },
  { id: "rust",       name: "rust" },
  { id: "sql",        name: "sql" },
  { id: "bash",       name: "bash" },
  { id: "quotes",     name: "quotes" },
  { id: "sprout",     name: "sprout" }
];
