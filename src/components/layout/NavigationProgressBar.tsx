"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When path or query changes, complete the progress bar
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        target.target !== "_blank"
      ) {
        // If navigating to different page
        if (href !== pathname) {
          setVisible(true);
          setProgress(25);
          setTimeout(() => setProgress(65), 120);
          setTimeout(() => setProgress(85), 350);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] pointer-events-none h-[2.5px]">
      <div
        className="h-full bg-gradient-to-r from-[#D45B7A] via-[#F2A4B7] to-[#F8CAD5] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(212,91,122,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

