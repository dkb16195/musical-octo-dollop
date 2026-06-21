import type { Config } from "tailwindcss";

/**
 * Tailwind config. The SISD colours come from the Duty Map app so the two
 * apps look like a family. You can tweak these once your style guide arrives.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SISD brand palette (matched to the Duty Map)
        navy: { DEFAULT: "#0b2545", deep: "#13315c" },
        sky: { brand: "#38bdf8" },
        ink: "#0f172a",
        paper: "#f1f5f9",
      },
      fontSize: {
        // Larger base sizes for young / anxious readers
        tap: ["1.25rem", { lineHeight: "1.6rem" }],
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
