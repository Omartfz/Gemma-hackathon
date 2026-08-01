import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nightingale — Pregnancy Care Companion",
  description:
    "Decision-support companion for pregnancy documentation readiness. Synthetic data only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AppNav />
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--muted)]">
          Decision-support only · synthetic / demo data · not medical advice
        </footer>
      </body>
    </html>
  );
}
