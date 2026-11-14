import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/themeContext";

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
        {/* Prevent FOUC: inline script to set theme before hydration with OS preference fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const saved = localStorage.getItem('theme');
                  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = saved || (systemDark ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="w-full h-full relative bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
