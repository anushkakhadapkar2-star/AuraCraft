"use client";

import { useState } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/components/ui/ToastProvider";

interface ProductQuickAddProps {
  product: any;
  disabled?: boolean;
  variant?: "auto" | "compact" | "full";
}

export function ProductQuickAdd({
  product,
  disabled = false,
  variant = "auto"
}: ProductQuickAddProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    addItem(product, 1);
    setIsAdded(true);
    toast({
      title: "Added to Bag",
      message: `${product.name} has been added to your shopping bag.`,
      type: "success",
    });

    setTimeout(() => setIsAdded(false), 1800);
  };

  if (disabled) {
    return (
      <div 
        className="py-1.5 px-2.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 bg-[#FAF7F2] text-[#706E6B]/60 border border-[#EDE3D5] select-none cursor-not-allowed"
        title="Currently Out of Stock"
      >
        <span>Out of Stock</span>
      </div>
    );
  }

  // Compact circular button for mobile / tight containers
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleQuickAdd}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 ${
          isAdded
            ? "bg-emerald-600 text-white shadow-xs"
            : "bg-[#24483B] text-white hover:bg-[#19342A] shadow-xs"
        }`}
        title="Add to Shopping Bag"
        aria-label={`Add ${product.name} to shopping bag`}
      >
        {isAdded ? (
          <Check className="w-3.5 h-3.5 animate-in zoom-in-75 duration-150" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        isAdded
          ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          : "clay-btn shadow-[0_4px_14px_rgba(36,72,59,0.3)] hover:shadow-[0_6px_18px_rgba(36,72,59,0.35)]"
      }`}
      title="Quick Add to Bag"
    >
      {isAdded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-700 animate-in zoom-in-75 duration-150" />
          <span>Added to Bag!</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </>
      )}
    </button>
  );
}
