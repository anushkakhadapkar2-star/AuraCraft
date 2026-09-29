import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Login | Aura Craft",
  description: "Secure admin portal for Aura Craft",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1a1a] relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-surface/10 border border-outline-variant/20 rounded-2xl mb-4 backdrop-blur-sm">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </Link>
          <h1 className="font-headline-lg text-3xl font-bold text-surface">Admin Portal</h1>
          <p className="text-surface-variant mt-2 font-body-md">Authorized personnel only.</p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-surface-variant font-body-md animate-pulse">Loading secure connection...</div>}>
          <AdminLoginForm />
        </Suspense>

      </div>
    </div>
  );
}
