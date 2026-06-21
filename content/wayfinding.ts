// ============================================================================
//  SISD WAYFINDER — CONTENT FILE
//  This is the ONE file a teacher edits. You do NOT need to be a coder.
//  (The 95 classrooms come automatically from the timetable app — see bottom.)
//
//  There are THREE lists to understand:
//    1) LANDMARKS   — non-classroom places (atrium, canteen, stairs, toilets…)
//    2) NODES       — points on the school "map" that routes pass through
//    3) CONNECTIONS — one short hop between two points: a photo + an instruction
//
//  The app joins all the hops together and works out the shortest route between
//  ANY two places by itself. So you only describe each short step ONCE.
//
//  ⚠️ Keep the punctuation exactly as shown: each item sits inside { } and ends
//     with a comma. If something looks broken, compare against the examples.
// ============================================================================

// ---- The "shape" of our data (you can ignore the technical bits) -----------
export type LocationType =
  | "classroom" | "lab" | "music" | "art" | "design" | "drama" | "sports"
  | "support" | "landmark" | "canteen" | "toilet" | "library" | "office"
  | "entrance"; // ← add more categories here if you ever need them

export type Location = {
  id: string;      // a unique code. For rooms this matches the timetable id.
  name: string;    // the friendly name a student reads, e.g. "Canteen"
  type: LocationType;
  icon: string;    // an emoji shown in the list, e.g. "🍽️"
  floor: string;   // "G", "1", "2", "3", or "X" for outdoor / sports
  node: string;    // which NODE (below) this place sits at
};

export type MapNode = {
  id: string;      // a unique code, e.g. "atrium_g"
  name: string;    // a human label, e.g. "Ground Floor Atrium"
  floor?: string;  // optional — used later if we add a floor-plan view
};

export type Connection = {
  from: string;        // a node id
  to: string;          // a node id (the NEXT point along the way)
  photo: string;       // a photo file inside /public/photos, e.g. "atrium-stairs.jpg"
  instruction: string; // what to do going FROM → TO, e.g. "Walk to the big stairs."
  reverse: string;     // what to do coming back TO → FROM (powers "reverse route")
};

// ============================================================================
//  1) LANDMARKS  — the non-classroom places.
//  These real SISD places come from the Duty Map app. Add toilets, the library,
//  the main entrance, etc. here. Each one needs a matching NODE in list 2.
//  TEMPLATE to copy:
//    { id: "my_place", name: "My Place", type: "landmark", icon: "📍",
//      floor: "G", node: "my_place" },
// ============================================================================
export const landmarks: Location[] = [
  // --- Ground floor ---
  { id: "entrance",   name: "Main Entrance",        type: "entrance", icon: "🚪", floor: "G", node: "entrance" },
  { id: "atrium_g",   name: "Ground Floor Atrium",  type: "landmark", icon: "🏛️", floor: "G", node: "atrium_g" },
  { id: "stairs_g",   name: "Main Stairs (Ground)", type: "landmark", icon: "🪜", floor: "G", node: "stairs_g" },
  { id: "canteen",    name: "Canteen",              type: "canteen",  icon: "🍽️", floor: "G", node: "canteen" },
  { id: "grabgo_g",   name: "Grab & Go (Ground)",   type: "canteen",  icon: "🥪", floor: "G", node: "grabgo_g" },
  // --- First floor ---
  { id: "atrium_1",   name: "First Floor Atrium",   type: "landmark", icon: "1️⃣", floor: "1", node: "atrium_1" },
  { id: "bridge_1",   name: "First Floor Bridge",   type: "landmark", icon: "🌉", floor: "1", node: "bridge_1" },
  // --- Second floor ---
  { id: "atrium_2",   name: "Second Floor Atrium",  type: "landmark", icon: "2️⃣", floor: "2", node: "atrium_2" },
  // --- Third floor ---
  { id: "atrium_3",   name: "Third Floor Atrium",   type: "landmark", icon: "3️⃣", floor: "3", node: "atrium_3" },
  // --- Outdoor / sports ---
  { id: "courtyard",  name: "Courtyard",            type: "landmark", icon: "🌳", floor: "X", node: "courtyard" },

  // EXAMPLES TO FILL IN LATER (uncomment and adjust when you have them):
  // { id: "toilets_g", name: "Toilets (Ground)", type: "toilet",  icon: "🚻", floor: "G", node: "toilets_g" },
  // { id: "library",   name: "Library",          type: "library", icon: "📚", floor: "1", node: "library" },
];

// ============================================================================
//  2) NODES  — every point a route can pass through.
//  Rooms get their nodes automatically. Here you only list the SHARED points
//  (atria, stairs, bridges, doorways) and a node for each landmark above.
//  RULE: every landmark's "node" value must appear here.
// ============================================================================
export const nodes: MapNode[] = [
  { id: "entrance",  name: "Main Entrance",        floor: "G" },
  { id: "atrium_g",  name: "Ground Floor Atrium",  floor: "G" },
  { id: "stairs_g",  name: "Main Stairs (Ground)", floor: "G" },
  { id: "canteen",   name: "Canteen",              floor: "G" },
  { id: "grabgo_g",  name: "Grab & Go (Ground)",   floor: "G" },
  { id: "stairs_1",  name: "Main Stairs (First)",  floor: "1" },
  { id: "atrium_1",  name: "First Floor Atrium",   floor: "1" },
  { id: "bridge_1",  name: "First Floor Bridge",   floor: "1" },
  { id: "stairs_2",  name: "Main Stairs (Second)", floor: "2" },
  { id: "atrium_2",  name: "Second Floor Atrium",  floor: "2" },
  { id: "stairs_3",  name: "Main Stairs (Third)",  floor: "3" },
  { id: "atrium_3",  name: "Third Floor Atrium",   floor: "3" },
  { id: "courtyard", name: "Courtyard",            floor: "X" },
];

// ============================================================================
//  3) CONNECTIONS  — the short hops, each with ONE photo + ONE instruction.
//  Fully worked EXAMPLE ROUTES are added in the next phase. For now this is a
//  template so you can see the pattern:
//
//    { from: "atrium_g", to: "stairs_g",
//      photo: "atrium-to-stairs.jpg",
//      instruction: "Walk straight ahead to the big stairs.",
//      reverse: "Walk back to the main atrium." },
//
//  You do NOT connect every room to every room — just neighbours. The app
//  finds the full route by joining hops together.
// ============================================================================
export const connections: Connection[] = [
  // (Phase 3 will seed 2–3 complete example routes here.)
];

// ============================================================================
//  THE MASTER LOCATION LIST  (rooms + landmarks)  — used by the picker.
//  `generatedRooms` is the 95 real rooms from your timetable app. Do not edit
//  that file by hand; edit data/rooms.json and run `npm run generate` instead.
// ============================================================================
import { generatedRooms } from "./rooms.generated";

export const allLocations: Location[] = [...generatedRooms, ...landmarks];
