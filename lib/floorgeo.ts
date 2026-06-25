/**
 * Works out WHERE on a floor map each point of a route sits, so the Map view
 * can draw the path line through the rooms/stairs the student passes.
 */
import floorplans from "@/data/floorplans.json";
import { allLocations } from "@/content/wayfinding";
import { floorKeyForLocation } from "@/lib/floors";

type Cell = { x: number; y: number; w: number; h: number; label: string; roomId?: string; node?: string };
type Floor = { cells: Cell[] };
const FLOORS = floorplans as Record<string, Floor>;

export type Point = { floorKey: string; x: number; y: number };

const leadNum = (s: string) => {
  const m = s.match(/^\s*0*(\d+)/);
  return m ? Number(m[1]) : null;
};
const center = (c: Cell) => ({ x: c.x + c.w / 2, y: c.y + c.h / 2 });

// Index 1: a cell that declares a `node` (landmarks, stairs, toilets…).
const nodeIndex = new Map<string, Point>();
// Index 2: room number -> point, per floor.
const numIndex = new Map<string, Map<number, { x: number; y: number }>>();
for (const [floorKey, floor] of Object.entries(FLOORS)) {
  const byNum = new Map<number, { x: number; y: number }>();
  for (const c of floor.cells) {
    if (c.node && !nodeIndex.has(c.node)) nodeIndex.set(c.node, { floorKey, ...center(c) });
    const n = leadNum(c.roomId ?? c.label);
    if (n !== null) byNum.set(n, center(c));
  }
  numIndex.set(floorKey, byNum);
}

/** Where does this graph node sit on a floor map? null if it isn't drawn. */
export function locateNode(nodeId: string): Point | null {
  const direct = nodeIndex.get(nodeId);
  if (direct) return direct;
  // Room node → use the room number on the room's floor.
  const loc = allLocations.find((l) => l.node === nodeId);
  if (!loc) return null;
  const floorKey = floorKeyForLocation(loc);
  const n = leadNum(loc.id);
  if (!floorKey || n === null) return null;
  const pt = numIndex.get(floorKey)?.get(n);
  return pt ? { floorKey, ...pt } : null;
}
