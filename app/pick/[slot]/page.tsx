import { notFound } from "next/navigation";
import Picker from "@/components/Picker";
import type { Slot } from "@/lib/store";

/**
 * The picker is reused for both choices via the address:
 *   /pick/from  → "Where are you now?"
 *   /pick/to    → "Where do you need to go?"
 * For a static site we must list these two pages up front.
 */
export function generateStaticParams() {
  return [{ slot: "from" }, { slot: "to" }];
}

export default function PickPage({ params }: { params: { slot: string } }) {
  if (params.slot !== "from" && params.slot !== "to") notFound();
  return <Picker slot={params.slot as Slot} />;
}
