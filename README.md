# 🐒 codemonkey

A minimalist typing‑speed test for developers — **[Monkeytype](https://monkeytype.com), but you type real code.**

Pick a language, pick a mode, and race through idiomatic snippets while codemonkey
tracks your WPM, accuracy, consistency, and a live WPM graph. No build step, no
dependencies, no backend — just open it and type.

👉 **Live:** https://fizzexual.github.io/Codemonkey/

---

## Features

- **Real code, not prose** — snippets in JavaScript, Python, TypeScript, Java, and C++.
- **Smart auto‑indentation** — press `Enter` and the next line's leading whitespace is
  filled in for you, so you only ever type the characters that matter.
- **Two modes**
  - `time` — type as much as you can in 15 / 30 / 60 / 120 seconds.
  - `snippet` — finish 1 / 3 / 5 complete snippets.
- **Live stats** — WPM, accuracy, and a countdown/progress indicator while you type.
- **Detailed results** — net WPM, raw WPM, accuracy, consistency, character counts,
  and a WPM‑over‑time graph with error markers.
- **Personal bests & history** — your results are saved locally (per language + mode)
  in `localStorage`, private to your device.
- **Global leaderboard (optional)** — opt-in shared rankings for every
  language + difficulty combo, backed by a free Supabase project. Submit your score
  from the results screen and see who's fastest. Off until you add your keys
  ([setup below](#leaderboard-setup-supabase)).
- **9 themes** — serika dark, dracula, nord, gruvbox, monokai, tokyo night, coral,
  matrix, and serika light. Your choice is remembered.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Tab` | restart with a new snippet |
| `Esc` | reset the current test |
| `Enter` | new line (leading indentation is auto‑filled) |
| `Enter` / `Tab` (on results) | start the next test |

## Running locally

It's a static site — there is nothing to install or build.

```bash
# just open it
open index.html        # macOS
start index.html       # Windows

# …or serve it (any static server works)
python -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
Codemonkey/
├── index.html          # markup
├── css/
│   └── style.css       # layout + all theme palettes (CSS variables)
└── js/
    ├── themes.js             # theme registry + apply/persist
    ├── snippets.js           # the code you type, per language
    ├── leaderboard-config.js # your Supabase url + anon key (fill in to enable)
    ├── leaderboard.js        # leaderboard data layer (submit / fetch)
    └── app.js                # typing engine, stats, graph, persistence
```

### Adding snippets

Open [`js/snippets.js`](js/snippets.js) and add a string to the array for a language.
Use spaces (not tabs) for indentation and skip trailing whitespace — `app.js` handles
auto‑indentation and normalisation. Adding a whole new language is just a new key in
`CODE_SNIPPETS` plus an entry in `LANGUAGES`.

### Adding a theme

Add a `[data-theme="your_theme"]` block of CSS variables in
[`css/style.css`](css/style.css) and a matching entry in the `THEMES` list in
[`js/themes.js`](js/themes.js).

## Leaderboard setup (Supabase)

The global leaderboard is **optional** and stays off until you connect a free
[Supabase](https://supabase.com) project. Everything else (typing test, personal
bests, history) works without it.

1. Create a project at [supabase.com](https://supabase.com) — the free tier is plenty.
2. Open the project's **SQL Editor** and run this once:

   ```sql
   create table if not exists public.scores (
     id           bigint generated always as identity primary key,
     created_at   timestamptz not null default now(),
     name         text not null check (char_length(name) between 1 and 24),
     language     text not null,
     mode         text not null,
     value        int  not null,
     wpm          int  not null check (wpm >= 0 and wpm <= 400),
     raw_wpm      int  not null default 0,
     accuracy     int  not null check (accuracy >= 0 and accuracy <= 100),
     consistency  int  not null default 0
   );

   alter table public.scores enable row level security;

   create policy "public read scores"  on public.scores for select using (true);
   create policy "public insert scores" on public.scores for insert with check (
     char_length(name) between 1 and 24
     and wpm between 0 and 400
     and accuracy between 0 and 100
   );

   create index if not exists scores_board_idx
     on public.scores (language, mode, value, wpm desc);
   ```

   Anyone can read the board and submit a score, but **not** edit or delete others'
   scores (there are no update/delete policies).

3. In **Project Settings → API**, copy the **Project URL** and the **anon / public**
   key into [`js/leaderboard-config.js`](js/leaderboard-config.js):

   ```js
   window.LEADERBOARD_CONFIG = {
     url: "https://YOUR-PROJECT.supabase.co",
     anonKey: "eyJ...your anon public key..."
   };
   ```

   These are public keys and safe to commit. Push, and the 🏆 leaderboard lights up.

**Fairness note:** with no server to validate runs, a determined person can submit a
fake score. The `wpm <= 400` check and read-only policies stop the worst of it, but
treat the board as fun, not gospel.

## Deployment (GitHub Pages)

This is a static site served straight from the repo root — no build step. Enable
Pages once:

> **Settings → Pages → Build and deployment → Source → _Deploy from a branch_ →
> Branch: `main` · `/ (root)` → Save**

The site goes live at `https://fizzexual.github.io/Codemonkey/` within a minute,
and every push to `main` redeploys automatically. The included `.nojekyll` file
tells Pages to serve the files as-is (no Jekyll processing).

## Credits

Inspired by the wonderful [Monkeytype](https://monkeytype.com). Built with plain
HTML, CSS, and JavaScript. Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
and [Lexend Deca](https://fonts.google.com/specimen/Lexend+Deca).

## License

[MIT](LICENSE)
