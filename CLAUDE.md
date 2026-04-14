# Craig OS

Personal operating system for Craig — a single Next.js app that consolidates weekly planning, daily reflection, business tracking, and family coordination into one calm interface.

## What This Is

Craig OS is a private dashboard that replaces scattered notes, spreadsheets, and mental load with a unified system. It runs on Supabase (Postgres + Auth + Edge Functions) and Next.js, deployed to Vercel. The user is Craig — one user, one login, no multi-tenancy.

## Core Mental Model

Everything flows through **weeks**. A week starts on Monday with intentions and ends on Sunday with a review. Days sit inside weeks. Entries sit inside days. The whole UI should feel like a calm journal, not a project management tool.

## The Five Pillars

Every part of Craig OS maps to one of these life pillars:

1. **SISD** — Craig's consultancy (Strategy, Innovation, Sustainable Development). Track active engagements, pipeline, revenue targets, and key deliverables.
2. **Breath** — Craig's breathwork / wellness practice. Track sessions, client notes, and growth metrics for the practice.
3. **The Portal** — A creative/community project. Track milestones, collaborators, and progress.
4. **Family** — Family coordination, priorities, and presence. Not a shared calendar — Craig's own awareness of what matters this week for the people he loves.
5. **Health & Self** — Personal fitness, sleep, energy, and anything that keeps the engine running.

## Key Features (Build Order)

### Phase 1: Foundation
- **Auth**: Supabase auth, single user, email/password. Protect all routes.
- **Database schema**: weeks, days, entries, pillars. Keep it simple — prefer fewer tables with a `pillar` enum over pillar-specific tables.
- **`/log`**: The daily journal. A simple form: select a pillar, write a reflection, optionally tag it. Entries are timestamped and belong to a day which belongs to a week.
- **`/week`**: The weekly view. Shows the current week's intentions (set Monday), daily entries grouped by pillar, and a "review" section that unlocks Friday onwards.

### Phase 2: Planning & Review
- **`/plan`**: Monday planning page. Set 3-5 intentions for the week, assign each to a pillar. These show up on `/week`.
- **`/review`**: End-of-week reflection. Auto-surfaces the week's entries, asks "what worked / what didn't / what's next" per pillar. Saves as a structured review.
- **`/dashboard`**: Landing page. Current week summary, streaks, upcoming intentions, quick-add entry button.

### Phase 3: Intelligence
- **AI summaries**: Use Claude API to summarize weekly reviews, spot patterns across weeks, surface insights ("You haven't logged anything under Family in 2 weeks").
- **`/ask`**: A chat interface where Craig can ask questions about his own data ("What were my SISD wins last month?"). RAG over entries using Supabase pgvector.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Database**: Supabase (Postgres, Row Level Security, Auth)
- **Styling**: Tailwind CSS. Clean, minimal, mobile-first. No component library unless absolutely needed.
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514 for summaries, claude-haiku-4-5-20251001 for chat/quick tasks)
- **Deployment**: Vercel
- **Language**: TypeScript throughout. Strict mode.

## Database Conventions

- All tables have `id` (uuid, default gen_random_uuid()), `created_at`, `updated_at`.
- Use Row Level Security on every table. Policies should check `auth.uid()` matches the user.
- Pillar is an enum: `sisd`, `breath`, `portal`, `family`, `health`.
- Weeks are identified by their Monday date (`week_of` date field).
- Entries have: `content` (text), `pillar` (enum), `day_id` (fk), `tags` (text[]).

## Code Conventions

- Use Server Components by default. Only add `"use client"` when you need interactivity.
- Server Actions for all mutations. No API routes unless needed for webhooks.
- One feature per directory under `app/`: `app/log/`, `app/week/`, `app/plan/`, etc.
- Shared components in `components/`. Database queries in `lib/db/`. Supabase client in `lib/supabase/`.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.
- Keep files short. If a component exceeds ~150 lines, break it up.
- No premature abstraction. Build the simple thing first.

## File Structure

```
craig-os/
  CLAUDE.md
  app/
    layout.tsx          # Root layout, auth provider
    page.tsx            # Dashboard (/)
    log/page.tsx        # Daily journal
    week/page.tsx       # Weekly view
    plan/page.tsx       # Monday planning
    review/page.tsx     # Weekly review
    ask/page.tsx        # AI chat (Phase 3)
    auth/
      login/page.tsx
      callback/route.ts
  components/
    entry-form.tsx
    entry-list.tsx
    week-header.tsx
    pillar-badge.tsx
    nav.tsx
  lib/
    supabase/
      client.ts         # Browser client
      server.ts         # Server client
      middleware.ts      # Auth middleware
    db/
      entries.ts
      weeks.ts
      days.ts
    ai/
      summarize.ts
      ask.ts
  supabase/
    migrations/         # SQL migration files
  middleware.ts         # Next.js middleware for auth
```

## Voice & UX

The tone of the app should feel like a personal notebook — warm, private, zero corporate energy. No gamification. No streaks with fire emojis. Just a clean, honest tool that helps Craig see his own life clearly.

Mobile-first. Craig will log from his phone often. Desktop is for weekly review and planning.

## When In Doubt

- Simpler is better. One table beats two. A text field beats a structured form. Ship it, then refine.
- Craig is the only user. Don't build for scale. Build for clarity.
- If a feature doesn't map to a pillar, question whether it belongs.
- Protect writing time. The most important feature is `/log` — if Craig uses that daily, everything else follows.
