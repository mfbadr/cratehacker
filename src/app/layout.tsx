import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "DJ Library Analyzer",
  description:
    "Analyze your Rekordbox library with detailed statistics and insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            made with love by&nbsp;
            <a
              href="https://mikeybadr.com"
              className="text-primary hover:underline"
            >
              Mikey Badr
            </a>
          </p>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
