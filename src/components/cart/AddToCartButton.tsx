"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";

export function AddToCartButton({ product, disabled }: { product: any, disabled?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button 
      className={`w-full py-4 font-body-lg text-body-lg font-semibold rounded-[24px] transition-colors flex justify-center items-center gap-2 ${isAdded ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary text-on-primary hover:bg-primary-fixed-variant'} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
      onClick={handleAdd}
    >
      {isAdded ? (
        <>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Added to Cart
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
          {disabled ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </button>
  );
}
