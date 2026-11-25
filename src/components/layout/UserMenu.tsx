"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Heart, ShoppingBag, LogOut, Package, Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  session: any;
}

export function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms delay to allow moving mouse into dropdown
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const loggedOutMenu = (
    <>
      <div className="mb-4 pb-4 border-b border-[#F3E1E5] space-y-2.5">
        <Link 
          href="/login" 
          onClick={handleLinkClick}
          className="clay-btn w-full py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-[0_4px_12px_rgba(212,91,122,0.3)]"
        >
          Log In
        </Link>
        <div className="flex justify-between items-center px-1 text-xs">
          <span className="text-[#8B5E6B]">New customer?</span>
          <Link 
            href="/register" 
            onClick={handleLinkClick}
            className="text-[#D45B7A] hover:text-[#B03E5D] hover:underline font-bold"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <Link href="/login?callbackUrl=/profile" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <User className="w-4 h-4 text-[#8B5E6B]" />
        <span>My Profile</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <Package className="w-4 h-4 text-[#8B5E6B]" />
        <span>Orders</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <Heart className="w-4 h-4 text-[#8B5E6B]" />
        <span>Wishlist</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <Star className="w-4 h-4 text-[#8B5E6B]" />
        <span>Rewards</span>
      </Link>
    </>
  );

  const loggedInMenu = (
    <>
      <Link href="/profile" onClick={handleLinkClick} className="block mb-4 pb-4 border-b border-[#F3E1E5] hover:opacity-85 transition-opacity">
        <p className="font-bold text-[#382025] text-sm truncate">
          Hello, {session?.user?.name || "Customer"}
        </p>
        <p className="text-[#8B5E6B] text-xs truncate mt-0.5">
          {session?.user?.email || session?.user?.phone || "Welcome back!"}
        </p>
      </Link>
      <Link href="/profile" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <User className="w-4 h-4 text-[#8B5E6B]" />
        <span>My Profile</span>
      </Link>
      <Link href="/account/orders" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <Package className="w-4 h-4 text-[#8B5E6B]" />
        <span>Orders</span>
      </Link>
      <Link href="/wishlist" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-[#382025] hover:text-[#D45B7A] transition-colors hover:bg-[#FAF7F8] px-3 -mx-2 rounded-xl text-xs font-semibold">
        <Heart className="w-4 h-4 text-[#8B5E6B]" />
        <span>Wishlist</span>
      </Link>
      <a href="/api/auth/signout" onClick={handleLinkClick} className="flex items-center gap-3 py-2.5 text-rose-600 hover:bg-rose-50 px-3 -mx-2 rounded-xl transition-colors mt-2 border-t border-[#F3E1E5] pt-3 text-xs font-bold">
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </a>
    </>
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
        className="flex items-center justify-center focus:outline-none cursor-pointer group p-0.5 rounded-full transition-transform hover:scale-105 active:scale-95"
        aria-label="User profile menu"
      >
        {session?.user ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-[0_3px_8px_rgba(212,91,122,0.35)] ring-2 ring-white">
            {getInitials(session.user?.name, session.user?.email)}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-white text-[#D45B7A] flex items-center justify-center group-hover:bg-[#FAF7F8] group-hover:text-[#382025] transition-all border border-[#F3E1E5] shadow-[0_3px_8px_rgba(212,91,122,0.08),_inset_0_1px_2px_rgba(255,255,255,0.95)]">
            <User className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full right-0 mt-2 w-64 bg-white rounded-[26px] shadow-[0_16px_36px_rgba(212,91,122,0.12),_inset_0_2px_4px_rgba(255,255,255,0.95)] border border-[#F3E1E5] p-5 transform origin-top-right transition-all duration-200 ease-out z-[110]
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
        `}
      >
        {/* Pointer Triangle */}
        <div className="absolute -top-1.5 right-6 w-3.5 h-3.5 bg-white border-t border-l border-[#F3E1E5] transform rotate-45"></div>
        
        <div className="relative z-10">
          {session ? loggedInMenu : loggedOutMenu}
        </div>
      </div>
    </div>
  );
}
