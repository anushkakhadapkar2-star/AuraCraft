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
      <button className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all relative flex items-center justify-center cursor-pointer">
        <ShoppingBag className="w-4 h-4" />
      </button>
    );
  }

  const itemCount = cart.getCartCount();
  const total = cart.getCartTotal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95" title="Cart">
        <ShoppingBag className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#24483B] text-[10px] font-extrabold text-white shadow-xs ring-2 ring-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#FAF7F2] border-l border-[#E6DDCF] text-[#292825] p-6 shadow-2xl">
        <SheetHeader className="border-b border-[#E6DDCF] pb-4">
          <SheetTitle className="font-serif text-xl font-bold text-[#24483B]">Shopping Bag ({itemCount})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#706E6B] space-y-4 text-center">
              <div className="w-16 h-16 rounded-[22px] bg-[#24483B] flex items-center justify-center text-white shadow-xs">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-[#292825]">Your bag is currently empty</p>
                <p className="text-xs text-[#706E6B] mt-1">Discover handcrafted floral bouquets & gifts!</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="clay-btn px-6 py-2.5 rounded-2xl text-xs font-bold shadow-xs"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#E6DDCF] shadow-xs">
                  <div className="relative aspect-square w-20 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E6DDCF] shrink-0">
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
                      <h4 className="font-serif font-bold text-sm text-[#292825] line-clamp-1">{item.product.name}</h4>
                      <button
                        onClick={() => cart.removeItem(item.product.id)}
                        className="text-[#706E6B] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.product.customGift && (
                      <div className="mt-1 p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E6DDCF] text-[10px] text-[#706E6B] space-y-0.5">
                        <div className="font-semibold text-[#24483B] flex items-center gap-1 truncate">
                          <span>💌 For: {item.product.customGift.recipientName || "Loved One"}</span>
                          <span>• {item.product.customGift.occasion}</span>
                        </div>
                        {item.product.customGift.note && (
                          <p className="line-clamp-1 italic text-[#292825]">"{item.product.customGift.note}"</p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E6DDCF]">
                      <div className="flex items-center bg-[#FAF7F2] border border-[#E6DDCF] rounded-xl p-0.5">
                        <button
                          className="p-1 px-2 text-[#292825] hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2 w-6 text-center select-none text-[#24483B]">{item.quantity}</span>
                        <button
                          className="p-1 px-2 text-[#292825] hover:bg-white rounded-lg cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#24483B]">
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
          <div className="border-t border-[#E6DDCF] pt-4 space-y-3 bg-[#FAF7F2]">
            <div className="flex justify-between font-serif font-bold text-base text-[#292825]">
              <span>Estimated Subtotal</span>
              <span className="text-[#24483B]">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[11px] text-[#706E6B]">Shipping and taxes calculated during checkout.</p>
            <button
              className="clay-btn w-full py-3.5 rounded-2xl text-sm shadow-[0_8px_20px_rgba(36,72,59,0.3)]"
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
