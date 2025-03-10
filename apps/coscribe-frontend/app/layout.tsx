import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from "react-hot-toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500','600', '700','800'],
  display: 'swap',
  variable: '--font-jakarta',
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoScribe",
  description: "Create and Collaborate",
  icons: [
    {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/abstract-logo.png", // Path to your favicon
    },
    {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/abstract-logo.png", // Use the same or a different image for Apple devices
    },
],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {


  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} antialiased bg-white`}
        >
          <ReactQueryProvider>
          {children}
          <Toaster position="top-right" />
          </ReactQueryProvider>
          
        </body>
      </html>

  );
}
