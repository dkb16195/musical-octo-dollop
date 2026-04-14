# First Three Prompts for Claude Code

Open your terminal in the project root. Paste these one at a time.

---

## Prompt 1: Scaffold the project

```
Read CLAUDE.md, then scaffold the Next.js project. Use `npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias "@/*"` (say yes to overwrite). Then install @supabase/supabase-js and @supabase/ssr. Create the file structure from CLAUDE.md — lib/supabase/client.ts, lib/supabase/server.ts, middleware.ts for auth, and placeholder pages for /log, /week, /plan, /review. Use the environment variable names from CLAUDE.md. Don't build features yet — just the skeleton with auth middleware that redirects unauthenticated users to /auth/login.
```

## Prompt 2: Database schema + /log

```
Read CLAUDE.md for the database conventions. Write a Supabase SQL migration file at supabase/migrations/001_initial_schema.sql that creates: the pillar enum, a weeks table (id, week_of, intentions jsonb, review jsonb, created_at, updated_at), a days table (id, week_id fk, date, created_at), and an entries table (id, day_id fk, content text, pillar enum, tags text[], created_at, updated_at). Add RLS policies on all tables — only the authenticated user can CRUD their own rows (use auth.uid()). Then build the /log page: a form with a textarea for content, a pillar selector (radio buttons or simple dropdown), and a submit button. Use a Server Action to insert the entry, auto-creating the day and week records if they don't exist.
```

## Prompt 3: /week view

```
Build the /week page from CLAUDE.md. It should show the current week (Monday to Sunday), with a header showing the week date range. Below that, show entries grouped by day, each entry showing its pillar as a colored badge and its content. If it's Monday and no intentions exist, show a prompt to go to /plan. If it's Friday or later, show a link to /review. Add a floating "+" button in the bottom right that links to /log. Make it mobile-first — single column, generous spacing, readable on a phone screen.
```

---

## After These Three

You'll have a working app with auth, a database, daily logging, and a weekly view. From there:
- Build `/plan` (Monday intentions)
- Build `/review` (Friday+ weekly reflection)
- Build `/dashboard` (landing page with current week summary)
- Wire up Claude API for summaries (Phase 3)

Each of those is one prompt to Claude Code.
