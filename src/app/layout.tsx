import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth/session";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";

export const metadata: Metadata = {
  title: "Aura Craft | Handmade Crochet Flowers, Torans & Artisan Gifts",
  description: "Handcrafted everlasting flowers, festive door torans, and bespoke craft hampers designed with love and eco-friendly yarns.",
  icons: {
    icon: [
      { url: "/icons/aura-craft-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/aura-craft-icon.svg",
    shortcut: "/icons/aura-craft-icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="text-on-background font-body-md overflow-x-hidden">
        <AppLayoutWrapper session={session}>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  );
}
