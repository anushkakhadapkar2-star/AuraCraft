"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  User, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface AccountSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    phone?: any;
  };
}

const NAV_ITEMS = [
  {
    href: "/account",
    label: "Dashboard",
    icon: User,
    exact: true,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: Package,
    exact: false,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: Heart,
    exact: true,
  },
  {
    href: "/profile",
    label: "My Profile",
    icon: Settings,
    exact: true,
  },
];

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-full md:w-72 flex-shrink-0">
      <div className="bg-white rounded-3xl p-5 sm:p-6 sticky top-28 border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-6">
        
        {/* User Profile Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-[#E9DCCB]/80">
          <div className="w-12 h-12 rounded-2xl bg-[#563A29] text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs shrink-0 ring-4 ring-[#FAF7F2]">
            {getInitials(user?.name, user?.email, "A")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-serif font-bold text-base text-[#36251A] truncate">
                {user?.name || "Customer"}
              </p>
              <span title="Verified Customer">
                <ShieldCheck className="w-4 h-4 text-[#A4AD91] shrink-0" />
              </span>
            </div>
            <p className="text-xs text-[#7D6B5E] truncate mt-0.5">
              {user?.email || user?.phone || "Aura Craft Artisan Member"}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                  active
                    ? "bg-[#563A29] text-white shadow-xs"
                    : "text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-white" : "text-[#7D6B5E] group-hover:text-[#36251A]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                    active ? "text-white/80" : "text-[#7D6B5E]/40"
                  }`}
                />
              </Link>
            );
          })}

          {/* Sign Out Action */}
          <div className="pt-3 mt-3 border-t border-[#E9DCCB]/80">
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#FFF5F4] transition-colors group"
            >
              <LogOut className="w-4 h-4 text-[#ba1a1a] group-hover:rotate-12 transition-transform" />
              <span>Sign Out</span>
            </Link>
          </div>
        </nav>

        {/* Artisan Member Perks Banner */}
        <div className="bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl p-3.5 text-xs">
          <div className="flex items-center gap-2 text-[#563A29] font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#CDAE91]" />
            <span>Artisan Rewards</span>
          </div>
          <p className="text-[11px] text-[#7D6B5E] leading-relaxed">
            Free shipping unlocked on selected handmade bouquets and festive gifts.
          </p>
        </div>

      </div>
    </aside>
  );
}
