import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Aura Craft",
  description: "Login to your Aura Craft account",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-surface rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
        
        {/* Left Side: Brand Panel */}
        <div className="w-full md:w-5/12 bg-primary p-10 flex flex-col justify-between text-on-primary">
          <div>
            <h1 className="font-display-md text-3xl mb-4">Login</h1>
            <p className="font-body-md text-on-primary/80 leading-relaxed">
              Get access to your Orders, Wishlist and personalized Recommendations.
            </p>
          </div>
          <div className="hidden md:block mt-12 relative w-full h-48 rounded-lg overflow-hidden mix-blend-luminosity opacity-80">
             {/* Decorative image matching Aura Craft vibe */}
             <img 
               src="https://images.unsplash.com/photo-1582736183424-9b88235210c4?q=80&w=600&auto=format&fit=crop" 
               alt="Aura Craft"
               className="w-full h-full object-cover"
             />
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex items-center justify-center bg-surface">
          <Suspense fallback={<div className="text-center py-12 text-on-surface-variant font-body-md animate-pulse">Loading secure connection...</div>}>
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </Suspense>
        </div>

      </div>
    </div>
  );
}
