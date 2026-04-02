import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Campus Dashboard",
  description: "Frontend dashboard for managing smart campus tickets and resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
