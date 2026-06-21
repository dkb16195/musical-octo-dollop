/**
 * Next.js config — set up to produce a STATIC website (no server needed),
 * so it can be hosted on GitHub Pages exactly like the Duty Map.
 *
 * GitHub Pages serves this repo at:
 *   https://<your-username>.github.io/musical-octo-dollop/
 * Because the site lives in a sub-folder ("/musical-octo-dollop"), we set
 * basePath so every link and image points to the right place.
 *
 * If you ever rename the repo, change REPO_NAME below to match.
 * If you move to a custom domain or Vercel (served at the root "/"),
 * set BASE_PATH to "" (empty).
 */
const REPO_NAME = "musical-octo-dollop";
const BASE_PATH = process.env.NODE_ENV === "production" ? `/${REPO_NAME}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // build a plain static site into the /out folder
  basePath: BASE_PATH,
  images: { unoptimized: true }, // required for static export (no image server)
  trailingSlash: true, // friendlier URLs on GitHub Pages
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
};

export default nextConfig;
