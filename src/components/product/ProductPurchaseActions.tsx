"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useToast } from "@/components/ui/ToastProvider";
import { Minus, Plus, ShoppingBag, Zap, Check, Truck, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProductPurchaseActionsProps {
  product: any;
  inStock: boolean;
}

export function ProductPurchaseActions({ product, inStock }: ProductPurchaseActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");

  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const { toast } = useToast();

  const maxStock = Number(product.inventory?.currentStock ?? 10);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => (inStock ? Math.min(maxStock, prev + 1) : 1));
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    toast({
      title: "Added to Shopping Bag",
      message: `${product.name} (Qty: ${quantity}) is in your bag.`,
      type: "success",
    });
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    setIsBuyingNow(true);
    addItem(product, quantity);
    router.push("/checkout");
  };

  const handleCheckPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPincodeStatus("invalid");
      setPincodeMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setPincodeStatus("checking");
    setTimeout(() => {
      // Deterministic delivery estimate
      const deliveryDays = (parseInt(cleanPin[cleanPin.length - 1], 10) % 3) + 3; // 3 to 5 days
      const date = new Date();
      date.setDate(date.getDate() + deliveryDays);
      const formattedDate = date.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      setPincodeStatus("valid");
      setPincodeMessage(`Delivery by ${formattedDate} • Free shipping eligible`);
    }, 400);
  };

  return (
    <div className="space-y-5 pt-2">
      {/* 1. Quantity Stepper & Wishlist */}
      <div className="flex items-center gap-3">
        {/* Stepper */}
        <div className="flex items-center bg-[#FAF7F2] border border-[#E6DDCF] rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={!inStock || quantity <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#292825] hover:bg-white disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-10 text-center font-bold text-sm text-[#24483B] select-none">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={!inStock || quantity >= maxStock}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#292825] hover:bg-white disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Button */}
        <WishlistButton
          productId={product.id}
          className="w-11 h-11 flex items-center justify-center rounded-2xl border border-[#E6DDCF] bg-white text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] transition-all shadow-xs shrink-0"
        />

        {inStock && maxStock <= 5 && (
          <span className="text-[11px] font-bold text-[#C9A45C] bg-[#FBF7EE] border border-[#E6DDCF] px-3 py-1 rounded-xl">
            Only {maxStock} left
          </span>
        )}
      </div>

      {/* 2. Primary CTAs: Add to Cart + Buy Now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add to Cart */}
        <button
          type="button"
          disabled={!inStock}
          onClick={handleAddToCart}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tactile-bounce flex items-center justify-center gap-2 cursor-pointer ${isAdded
            ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
            : inStock
              ? "clay-btn shadow-[0_8px_20px_rgba(36,72,59,0.3)]"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
            </>
          )}
        </button>

        {/* Buy Now */}
        <button
          type="button"
          disabled={!inStock || isBuyingNow}
          onClick={handleBuyNow}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tactile-bounce flex items-center justify-center gap-2 cursor-pointer ${
            inStock
              ? "clay-btn-secondary border-[#E6DDCF] hover:border-[#24483B]"
              : "bg-gray-200 cursor-not-allowed opacity-50"
          }`}
        >
          <Zap className="w-4 h-4 fill-[#24483B]" />
          <span>{isBuyingNow ? "Proceeding..." : "Buy Now"}</span>
        </button>
      </div>

      {/* 3. Interactive Pincode Checker */}
      <div className="clay-card p-4 rounded-2xl border border-[#E6DDCF] space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#24483B] uppercase tracking-wider">
          <Truck className="w-4 h-4 text-[#A8B8A0]" />
          <span>Delivery & Dispatch Availability</span>
        </div>

        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              if (pincodeStatus !== "idle") setPincodeStatus("idle");
            }}
            placeholder="Enter 6-digit PIN code"
            className="flex-1 bg-white border border-[#E6DDCF] rounded-xl px-3.5 py-2 text-xs text-[#292825] placeholder-[#A8A49E] focus:outline-none focus:border-[#24483B] focus:ring-4 focus:ring-[#24483B]/10 transition-all font-mono shadow-2xs"
          />
          <button
            type="submit"
            disabled={pincodeStatus === "checking" || pincode.length !== 6}
            className="clay-btn px-4 py-2 rounded-xl text-xs font-bold shadow-xs disabled:opacity-40"
          >
            {pincodeStatus === "checking" ? "Checking..." : "Check"}
          </button>
        </form>

        {pincodeStatus === "valid" && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{pincodeMessage}</span>
          </div>
        )}

        {pincodeStatus === "invalid" && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{pincodeMessage}</span>
          </div>
        )}

        {pincodeStatus === "idle" && (
          <p className="text-[11px] text-[#706E6B] leading-relaxed">
            Usually dispatches in 1-2 business days from our Mumbai artisan studio.
          </p>
        )}
      </div>
    </div>
  );
}

