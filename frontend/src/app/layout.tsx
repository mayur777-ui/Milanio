import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/themeContext";
import { Inter } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milanio – Secure Video Meetings for Developers",
  description: "Join secure, real-time meetings with chat and screen sharing.",
  openGraph: {
    title: "Milanio – Secure Video Meetings for Developers",
    description: "Join secure, real-time meetings with chat and screen sharing.",
    url: "https://Milanio.app",
    siteName: "Milanio",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Milanio Preview",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} w-full h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent FOUC: inline script to set theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="w-full h-full relative dark:bg-zinc-900 bg-gray-50">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
