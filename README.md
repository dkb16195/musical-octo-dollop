# SISD Wayfinder

A phone-friendly web app that guides new students to their next class using
step-by-step **photo** directions. No GPS — students pick where they are and
where they're going, and the app shows ordered photo cards.

Built with Next.js (App Router) + TypeScript + Tailwind, deployed as a static
site to GitHub Pages (same launch/sharing style as the SISD Duty Map).

**Status:** Phase 2 complete (home screen + searchable location pickers, using
the real 95-room list from the timetable app). Phase 3 adds the route-finding
and photo step-cards. A full "how to add content & deploy" guide arrives in
Phase 4.

Teachers edit one file: `content/wayfinding.ts`. Rooms come from the timetable
app via `data/rooms.json` (run `npm run generate` to refresh them).
