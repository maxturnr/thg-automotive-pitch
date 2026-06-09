import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THG Automotive — Investor Dashboard",
  description: "Performance data and investment projections for THG Automotive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
