import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
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

export const metadata: Metadata = {
  title: "Summon — Vote for Artists to Play Your City",
  description:
    "Vote for the artists you want to see live in your city. When demand is loud enough, we make it happen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark", backgroundColor: "#0C0A18" }}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${neueMontreal.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
