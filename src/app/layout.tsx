import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Todo",
  description: "Personal recurring todo app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#171717" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-black/10 dark:border-white/10">
          <nav className="mx-auto max-w-4xl h-14 flex items-center gap-4 px-4">
            <Link href="/" className="font-semibold">Today</Link>
            <Link href="/log" className="text-sm">Log</Link>
            <Link href="/calendar" className="text-sm">Calendar</Link>
            <div className="ml-auto">
              {!session ? (
                <form action="/api/auth/signin" method="post">
                  <button className="text-sm underline">Sign in</button>
                </form>
              ) : (
                <form action="/api/auth/signout" method="post">
                  <button className="text-sm underline">Sign out</button>
                </form>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
