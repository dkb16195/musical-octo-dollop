/**
 * FLOOR PLAN VIEW
 * Draws a schematic map of one floor as crisp SVG (so it scales on any phone),
 * matching the SISD campus-map style. It can HIGHLIGHT one or more places — used
 * to show a student "you are here" and "your room is here".
 *
 * Layouts live in data/floorplans.json. Each cell is placed with real
 * coordinates (x, y, w, h) so the map matches the proportions of the originals.
 */
import floorplans from "@/data/floorplans.json";

type Cell = {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; kind: string;
  roomId?: string; node?: string;
};
type Floor = {
  title: string; subtitle: string; note?: string;
  w: number; h: number; compass?: boolean; cells: Cell[];
};

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

const HEADER = 70;

// Wrap a label onto at most two lines so long names fit inside their box.
function wrap(text: string, cellW: number, fontSize: number): string[] {
  const maxChars = Math.max(4, Math.floor((cellW - 10) / (fontSize * 0.6)));
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    if (cur && (cur + " " + word).length > maxChars) {
      lines.push(cur);
      cur = word;
    } else {
      cur = cur ? `${cur} ${word}` : word;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2); // keep it to two lines
}

export default function FloorPlan({
  floorKey,
  highlight = [],
}: {
  floorKey: string;
  highlight?: string[]; // location ids and/or node ids to highlight
}) {
  const floor = FLOORS[floorKey];
  if (!floor) return null;
  const { w, h } = floor;

  const isHit = (cell: Cell) =>
    (cell.roomId && highlight.includes(cell.roomId)) ||
    (cell.node && highlight.includes(cell.node));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Map of ${floor.title}, ${floor.subtitle}`}
    >
      {/* header band */}
      <rect x="0" y="0" width={w} height={HEADER} fill="#0b2545" />
      <text x="24" y="32" fill="#fff" fontSize="26" fontWeight="800">{floor.title}</text>
      <text x="24" y="54" fill="#cbd5e1" fontSize="15">{floor.subtitle}</text>
      <text x={w - 24} y="30" fill="#fff" fontSize="16" fontWeight="700" textAnchor="end">SISD Campus Map</text>
      {floor.note && (
        <text x={w - 24} y="50" fill="#9fb3c8" fontSize="11.5" fontStyle="italic" textAnchor="end">{floor.note}</text>
      )}

      {/* building outline */}
      <rect x="16" y={HEADER + 10} width={w - 32} height={h - HEADER - 22}
            rx="14" fill="none" stroke="#0b2545" strokeWidth="2.5" />

      {floor.cells.map((cell, i) => {
        const s = STYLE[cell.kind] ?? STYLE.room;
        const hit = isHit(cell);
        const pill = cell.kind === "exit";
        const big = cell.kind === "room";
        const labelSize = big ? 22 : pill ? 14 : 14.5;
        const lines = wrap(cell.label, cell.w, labelSize);
        const lineH = labelSize * 1.05;
        const blockH = lines.length * lineH + (cell.sub ? 16 : 0);
        const startY = cell.y + cell.h / 2 - blockH / 2 + labelSize * 0.8;
        const cx = cell.x + cell.w / 2;
        return (
          <g key={i}>
            <rect
              x={cell.x} y={cell.y} width={cell.w} height={cell.h}
              rx={pill ? cell.h / 2 : 12}
              fill={hit ? "#fff7d6" : s.fill}
              stroke={hit ? "#f59e0b" : s.stroke}
              strokeWidth={hit ? 6 : 2}
              strokeDasharray={s.dash ? "7 6" : undefined}
            />
            {lines.map((ln, j) => (
              <text key={j} x={cx} y={startY + j * lineH} textAnchor="middle"
                    fill={s.text} fontSize={labelSize} fontWeight="800">
                {ln}
              </text>
            ))}
            {cell.sub && (
              <text x={cx} y={startY + lines.length * lineH + 2}
                    textAnchor="middle" fill={s.text} fontSize="11.5">
                {cell.sub}
              </text>
            )}
            {hit && (
              <text x={cell.x + cell.w - 16} y={cell.y + 24} textAnchor="middle" fontSize="22">📍</text>
            )}
          </g>
        );
      })}

      {/* compass */}
      {floor.compass && (
        <g>
          <circle cx={w - 50} cy={HEADER + 44} r="18" fill="#fff" stroke="#0b2545" strokeWidth="2" />
          <path d={`M ${w - 50} ${HEADER + 30} l 6 14 l -6 -4 l -6 4 z`} fill="#0b2545" />
          <text x={w - 50} y={HEADER + 58} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0b2545">N</text>
        </g>
      )}
    </svg>
  );
}
