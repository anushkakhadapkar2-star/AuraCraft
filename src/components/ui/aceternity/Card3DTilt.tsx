"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxTilt?: number;
}

/**
 * Aceternity 3D Card Tilt Component
 * Soft, physical tilt adapted for Aura Craft's 3D clay aesthetic.
 * Tilts gently on mouse move (max 5-7 deg) with a subtle specular sheen.
 */
export const Card3DTilt = ({
  children,
  className,
  containerClassName,
  maxTilt = 6,
}: Card3DTiltProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative [perspective:1000px] h-full", containerClassName)}
    >
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered && !shouldReduceMotion ? 1.015 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn("relative h-full will-change-transform", className)}
      >
        {children}

        {/* Delicate specular glare overlay */}
        {isHovered && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-white/12 to-white/20 z-30"
          />
        )}
      </motion.div>
    </div>
  );
};
