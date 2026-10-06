# Contributing to Codemonkey

Thanks for your interest in Codemonkey. This guide shows how to run the
project locally and how to propose a change.

## What Codemonkey is

Codemonkey is a static site in plain HTML, CSS and JavaScript. There is no
build step, no package manager, no backend and no test suite. Everything
runs in the browser.

## Prerequisites

- Git
- A modern desktop browser with a physical keyboard
- Optional: Python 3, if you want to serve the files with a local web server

## Setup

```bash
git clone https://github.com/fizzexual/Codemonkey.git
cd Codemonkey
```

There is nothing to install.

## Run it locally

Open `index.html` directly:

```bash
start index.html    # Windows
open index.html     # macOS
```

Or serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Where things live

- `index.html` - the page markup and the `<script>` tags
- `css/style.css` - layout and all theme palettes (CSS variables)
- `js/app.js` - typing engine, stats, graph and `localStorage` persistence
- `js/themes.js` - theme list, apply and persist
- `js/snippets.js` - the language list
- `js/snippets/<language>.js` - the code snippets for one language

## Common changes

**Add a snippet.** Add a string to the array in the matching
`js/snippets/<language>.js` file. Use spaces, not tabs. Do not leave trailing
whitespace. Make sure the code compiles or parses in its language.

**Add a language.** Create `js/snippets/<id>.js` containing
`window.CODE_SNIPPETS["<id>"] = [ ... ]`. Add a `<script>` tag for it in
`index.html`. Add an entry to `LANGUAGES` in `js/snippets.js`.

**Add a theme.** Add a `[data-theme="your_theme"]` block of CSS variables in
`css/style.css`. Add a matching entry to the `THEMES` list in `js/themes.js`.

## Check your change

There are no automated tests. Before you open a pull request:

1. Open the site locally and finish at least one test in `time` mode and one
   in `snippet` mode.
2. Check the language, theme or snippet you changed.
3. Open the browser console and make sure there are no errors.
4. If you touched input handling, try `Tab`, `Esc`, `Enter` and `Backspace`
   at the start of a line.

## How the live site deploys

The live site is https://fizzexual.github.io/Codemonkey/. It is served by
GitHub Pages straight from the root of the `main` branch. There is no build
and no workflow. Every push to `main` updates the live site.

## Proposing a change

1. Fork the repository.
2. Create a branch from `main` with a short, clear name.
3. Keep the pull request small and focused on one thing.
4. In the description, say what you changed and why.
5. Say how you checked it (see "Check your change").
6. Open the pull request against `main`.

For larger changes, open an issue first so we can agree on the approach.

## Security issues

Do not report security problems in a public issue. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
