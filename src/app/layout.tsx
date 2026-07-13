import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClampAds — Meta Ads Manager",
  description: "Unified Facebook, Instagram & Threads Ads Manager for DealClamp and LootClamp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
