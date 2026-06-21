/**
 * Helper for linking to other pages. On GitHub Pages the site lives under
 * "/musical-octo-dollop", so we add that prefix to internal links.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function href(path: string): string {
  return `${BASE}${path}`;
}
