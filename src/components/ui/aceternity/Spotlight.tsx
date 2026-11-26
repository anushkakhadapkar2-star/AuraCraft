"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

/**
 * Aceternity Spotlight Component
 * Tailored for Aura Craft: Emits a soft, artisanal warm glow (English rose & champagne gold)
 * instead of harsh neon SaaS lighting.
 */
export const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter-warm-spotlight)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "url(#warm-rose-grad)"}
          fillOpacity="0.28"
        />
      </g>
      <defs>
        <filter
          id="filter-warm-spotlight"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          />
        </filter>
        <radialGradient
          id="warm-rose-grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1924.71 273.501) rotate(90) scale(273.501 1924.71)"
        >
          <stop stopColor="#F8CAD5" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#D45B7A" stopOpacity="0.4" />
          <stop offset="1" stopColor="#382025" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};
