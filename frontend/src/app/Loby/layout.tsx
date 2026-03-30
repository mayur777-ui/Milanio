"use client";

import { useEffect, useState } from "react";
import { SocketProvider } from "@/context/Socketcontext";
import { UseridProvider } from "@/context/UserIdcontext";
import { ThemeProvider } from "@/context/themeContext";
import { useRouter } from "next/navigation";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setIsAuthorized(false);
      router.replace("/");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200">
        Checking access...
      </div>
    );
  }

  return (
        <UseridProvider>
          <SocketProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          </SocketProvider>
        </UseridProvider>
  );
}
