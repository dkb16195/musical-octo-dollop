"use client";
/**
 * MAP VIEW
 * Browsable floor plans with a Building·Floor switcher. If opened with
 * ?floor=...&hl=id1,id2 it jumps to that floor and highlights those places
 * (used by the "See it on the map" button on the route screen).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import FloorPlan from "@/components/FloorPlan";
import { FLOOR_LIST } from "@/lib/floors";

export default function MapPage() {
  const [floorKey, setFloorKey] = useState<string>(FLOOR_LIST[0].key);
  const [highlight, setHighlight] = useState<string[]>([]);

  // Read the floor + highlights from the address (set when arriving from a route).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("floor");
    if (f && FLOOR_LIST.some((x) => x.key === f)) setFloorKey(f);
    const hl = p.get("hl");
    if (hl) setHighlight(hl.split(",").filter(Boolean));
  }, []);

  return (
    <main className="mx-auto max-w-screen-md px-3 pb-12">
      <header className="-mx-3 mb-3 bg-gradient-to-br from-navy to-navy-deep px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Go back" className="rounded-full bg-white/15 px-3 py-2 text-lg font-bold">←</Link>
          <h1 className="text-xl font-extrabold">Campus map</h1>
        </div>
        <p className="mt-1 text-sm text-sky-100">📍 = a place you chose. Tap a floor below to look around.</p>
      </header>

      {/* Floor switcher */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {FLOOR_LIST.map((f) => (
          <button
            key={f.key}
            onClick={() => setFloorKey(f.key)}
            aria-pressed={floorKey === f.key}
            className={`flex-none rounded-xl2 px-4 py-2.5 text-sm font-bold shadow-sm ring-1 ring-slate-200 active:scale-[0.99] ${
              floorKey === f.key ? "bg-navy text-white" : "bg-white text-navy"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl2 bg-white p-2 shadow ring-1 ring-slate-200">
        <FloorPlan floorKey={floorKey} highlight={highlight} />
      </div>
    </main>
  );
}
