"use client";
/**
 * ROUTE MAP VIEW
 * Shows the floors the route crosses, with the path drawn on each as a line
 * with markers: A = start (green), B = destination (red), numbers = points in
 * between (e.g. stairs). When a route spans floors, you get one map per floor.
 */
import { useRouter } from "next/navigation";
import FloorPlan from "@/components/FloorPlan";
import ViewToggle from "@/components/ViewToggle";
import { FLOOR_LIST } from "@/lib/floors";
import { locateNode } from "@/lib/floorgeo";

type PathPoint = { floorKey: string; x: number; y: number; label: string; kind: "start" | "end" | "via" };

export default function RouteMap({
  nodes,
  toName,
  view,
  setView,
}: {
  nodes: string[];
  toName: string;
  view: "steps" | "map";
  setView: (v: "steps" | "map") => void;
}) {
  const router = useRouter();

  // Place each route point on a floor map; drop any we can't draw.
  const located = nodes
    .map((n) => locateNode(n))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Label points: A = start, B = end, running numbers in between.
  let viaCount = 0;
  const points: PathPoint[] = located.map((p, i) => {
    const kind = i === 0 ? "start" : i === located.length - 1 ? "end" : "via";
    const label = kind === "start" ? "A" : kind === "end" ? "B" : String(++viaCount);
    return { ...p, kind, label };
  });

  // Group consecutive points by floor → one map per floor segment.
  const segments: { floorKey: string; pts: PathPoint[] }[] = [];
  for (const p of points) {
    const last = segments[segments.length - 1];
    if (last && last.floorKey === p.floorKey) last.pts.push(p);
    else segments.push({ floorKey: p.floorKey, pts: [p] });
  }
  const floorLabel = (k: string) => FLOOR_LIST.find((f) => f.key === k)?.label ?? k;

  return (
    <main className="mx-auto max-w-screen-md px-3 pb-12">
      <header className="-mx-3 mb-3 bg-gradient-to-br from-navy to-navy-deep px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} aria-label="Go back to start"
                  className="rounded-full bg-white/15 px-3 py-2 text-lg font-bold">←</button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-sky-100">Route to</div>
            <div className="truncate text-lg font-extrabold">{toName}</div>
          </div>
          <ViewToggle view={view} setView={setView} />
        </div>
        <p className="mt-2 text-center text-sm">
          <span className="font-bold text-green-300">A</span> = you ·{" "}
          <span className="font-bold text-red-300">B</span> = your room · follow the dotted line
        </p>
      </header>

      {segments.length === 0 && (
        <p className="mt-10 text-center text-lg text-slate-500">
          This route can&apos;t be shown on the map yet.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="overflow-hidden rounded-xl2 bg-white shadow ring-1 ring-slate-200">
            {segments.length > 1 && (
              <div className="bg-slate-100 px-4 py-2 text-sm font-bold text-navy">
                {i + 1}. {floorLabel(seg.floorKey)}
              </div>
            )}
            <div className="p-2">
              <FloorPlan floorKey={seg.floorKey} path={seg.pts} />
            </div>
          </div>
        ))}
      </div>

      {segments.length > 1 && (
        <p className="mt-3 px-2 text-center text-sm text-slate-500">
          Your route uses the stairs between floors — follow each map in order, top to bottom.
        </p>
      )}
    </main>
  );
}
