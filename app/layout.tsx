import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DETAILX Chicago | Premium Mobile Detailing",
  description:
    "Premium mobile detailing, ceramic coating, tint, polishing, and paint correction for Chicago drivers.",
  openGraph: {
    title: "DETAILX Chicago",
    description: "Premium mobile detailing brought to homes, garages, and offices across Chicago.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
