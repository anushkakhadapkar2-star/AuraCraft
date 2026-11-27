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
          ? "bg-[#FAF7F2] text-[#24483B] border border-[#EDE3D5] shadow-xs" 
          : "bg-white/95 text-[#706E6B] hover:text-[#24483B] hover:bg-white border border-[#EDE3D5] shadow-xs",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={cn(
          "w-4 h-4 transition-transform duration-200", 
          isWishlisted ? "fill-[#24483B] text-[#24483B] scale-110" : "text-[#706E6B] hover:scale-105"
        )} 
      />
    </button>
  );
}
