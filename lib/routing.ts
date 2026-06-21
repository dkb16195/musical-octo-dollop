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
  type Connection,
} from "@/content/wayfinding";

export type Step = {
  photo: string;
  instruction: string;
  alt: string;
  toName: string; // the point this step arrives at (for the progress label)
};

export type RouteResult =
  | { ok: true; steps: Step[]; fromName: string; toName: string }
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
  for (const c of connections) {
    add(c.from, { to: c.to, conn: c, forward: true });
    add(c.to, { to: c.from, conn: c, forward: false });
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

  return { ok: true, steps, fromName, toName };
}
