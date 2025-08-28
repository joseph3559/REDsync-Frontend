import type { Metadata } from "next";
import { SITE } from "@/lib/content";
import { Geist, Geist_Mono } from "next/font/google";
import MetaMaskErrorSuppressor from "@/components/MetaMaskErrorSuppressor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE.name} – ${SITE.tagline}`,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MetaMaskErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
