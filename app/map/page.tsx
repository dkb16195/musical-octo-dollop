"use client";
/**
 * MAP VIEW (template)
 * Shows a floor plan with optional highlighting. For now this previews the
 * Secondary Ground Floor with two places highlighted, so we can agree the look
 * before adding the other seven floors and wiring it to the route screen.
 */
import Link from "next/link";
import FloorPlan from "@/components/FloorPlan";

export default function MapPage() {
  return (
    <main className="mx-auto max-w-screen-md px-3 pb-12">
      <header className="-mx-3 mb-3 bg-gradient-to-br from-navy to-navy-deep px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Go back" className="rounded-full bg-white/15 px-3 py-2 text-lg font-bold">←</Link>
          <h1 className="text-xl font-extrabold">Map preview</h1>
        </div>
        <p className="mt-1 text-sm text-sky-100">
          📍 = highlighted place. This is a template of one floor for approval.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl2 bg-white p-2 shadow ring-1 ring-slate-200">
        <FloorPlan
          floorKey="secondary-ground"
          highlight={["reception", "008 - Science Lab"]}
        />
      </div>
    </main>
  );
}
