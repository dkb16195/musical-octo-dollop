import type { MetadataRoute } from "next";

/**
 * Web App Manifest — lets a phone "add to home screen" with an icon and name,
 * so Wayfinder opens full-screen like an app (no login, no app-store install).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SISD Wayfinder",
    short_name: "Wayfinder",
    description: "Find your way to your next class with photo directions.",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#0b2545",
    theme_color: "#0b2545",
    icons: [
      {
        src: `${BASE}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
