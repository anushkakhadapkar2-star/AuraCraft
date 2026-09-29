"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialIsWishlisted?: boolean;
  className?: string;
}

export function WishlistButton({ productId, initialIsWishlisted = false, className = "" }: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const router = useRouter();

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Optimistic update
    setIsWishlisted(!isWishlisted);

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      
      if (result.error) {
        // Revert on error
        setIsWishlisted(isWishlisted);
        if (result.error.includes("login")) {
          router.push("/login?callbackUrl=/wishlist");
        } else {
          console.error(result.error);
        }
      } else {
        setIsWishlisted(result.action === "added");
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 text-primary",
        isWishlisted 
          ? "bg-error text-on-error hover:bg-error/90" 
          : "bg-surface-container text-on-background hover:bg-primary hover:text-white",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
    </button>
  );
}
