# Security Policy

## Supported Versions

Codemonkey has no versioned releases. Security fixes are applied to the
`main` branch, which is what the live site at
https://fizzexual.github.io/Codemonkey/ always runs.

| Version | Supported |
| ------- | --------- |
| current `main` / live site | Yes |
| older commits and forks | No |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report it privately by email to **fizzexual@gmail.com**. This keeps
the details confidential until a fix is available.

When reporting, please include:

- The page URL or the commit you tested
- Your browser and its version
- Steps to reproduce (a minimal proof of concept if possible)
- What an attacker could do with it (the impact)
- Any suggested fix

You can expect an initial response within 7 days. Once the issue is
confirmed, a fix will be pushed to `main`, which updates the live site.

## Scope

Codemonkey is a static, client-side app in plain HTML, CSS and JavaScript. It
has no backend, no accounts and no server-side storage. Your settings,
personal bests and history are stored only in your own browser's
`localStorage`. The page loads fonts from Google Fonts.

Reports about the following are especially welcome:

- Script injection through snippet content, themes or saved `localStorage`
  data
- Anything that lets another site read or change your saved data
- Problems in how the page is served from GitHub Pages

Issues in GitHub Pages itself, in Google Fonts, or in your browser should be
reported to those vendors.
