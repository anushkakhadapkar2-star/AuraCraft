"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  id: string | number;
  quote: string;
  name: string;
  title: string;
  rating?: number;
}

interface InfiniteMovingCardsProps {
  items: TestimonialItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Aceternity InfiniteMovingCards
 * Tailored for Aura Craft's verified buyer reviews.
 * Smooth 60 FPS marquee with warm clay cards, star ratings, and pause-on-hover.
 */
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Duplicate elements for infinite loop
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "25s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "65s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-5 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={item.id + "-" + idx}
            className="w-[320px] sm:w-[380px] max-w-full relative rounded-[28px] border border-[#F3E1E5] flex-shrink-0 clay-card p-6 flex flex-col justify-between bg-white shadow-[0_12px_28px_rgba(212,91,122,0.06),_inset_0_2px_4px_rgba(255,255,255,0.95)] hover:border-[#F8CAD5] transition-colors"
          >
            <div>
              {/* Star Rating */}
              <div className="flex text-[#FFBF00] mb-3">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#382025] leading-relaxed italic font-serif">
                "{item.quote}"
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3E1E5] flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-xs text-[#382025]">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#8B5E6B]">{item.title}</p>
              </div>
              <span className="text-emerald-600 text-sm font-bold">✓</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
