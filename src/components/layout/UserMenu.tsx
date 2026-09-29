"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Heart, ShoppingBag, LogOut, Package, Star } from "lucide-react";

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
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const loggedOutMenu = (
    <>
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant/30">
        <span className="font-body-md text-on-surface-variant text-sm">New customer?</span>
        <Link 
          href="/login" 
          onClick={handleLinkClick}
          className="text-primary font-headline-sm hover:underline"
        >
          Sign Up
        </Link>
      </div>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <User className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">My Profile</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <Package className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">Orders</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <Heart className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">Wishlist</span>
      </Link>
      <Link href="/login" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <Star className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">Rewards</span>
      </Link>
    </>
  );

  const loggedInMenu = (
    <>
      <div className="mb-4 pb-4 border-b border-outline-variant/30">
        <p className="font-headline-sm text-primary text-sm truncate">
          Hello, {session?.user?.name || "Customer"}
        </p>
        <p className="font-body-md text-on-surface-variant text-xs truncate mt-1">
          {session?.user?.email || session?.user?.phone || "Welcome back!"}
        </p>
      </div>
      <Link href="/account/settings" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <User className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">My Profile</span>
      </Link>
      {session?.user?.role === "ADMIN" && (
         <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
           <Star className="w-5 h-5 text-on-surface-variant" />
           <span className="font-body-md font-bold text-primary">Admin Dashboard</span>
         </Link>
      )}
      <Link href="/account/orders" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <Package className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">Orders</span>
      </Link>
      <Link href="/wishlist" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-on-surface hover:text-primary transition-colors hover:bg-surface-container-low px-4 -mx-4 rounded-lg">
        <Heart className="w-5 h-5 text-on-surface-variant" />
        <span className="font-body-md">Wishlist</span>
      </Link>
      <a href="/api/auth/signout" onClick={handleLinkClick} className="flex items-center gap-3 py-3 text-error hover:bg-error/10 px-4 -mx-4 rounded-lg transition-colors mt-2 border-t border-outline-variant/30 pt-4">
        <LogOut className="w-5 h-5" />
        <span className="font-body-md">Logout</span>
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
      <Link 
        href={session ? "/account" : "/login"} 
        className="flex items-center gap-1 hover:text-tertiary transition-all duration-300 group py-2"
      >
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">person</span>
        <span className="font-headline-sm text-sm hidden lg:block">
          {session ? session.user?.name?.split(' ')[0] || "Account" : "Login"}
        </span>
        <ChevronDown className={`w-4 h-4 hidden lg:block transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Link>

      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full right-0 mt-2 w-64 bg-surface rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-outline-variant/20 p-6 transform origin-top-right transition-all duration-300 ease-out z-[110]
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
        `}
      >
        {/* Pointer Triangle */}
        <div className="absolute -top-2 right-6 w-4 h-4 bg-surface border-t border-l border-outline-variant/20 transform rotate-45"></div>
        
        <div className="relative z-10">
          {session ? loggedInMenu : loggedOutMenu}
        </div>
      </div>
    </div>
  );
}
