"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CartSheet() {
  const cart = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Prevent hydration errors by only rendering client-side content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button className="w-10 h-10 rounded-full bg-white border border-[#F3E1E5] text-[#D45B7A] hover:text-[#382025] hover:bg-[#FAF7F8] shadow-[0_3px_8px_rgba(212,91,122,0.08),_inset_0_1px_2px_rgba(255,255,255,0.95)] transition-all relative flex items-center justify-center cursor-pointer">
        <ShoppingBag className="w-4 h-4" />
      </button>
    );
  }

  const itemCount = cart.getCartCount();
  const total = cart.getCartTotal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-10 h-10 rounded-full bg-white border border-[#F3E1E5] text-[#D45B7A] hover:text-[#382025] hover:bg-[#FAF7F8] shadow-[0_3px_8px_rgba(212,91,122,0.08),_inset_0_1px_2px_rgba(255,255,255,0.95)] transition-all relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95" title="Cart">
        <ShoppingBag className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#F2A4B7] to-[#D45B7A] text-[10px] font-extrabold text-white shadow-[0_2px_6px_rgba(212,91,122,0.4)] ring-2 ring-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#FAF7F8] border-l border-[#F3E1E5] text-[#382025] p-6 shadow-2xl">
        <SheetHeader className="border-b border-[#F3E1E5] pb-4">
          <SheetTitle className="font-serif text-xl font-bold text-[#382025]">Shopping Bag ({itemCount})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#8B5E6B] space-y-4 text-center">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(212,91,122,0.35)]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-[#382025]">Your bag is currently empty</p>
                <p className="text-xs text-[#8B5E6B] mt-1">Discover handcrafted floral bouquets & gifts!</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="clay-btn px-6 py-2.5 rounded-2xl text-xs font-bold shadow-[0_6px_16px_rgba(212,91,122,0.35)]"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#F3E1E5] shadow-[0_6px_16px_rgba(212,91,122,0.06),_inset_0_1px_2px_rgba(255,255,255,0.9)]">
                  <div className="relative aspect-square w-20 rounded-xl overflow-hidden bg-[#FAF7F8] border border-[#F3E1E5] shrink-0">
                    {item.product.images?.length > 0 && (
                      <Image 
                        src={item.product.images[0].url} 
                        alt={item.product.name} 
                        fill 
                        sizes="80px"
                        className="object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#382025] line-clamp-1">{item.product.name}</h4>
                      <button
                        onClick={() => cart.removeItem(item.product.id)}
                        className="text-[#8B5E6B] hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.product.customGift && (
                      <div className="mt-1 p-1.5 bg-[#FAF7F8] rounded-lg border border-[#F3E1E5] text-[10px] text-[#8B5E6B] space-y-0.5">
                        <div className="font-semibold text-[#D45B7A] flex items-center gap-1 truncate">
                          <span>💌 For: {item.product.customGift.recipientName || "Loved One"}</span>
                          <span>• {item.product.customGift.occasion}</span>
                        </div>
                        {item.product.customGift.note && (
                          <p className="line-clamp-1 italic text-[#382025]">"{item.product.customGift.note}"</p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F3E1E5]">
                      <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-xl p-0.5">
                        <button
                          className="p-1 px-2 text-[#382025] hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2 w-6 text-center select-none text-[#382025]">{item.quantity}</span>
                        <button
                          className="p-1 px-2 text-[#382025] hover:bg-white rounded-lg cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#382025]">
                        ₹{Number((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {itemCount > 0 && (
          <div className="border-t border-[#F3E1E5] pt-4 space-y-3 bg-[#FAF7F8]">
            <div className="flex justify-between font-serif font-bold text-base text-[#382025]">
              <span>Estimated Subtotal</span>
              <span className="text-[#D45B7A]">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[11px] text-[#8B5E6B]">Shipping and taxes calculated during checkout.</p>
            <button
              className="clay-btn w-full py-3.5 rounded-2xl text-sm shadow-[0_8px_20px_rgba(212,91,122,0.4)]"
              onClick={() => { setOpen(false); router.push("/checkout"); }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
