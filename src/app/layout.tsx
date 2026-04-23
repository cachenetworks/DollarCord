import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DollarCord",
  description:
    "A real-time Discord-inspired chat app with servers, channels, DMs, presence, reactions, pins, and settings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dc-chat text-dc-text antialiased">
        {children}
      </body>
    </html>
  );
}
