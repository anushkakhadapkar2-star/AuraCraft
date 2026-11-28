"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Package, Heart, Sparkles, LogIn, UserPlus } from "lucide-react";

export function UserMenu({ session }: { session?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "AC";
  };

  const loggedOutMenu = (
    <div className="space-y-3">
      <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE3D5] text-center space-y-2">
        <p className="text-xs font-bold text-[#292825]">Welcome to Aura Craft</p>
        <p className="text-[11px] text-[#706E6B]">Sign in to track orders, manage wishlist & addresses</p>
        <Link 
          href="/login?callbackUrl=/profile" 
          onClick={handleLinkClick}
          className="clay-btn w-full py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </Link>
        <div className="flex justify-center items-center gap-1 pt-1 text-[11px]">
          <span className="text-[#706E6B]">New here?</span>
          <Link 
            href="/register" 
            onClick={handleLinkClick}
            className="text-[#24483B] hover:text-[#C9A45C] hover:underline font-bold"
          >
            Create an Account
          </Link>
        </div>
      </div>

      <div className="space-y-0.5">
        <Link 
          href="/login?callbackUrl=/profile" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <User className="w-4 h-4 text-[#706E6B]" />
          <span>My Profile</span>
        </Link>
        <Link 
          href="/login?callbackUrl=/account/orders" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <Package className="w-4 h-4 text-[#706E6B]" />
          <span>Orders & Tracking</span>
        </Link>
        <Link 
          href="/wishlist" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <Heart className="w-4 h-4 text-[#706E6B]" />
          <span>Wishlist</span>
        </Link>
      </div>
    </div>
  );

  const loggedInMenu = (
    <div className="space-y-2">
      <Link 
        href="/profile" 
        onClick={handleLinkClick} 
        className="block p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE3D5] hover:border-[#DFD3C3] transition-colors"
      >
        <p className="font-serif font-bold text-[#24483B] text-sm truncate">
          {session?.user?.name || "Artisan Patron"}
        </p>
        <p className="text-[#706E6B] text-[11px] truncate mt-0.5">
          {session?.user?.email || session?.user?.phone || "Welcome back"}
        </p>
      </Link>

      <div className="space-y-0.5 pt-1">
        <Link 
          href="/profile" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <User className="w-4 h-4 text-[#706E6B]" />
          <span>Personal Details & Addresses</span>
        </Link>
        <Link 
          href="/account/orders" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <Package className="w-4 h-4 text-[#706E6B]" />
          <span>My Orders</span>
        </Link>
        <Link 
          href="/wishlist" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 py-2 px-3 text-[#292825] hover:text-[#24483B] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold transition-colors"
        >
          <Heart className="w-4 h-4 text-[#706E6B]" />
          <span>Wishlist</span>
        </Link>
      </div>

      <div className="pt-2 border-t border-[#EDE3D5]">
        <a 
          href="/api/auth/signout" 
          onClick={handleLinkClick} 
          className="flex items-center gap-2.5 py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </a>
      </div>
    </div>
  );

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
        aria-label="User profile menu"
        title={session?.user?.name ? `Account: ${session.user.name}` : "Account"}
      >
        {session?.user ? (
          <div className="w-7 h-7 rounded-full bg-[#24483B] text-white flex items-center justify-center font-bold text-[11px] tracking-tight">
            {getInitials(session.user?.name, session.user?.email)}
          </div>
        ) : (
          <User className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white rounded-[24px] shadow-[0_16px_40px_rgba(41,40,37,0.12)] border border-[#EDE3D5] p-3.5 transform origin-top-right transition-all duration-200 ease-out z-[110] ${
          isOpen 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {session?.user ? loggedInMenu : loggedOutMenu}
      </div>
    </div>
  );
}
