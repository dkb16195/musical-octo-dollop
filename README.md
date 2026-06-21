# Perked — Card Benefits Tracker

A beautiful, iOS-Reminders-style checklist for the annual & recurring benefits on
you and your partner's credit cards. Built as a **single, self-contained React
artifact** — just open `index.html` in any browser. No build step, no install.

## Use it

Open `index.html`. Everything saves to your browser's `localStorage`, so your
cards and check-offs stick around between visits. To use it on both your phones,
open the same file/URL on each device (each keeps its own local copy).

## Features

- **Unlimited cards, added dynamically.** Pick from built-in templates (Amex
  Platinum, Gold, Sapphire Reserve, Venture X, …), set a **quantity** to create
  several identical cards at once (each tracked as its own checklist), or build a
  fully custom card. Every card is editable and deletable.
- **Benefits with real reset cadences.** Each benefit has a name, dollar value, a
  note, and a cadence: monthly (12 boxes), quarterly (4), semi-annual (2), annual
  (1), or **perk** (info-only, no checkbox). The current period is highlighted so
  you know what's live, with a `used X/N` counter per benefit.
- **Two views via a segmented control:**
  - **To-Do** (default) — one clean checklist of everything claimable *right now*
    across every card. Tap the circle to check; done items drop into a
    "Done this period" group showing **who** checked it and **when**.
  - **All Cards** — each card expands to its full punchcard grid of benefits and
    periods.
- **Reset dates.** Per card, choose *Calendar year (Jan 1)* or *Card anniversary*
  (with a date). Annual benefits anchor to that date and show "renews [date]";
  anniversary cards without a date get a gentle "set reset date" nudge.
  Monthly/quarterly/semi-annual stay on the calendar — accurate to how cards work.
- **ROI stats.** A dark "metal card" hero panel up top: big **Available to claim
  now** number, plus value captured this year, total annual potential, total
  annual fees, and net captured (value − fees).
- **Two-person aware.** Tap your avatar (top right) before checking things off so
  you both know who claimed what. Edit the names to match you and your partner.

## Tech

Single HTML file: React 18 + Babel (in-browser) + Tailwind, all via CDN.
