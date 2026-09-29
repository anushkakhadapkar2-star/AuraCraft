"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "./SearchBar";

export function Navbar({ session }: { session?: any }) {
  const [lastScroll, setLastScroll] = useState(0);
  const [navStyle, setNavStyle] = useState({ transform: 'translateY(0)' });

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) {
        setNavStyle({ transform: 'translateY(0)' });
      }
      if (currentScroll > lastScroll && currentScroll > 100) {
        setNavStyle({ transform: 'translateY(-100%)' });
      } else if (currentScroll < lastScroll) {
        setNavStyle({ transform: 'translateY(0)' });
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 w-full z-[101] bg-primary text-on-primary py-2 px-4 text-center font-label-caps text-label-caps tracking-widest text-xs md:text-sm">
        ✨ Handcrafted with Love • Free Shipping on Selected Orders
      </div>

      {/* TopNavBar (Web) */}
      <nav 
        className="hidden md:flex fixed top-[32px] w-full z-[100] bg-surface/90 dark:bg-surface-container-highest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm transition-transform duration-200 ease-in-out" 
        style={navStyle}
      >
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto w-full">
          {/* Brand */}
          <Link className="font-display-md text-2xl font-bold text-primary dark:text-primary-fixed-dim tracking-tight" href="/">
            AURA CRAFT
          </Link>
          {/* Links */}
          <ul className="flex space-x-8">
            <li><Link className="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-headline-sm text-sm hover:opacity-80 transition-all duration-300" href="/">Home</Link></li>
            <li><Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-headline-sm text-sm hover:opacity-80 duration-300" href="/shop">Shop</Link></li>
            <li><Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-headline-sm text-sm hover:opacity-80 duration-300" href="/categories">Categories</Link></li>
            <li><Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-headline-sm text-sm hover:opacity-80 duration-300" href="/about">About Us</Link></li>
            <li><Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-headline-sm text-sm hover:opacity-80 duration-300" href="/shop?new=true">New Arrivals</Link></li>
          </ul>
          {/* Actions */}
          <div className="flex space-x-4 items-center text-primary dark:text-primary-fixed-dim">
            <SearchBar />
            <button className="hover:opacity-80 transition-all duration-300 scale-95 duration-200 ease-in-out"><span className="material-symbols-outlined text-2xl">favorite</span></button>
            <CartSheet />
            <UserMenu session={session} />
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header 
        className="md:hidden fixed top-[32px] w-full z-[100] bg-surface/90 dark:bg-surface-container-highest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm px-margin-mobile py-3 flex justify-between items-center transition-transform duration-200 ease-in-out"
        style={navStyle}
      >
        <Link className="font-display-md text-xl font-bold text-primary tracking-tight" href="/">
          AURA CRAFT
        </Link>
        <div className="flex items-center space-x-2">
          <SearchBar />
        </div>
      </header>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-surface/95 dark:bg-surface-container-highest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-12px_40px_rgba(111,78,55,0.12)]">
        <div className="flex justify-around items-center px-margin-mobile py-3">
          <Link className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed-dim bg-secondary-fixed/50 rounded-full p-2 active:bg-surface-container-high transition-transform active:scale-90" href="/">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-label-caps text-label-caps mt-1">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant active:bg-surface-container-high transition-transform active:scale-90" href="/shop">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-caps text-label-caps mt-1">Shop</span>
          </Link>
          <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant active:bg-surface-container-high transition-transform active:scale-90">
            <span className="material-symbols-outlined">favorite</span>
            <span className="font-label-caps text-label-caps mt-1">Wishlist</span>
          </button>
          <div className="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant active:bg-surface-container-high transition-transform active:scale-90 relative">
            <CartSheet />
          </div>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant active:bg-surface-container-high transition-transform active:scale-90" href="/login">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-caps text-label-caps mt-1">Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
