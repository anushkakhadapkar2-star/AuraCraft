"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  href: string;
  label: string;
}

interface FloatingNavbarPillProps {
  links: NavLinkItem[];
  currentPath: string;
  isLinkActive: (href: string) => boolean;
}

/**
 * Aceternity Smooth Floating Nav Pill
 * Provides a fluid sliding pill indicator behind navigation items as the user
 * navigates or hovers between pages.
 */
export const FloatingNavbarPill = ({
  links,
  currentPath,
  isLinkActive,
}: FloatingNavbarPillProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <ul className="flex items-center gap-1 lg:gap-2">
      {links.map((link, idx) => {
        const active = isLinkActive(link.href);
        const isHovered = hoveredIdx === idx;

        return (
          <li
            key={link.href}
            className="relative"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Active Pill Indicator */}
            {active && (
              <motion.div
                layoutId="navbar-active-pill"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D45B7A] to-[#B03E5D] shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
              />
            )}

            {/* Hover Glaze Pill Indicator (when not active) */}
            {!active && isHovered && (
              <motion.div
                layoutId="navbar-hover-glaze"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
                className="absolute inset-0 rounded-full bg-[#F8CAD5]/30 border border-[#F3E1E5]"
              />
            )}

            <Link
              href={link.href}
              className={cn(
                "relative z-10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 block",
                active
                  ? "text-white font-extrabold"
                  : "text-[#8B5E6B] hover:text-[#382025]"
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
