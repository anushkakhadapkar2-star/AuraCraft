"use client";

import { useState } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/components/ui/ToastProvider";

export function ProductQuickAdd({ product, disabled = false }: { product: any; disabled?: boolean }) {
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

    setTimeout(() => setIsAdded(false), 2000);
  };

  if (disabled) {
    return (
      <div 
        className="w-full py-2 px-3 rounded-2xl text-[11px] font-bold flex items-center justify-center gap-1 bg-[#FAF7F8]/90 text-[#8B5E6B]/70 border border-[#F3E1E5] select-none cursor-not-allowed"
        title="Currently Out of Stock"
      >
        <span>Out of Stock</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
        isAdded
          ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          : "clay-btn shadow-[0_6px_16px_rgba(212,91,122,0.35)]"
      }`}
      title="Quick Add to Bag"
    >
      {isAdded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-700" />
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

