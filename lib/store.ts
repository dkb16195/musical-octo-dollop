"use client";
/**
 * Remembers the student's two choices ("where I am" and "where I'm going")
 * while they use the app. We use the browser's sessionStorage so it survives
 * moving between screens but clears when they close the tab. No accounts,
 * no data leaves the phone.
 */
import { useEffect, useState } from "react";
import { allLocations, type Location } from "@/content/wayfinding";

export type Slot = "from" | "to";
const KEY: Record<Slot, string> = { from: "wf_from", to: "wf_to" };

export function getChoiceId(slot: Slot): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY[slot]);
}

export function setChoiceId(slot: Slot, id: string) {
  window.sessionStorage.setItem(KEY[slot], id);
  // let other open screens know it changed
  window.dispatchEvent(new Event("wf-choice"));
}

export function findLocation(id: string | null): Location | null {
  if (!id) return null;
  return allLocations.find((l) => l.id === id) ?? null;
}

/** A small React hook that re-renders when a choice changes. */
export function useChoice(slot: Slot): Location | null {
  const [loc, setLoc] = useState<Location | null>(null);
  useEffect(() => {
    const read = () => setLoc(findLocation(getChoiceId(slot)));
    read();
    window.addEventListener("wf-choice", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("wf-choice", read);
      window.removeEventListener("storage", read);
    };
  }, [slot]);
  return loc;
}
