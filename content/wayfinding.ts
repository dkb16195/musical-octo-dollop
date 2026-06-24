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
  building: BuildingId; // which building it's in (see BUILDINGS below)
  floor: string;   // "G", "1", "2", "3", or "X" for outdoor / sports
  node: string;    // which NODE (below) this place sits at
};

// The campus has separate buildings. The picker groups places by Building →
// Floor so students aren't shown three different "Room 305"s in one list.
export type BuildingId =
  | "secondary" | "auditorium" | "bridge" | "sports" | "other";

export const BUILDINGS: { id: BuildingId; name: string }[] = [
  { id: "secondary", name: "Secondary Building" },
  { id: "auditorium", name: "Auditorium Building" },
  { id: "bridge", name: "Bridge Wing (New Classrooms)" },
  { id: "sports", name: "Sports & Outdoor" },
  { id: "other", name: "Other" },
];

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
  alt?: string;        // OPTIONAL: describes the photo for screen-readers /
                       // blind users. If you leave it out, the instruction is
                       // used. Adding a real description is kinder & more accessible.
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
  // === SECONDARY BUILDING ===
  { id: "reception",    name: "Reception / Main Entrance", type: "entrance", icon: "🚪", building: "secondary", floor: "G", node: "reception" },
  { id: "courtyard",    name: "Central Courtyard / Stadium", type: "landmark", icon: "🏟️", building: "secondary", floor: "G", node: "courtyard" },
  { id: "wc_sec_g",     name: "Toilets — Secondary (Ground)", type: "toilet", icon: "🚻", building: "secondary", floor: "G", node: "wc_sec_g" },
  { id: "wc_sec_1",     name: "Toilets — Secondary (First)",  type: "toilet", icon: "🚻", building: "secondary", floor: "1", node: "wc_sec_1" },
  { id: "wc_sec_2",     name: "Toilets — Secondary (Second)", type: "toilet", icon: "🚻", building: "secondary", floor: "2", node: "wc_sec_2" },
  { id: "wc_sec_3",     name: "Toilets — Secondary (Third)",  type: "toilet", icon: "🚻", building: "secondary", floor: "3", node: "wc_sec_3" },

  // === AUDITORIUM BUILDING ===
  { id: "canteen",      name: "New Canteen (Grab & Go)", type: "canteen", icon: "🍽️", building: "auditorium", floor: "1", node: "canteen" },
  { id: "parent_cafe",  name: "Parent Café",            type: "canteen",  icon: "☕", building: "auditorium", floor: "1", node: "parent_cafe" },
  { id: "auditorium",   name: "Auditorium",             type: "landmark", icon: "🎭", building: "auditorium", floor: "1", node: "auditorium" },
  { id: "lib_primary",  name: "Primary Library",        type: "library",  icon: "📚", building: "auditorium", floor: "2", node: "lib_primary" },
  { id: "lib_secondary",name: "Secondary Library",      type: "library",  icon: "📚", building: "auditorium", floor: "2", node: "lib_secondary" },
  { id: "art_display",  name: "Art Display Open Area",   type: "landmark", icon: "🖼️", building: "auditorium", floor: "3", node: "art_display" },
  { id: "wc_aud_1",     name: "Toilets — Auditorium (First)", type: "toilet", icon: "🚻", building: "auditorium", floor: "1", node: "wc_aud_1" },
  { id: "wc_aud_3",     name: "Toilets — Auditorium (Third)", type: "toilet", icon: "🚻", building: "auditorium", floor: "3", node: "wc_aud_3" },

  // === BRIDGE WING ===
  { id: "wc_bridge_3",  name: "Toilets — Bridge (Third)", type: "toilet", icon: "🚻", building: "bridge", floor: "3", node: "wc_bridge_3" },

  // ➕ Add more landmarks with the same pattern. Remember to also add a matching
  //    NODE below, then connect it to its neighbours in CONNECTIONS.
];

// ============================================================================
//  2) NODES  — every point a route can pass through.
//  Rooms get their nodes automatically. Here you only list the SHARED points
//  (atria, stairs, bridges, doorways) and a node for each landmark above.
//  RULE: every landmark's "node" value must appear here.
// ============================================================================
export const nodes: MapNode[] = [
  // --- Secondary Building: landmarks + stair core (one node per floor) ---
  { id: "reception",    name: "Reception / Main Entrance",   floor: "G" },
  { id: "courtyard",    name: "Central Courtyard / Stadium", floor: "G" },
  { id: "wc_sec_g",     name: "Toilets — Secondary (Ground)", floor: "G" },
  { id: "wc_sec_1",     name: "Toilets — Secondary (First)",  floor: "1" },
  { id: "wc_sec_2",     name: "Toilets — Secondary (Second)", floor: "2" },
  { id: "wc_sec_3",     name: "Toilets — Secondary (Third)",  floor: "3" },
  { id: "stairs_sec_g", name: "Secondary Stairs (Ground)",   floor: "G" },
  { id: "stairs_sec_1", name: "Secondary Stairs (First)",    floor: "1" },
  { id: "stairs_sec_2", name: "Secondary Stairs (Second)",   floor: "2" },
  { id: "stairs_sec_3", name: "Secondary Stairs (Third)",    floor: "3" },

  // --- Auditorium Building: landmarks + stair core + lift ---
  { id: "canteen",      name: "New Canteen (Grab & Go)",     floor: "1" },
  { id: "parent_cafe",  name: "Parent Café",                 floor: "1" },
  { id: "auditorium",   name: "Auditorium",                  floor: "1" },
  { id: "lib_primary",  name: "Primary Library",             floor: "2" },
  { id: "lib_secondary",name: "Secondary Library",           floor: "2" },
  { id: "art_display",  name: "Art Display Open Area",        floor: "3" },
  { id: "wc_aud_1",     name: "Toilets — Auditorium (First)", floor: "1" },
  { id: "wc_aud_3",     name: "Toilets — Auditorium (Third)", floor: "3" },
  { id: "stairs_aud_1", name: "Auditorium Stairs (First)",   floor: "1" },
  { id: "stairs_aud_2", name: "Auditorium Stairs (Second)",  floor: "2" },
  { id: "stairs_aud_3", name: "Auditorium Stairs (Third)",   floor: "3" },

  // --- Bridge Wing ---
  { id: "wc_bridge_3",  name: "Toilets — Bridge (Third)",     floor: "3" },
  { id: "stairs_bridge_3", name: "Bridge Stairs (Third)",     floor: "3" },

  // NOTE: Phase B adds the corridor links between rooms and these stairs, plus
  // the links BETWEEN buildings, once the school confirms where they join.
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
  // ----------------------------------------------------------------------
  //  HOW TO READ THIS LIST
  //  Each line is ONE short hop between two neighbouring points. You only
  //  describe neighbours — the app joins hops into full routes by itself.
  //  Photos live in /public/photos and are coloured PLACEHOLDERS for now.
  //
  //  These are example hops INSIDE one building, built from the real plans.
  //  The full set of corridor links, vertical stairs, and the links BETWEEN
  //  buildings are added in Phase B once the building connections are confirmed.
  // ----------------------------------------------------------------------

  // --- EXAMPLE A: Reception → Room 103 (Secondary, up to the first floor) ---
  {
    from: "reception", to: "stairs_sec_g",
    photo: "reception-to-stairs.jpg",
    instruction: "From Reception, walk ahead to the main stairs.",
    reverse: "Walk back to Reception and the main doors.",
    alt: "The reception area with the Secondary Building stairs ahead.",
  },
  {
    from: "stairs_sec_g", to: "stairs_sec_1",
    photo: "sec-stairs-g-1.jpg",
    instruction: "Go up the stairs to the first floor.",
    reverse: "Go down the stairs to the ground floor.",
    alt: "Stairs going up from the ground floor to the first floor.",
  },
  {
    from: "stairs_sec_1", to: "room_103",
    photo: "sec-1-to-103.jpg",
    instruction: "At the top, walk along to Room 103.",
    reverse: "Walk back along to the stairs.",
    alt: "First floor corridor with the door to Room 103.",
  },

  // --- EXAMPLE B: New Canteen → Auditorium (same floor) ---
  {
    from: "canteen", to: "auditorium",
    photo: "canteen-to-auditorium.jpg",
    instruction: "From the canteen, walk across to the Auditorium doors.",
    reverse: "Leave the Auditorium and walk back to the canteen.",
    alt: "The first floor area between the New Canteen and the Auditorium.",
  },

  // ➕ ADD YOUR OWN HOPS BELOW using the same pattern.
];

// ============================================================================
//  THE MASTER LOCATION LIST  (rooms + landmarks)  — used by the picker.
//  `generatedRooms` is the 95 real rooms from your timetable app. Do not edit
//  that file by hand; edit data/rooms.json and run `npm run generate` instead.
// ============================================================================
import { generatedRooms } from "./rooms.generated";

export const allLocations: Location[] = [...generatedRooms, ...landmarks];
