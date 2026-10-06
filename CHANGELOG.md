# Changelog

All notable changes to Codemonkey are listed here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Codemonkey has no versioned releases yet. The live site at
https://fizzexual.github.io/Codemonkey/ always runs the `main` branch. The
entries below are grouped by date and built from the git history.

## 2026-06-24

### Fixed

- Typing on non-QWERTY layouts (QWERTZ, AZERTY, Dvorak). A keystroke now
  counts if it produces the expected character or comes from the physical
  US-QWERTY key for that character.
- `AltGr` symbols such as `{ } [ ] @ \` can now be typed. Plain `Ctrl`, `Cmd`
  and `Alt` shortcuts are still ignored.

## 2026-06-22

### Added

- Sprout language snippets (pull request #4).

### Changed

- Code cleanup: `let` instead of `var` in `js/app.js` and `js/themes.js`
  (pull request #4).

## 2026-06-21

### Added

- Go, Rust, SQL and Bash snippets.
- A `quotes` mode with 70 programming and wisdom lines.

### Changed

- More snippets for JavaScript, Python, TypeScript, Java and C++. There are
  now 274 code snippets across 9 languages, each checked to compile or parse.
- Snippets moved to one file per language under `js/snippets/`.

### Fixed

- The language selector wraps instead of overflowing on narrow screens.

## 2026-06-20

### Added

- Open Graph and Twitter link-preview tags and a preview card image.
- A "star on GitHub" link in the footer.

### Changed

- New monkey logo in the header and favicon. It follows the active theme.
- Redesigned link-preview card.
- Visual polish: background glow, caret glow, page-load animation, button
  hover states, visible keyboard focus and support for reduced motion.
- CSS variables reformatted for readability (pull request #2).

### Removed

- The shared Supabase leaderboard. The site no longer talks to any server.

## 2026-06-19

### Added

- First version of Codemonkey: a typing test for real code snippets in
  JavaScript, Python, TypeScript, Java and C++.
- `time` and `snippet` modes, live WPM and accuracy, and a results screen
  with a WPM-over-time graph.
- Smart auto-indentation: `Enter` fills in the next line's indentation.
- 9 themes, plus personal bests and recent history saved in `localStorage`.
- A shared leaderboard per language and mode, backed by Supabase (removed on
  2026-06-20).

### Changed

- The site is deployed by GitHub Pages from the `main` branch instead of a
  GitHub Actions workflow.
