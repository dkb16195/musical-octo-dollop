# SISD Wayfinder 🧭

A phone-friendly web app that helps new Grade 6 students find their way to their
next class using **step-by-step photo directions**.

There's no GPS and no map to read. A student picks **where they are now** and
**where they need to go**, and the app shows a set of real photos — one big
photo and one short instruction per card — guiding them the whole way.

- 📱 Works in any phone browser. No login, no app to install.
- 🏫 Uses the **real room list** from the school timetable app (95 rooms).
- 👩‍🏫 A teacher can add rooms, photos and routes **without coding** — see below.
- ♿ Built for anxious 11-year-olds: big buttons, simple words, high contrast.

---

## 🚦 The two things you'll ever touch

Almost everything you'll want to change lives in just two places:

| You want to… | Go to… |
| --- | --- |
| Add/change **directions & routes** | the file `content/wayfinding.ts` |
| Add/replace **photos** | the folder `public/photos/` |

That's it. You don't need to understand the rest of the code.

---

## ✍️ How to add a new route (the normal job)

A "route" is just a chain of short **hops**. You describe each hop once — a
photo, a short instruction, and the reverse instruction — and the app
automatically joins hops together to make routes between *any* two places, and
always finds the shortest one. **You never write directions for every pair of
rooms.**

Think of it like train stops: you only say how to get from each stop to the
*next* stop. The app works out the whole journey.

### Step 1 — take your photos
Stand at the first point, photograph what the student sees as they walk to the
next point. Repeat for each short hop along the way.

### Step 2 — drop the photos in
Put them in `public/photos/` with simple, lower-case names, e.g.
`atrium-to-stairs.jpg`. (Keep them around 800–1200px wide and "medium" quality
so they load fast on school wi-fi.)

### Step 3 — add the hops
Open `content/wayfinding.ts` and, in the **CONNECTIONS** list, copy an existing
block and fill it in:

```ts
{
  from: "atrium_g",                 // a point you start at  (a "node" id)
  to: "stairs_g",                   // the very next point   (a "node" id)
  photo: "atrium-to-stairs.jpg",    // the photo file you just added
  instruction: "Walk to the big stairs.",       // going from → to
  reverse: "Walk back to the main atrium.",      // coming back to → from
  alt: "The atrium with the main staircase ahead.", // (optional) describes the photo
},
```

If a point is brand new (not a classroom and not already listed), also add it to
the **NODES** list, and — if a student should be able to *pick* it — to the
**LANDMARKS** list. There are clear templates and comments in the file showing
exactly what to type.

### Step 4 — see it
Routes appear automatically. If two places aren't joined up yet, the app shows a
calm "No photo route yet" message instead of breaking.

---

## 🏫 How to add or change a **room**

The 95 rooms come straight from the **timetable app**, so the two apps stay in
sync and you never re-type rooms.

- The rooms live in `data/rooms.json` (just the room id + type).
- To refresh them after changing your timetable: update `data/rooms.json`
  (or save your whole school export as `data/sisd.yaml`) and run:

  ```bash
  npm run generate
  ```

This rewrites the room list. Your photos and routes are **not** touched.

> Each room automatically gets a floor (from its number: 0xx = Ground,
> 1xx = First, 2xx = Second, 3xx = Third), an icon, and a tidy name.

---

## 📍 How to add a **landmark** (toilets, library, entrance…)

Landmarks are the non-classroom places. Open `content/wayfinding.ts`, find the
**LANDMARKS** list, copy a line and edit it:

```ts
{ id: "toilets_g", name: "Toilets (Ground)", type: "toilet",
  icon: "🚻", floor: "G", node: "toilets_g" },
```

Then add a matching line in the **NODES** list with the same `node` value, and
connect it to its neighbours in **CONNECTIONS** (see "add a route" above).

---

## 🚀 How to publish & share it (same as the Duty Map)

The app is published as a plain static website on **GitHub Pages**.

**One-time setup (in the browser):**
1. Go to the repo on GitHub → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

**After that:** every time changes are pushed to the Wayfinder branch
(`claude/sisd-wayfinder-app-x5nf3q`), it rebuilds and republishes itself
automatically (via `.github/workflows/deploy.yml`). Your live link will be:

```
https://<your-username>.github.io/musical-octo-dollop/
```

**Sharing with students:**
- Send the link, or make a **QR code** from it (any free QR generator) and print
  it on posters / form-room screens.
- On a phone, students can tap the browser menu → **Add to Home Screen** to get
  a Wayfinder icon that opens full-screen like an app.

> Renamed the repo or moved to a custom domain / Vercel? Change `REPO_NAME` in
> `next.config.mjs` (set the base path to `""` if served from the root).

---

## 🧑‍💻 Running it on your own computer (optional)

You only need this if you want to preview changes before publishing.

```bash
npm install      # first time only
npm run dev      # then open http://localhost:3000
```

To build the static site exactly as it's published:

```bash
npm run build    # output appears in the /out folder
```

---

## ♿ Accessibility & design notes

- Large tap targets, big readable text, simple reading-age language.
- High-contrast SISD colours (navy/sky), meeting WCAG AA.
- Every photo has alt text (the `alt` field, or the instruction as a fallback).
- Clear keyboard focus outlines; respects "reduce motion" phone settings.
- A "Step 2 of 5" indicator is announced to screen readers.

---

## 🗺️ Adding a floor-plan later (not built yet)

There's no floor plan today, and routing doesn't need one. When you have one,
each node already carries a `floor` value, so a future `<FloorPlan/>` component
could sit on the route screen and highlight the current step on a plan image —
without changing any of the route data you've written.

---

## 🔮 Possible later phase (idea only)

Pull a student's real timetable (from an iSAMS export, or the timetable app) so
Wayfinder can suggest **"your next class"** automatically, pre-filling the
destination. Not built yet — noted for the future.

---

## 🗂️ Where things live (for the curious)

```
app/                 the screens (home, picker, route)
components/          reusable pieces (Picker, RouteCards)
lib/                 routing logic + small helpers
content/
  wayfinding.ts      ⭐ the ONE file teachers edit (landmarks, nodes, routes)
  rooms.generated.ts auto-made from the timetable rooms — do not edit by hand
data/rooms.json      the room list copied from the timetable app
public/photos/       ⭐ the route photos
scripts/             the room generator (npm run generate)
```
