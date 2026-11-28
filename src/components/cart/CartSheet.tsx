"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, X, Plus, Minus, Truck, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartSheet() {
  const cart = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button 
        className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all relative flex items-center justify-center cursor-pointer"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="w-4 h-4" />
      </button>
    );
  }

  const itemCount = cart.getCartCount();
  const total = cart.getCartTotal();
  const progressToFreeShipping = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger 
        className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95" 
        title="View Shopping Bag"
        aria-label={`Shopping bag with ${itemCount} items`}
      >
        <ShoppingBag className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#24483B] text-[10px] font-extrabold text-white shadow-xs ring-2 ring-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#FAF7F2] border-l border-[#E6DDCF] text-[#292825] p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <SheetHeader className="border-b border-[#E6DDCF] pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl font-bold text-[#24483B] flex items-center gap-2">
              <span>Shopping Bag</span>
              <span className="text-xs font-sans font-semibold text-[#706E6B] bg-[#EDE3D5] px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "creation" : "creations"}
              </span>
            </SheetTitle>
          </div>

          {/* Free Shipping Progress Indicator */}
          {itemCount > 0 && (
            <div className="mt-3 bg-white p-3 rounded-2xl border border-[#EDE3D5] shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-[#24483B]">
                  <Truck className="w-3.5 h-3.5 text-[#24483B]" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-bold">🎉 Free Pan-India Delivery Unlocked!</span>
                  ) : (
                    <span>Add <strong className="text-[#24483B]">₹{remainingForFreeShipping.toLocaleString("en-IN")}</strong> for Free Delivery</span>
                  )}
                </span>
                <span className="text-[11px] text-[#706E6B] font-bold">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#EDE3D5]">
                <div 
                  className="h-full bg-gradient-to-r from-[#A8B8A0] to-[#24483B] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 custom-scrollbar">
          {itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#706E6B] space-y-4 text-center px-4">
              <div className="w-16 h-16 rounded-[24px] bg-[#EDE3D5] flex items-center justify-center text-[#24483B] shadow-xs">
                <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-lg font-bold text-[#24483B]">Your bag is currently empty</p>
                <p className="text-xs text-[#706E6B] max-w-xs leading-relaxed">
                  Every Aura Craft creation is patiently hand-crocheted with premium milk cotton yarn.
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); router.push("/shop"); }}
                className="clay-btn px-6 py-2.5 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 mt-2"
              >
                <span>Explore Artisan Blooms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div 
                  key={item.product.id} 
                  className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EDE3D5] shadow-2xs hover:border-[#DFD3C3] transition-colors"
                >
                  <div className="relative aspect-square w-20 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EDE3D5] shrink-0">
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
                      <Link 
                        href={`/product/${item.product.slug}`}
                        onClick={() => setOpen(false)}
                        className="font-serif font-bold text-sm text-[#292825] line-clamp-1 hover:text-[#24483B] transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => cart.removeItem(item.product.id)}
                        className="text-[#706E6B] hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
                        title="Remove item"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.product.customGift && (
                      <div className="mt-1 p-2 bg-[#FAF7F2] rounded-xl border border-[#EDE3D5] text-[10px] text-[#706E6B] space-y-0.5">
                        <div className="font-semibold text-[#24483B] flex items-center gap-1 truncate">
                          <span>💌 For: {item.product.customGift.recipientName || "Loved One"}</span>
                          <span>• {item.product.customGift.occasion}</span>
                        </div>
                        {item.product.customGift.note && (
                          <p className="line-clamp-1 italic text-[#292825]">"{item.product.customGift.note}"</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EDE3D5]/80">
                      <div className="flex items-center bg-[#FAF7F2] border border-[#EDE3D5] rounded-xl p-0.5">
                        <button
                          className="p-1 px-2 text-[#292825] hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2 w-6 text-center select-none text-[#24483B]">{item.quantity}</span>
                        <button
                          className="p-1 px-2 text-[#292825] hover:bg-white rounded-lg cursor-pointer transition-all"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Increase quantity"
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

        {/* Footer with Checkout CTA */}
        {itemCount > 0 && (
          <div className="border-t border-[#E6DDCF] pt-4 space-y-3 bg-[#FAF7F2] shrink-0">
            <div className="space-y-1">
              <div className="flex justify-between font-serif font-bold text-base text-[#292825]">
                <span>Estimated Subtotal</span>
                <span className="text-[#24483B]">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-[#706E6B] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pan-India shipping & GST calculated at checkout</span>
              </p>
            </div>

            <button
              className="clay-btn w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(36,72,59,0.28)]"
              onClick={() => { setOpen(false); router.push("/checkout"); }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-[#706E6B]">
              <span>🔒 256-bit Secure Checkout</span>
              <span>•</span>
              <span>Direct UPI (0% Fee) & Cards</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
