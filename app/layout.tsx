import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Ruang — Workspace Equipment Rental in Bali",
  description:
    "Rent desks, chairs, monitors, and full workspace setups across Canggu, Ubud, and Seminyak. Built for freelancers who come to Bali to work.",
  keywords: [
    "workspace rental",
    "Bali",
    "freelancer",
    "desk rental",
    "monitor rental",
    "coworking",
    "remote work",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
