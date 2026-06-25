"use client";
/** Small segmented control to switch the route between Steps and Map views. */
export default function ViewToggle({
  view,
  setView,
}: {
  view: "steps" | "map";
  setView: (v: "steps" | "map") => void;
}) {
  return (
    <div className="flex flex-none rounded-full bg-white/15 p-1 text-sm font-bold">
      <button
        onClick={() => setView("steps")}
        aria-pressed={view === "steps"}
        className={`rounded-full px-3 py-1.5 ${view === "steps" ? "bg-white text-navy" : "text-white"}`}
      >
        📋 Steps
      </button>
      <button
        onClick={() => setView("map")}
        aria-pressed={view === "map"}
        className={`rounded-full px-3 py-1.5 ${view === "map" ? "bg-white text-navy" : "text-white"}`}
      >
        🗺️ Map
      </button>
    </div>
  );
}
