import type { Metadata, Viewport } from "next";
import { body, display } from "@/lib/fonts";

import "./globals.css";
import "./typography.css";

export const metadata: Metadata = {
  title: "Cinema Experience",
  description: "Une expérience cinématographique immersive.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className={`${display.variable} ${body.variable} ${body.className}`}>
        {children}
      </body>
    </html>
  );
}
