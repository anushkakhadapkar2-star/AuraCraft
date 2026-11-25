"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Star, 
  Tag, 
  Mail, 
  BarChart3, 
  Settings,
  Plus,
  ExternalLink,
  RefreshCcw,
  Sparkles,
  Command,
  ArrowRight
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  category: "Navigation" | "Quick Actions";
  href: string;
  isExternal?: boolean;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Quick Actions
  {
    id: "add-product",
    title: "Add New Product",
    subtitle: "Create a new handcrafted craft in your store",
    icon: Plus,
    category: "Quick Actions",
    href: "/admin/products/new",
  },
  {
    id: "view-store",
    title: "View Live Storefront",
    subtitle: "Open Aura Craft customer shopping experience",
    icon: ExternalLink,
    category: "Quick Actions",
    href: "/",
    isExternal: true,
  },
  {
    id: "coupons",
    title: "Create Discount Coupon",
    subtitle: "Manage promotions, festive discounts and promo codes",
    icon: Tag,
    category: "Quick Actions",
    href: "/admin/marketing",
  },

  // Navigation
  {
    id: "nav-dashboard",
    title: "Dashboard Overview",
    subtitle: "Real-time metrics, KPI charts and recent sales",
    icon: LayoutDashboard,
    category: "Navigation",
    href: "/admin",
  },
  {
    id: "nav-orders",
    title: "Orders & Fulfillment",
    subtitle: "Manage customer shipments, status and tracking",
    icon: ShoppingBag,
    category: "Navigation",
    href: "/admin/orders",
  },
  {
    id: "nav-products",
    title: "Product Catalog",
    subtitle: "View, edit, duplicate or restock crafts",
    icon: Package,
    category: "Navigation",
    href: "/admin/products",
  },
  {
    id: "nav-inventory",
    title: "Inventory & Stock Levels",
    subtitle: "Track low stock warnings and reorder levels",
    icon: RefreshCcw,
    category: "Navigation",
    href: "/admin/inventory",
  },
  {
    id: "nav-categories",
    title: "Categories",
    subtitle: "Organize collections, bouquets and torans",
    icon: Layers,
    category: "Navigation",
    href: "/admin/categories",
  },
  {
    id: "nav-customers",
    title: "Customer Directory",
    subtitle: "Inspect registered members, orders and phone numbers",
    icon: Users,
    category: "Navigation",
    href: "/admin/customers",
  },
  {
    id: "nav-reviews",
    title: "Product Reviews & Ratings",
    subtitle: "Moderate photo reviews and customer feedback",
    icon: Star,
    category: "Navigation",
    href: "/admin/reviews",
  },
  {
    id: "nav-messages",
    title: "Customer Messages",
    subtitle: "Read inquiries from contact and custom order forms",
    icon: Mail,
    category: "Navigation",
    href: "/admin/messages",
  },
  {
    id: "nav-analytics",
    title: "Sales Analytics & Reports",
    subtitle: "Monthly revenue, top products and sales growth",
    icon: BarChart3,
    category: "Navigation",
    href: "/admin/analytics",
  },
  {
    id: "nav-settings",
    title: "Store Settings",
    subtitle: "Payment methods, branding, banner promos and shipping",
    icon: Settings,
    category: "Navigation",
    href: "/admin/settings",
  },
];

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter commands
  const filtered = COMMAND_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.isExternal) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(86,58,41,0.25)] border border-[#E9DCCB] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E9DCCB] bg-[#FAF7F2]">
          <Search className="w-5 h-5 text-[#563A29] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search pages... (e.g. Orders, Products, Revenue)"
            className="w-full bg-transparent border-none outline-none text-sm text-[#2A1D15] placeholder:text-[#7D6B5E]/60 font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-[#E9DCCB] text-[10px] font-mono text-[#7D6B5E] shadow-2xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#E9DCCB]/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7D6B5E]">
              <p className="font-semibold text-sm text-[#36251A] mb-1">No results found</p>
              <p>Try searching for "Orders", "Inventory", or "Add Product"</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#563A29] text-white shadow-xs"
                      : "text-[#36251A] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[#FAF7F2] text-[#563A29] border border-[#E9DCCB]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#2A1D15]"}`}>
                        {item.title}
                      </p>
                      <p className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[#7D6B5E]"}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF7F2] text-[#7D6B5E] border border-[#E9DCCB]"
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? "text-white translate-x-0.5" : "text-transparent"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-[#E9DCCB] bg-[#FAF7F2] flex items-center justify-between text-[11px] text-[#7D6B5E]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E9DCCB] font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E9DCCB] font-mono text-[9px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E9DCCB] font-mono text-[9px]">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="font-semibold text-[#563A29] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#CDAE91]" />
            <span>Aura Craft Admin Ops</span>
          </span>
        </div>
      </div>
    </div>
  );
}

