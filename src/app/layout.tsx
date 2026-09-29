import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
});

import { auth } from "@/lib/auth/session";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";

export const metadata: Metadata = {
  title: "AURA CRAFT - Handmade Pieces",
  description: "Handmade Pieces That Add a Little Magic to Everyday Life.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased light`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-on-background font-body-md overflow-x-hidden">
        <AppLayoutWrapper session={session}>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  );
}
