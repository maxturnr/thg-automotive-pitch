import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THG Automotive — Investor Dashboard",
  description: "Investment performance and vehicle deal analytics for THG Automotive",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-surface-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
