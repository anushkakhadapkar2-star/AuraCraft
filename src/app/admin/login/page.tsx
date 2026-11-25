import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AdminPanelIcon } from "@/components/brand/AdminPanelLogo";

export const metadata: Metadata = {
  title: "Admin Login | Aura Craft Operations",
  description: "Secure admin management console for Aura Craft",
  icons: {
    icon: "/icons/aura-admin-icon.svg",
    apple: "/icons/aura-admin-icon.svg",
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#231710] relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#563A29]/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A4AD91]/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4 hover:scale-105 transition-transform" title="Back to Storefront">
            <AdminPanelIcon size={64} />
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#F8F4EE]">Aura Craft Operations</h1>
          <p className="text-[#CDAE91] mt-1 text-xs font-mono tracking-widest uppercase">Admin Security Portal</p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-surface-variant font-body-md animate-pulse">Loading secure connection...</div>}>
          <AdminLoginForm />
        </Suspense>

      </div>
    </div>
  );
}
