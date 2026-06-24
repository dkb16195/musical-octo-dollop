/**
 * FLOOR PLAN VIEW
 * Draws a schematic map of one floor as crisp SVG (so it scales on any phone),
 * in the SISD campus-map style. It can HIGHLIGHT one or more places — used to
 * show a student "you are here" and "your room is here".
 *
 * The layouts live in data/floorplans.json so they're easy to tweak. Each cell
 * is placed on a simple grid (column `c`, row `r`, optional spans `cs`/`rs`).
 */
import floorplans from "@/data/floorplans.json";

type Cell = {
  c: number; r: number; cs?: number; rs?: number;
  label: string; sub?: string; kind: string;
  roomId?: string; node?: string;
};
type Floor = { title: string; subtitle: string; cols: number; rowH: number; cells: Cell[] };

const FLOORS = floorplans as Record<string, Floor>;

// Colours taken from the campus-map KEY.
const STYLE: Record<string, { fill: string; stroke: string; text: string; dash?: boolean }> = {
  room:     { fill: "#dbeafe", stroke: "#2563eb", text: "#0f3a6e" },
  landmark: { fill: "#fde7c9", stroke: "#d9a441", text: "#8a5a0a" },
  office:   { fill: "#e8ebef", stroke: "#9aa3af", text: "#475569" },
  store:    { fill: "#e8ebef", stroke: "#9aa3af", text: "#475569" },
  stairs:   { fill: "#f6c343", stroke: "#d9a441", text: "#4a3a0a" },
  lift:     { fill: "#16a34a", stroke: "#15803d", text: "#ffffff" },
  toilet:   { fill: "#e879b9", stroke: "#c2569b", text: "#ffffff" },
  exit:     { fill: "#16a34a", stroke: "#15803d", text: "#ffffff" },
  open:     { fill: "#f1f5f9", stroke: "#cbd5e1", text: "#94a3b8", dash: true },
};

// Layout maths (units; the SVG scales to fit the screen via viewBox).
const PAD = 24;
const HEADER = 70;
const FRAME_PAD = 16;
const COL_GAP = 10;
const ROW_GAP = 10;
const CONTENT_W = 1000 - PAD * 2;

export default function FloorPlan({
  floorKey,
  highlight = [],
}: {
  floorKey: string;
  highlight?: string[]; // location ids and/or node ids to highlight
}) {
  const floor = FLOORS[floorKey];
  if (!floor) return null;

  const rows = Math.max(...floor.cells.map((c) => c.r + (c.rs ?? 1)));
  const colW = (CONTENT_W - (floor.cols - 1) * COL_GAP) / floor.cols;
  const rowH = floor.rowH;
  const x0 = PAD;
  const y0 = HEADER + FRAME_PAD;
  const gridH = rows * rowH + (rows - 1) * ROW_GAP;
  const H = y0 + gridH + FRAME_PAD + 8;

  const cellX = (c: number) => x0 + c * (colW + COL_GAP);
  const cellY = (r: number) => y0 + r * (rowH + ROW_GAP);
  const isHit = (cell: Cell) =>
    (cell.roomId && highlight.includes(cell.roomId)) ||
    (cell.node && highlight.includes(cell.node));

  return (
    <svg
      viewBox={`0 0 1000 ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Map of ${floor.title}, ${floor.subtitle}`}
    >
      {/* header band */}
      <rect x="0" y="0" width="1000" height={HEADER} fill="#0b2545" />
      <text x={PAD} y="30" fill="#fff" fontSize="26" fontWeight="800">{floor.title}</text>
      <text x={PAD} y="52" fill="#cbd5e1" fontSize="15">{floor.subtitle}</text>
      <text x={1000 - PAD} y="34" fill="#fff" fontSize="16" fontWeight="700" textAnchor="end">SISD Campus Map</text>

      {/* building outline */}
      <rect x={PAD - 6} y={HEADER + 8} width={CONTENT_W + 12} height={H - HEADER - 14}
            rx="14" fill="none" stroke="#0b2545" strokeWidth="2.5" />

      {floor.cells.map((cell, i) => {
        const w = (cell.cs ?? 1) * colW + ((cell.cs ?? 1) - 1) * COL_GAP;
        const h = (cell.rs ?? 1) * rowH + ((cell.rs ?? 1) - 1) * ROW_GAP;
        const s = STYLE[cell.kind] ?? STYLE.room;
        const hit = isHit(cell);
        const x = cellX(cell.c), y = cellY(cell.r);
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={w} height={h} rx="12"
              fill={hit ? "#fff7d6" : s.fill}
              stroke={hit ? "#f59e0b" : s.stroke}
              strokeWidth={hit ? 6 : 2}
              strokeDasharray={s.dash ? "7 6" : undefined}
            />
            <text
              x={x + w / 2} y={y + h / 2 + (cell.sub ? -2 : 6)}
              textAnchor="middle" fill={s.text}
              fontSize={cell.kind === "room" ? 22 : 16}
              fontWeight="800"
            >
              {cell.label}
            </text>
            {cell.sub && (
              <text x={x + w / 2} y={y + h / 2 + 18} textAnchor="middle" fill={s.text} fontSize="12">
                {cell.sub}
              </text>
            )}
            {hit && (
              <text x={x + w - 14} y={y + 24} textAnchor="middle" fontSize="22">📍</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
