import type { Metadata } from "next";

import "./globals.css";
//import "./glass-card.css";

export const metadata: Metadata = {
  title: "Cinema Experience",
  description: "Une expérience cinématographique immersive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}