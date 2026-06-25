/**
 * Helpers for the floor-plan view: the list of floors (for the switcher) and a
 * way to find which floor map a chosen location appears on.
 */
import type { Location } from "@/content/wayfinding";

export const FLOOR_LIST: { key: string; label: string }[] = [
  { key: "secondary-ground", label: "Secondary · Ground" },
  { key: "secondary-first", label: "Secondary · First" },
  { key: "secondary-second", label: "Secondary · Second" },
  { key: "secondary-third", label: "Secondary · Third" },
  { key: "auditorium-first", label: "Auditorium · First" },
  { key: "auditorium-second", label: "Auditorium · Second" },
  { key: "auditorium-third", label: "Auditorium · Third" },
  { key: "bridge-third", label: "Bridge · Third" },
];

const FLOOR_NAME: Record<string, string> = { G: "ground", "1": "first", "2": "second", "3": "third" };

/** Which floor-plan key does this place appear on? (null if not mapped, e.g. sports.) */
export function floorKeyForLocation(loc: Location | null | undefined): string | null {
  if (!loc) return null;
  const name = FLOOR_NAME[loc.floor];
  if (!name) return null;
  const key = `${loc.building}-${name}`;
  return FLOOR_LIST.some((f) => f.key === key) ? key : null;
}
