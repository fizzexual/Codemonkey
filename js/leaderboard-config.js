/* ============================================================
   leaderboard-config.js — Supabase connection settings
   ------------------------------------------------------------
   These are PUBLIC values and safe to commit:
     • url      = your Supabase "Project URL"
     • anonKey  = your Supabase PUBLISHABLE key (sb_publishable_…)
                  — the browser/anon key, NOT the secret key.

   NEVER put the secret key (sb_secret_…) here — it grants full
   admin access and bypasses Row Level Security.

   The database is protected by Row Level Security + grants (see
   README.md): visitors can read the board and insert their own
   score, but cannot edit or delete anyone's scores.
   ============================================================ */
window.LEADERBOARD_CONFIG = {
  url: "https://jlcekfypmbggqbflwcus.supabase.co",
  anonKey: "sb_publishable_7H4DBVwmqgFgVNrkaYRmtQ_2LrbYA1g"
};
