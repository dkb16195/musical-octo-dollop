"use client";
/**
 * ROUTE SCREEN — placeholder for now.
 * Phase 3 will turn this into swipeable photo cards (one big photo + one
 * instruction each) with a "Step 2 of 5" progress indicator and a
 * "You've arrived!" end screen.
 */
import Link from "next/link";
import { useChoice } from "@/lib/store";

export default function RoutePage() {
  const from = useChoice("from");
  const to = useChoice("to");

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-6xl">🗺️</div>
      <h1 className="text-2xl font-extrabold text-navy">Route coming up next</h1>
      <p className="text-lg text-slate-600">
        From <b>{from?.name ?? "—"}</b> to <b>{to?.name ?? "—"}</b>.
      </p>
      <p className="text-base text-slate-500">
        The step-by-step photo directions are built in Phase 3.
      </p>
      <Link
        href="/"
        className="rounded-xl2 bg-navy px-6 py-4 text-lg font-bold text-white shadow-lg"
      >
        ← Back to start
      </Link>
    </main>
  );
}
