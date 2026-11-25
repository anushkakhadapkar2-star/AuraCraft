"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

export function AppLayoutWrapper({ children, session }: { children: React.ReactNode, session: any }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <ToastProvider>
      <NavigationProgressBar />
      <div className={cn(
        "min-h-screen flex flex-col selection:bg-[#F8CAD5] selection:text-[#382025]",
        !isAdminPath && (isAuthPage ? "pt-[72px]" : "pt-28 md:pt-36 pb-24 md:pb-0 bg-gradient-to-b from-[#FAF7F8] via-[#FFF9FA] to-[#FAF7F8]")
      )}>
        {!isAdminPath && <Navbar session={session} />}

        <main className={cn(
          "flex-1 w-full",
          !isAdminPath && !isAuthPage && "max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop"
        )}>
          {children}
        </main>

        {!isAdminPath && !isAuthPage && <Footer />}
      </div>
    </ToastProvider>
  );
}
