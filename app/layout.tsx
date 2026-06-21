import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Page metadata + "add to home screen" settings.
 * This mirrors the Duty Map: no login, no install — it just works in any
 * phone browser, and students can add it to their home screen like an app.
 */
export const metadata: Metadata = {
  title: "SISD Wayfinder",
  description: "Find your way to your next class with photo directions.",
  robots: { index: false, follow: false }, // internal tool — keep it private
  appleWebApp: {
    capable: true,
    title: "Wayfinder",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2545", // SISD navy — colours the phone's status bar
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
