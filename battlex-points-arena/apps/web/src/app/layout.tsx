import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BattleX Points Arena",
  description: "Create Free Fire and BGMI tournament points tables, scan scoreboards, and design esports certificates.",
  applicationName: "BattleX Points Arena"
};

export const viewport: Viewport = {
  themeColor: "#050b18",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
