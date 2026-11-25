"use client";

import Link from "next/link";

interface AdminPanelLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  collapsed?: boolean;
  href?: string;
}

export function AdminPanelIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Aura Craft Admin Operations Shield"
    >
      <defs>
        <linearGradient id="adCompBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#563A29" />
          <stop offset="60%" stopColor="#3D2719" />
          <stop offset="100%" stopColor="#25170F" />
        </linearGradient>
        <linearGradient id="adCompGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="40%" stopColor="#E9DCCB" />
          <stop offset="80%" stopColor="#CDAE91" />
          <stop offset="100%" stopColor="#9C795A" />
        </linearGradient>
        <radialGradient id="adCompBeacon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9D4B8" />
          <stop offset="50%" stopColor="#A4AD91" />
          <stop offset="100%" stopColor="#5A6646" />
        </radialGradient>
      </defs>

      {/* Base Squircle */}
      <rect x="24" y="24" width="464" height="464" rx="128" fill="url(#adCompBg)" stroke="#CDAE91" strokeWidth="6" strokeOpacity="0.75" />
      <rect x="44" y="44" width="424" height="424" rx="110" fill="none" stroke="#E9DCCB" strokeWidth="1" strokeDasharray="8 8" opacity="0.2" />

      {/* Faceted Shield Crest */}
      <path d="M 256 76 L 396 156 L 396 316 L 256 424 L 116 316 L 116 156 Z" 
            fill="#362318" stroke="url(#adCompGold)" strokeWidth="8" />

      <path d="M 256 94 L 378 164 L 378 306 L 256 400 L 134 306 L 134 164 Z" 
            fill="none" stroke="#E9DCCB" strokeWidth="1.5" opacity="0.3" />

      {/* Intertwined Monogram A & C */}
      <path d="M 256 128 L 332 300 L 296 300 L 278 256 L 234 256 L 216 300 L 180 300 Z" fill="url(#adCompGold)" />
      <path d="M 256 182 L 242 228 L 270 228 Z" fill="#362318" />

      <path d="M 334 220 C 342 195 330 165 298 155 C 256 142 208 170 198 220 C 188 270 224 322 278 322 C 316 322 340 295 344 272 L 310 264 C 306 278 294 294 274 294 C 244 294 226 264 230 234 C 234 204 258 178 288 184 C 304 187 312 200 316 214 Z" 
            fill="#FAF7F2" opacity="0.95" />

      {/* Center Star */}
      <path d="M 256 220 Q 256 238 238 238 Q 256 238 256 256 Q 256 238 274 238 Q 256 238 256 220 Z" fill="#FFFFFF" />
      <circle cx="256" cy="238" r="3" fill="#563A29" />

      {/* Apex Beacon */}
      <circle cx="256" cy="76" r="14" fill="#A4AD91" opacity="0.3" />
      <circle cx="256" cy="76" r="7" fill="url(#adCompBeacon)" stroke="#FFFFFF" strokeWidth="2" />

      {/* Admin Ribbon Tag */}
      <g transform="translate(186, 352)">
        <rect x="0" y="0" width="140" height="34" rx="17" fill="#20130C" stroke="#CDAE91" strokeWidth="2" />
        <text x="70" y="22" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13" letterSpacing="3" fill="#E9DCCB">
          ADMIN
        </text>
      </g>
    </svg>
  );
}

export function AdminPanelLogo({ 
  className = "", 
  size = "md", 
  showText = true,
  collapsed = false,
  href = "/admin" 
}: AdminPanelLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div className="relative transition-transform duration-300 group-hover:scale-105 shrink-0">
        <AdminPanelIcon size={iconSizes[size]} />
      </div>
      {showText && !collapsed && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-base text-[#563A29] tracking-tight">
              AURA CRAFT
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#A4AD91]/20 text-[#2f3d1e] border border-[#A4AD91]/40">
              PRO
            </span>
          </div>
          <span className="font-mono text-[9px] font-semibold text-[#7D6B5E] tracking-wider uppercase">
            OPERATIONS HUB
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

