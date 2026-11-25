"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

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
        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-90",
        isWishlisted 
          ? "bg-[#FAF7F8] text-[#D45B7A] border border-[#F8CAD5] shadow-[0_2px_8px_rgba(212,91,122,0.25)]" 
          : "bg-white/95 text-[#8B5E6B] hover:text-[#D45B7A] hover:bg-white border border-[#F3E1E5] shadow-xs",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={cn(
          "w-4 h-4 transition-transform duration-200", 
          isWishlisted ? "fill-[#D45B7A] text-[#D45B7A] scale-110" : "text-[#8B5E6B] hover:scale-105"
        )} 
      />
    </button>
  );
}
