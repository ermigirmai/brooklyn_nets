import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BKLYN NETS",
  description: "NBA player evaluation workspace",
  icons: {
    icon: "/brand/brooklyn-nets-primary.svg",
    shortcut: "/brand/brooklyn-nets-primary.svg",
    apple: "/brand/brooklyn-nets-primary.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
