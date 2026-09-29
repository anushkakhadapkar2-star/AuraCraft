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
      <button className="hover:opacity-80 transition-all duration-300 scale-95 duration-200 ease-in-out relative flex items-center justify-center border-none bg-transparent outline-none cursor-pointer">
        <span className="material-symbols-outlined">shopping_bag</span>
      </button>
    );
  }

  const itemCount = cart.getCartCount();
  const total = cart.getCartTotal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="hover:opacity-80 transition-all duration-300 scale-95 duration-200 ease-in-out relative flex items-center justify-center border-none bg-transparent outline-none cursor-pointer">
        <span className="material-symbols-outlined">shopping_bag</span>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={() => setOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative aspect-square w-20 rounded-md overflow-hidden bg-zinc-100">
                    {item.product.images?.length > 0 && (
                      <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                      <button onClick={() => cart.removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button 
                          className="p-1 px-2 hover:bg-zinc-100 disabled:opacity-50"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs px-2 w-6 text-center">{item.quantity}</span>
                        <button 
                          className="p-1 px-2 hover:bg-zinc-100"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-sm">
                        ₹{(item.product.discountPrice || item.product.price) * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {itemCount > 0 && (
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Button className="w-full h-12 text-lg" onClick={() => { setOpen(false); router.push("/checkout"); }}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
