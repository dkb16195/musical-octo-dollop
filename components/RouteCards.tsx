"use client";
/**
 * ROUTE CARDS
 * Swipeable cards: each card is ONE big photo + ONE short instruction, with a
 * "Step 2 of 5" progress indicator. The final card is a friendly "You've
 * arrived!" screen with a button to reverse the route or start again.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/paths";
import { setChoiceId } from "@/lib/store";
import type { Step } from "@/lib/routing";

export default function RouteCards({
  steps,
  fromId,
  toId,
  fromName,
  toName,
}: {
  steps: Step[];
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
}) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const total = steps.length;
  const cardCount = total + 1; // + the "arrived" card
  const onArrived = index >= total;

  function scrollToCard(i: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  // "Reverse the route": swap the two choices and reload the route screen.
  function reverse() {
    setChoiceId("from", toId);
    setChoiceId("to", fromId);
    router.refresh();
    scrollToCard(0);
    setIndex(0);
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-screen-sm flex-col bg-paper">
      {/* Top bar: where you're heading + progress */}
      <header className="bg-gradient-to-br from-navy to-navy-deep px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            aria-label="Go back to start"
            className="rounded-full bg-white/15 px-3 py-2 text-lg font-bold"
          >
            ←
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm text-sky-100">Going to</div>
            <div className="truncate text-lg font-extrabold">{toName}</div>
          </div>
        </div>
        {/* Progress: "Step 2 of 5" + dots */}
        <div className="mt-3">
          <div
            className="text-center text-sm font-bold"
            aria-live="polite"
          >
            {onArrived ? "You've arrived!" : `Step ${index + 1} of ${total}`}
          </div>
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: cardCount }).map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-sky-brand" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Swipeable cards */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {steps.map((s, i) => (
          <section
            key={i}
            className="flex w-full flex-none snap-center flex-col px-4 py-4"
            aria-label={`Step ${i + 1} of ${total}`}
          >
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl2 bg-white shadow-md ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/photos/${s.photo}`}
                alt={s.alt}
                className="h-0 w-full flex-1 object-cover"
                loading={i <= 1 ? "eager" : "lazy"}
              />
              <p className="px-5 py-5 text-center text-2xl font-extrabold leading-snug text-navy">
                {s.instruction}
              </p>
            </div>
          </section>
        ))}

        {/* Final "arrived" card */}
        <section className="flex w-full flex-none snap-center flex-col items-center justify-center px-6 text-center">
          <div className="text-7xl">🎉</div>
          <h2 className="mt-4 text-3xl font-extrabold text-navy">
            You&apos;ve arrived!
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Welcome to <b>{toName}</b>. Well done! 👏
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <button
              onClick={reverse}
              className="w-full rounded-xl2 bg-navy px-6 py-4 text-lg font-extrabold text-white shadow-lg active:scale-[0.99]"
            >
              ↩︎ Take me back to {fromName}
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-xl2 bg-white px-6 py-4 text-lg font-bold text-navy shadow ring-1 ring-slate-200 active:scale-[0.99]"
            >
              Find a new place
            </button>
          </div>
        </section>
      </div>

      {/* Big Back / Next buttons (clearer than swiping for some students) */}
      {!onArrived && (
        <div className="flex gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
          <button
            onClick={() => scrollToCard(Math.max(0, index - 1))}
            disabled={index === 0}
            className="flex-1 rounded-xl2 bg-white px-4 py-4 text-lg font-bold text-navy shadow ring-1 ring-slate-200 disabled:opacity-40 active:scale-[0.99]"
          >
            ← Back
          </button>
          <button
            onClick={() => scrollToCard(index + 1)}
            className="flex-[2] rounded-xl2 bg-navy px-4 py-4 text-lg font-extrabold text-white shadow-lg active:scale-[0.99]"
          >
            {index === total - 1 ? "I'm here! →" : "Next →"}
          </button>
        </div>
      )}
    </main>
  );
}
