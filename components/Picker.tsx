"use client";
/**
 * PICKER SCREEN
 * A big, searchable, scrollable list of every place in school.
 * Tapping one saves the choice and returns to the home screen.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { allLocations, BUILDINGS, type Location } from "@/content/wayfinding";
import { setChoiceId, type Slot } from "@/lib/store";

// The floors, in order, with the words a student reads.
const FLOORS: { key: string; label: string }[] = [
  { key: "G", label: "Ground Floor" },
  { key: "1", label: "First Floor" },
  { key: "2", label: "Second Floor" },
  { key: "3", label: "Third Floor" },
  { key: "X", label: "Sports & Outdoor" },
];

const TITLE: Record<Slot, string> = {
  from: "Where are you now?",
  to: "Where do you need to go?",
};

export default function Picker({ slot }: { slot: Slot }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Filter by what the student types (matches name or room number).
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLocations;
    return allLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q),
    );
  }, [query]);

  // Group the matches by Building → Floor so the list is easy to scan.
  const byBuildingFloor = useMemo(() => {
    const map = new Map<string, Location[]>(); // key = `${building}|${floor}`
    for (const l of matches) {
      const key = `${l.building}|${l.floor}`;
      const arr = map.get(key) ?? [];
      arr.push(l);
      map.set(key, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return map;
  }, [matches]);

  function choose(id: string) {
    setChoiceId(slot, id);
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col">
      {/* Sticky header with a back button and the search box */}
      <header className="sticky top-0 z-10 bg-gradient-to-br from-navy to-navy-deep px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            aria-label="Go back"
            className="rounded-full bg-white/15 px-3 py-2 text-lg font-bold"
          >
            ←
          </button>
          <h1 className="text-xl font-extrabold">{TITLE[slot]}</h1>
        </div>
        <input
          type="search"
          inputMode="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a room or place…"
          aria-label="Search for a place"
          className="mt-3 w-full rounded-xl2 border-0 px-4 py-3 text-lg text-ink shadow-inner placeholder:text-slate-400"
        />
      </header>

      {/* The grouped list */}
      <div className="flex-1 px-4 pb-12 pt-3">
        {matches.length === 0 && (
          <p className="mt-10 text-center text-lg text-slate-500">
            No places found. Try a different word.
          </p>
        )}

        {BUILDINGS.map((building) => {
          // Does this building have any matches on any floor?
          const hasAny = FLOORS.some(
            (f) => (byBuildingFloor.get(`${building.id}|${f.key}`)?.length ?? 0) > 0,
          );
          if (!hasAny) return null;
          return (
            <section key={building.id} className="mb-6">
              <h2 className="sticky top-[8.5rem] z-[1] -mx-1 mb-1 rounded-lg bg-paper/95 px-2 py-1.5 text-base font-extrabold text-navy backdrop-blur">
                {building.name}
              </h2>
              {FLOORS.map((f) => {
                const items = byBuildingFloor.get(`${building.id}|${f.key}`);
                if (!items || items.length === 0) return null;
                return (
                  <div key={f.key} className="mb-3">
                    <h3 className="px-1 pb-1.5 pt-1 text-sm font-bold uppercase tracking-wide text-slate-600">
                      {f.label}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {items.map((l) => (
                        <li key={l.id}>
                          <button
                            onClick={() => choose(l.id)}
                            className="flex w-full items-center gap-4 rounded-xl2 bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
                          >
                            <span aria-hidden className="text-3xl">
                              {l.icon}
                            </span>
                            <span className="text-xl font-bold text-navy">
                              {l.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </main>
  );
}
