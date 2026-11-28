"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundGradientProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

/**
 * Aceternity BackgroundGradient
 * Specially customized for Aura Craft: Employs a soft, rotating gradient of
 * English Rose (#24483B), Soft Peach (#EDE3D5), and Warm Terracotta (#A8B8A0),
 * providing an artisanal frame glow rather than aggressive neon gradients.
 */
export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: BackgroundGradientProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      backgroundPosition: "0% 50%",
    },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
  };

  return (
    <div className={cn("relative p-[3px] group rounded-[38px]", containerClassName)}>
      <motion.div
        variants={animate && !shouldReduceMotion ? variants : undefined}
        initial="initial"
        animate="animate"
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{
          backgroundSize: "260% 260%",
        }}
        className={cn(
          "absolute inset-0 rounded-[38px] z-[1] opacity-70 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          "bg-[radial-gradient(ellipse_at_top_left,#24483B_0%,#EDE3D5_40%,#A8B8A0_70%,#FAF7F2_100%)]"
        )}
      />
      <motion.div
        variants={animate && !shouldReduceMotion ? variants : undefined}
        initial="initial"
        animate="animate"
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{
          backgroundSize: "260% 260%",
        }}
        className={cn(
          "absolute inset-0 rounded-[38px] z-[1] will-change-transform",
          "bg-[radial-gradient(ellipse_at_top_left,#24483B_0%,#EDE3D5_40%,#A8B8A0_70%,#FAF7F2_100%)]"
        )}
      />

      <div className={cn("relative z-10 rounded-[35px]", className)}>
        {children}
      </div>
    </div>
  );
};
