"use client";
/**
 * ROUTE SCREEN
 * Reads the student's two choices, works out the shortest photo route, and
 * shows the swipeable step cards. If a route hasn't been added yet, it shows
 * a calm, friendly message instead of an error.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { getChoiceId } from "@/lib/store";
import { findRoute, type RouteResult } from "@/lib/routing";
import RouteCards from "@/components/RouteCards";
import RouteMap from "@/components/RouteMap";

export default function RoutePage() {
  const [view, setView] = useState<"steps" | "map">("steps");
  const [state, setState] = useState<{
    fromId: string | null;
    toId: string | null;
    result: RouteResult | null;
  }>({ fromId: null, toId: null, result: null });

  useEffect(() => {
    const fromId = getChoiceId("from");
    const toId = getChoiceId("to");
    if (!fromId || !toId) {
      setState({ fromId, toId, result: null });
      return;
    }
    setState({ fromId, toId, result: findRoute(fromId, toId) });
  }, []);

  const { fromId, toId, result } = state;

  // Missing choices → send them home gently.
  if (!fromId || !toId) {
    return (
      <Fallback
        emoji="🤔"
        title="Let's pick your places first"
        body="We need to know where you are and where you're going."
      />
    );
  }

  if (!result) return null; // still working it out (a blink)

  if (!result.ok) {
    return (
      <Fallback emoji="🧭" title="No photo route yet" body={result.reason} />
    );
  }

  if (view === "map") {
    return (
      <RouteMap nodes={result.nodes} toName={result.toName} view={view} setView={setView} />
    );
  }

  return (
    <RouteCards
      steps={result.steps}
      fromId={fromId}
      toId={toId}
      fromName={result.fromName}
      toName={result.toName}
      view={view}
      setView={setView}
    />
  );
}

function Fallback({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="text-6xl">{emoji}</div>
      <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
      <p className="text-lg text-slate-600">{body}</p>
      <Link
        href="/"
        className="rounded-xl2 bg-navy px-6 py-4 text-lg font-bold text-white shadow-lg"
      >
        ← Back to start
      </Link>
    </main>
  );
}
