import type { Metadata } from "next";
import { Instrument_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledger — Every rupee, accounted for",
  description:
    "Personal finance ledger to track every rupee of income and expense with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${robotoMono.variable} font-sans antialiased bg-canvas text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
