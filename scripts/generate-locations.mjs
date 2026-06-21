/**
 * generate-locations.mjs
 * ----------------------------------------------------------------------------
 * Turns your school's room list into the typed location list the app uses.
 *
 * WHY THIS EXISTS:
 *   The master room list comes from your TIMETABLE app (the file you upload to
 *   it). We keep the rooms here in data/rooms.json so the two apps stay in
 *   sync and you never re-type rooms by hand.
 *
 * HOW TO REFRESH THE ROOMS LATER (no coding needed):
 *   1. In your timetable app, export / locate your school YAML file.
 *   2. EITHER: copy its `rooms:` list into data/rooms.json (id + type),
 *      OR: save the whole YAML as data/sisd.yaml (this script will read it).
 *   3. Run:  npm run generate
 *   This rewrites content/rooms.generated.ts. Your routes/photos are NOT touched.
 *
 * This script is plumbing — you normally won't open it.
 * ----------------------------------------------------------------------------
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// Emoji icon shown next to each location, chosen by room type.
const ICON = {
  classroom: "📘", science_lab: "🔬", music: "🎵", art: "🎨",
  design_workshop: "🛠️", drama: "🎭", it_lab: "💻", pe_space: "🏀",
  support_room: "🤝",
};

// Map the timetable's room "type" to a simpler Wayfinder category.
const WTYPE = {
  classroom: "classroom", science_lab: "lab", music: "music", art: "art",
  design_workshop: "design", drama: "drama", it_lab: "lab", pe_space: "sports",
  support_room: "support",
};

// Work out which floor a room is on from its number (0xx=Ground, 1xx=First...).
function floorOf(id) {
  const m = String(id).match(/^\s*(\d)/);
  if (m) return { "0": "G", "1": "1", "2": "2", "3": "3" }[m[1]] ?? "G";
  const up = String(id).toUpperCase();
  if (up.includes("AUDITORIUM")) return "3";
  return "X"; // FIELD1, Sports Hall, Dance Studio... = outdoor / sports
}

// Make a friendly display name, e.g. "001 - Science Lab" -> "Science Lab 001".
function friendly(id) {
  const s = String(id).trim();
  let m = s.match(/^(\d{1,3})\s*-\s*(.+)$/);
  if (m) return `${m[2].trim()} ${m[1]}`;
  m = s.match(/^(\d{1,3})\s+(.+)$/);
  if (m) return `${m[2].trim()} ${m[1]}`;
  if (/^\d{1,3}$/.test(s)) return `Room ${s}`;
  return s;
}

// A safe id for the graph node that sits at this room.
function nodeId(id) {
  const slug = String(id).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `room_${slug}`;
}

// --- Read the rooms: prefer a full YAML if present, else rooms.json ---------
let rooms;
if (existsSync("data/sisd.yaml")) {
  const YAML = (await import("yaml")).default;
  rooms = YAML.parse(readFileSync("data/sisd.yaml", "utf8")).rooms;
  console.log("Read rooms from data/sisd.yaml");
} else {
  rooms = JSON.parse(readFileSync("data/rooms.json", "utf8"));
  console.log("Read rooms from data/rooms.json");
}

const locations = rooms.map((r) => {
  const id = String(r.id);
  const t = r.type;
  return {
    id,
    name: friendly(id),
    type: WTYPE[t] ?? "classroom",
    icon: ICON[t] ?? "📘",
    floor: floorOf(id),
    node: nodeId(id),
  };
});

const header = `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
// Created by scripts/generate-locations.mjs from your timetable room list.
// To change rooms, update data/rooms.json (or data/sisd.yaml) then run:
//   npm run generate
import type { Location } from "./wayfinding";

export const generatedRooms: Location[] = `;

writeFileSync(
  "content/rooms.generated.ts",
  header + JSON.stringify(locations, null, 2) + ";\n",
);
console.log(`Wrote content/rooms.generated.ts with ${locations.length} rooms.`);
