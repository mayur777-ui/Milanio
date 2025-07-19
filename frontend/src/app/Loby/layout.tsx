import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SocketProvider } from "@/context/Socketcontext";
import { UseridProvider } from "@/context/UserIdcontext";
import { ThemeProvider } from "@/context/themeContext";
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

// const cookieStore = cookies();
// const token = cookieStore.get('token')?.value;
// if(!token){
//   redirect('/?unauthorized=true');
//   return;
// }
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
