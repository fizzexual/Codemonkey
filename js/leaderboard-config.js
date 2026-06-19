/* ============================================================
   leaderboard-config.js — Supabase connection settings
   ------------------------------------------------------------
   Fill these in with your own Supabase project values:

     Supabase dashboard → Project Settings → API
       • url      = "Project URL"      (e.g. https://abcd1234.supabase.co)
       • anonKey  = Project API keys → "anon" / "public"

   These are PUBLIC keys and safe to commit. The database is
   protected by Row Level Security (see the SQL in README.md):
   visitors can read the board and insert their own score, but
   cannot edit or delete anyone's scores.

   Until these are filled in, the leaderboard UI shows a friendly
   "not configured yet" message and the rest of the site works
   exactly as before.
   ============================================================ */
window.LEADERBOARD_CONFIG = {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
