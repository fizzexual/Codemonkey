<div align="center">

<img src="https://fizzexual.github.io/Codemonkey/og-image.svg" alt="codemonkey — a typing test for code" width="100%" />

# 🐒 codemonkey

**[Monkeytype](https://monkeytype.com), but for code.**
A minimalist typing‑speed test where you type real code snippets and measure your
**WPM**, **accuracy**, and **consistency** — no sign‑up, no backend, no build step.

### [▶ Try it live](https://fizzexual.github.io/Codemonkey/)

[![live demo](https://img.shields.io/badge/live-demo-e2b714?style=flat-square)](https://fizzexual.github.io/Codemonkey/)
![no build step](https://img.shields.io/badge/build-none-4b4d50?style=flat-square)
![vanilla js](https://img.shields.io/badge/vanilla-JS-f7df1e?style=flat-square&labelColor=323437)
![dependencies](https://img.shields.io/badge/dependencies-0-88c0d0?style=flat-square)
[![license: MIT](https://img.shields.io/badge/license-MIT-bd93f9?style=flat-square)](LICENSE)

<br>

⭐ **If you enjoy it, a star helps a lot** — I'm a student, and it genuinely makes a difference.

</div>

---

## Why

Typing tests use prose. But the stuff developers actually type all day — brackets,
semicolons, `camelCase`, indentation — never shows up. **codemonkey** drops real,
idiomatic code in front of you and clocks how fast you can type it, the same clean
way Monkeytype does for words.

## Features

- **A near‑endless pool of correct content** — **274 hand‑written code snippets across 9 languages**
  (JavaScript · Python · TypeScript · Java · C++ · Go · Rust · SQL · Bash), each verified to compile or
  parse, **plus a `quotes` mode** of 70 famous programming & wisdom lines. No immediate repeats, and the
  pool is trivially extensible — drop a string in a file and it shows up.
- **Smart auto‑indentation** — press `Enter` and the next line's leading whitespace is
  filled in for you, so you only ever type the characters that matter (more below).
- **Two modes**
  - `time` — type as much as you can in **15 / 30 / 60 / 120** seconds.
  - `snippet` — finish **1 / 3 / 5** complete snippets.
- **Live + detailed stats** — live WPM/accuracy while typing, then a results screen with
  net & raw WPM, accuracy, consistency, character counts, and a **WPM‑over‑time graph**
  with error markers.
- **Personal bests & history** — saved locally per language + mode in `localStorage`,
  private to your device.
- **9 themes** — serika dark, dracula, nord, gruvbox, monokai, tokyo night, coral,
  matrix, serika light. Your choice is remembered.
- **Zero dependencies** — plain HTML, CSS, and JavaScript. No framework, no build, no server.

## How the auto‑indentation works

Code isn't a flat line of words — it has newlines and indentation, which would be
miserable to type literally. So codemonkey handles whitespace for you:

- Each line's **leading indentation** is auto‑filled the moment you enter the line.
- You press `Enter` for a new line; the caret jumps straight to the first real character.
- One `Backspace` at the start of a line cleanly unwinds the whole indent **and** the line break.

The result: you type the *meaningful* characters at full speed, and your WPM reflects
real typing — not how many spaces you can hammer.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Tab` | restart with a new snippet |
| `Esc` | reset the current test |
| `Enter` | new line (indentation auto‑filled) |
| `Enter` / `Tab` *(on results)* | start the next test |

> Input comes from a physical keyboard, so codemonkey is built for desktop.

**Non‑QWERTY layouts** (QWERTZ, AZERTY, Dvorak…) are supported: a keystroke counts
as correct if it produces the expected character **or** comes from the physical key
that types it on a US‑QWERTY board — so you can touch‑type by position. `AltGr`
symbols (`{ } [ ] @ \`) are handled too.

## Run it locally

It's a static site — nothing to install or build.

```bash
# clone
git clone https://github.com/fizzexual/Codemonkey.git
cd Codemonkey

# open it directly…
start index.html          # Windows
open  index.html          # macOS

# …or serve it (any static server works)
python -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
Codemonkey/
├── index.html        # markup
├── og-image.svg      # social/link-preview card
├── .nojekyll         # serve files as-is on GitHub Pages
├── css/
│   └── style.css     # layout + all 9 theme palettes (CSS variables)
└── js/
    ├── themes.js     # theme registry + apply/persist
    ├── snippets.js   # bootstrap: the language list
    ├── snippets/     # one self‑contained file per language — the content you type
    │   ├── javascript.js · python.js · typescript.js · java.js · cpp.js
    │   ├── go.js · rust.js · sql.js · bash.js
    │   └── quotes.js
    └── app.js        # typing engine, stats, graph, persistence
```

## Customizing

**Add a snippet** — drop a string into the array in the matching
[`js/snippets/<language>.js`](js/snippets) file. Use spaces (not tabs) and skip trailing
whitespace; the engine normalizes and auto‑indents for you.

**Add a language** — create `js/snippets/<id>.js` containing
`window.CODE_SNIPPETS["<id>"] = [ ... ]`, add a `<script>` tag for it in `index.html`,
and add an entry to `LANGUAGES` in [`js/snippets.js`](js/snippets.js). The config bar and
stats pick it up automatically.

**Add a theme** — add a `[data-theme="your_theme"]` block of CSS variables in
[`css/style.css`](css/style.css) and a matching entry in the `THEMES` list in
[`js/themes.js`](js/themes.js).

## Deployment

Served straight from the repo root on **GitHub Pages** — no build. To host your own
fork: **Settings → Pages → Build and deployment → Source → Deploy from a branch →
`main` · `/ (root)`**. Every push to `main` redeploys automatically.

## Built with

Plain **HTML · CSS · JavaScript**, the [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
and [Lexend Deca](https://fonts.google.com/specimen/Lexend+Deca) fonts, and a lot of
admiration for [Monkeytype](https://monkeytype.com).

## ⭐ Support

If codemonkey made you a little faster — or just made you smile — consider giving it a
**star**. It helps more people discover the project, and as a student building in public,
it genuinely means a lot. Thank you 🙏

## License

[MIT](LICENSE) © fizzexual
