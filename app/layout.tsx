import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "DETAILX Chicago | Premium Mobile Detailing",
  description:
    "Premium mobile detailing, ceramic coating, tint, and paint correction for Chicago drivers.",
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18082565611"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18082565611');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
