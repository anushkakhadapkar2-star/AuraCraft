import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Welcome Back | Aura Craft",
  description: "Sign in to continue your handcrafted journey with Aura Craft",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start py-6 sm:py-10 px-4 sm:px-6 bg-gradient-to-br from-[#F5D5DC] via-[#FAE5E9] to-[#F0C2CD] relative overflow-y-auto select-none">
      
      {/* 1. Ambient 3D Clay Clouds & Botanical Decor */}
      <div className="absolute top-[8%] left-[8%] w-24 sm:w-28 opacity-90 pointer-events-none hidden md:block drop-shadow-[0_12px_24px_rgba(212,91,122,0.22)] animate-pulse" style={{ animationDuration: '6s' }}>
        <svg viewBox="0 0 100 60" fill="none">
          <path d="M20 45 Q10 45 10 35 Q10 25 22 25 Q25 10 42 10 Q58 10 64 22 Q75 18 82 28 Q90 32 90 42 Q90 45 80 45 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M25 45 Q15 45 15 38 Q15 28 26 28 Q28 15 42 15 Q56 15 62 25 Q72 22 78 30 Q85 34 85 42 Q85 45 76 45 Z" fill="#FDF2F5" opacity="0.7" />
        </svg>
      </div>

      <div className="absolute top-[18%] right-[10%] w-20 sm:w-24 opacity-85 pointer-events-none hidden md:block drop-shadow-[0_12px_24px_rgba(212,91,122,0.2)] animate-pulse" style={{ animationDuration: '8s' }}>
        <svg viewBox="0 0 100 60" fill="none">
          <path d="M20 45 Q10 45 10 35 Q10 25 22 25 Q25 10 42 10 Q58 10 64 22 Q75 18 82 28 Q90 32 90 42 Q90 45 80 45 Z" fill="#FFFFFF" opacity="0.95" />
        </svg>
      </div>

      {/* Potted Succulent (Bottom Left - transparent background) */}
      <div className="absolute bottom-[2%] left-[3%] w-28 sm:w-40 lg:w-44 pointer-events-none hidden sm:block drop-shadow-[0_18px_36px_rgba(212,91,122,0.28)] transition-transform hover:scale-105">
        <Image 
          src="/images/clay-plant.png" 
          alt="3D Clay Potted Plant" 
          width={180} 
          height={400} 
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* Potted Flower (Bottom Right - transparent background) */}
      <div className="absolute bottom-[3%] right-[3%] w-26 sm:w-36 lg:w-40 pointer-events-none hidden sm:block drop-shadow-[0_18px_36px_rgba(212,91,122,0.28)] transition-transform hover:scale-105">
        <Image 
          src="/images/clay-flower.png" 
          alt="3D Clay Blooming Flower" 
          width={160} 
          height={320} 
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* 2. Central 3D Clay Phone / Card Mockup Frame */}
      <div className="w-full max-w-[420px] bg-[#FAF7F8] rounded-[48px] shadow-[0_25px_60px_rgba(212,91,122,0.28),_0_8px_24px_rgba(56,32,37,0.08),_inset_0_3px_6px_rgba(255,255,255,0.95),_inset_0_-4px_10px_rgba(242,164,183,0.35)] border-[5px] border-[#F3E1E5] overflow-hidden flex flex-col relative z-20 transition-all duration-300">
        
        {/* Top Header Banner: 3D Cute Pink Heart, Welcome Back with Yellow Sparkles, and Cute 3D Girl */}
        <div className="w-full relative bg-[#FAF7F8] overflow-hidden rounded-t-[44px]">
          <Image
            src="/images/clay-header.png"
            alt="Welcome Back - Cute 3D Clay Girl and Heart"
            width={472}
            height={446}
            priority
            className="w-full h-auto block select-none pointer-events-none"
          />
        </div>

        {/* Floating Interactive Form Card (Overlaps the character ledge) */}
        <div className="relative -mt-5 mx-4 mb-5 z-30">
          <Suspense fallback={
            <div className="bg-white rounded-[36px] p-8 text-center text-xs text-[#8B5E6B] animate-pulse">
              Loading secure handcrafted portal...
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

      </div>

      {/* 3. Bottom Footer Note */}
      <div className="mt-5 text-center text-xs text-white/80 font-medium z-20">
        Protected by Aura Craft Artisan Security • 100% Handcrafted
      </div>

    </div>
  );
}
