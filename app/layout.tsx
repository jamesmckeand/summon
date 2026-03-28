import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import CapacitorProvider from "@/components/CapacitorProvider";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const neueMontreal = localFont({
  src: [
    { path: "../public/fonts/NeueMontreal-Light.ttf",        weight: "300", style: "normal" },
    { path: "../public/fonts/NeueMontreal-LightItalic.ttf",  weight: "300", style: "italic" },
    { path: "../public/fonts/NeueMontreal-Regular.ttf",       weight: "400", style: "normal" },
    { path: "../public/fonts/NeueMontreal-Italic.ttf",        weight: "400", style: "italic" },
    { path: "../public/fonts/NeueMontreal-Bold.ttf",          weight: "700", style: "normal" },
    { path: "../public/fonts/NeueMontreal-BoldItalic.ttf",    weight: "700", style: "italic" },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080B14",
};

export const metadata: Metadata = {
  title: "Summon — Vote for Artists to Play Your City",
  description:
    "Vote for the artists you want to see live in your city. When demand is loud enough, we make it happen.",
  other: {
    // iOS full-screen web app experience
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Summon",
    "format-detection": "telephone=no",
    // Impact affiliate verification
    "impact-site-verification": "eaaf7ebc-6448-4f14-be83-ee60a75365ce",
    // Facebook domain verification
    "facebook-domain-verification": "rh87big5y4z9kslw3j14cgpvz0ohqe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark", backgroundColor: "#080B14" }}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${neueMontreal.variable} font-sans antialiased`}>
        <CapacitorProvider />
        {children}
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
