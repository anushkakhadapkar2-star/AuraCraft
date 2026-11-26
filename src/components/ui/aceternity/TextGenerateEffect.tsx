"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

/**
 * Aceternity TextGenerateEffect
 * Reveals words progressively with a gentle blur-to-focus fade.
 * Designed for Aura Craft's editorial Playfair Display serif typography.
 */
export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) => {
  const [scope, animate] = useAnimate();
  const shouldReduceMotion = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (shouldReduceMotion) {
      animate("span", { opacity: 1, filter: "none" }, { duration: 0.01 });
      return;
    }

    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration || 0.5,
        delay: stagger(0.12),
        ease: [0.16, 1, 0.3, 1],
      }
    );
  }, [animate, duration, filter, shouldReduceMotion]);

  const renderWords = () => {
    return (
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="inline-block opacity-0"
              style={{
                filter: filter && !shouldReduceMotion ? "blur(8px)" : "none",
              }}
            >
              {word}&nbsp;
            </motion.span>
          );
        })}
      </motion.span>
    );
  };

  return (
    <span className={cn("font-serif font-bold inline", className)}>
      {renderWords()}
    </span>
  );
};
