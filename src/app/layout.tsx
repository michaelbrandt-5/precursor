import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Precursor · AI Exposure Index™",
    template: "%s · Precursor",
  },
  description:
    "Precursor measures how exposed every profession is to artificial intelligence. The AI Exposure Index™ scores occupations 0–100 based on structured capability analysis.",
  metadataBase: new URL("https://precursorindex.com"),
  openGraph: {
    title: "Precursor · AI Exposure Index™",
    description:
      "How exposed is your profession to AI? Structured, data-driven scores for every occupation.",
    url: "https://precursorindex.com",
    siteName: "Precursor",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
