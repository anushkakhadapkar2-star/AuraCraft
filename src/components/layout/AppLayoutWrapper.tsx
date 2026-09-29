"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

export function AppLayoutWrapper({ children, session }: { children: React.ReactNode, session: any }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      !isAdminPath && "pt-32 md:pt-40 pb-24 md:pb-0" // Padding for fixed Navbar
    )}>
      {!isAdminPath && <Navbar session={session} />}
      
      <main className={cn(
        "flex-1 w-full",
        !isAdminPath && "max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop"
      )}>
        {children}
      </main>
      
      {!isAdminPath && <Footer />}
    </div>
  );
}
