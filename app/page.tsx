"use client";
/**
 * HOME SCREEN
 * Two big friendly buttons: "Where are you now?" and "Where do you need to go?"
 * Once both are chosen, the "Find my way!" button lights up.
 */
import Link from "next/link";
import { useChoice } from "@/lib/store";
import type { Location } from "@/content/wayfinding";

export default function Home() {
  const from = useChoice("from");
  const to = useChoice("to");
  const ready = Boolean(from && to);

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col px-5 pb-10">
      {/* Friendly header */}
      <header className="bg-gradient-to-br from-navy to-navy-deep -mx-5 px-5 pb-7 pt-[calc(env(safe-area-inset-top)+1.75rem)] text-white rounded-b-xl2 shadow-md">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide opacity-90">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-brand shadow-[0_0_8px_#38bdf8]" />
          SISD WAYFINDER
        </div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight">
          Let&apos;s find your class 👋
        </h1>
        <p className="mt-2 text-base text-sky-100">
          Pick where you are and where you&apos;re going. We&apos;ll show you the
          way with photos.
        </p>
      </header>

      {/* The two choices */}
      <div className="mt-6 flex flex-col gap-4">
        <ChoiceCard
          slot="Where are you now?"
          emoji="📍"
          color="bg-white"
          choice={from}
          href="/pick/from"
        />
        <ChoiceCard
          slot="Where do you need to go?"
          emoji="🎯"
          color="bg-white"
          choice={to}
          href="/pick/to"
        />
      </div>

      {/* The big go button */}
      <div className="mt-auto pt-8">
        {ready ? (
          <Link
            href="/route"
            className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-navy px-6 py-5 text-2xl font-extrabold text-white shadow-lg active:scale-[0.99]"
          >
            Find my way! →
          </Link>
        ) : (
          <div
            aria-disabled="true"
            className="flex w-full items-center justify-center rounded-xl2 bg-slate-200 px-6 py-5 text-center text-lg font-bold text-slate-700"
          >
            Choose both places to start
          </div>
        )}
        <Link
          href="/map"
          className="mt-3 block w-full rounded-xl2 bg-white px-6 py-3.5 text-center text-base font-bold text-navy shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
        >
          🗺️ Browse the campus map
        </Link>
      </div>
    </main>
  );
}

/** One big tappable card showing a choice (or a prompt to choose). */
function ChoiceCard({
  slot,
  emoji,
  color,
  choice,
  href,
}: {
  slot: string;
  emoji: string;
  color: string;
  choice: Location | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl2 ${color} p-5 text-left shadow-md ring-1 ring-slate-200 active:scale-[0.99]`}
    >
      <span aria-hidden className="text-4xl">
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold uppercase tracking-wide text-slate-600">
          {slot}
        </span>
        {choice ? (
          <span className="mt-0.5 flex items-center gap-2 text-2xl font-extrabold text-navy">
            <span aria-hidden>{choice.icon}</span>
            <span className="truncate">{choice.name}</span>
          </span>
        ) : (
          <span className="mt-0.5 block text-xl font-bold text-sky-700">
            Tap to choose
          </span>
        )}
      </span>
      <span aria-hidden className="text-2xl text-slate-300">
        ›
      </span>
    </Link>
  );
}
