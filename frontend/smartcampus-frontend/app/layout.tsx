import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniDesk",
  description: "UniDesk platform for resources, bookings, maintenance tickets, and dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
