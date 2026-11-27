"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "./SearchBar";
import { Heart, User, Gift, Home, Store } from "lucide-react";
import { AuraCraftIcon } from "@/components/brand/AuraCraftLogo";
import { FloatingNavbarPill } from "@/components/ui/aceternity/FloatingNavbarPill";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Collections" },
  { href: "/shop?new=true", label: "New Arrivals" },
  { href: "/custom-gifts", label: "Gifts" },
  { href: "/about", label: "About" },
];

export function Navbar({ session }: { session?: any }) {
  const pathname = usePathname();

  const isLinkActive = useCallback((href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/shop?new=true") {
      if (typeof window !== "undefined") {
        return pathname === "/shop" && window.location.search.includes("new=true");
      }
      return false;
    }
    if (href === "/shop") {
      if (typeof window !== "undefined" && window.location.search.includes("new=true")) {
        return false;
      }
      return pathname === "/shop" || pathname.startsWith("/product/");
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <>
      {/* Unified Solid Sticky Header: 100% Opaque Cream, Zero Gaps, Perfectly Aligned */}
      <header className="sticky top-0 z-50 w-full bg-[#FAF7F2] border-b border-[#E6DDCF] shadow-[0_2px_14px_rgba(41,40,37,0.05)] transition-shadow">
        {/* Top Announcement Bar */}
        <div className="w-full bg-[#24483B] text-[#EDE3D5] py-2 px-4 text-center font-medium text-xs tracking-wider select-none flex items-center justify-center gap-2">
          <span className="text-[#C9A45C]">✦</span>
          <span>Handcrafted with Care &amp; Passion • Free Pan-India Delivery on Orders Above ₹999</span>
          <span className="text-[#C9A45C]">✦</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-between items-center px-margin-desktop py-3.5 max-w-container-max mx-auto w-full bg-[#FAF7F2] font-sans">
          {/* Brand */}
          <Link className="font-serif text-2xl font-bold text-[#24483B] tracking-tight hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2.5 group" href="/">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <AuraCraftIcon size={34} />
            </div>
            <span className="tracking-wide">AURA CRAFT</span>
          </Link>

          {/* Links Pills with Aceternity Smooth Layout Motion */}
          <FloatingNavbarPill
            links={NAV_LINKS}
            currentPath={pathname}
            isLinkActive={isLinkActive}
          />

          {/* Actions */}
          <div className="flex items-center gap-2.5 text-[#292825] shrink-0">
            <SearchBar />
            <Link 
              href="/wishlist" 
              className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
              title="Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4" />
            </Link>
            <CartSheet />
            <UserMenu session={session} />
          </div>
        </nav>

        {/* Mobile Top Header */}
        <div className="md:hidden flex justify-between items-center px-margin-mobile py-2.5 bg-[#FAF7F2] border-t border-[#E6DDCF]/40">
          <Link className="font-serif text-xl font-bold text-[#24483B] tracking-tight flex items-center gap-2" href="/">
            <AuraCraftIcon size={26} />
            <span>AURA CRAFT</span>
          </Link>
          <div className="flex items-center gap-2">
            <SearchBar />
            <CartSheet />
          </div>
        </div>
      </header>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[28px] bg-[#FAF7F2] border-t border-[#E6DDCF] shadow-[0_-8px_30px_rgba(41,40,37,0.06)]">
        <div className="flex justify-around items-center px-margin-mobile py-1.5">
          <Link 
            className={`min-touch flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${pathname === "/" ? "clay-btn px-3.5 py-1.5 shadow-[0_4px_12px_rgba(36,72,59,0.35)]" : "text-[#706E6B] hover:text-[#24483B]"}`} 
            href="/"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Home</span>
          </Link>
          <Link 
            className={`min-touch flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${pathname.startsWith("/shop") ? "clay-btn px-3.5 py-1.5 shadow-[0_4px_12px_rgba(36,72,59,0.35)]" : "text-[#706E6B] hover:text-[#24483B]"}`} 
            href="/shop"
            aria-label="Shop"
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Shop</span>
          </Link>

          <Link 
            className={`min-touch flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${pathname.startsWith("/custom-gifts") ? "clay-btn px-3.5 py-1.5 shadow-[0_4px_12px_rgba(36,72,59,0.35)]" : "text-[#706E6B] hover:text-[#24483B]"}`} 
            href="/custom-gifts"
            aria-label="Custom Gifts"
          >
            <Gift className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Gifts</span>
          </Link>
          <Link 
            className={`min-touch flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${pathname.startsWith("/wishlist") ? "clay-btn px-3.5 py-1.5 shadow-[0_4px_12px_rgba(36,72,59,0.35)]" : "text-[#706E6B] hover:text-[#24483B]"}`} 
            href="/wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Wishlist</span>
          </Link>
          <Link 
            className={`min-touch flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${pathname.startsWith("/profile") || pathname.startsWith("/account") || pathname.startsWith("/login") ? "clay-btn px-3.5 py-1.5 shadow-[0_4px_12px_rgba(36,72,59,0.35)]" : "text-[#706E6B] hover:text-[#24483B]"}`} 
            href={session ? "/profile" : "/login"}
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
