"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverBorderGradientProps {
  as?: React.ElementType;
  containerClassName?: string;
  className?: string;
  duration?: number;
  clockwise?: boolean;
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * Aceternity HoverBorderGradient
 * Adds a glowing rotating border to luxury CTAs in warm rose & gold.
 */
export const HoverBorderGradient = ({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<string>("TOP");
  const shouldReduceMotion = useReducedMotion();

  const rotateDirection = (currentDirection: string) => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const index = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (index - 1 + directions.length) % directions.length
      : (index + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<string, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, #D45B7A 0%, rgba(212, 91, 122, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #F8CAD5 0%, rgba(248, 202, 213, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #B03E5D 0%, rgba(176, 62, 93, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, #D45B7A 0%, rgba(212, 91, 122, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.16% at 50% 50%, #D45B7A 0%, rgba(212, 91, 122, 0) 100%)";

  useEffect(() => {
    if (!hovered && !shouldReduceMotion) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, shouldReduceMotion]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-2xl border border-[#F3E1E5] content-center bg-white hover:bg-[#FAF7F8]/80 transition duration-300 items-center justify-center p-[1px] overflow-hidden",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full text-center z-10 rounded-[15px] px-6 py-3",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered && !shouldReduceMotion
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-white absolute z-1 flex-none inset-[1px] rounded-[15px]" />
    </Tag>
  );
};
