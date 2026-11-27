"use client";

import Link from "next/link";

interface AuraCraftLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

export function AuraCraftIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Aura Craft Handcrafted Crochet Flora Logo"
    >
      <defs>
        {/* Background Gradient */}
        <radialGradient id="craftIconBg" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#EDE3D5" />
        </radialGradient>

        {/* Artisanal Flora & Petal Gradient */}
        <linearGradient id="craftPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDE3D5" />
          <stop offset="50%" stopColor="#D99A9C" />
          <stop offset="100%" stopColor="#24483B" />
        </linearGradient>

        {/* Crochet Hook Wooden Grip Gradient */}
        <linearGradient id="craftHookWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7E563B" />
          <stop offset="50%" stopColor="#292825" />
          <stop offset="100%" stopColor="#19342A" />
        </linearGradient>

        {/* Metallic Gold Hook Shank Gradient */}
        <linearGradient id="craftHookMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="60%" stopColor="#EDE3D5" />
          <stop offset="100%" stopColor="#C9A45C" />
        </linearGradient>

        {/* Warm Sage Leaf Gradient */}
        <linearGradient id="craftLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2CDBB" />
          <stop offset="60%" stopColor="#A8B8A0" />
          <stop offset="100%" stopColor="#24483B" />
        </linearGradient>
      </defs>

      {/* Canvas Squircle */}
      <rect x="24" y="24" width="464" height="464" rx="124" fill="url(#craftIconBg)" stroke="#EDE3D5" strokeWidth="8"/>
      {/* Stitched Perimeter Ring */}
      <rect x="42" y="42" width="428" height="428" rx="106" fill="none" stroke="#C9A45C" strokeWidth="2.5" strokeDasharray="9 9" opacity="0.6"/>

      {/* SAGE CROCHET LEAVES */}
      <path d="M 270 280 C 220 280 180 320 180 360 C 220 370 260 330 270 280 Z" fill="url(#craftLeafGrad)" opacity="0.95" />
      <path d="M 215 330 Q 235 315 255 295" stroke="#F8F4EE" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      
      <path d="M 330 250 C 380 250 410 290 400 330 C 360 335 335 295 330 250 Z" fill="url(#craftLeafGrad)" opacity="0.9" />
      <path d="M 355 275 Q 375 295 385 315" stroke="#F8F4EE" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

      {/* TEXTURED YARN SKEIN BALL (Bottom-Left) */}
      <g transform="translate(170, 320)">
        <circle cx="0" cy="0" r="76" fill="#F8F4EE" stroke="#E9DCCB" strokeWidth="4" />
        <circle cx="0" cy="0" r="76" fill="url(#craftPetalGrad)" opacity="0.45" />

        <path d="M -54 -30 C -20 -60 20 -60 54 -30 C 20 0 -20 0 -54 -30 Z" fill="none" stroke="#CDAE91" strokeWidth="9" strokeLinecap="round"/>
        <path d="M -65 0 C -30 -35 30 -35 65 0 C 30 35 -30 35 -65 0 Z" fill="none" stroke="#DDB9B4" strokeWidth="11" strokeLinecap="round"/>
        <path d="M -54 30 C -20 0 20 0 54 30 C 20 60 -20 60 -54 30 Z" fill="none" stroke="#382025" strokeWidth="8" strokeLinecap="round" opacity="0.75"/>
        <path d="M -40 -50 C 0 -20 40 20 20 65" fill="none" stroke="#F8F4EE" strokeWidth="6" strokeLinecap="round"/>
        <path d="M -20 -65 C 20 -20 50 10 40 55" fill="none" stroke="#CDAE91" strokeWidth="8" strokeLinecap="round"/>
      </g>

      {/* CONTINUOUS YARN THREAD UNCOILING INTO BLOOM */}
      <path d="M 230 300 C 300 280 320 210 270 170 C 240 145 225 180 250 205 C 275 230 310 170 310 130" 
            fill="none" stroke="#CDAE91" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 230 300 C 300 280 320 210 270 170 C 240 145 225 180 250 205 C 275 230 310 170 310 130" 
            fill="none" stroke="#F8F4EE" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round"/>

      {/* ARTISAN CROCHET HOOK */}
      <g transform="translate(140, 240) rotate(-35)">
        <rect x="-14" y="60" width="28" height="150" rx="14" fill="url(#craftHookWood)" stroke="#3A2417" strokeWidth="2"/>
        <circle cx="0" cy="110" r="5" fill="#CDAE91" />
        <rect x="-6" y="-20" width="12" height="85" rx="4" fill="url(#craftHookMetal)" />
        <path d="M -6 -20 C -6 -45 -1 -55 -1 -65 C -1 -75 -12 -70 -12 -60 C -12 -50 0 -40 4 -20 Z" fill="url(#craftHookMetal)" stroke="#B39374" strokeWidth="1.5"/>
      </g>

      {/* CROCHET BLOOMING FLOWER (Top Right) */}
      <g transform="translate(320, 150)">
        <circle cx="0" cy="0" r="68" fill="url(#craftPetalGrad)" opacity="0.35" />
        <path d="M -30 -20 C -50 -70 50 -70 30 -20 Z" fill="url(#craftPetalGrad)" stroke="#F8F4EE" strokeWidth="4"/>
        <path d="M 20 -30 C 70 -50 70 50 20 30 Z" fill="url(#craftPetalGrad)" stroke="#F8F4EE" strokeWidth="4"/>
        <path d="M 15 25 C 50 65 -15 80 -25 35 Z" fill="url(#craftPetalGrad)" stroke="#F8F4EE" strokeWidth="4"/>
        <path d="M -25 30 C -70 50 -70 -20 -30 -15 Z" fill="url(#craftPetalGrad)" stroke="#F8F4EE" strokeWidth="4"/>
        
        {/* Hand-stitched Rose Swirl */}
        <path d="M -20 -10 C -15 -35 25 -35 20 -5 C 15 20 -20 20 -15 -5 C -10 -15 10 -15 5 -5" 
              fill="none" stroke="#382025" strokeWidth="5.5" strokeLinecap="round"/>
        
        {/* Center Stamen Button */}
        <circle cx="0" cy="0" r="14" fill="#382025" stroke="#E9DCCB" strokeWidth="3"/>
        <circle cx="0" cy="0" r="4" fill="#F8F4EE"/>
      </g>

      {/* Artisan Sparks */}
      <path d="M 390 80 Q 390 95 375 95 Q 390 95 390 110 Q 390 95 405 95 Q 390 95 390 80 Z" fill="#CDAE91" />
      <path d="M 120 160 Q 120 170 110 170 Q 120 170 120 180 Q 120 170 130 170 Q 120 170 120 160 Z" fill="#DDB9B4" />
    </svg>
  );
}

export function AuraCraftLogo({ 
  className = "", 
  size = "md", 
  showText = true,
  href = "/" 
}: AuraCraftLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-[0.2em]",
    md: "text-[10px] tracking-[0.25em]",
    lg: "text-xs tracking-[0.3em]",
  };

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <AuraCraftIcon size={iconSizes[size]} />
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`font-serif ${textSizes[size]} font-bold tracking-[0.04em] text-[#382025] leading-none transition-colors hover:text-[#D45B7A]`}
          >
            AURA CRAFT
          </span>
          <span className={`font-medium ${subtitleSizes[size]} uppercase text-[#8B5E6B] mt-1`}>
            Handmade with Love
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group focus:outline-hidden rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
