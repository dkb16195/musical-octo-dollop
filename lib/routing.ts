/**
 * ROUTE FINDER
 * -----------------------------------------------------------------------------
 * Builds a small "map" from the connections in content/wayfinding.ts, then finds
 * the SHORTEST route between any two places and turns it into a list of steps
 * (one photo + one instruction each). This is why you only describe each short
 * hop once — the app joins them up automatically.
 *
 * It uses a classic "breadth-first search": explore the nearest points first,
 * so the first time we reach the destination we've used the fewest hops.
 */
import {
  allLocations,
  connections,
  FLOOR_STAIR,
  type Connection,
} from "@/content/wayfinding";

export type Step = {
  photo?: string; // optional — when missing, the app shows an instruction card
  instruction: string;
  alt: string;
  toName: string; // the point this step arrives at (for the progress label)
};

export type RouteResult =
  | { ok: true; steps: Step[]; nodes: string[]; fromName: string; toName: string }
  | { ok: false; reason: string };

// Look up which graph node a chosen location sits at.
function nodeForLocation(id: string): string | null {
  return allLocations.find((l) => l.id === id)?.node ?? null;
}

function nameForNode(nodeId: string): string {
  // Prefer a location name (rooms/landmarks); fall back to the node id.
  const loc = allLocations.find((l) => l.node === nodeId);
  return loc?.name ?? nodeId;
}

// Build a lookup of neighbours for every node (connections work both ways).
type Edge = { to: string; conn: Connection; forward: boolean };
function buildGraph(): Map<string, Edge[]> {
  const g = new Map<string, Edge[]>();
  const add = (from: string, e: Edge) => {
    const arr = g.get(from) ?? [];
    arr.push(e);
    g.set(from, arr);
  };

  // 1) Hand-written connections come FIRST, so when a photo hop and an
  //    automatic corridor hop cover the same pair, the photo one wins.
  const covered = new Set<string>();
  for (const c of connections) {
    add(c.from, { to: c.to, conn: c, forward: true });
    add(c.to, { to: c.from, conn: c, forward: false });
    covered.add(`${c.from}|${c.to}`);
    covered.add(`${c.to}|${c.from}`);
  }

  // 2) Automatic corridor links: connect every room/landmark to the stairs on
  //    its floor, so the app can route anywhere without a hop hand-written for
  //    every room. These have no photo (a tidy instruction card is shown).
  for (const loc of allLocations) {
    const stair = FLOOR_STAIR[loc.building]?.[loc.floor];
    if (!stair || stair === loc.node) continue;
    if (covered.has(`${loc.node}|${stair}`)) continue;
    const conn: Connection = {
      from: loc.node,
      to: stair,
      instruction: "Go to the stairs on this floor.",
      reverse: `Walk along the corridor to ${loc.name}.`,
    };
    add(loc.node, { to: stair, conn, forward: true });
    add(stair, { to: loc.node, conn, forward: false });
  }
  return g;
}

/** Find the shortest route between two LOCATION ids and return the steps. */
export function findRoute(fromId: string, toId: string): RouteResult {
  const startNode = nodeForLocation(fromId);
  const goalNode = nodeForLocation(toId);
  const fromName = allLocations.find((l) => l.id === fromId)?.name ?? fromId;
  const toName = allLocations.find((l) => l.id === toId)?.name ?? toId;

  if (!startNode || !goalNode)
    return { ok: false, reason: "One of these places isn't on the map yet." };

  if (startNode === goalNode)
    return { ok: false, reason: "You're already there! 🎉" };

  const graph = buildGraph();

  // Breadth-first search, remembering how we reached each node.
  const cameFrom = new Map<string, Edge>();
  const visited = new Set<string>([startNode]);
  const queue: string[] = [startNode];
  let found = false;

  while (queue.length) {
    const node = queue.shift()!;
    if (node === goalNode) {
      found = true;
      break;
    }
    for (const edge of graph.get(node) ?? []) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        cameFrom.set(edge.to, edge);
        queue.push(edge.to);
      }
    }
  }

  if (!found)
    return {
      ok: false,
      reason: "There's no photo route between these two places yet.",
    };

  // Walk backwards from the goal to rebuild the path, then reverse it.
  const edges: Edge[] = [];
  let cur = goalNode;
  while (cur !== startNode) {
    const e = cameFrom.get(cur)!;
    edges.push(e);
    // step back to the node we came from
    cur = e.forward ? e.conn.from : e.conn.to;
  }
  edges.reverse();

  // Turn each edge into a student-facing step (use the reverse wording &
  // direction when we travelled the hop "backwards").
  const steps: Step[] = edges.map((e) => {
    const instruction = e.forward ? e.conn.instruction : e.conn.reverse;
    return {
      photo: e.conn.photo,
      instruction,
      alt: e.conn.alt ?? instruction,
      toName: nameForNode(e.to),
    };
  });

  // The ordered list of nodes the route passes through (for the map view).
  const nodes = [startNode, ...edges.map((e) => e.to)];

  return { ok: true, steps, nodes, fromName, toName };
}

/**
 * Find the NEAREST location of a given type (e.g. "toilet") to where the
 * student is now, by exploring the map outwards until we hit one. Returns the
 * location id, or null if none can be reached.
 */
export function findNearest(fromId: string, type: string): string | null {
  const startNode = nodeForLocation(fromId);
  if (!startNode) return null;

  // Group target locations by the node they sit at.
  const targetsByNode = new Map<string, string>(); // node -> location id
  for (const l of allLocations) {
    if (l.type === type) targetsByNode.set(l.node, l.id);
  }
  if (targetsByNode.size === 0) return null;

  const graph = buildGraph();
  const visited = new Set<string>([startNode]);
  const queue: string[] = [startNode];
  while (queue.length) {
    const node = queue.shift()!;
    if (node !== startNode && targetsByNode.has(node)) return targetsByNode.get(node)!;
    for (const edge of graph.get(node) ?? []) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  return null;
}
