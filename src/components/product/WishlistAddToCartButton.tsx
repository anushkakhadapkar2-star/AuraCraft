"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/components/ui/ToastProvider";

export function WishlistAddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    toast({
      title: "Moved to Bag",
      message: `${product.name} has been added to your shopping bag.`,
      type: "success",
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button 
      type="button"
      onClick={handleAddToCart}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
        isAdded
          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
          : "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
      }`}
      aria-label="Add to cart"
      title={isAdded ? "Added to Cart!" : "Add to Cart"}
    >
      {isAdded ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
    </button>
  );
}

