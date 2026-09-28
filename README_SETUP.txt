LEARNFLOW - GOOGLE SIGN-IN + PRIVATE USER WORKSPACES

Replace:
  src/main.jsx
  src/styles.css
  src/lib/supabase.js

Then:
1. Open Supabase -> SQL Editor.
2. Run supabase_setup.sql once.
3. Open Supabase -> Authentication -> Providers -> Google.
4. Enable Google and enter the Google OAuth Client ID + Client Secret.
5. Use the callback URL Supabase shows you in the Google Cloud OAuth configuration.
6. In Supabase -> Authentication -> URL Configuration:
   - Site URL = your live LearnFlow website
   - Redirect URLs = your live URL and your localhost Vite URL
7. Keep VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
8. Restart: npm run dev

RESULT:
- A new Google user gets an empty workspace.
- Courses, tasks, and notes save in Supabase.
- Returning users get their own saved data back.
- Row Level Security prevents one signed-in user from reading another user's records.
- Existing email/password login still works.

TEST:
A) Google account A -> add course/task/note -> sign out.
B) Google account B -> workspace should be empty.
C) Sign back into A -> A's saved content should return.
