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
        "min-h-screen flex flex-col selection:bg-[#EDE3D5] selection:text-[#24483B]",
        !isAdminPath && "bg-[#FAF7F2] pb-24 md:pb-0"
      )}>
        {!isAdminPath && <Navbar session={session} />}

        <main className={cn(
          "flex-1 w-full",
          !isAdminPath && !isAuthPage && "max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 sm:py-6 md:py-8"
        )}>
          {children}
        </main>

        {!isAdminPath && !isAuthPage && <Footer />}
      </div>
    </ToastProvider>
  );
}
