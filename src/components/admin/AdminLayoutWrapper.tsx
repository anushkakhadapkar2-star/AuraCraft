"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  RefreshCcw,
  Users,
  Star,
  Tag,
  LayoutTemplate,
  Bell,
  BarChart3,
  Settings,
  Menu,
  Search,
  X,
  LogOut,
  ChevronLeft,
  Mail,
  ExternalLink,
  Sparkles,
  Command,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminPanelIcon } from "@/components/brand/AdminPanelLogo";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
}

interface NavSection {
  title: string;
  items: {
    label: string;
    icon: any;
    href: string;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    title: "COMMERCE",
    items: [
      { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
      { label: "Products", icon: Package, href: "/admin/products" },
      { label: "Categories", icon: Layers, href: "/admin/categories" },
      { label: "Inventory", icon: RefreshCcw, href: "/admin/inventory" },
      { label: "Returns", icon: RefreshCcw, href: "/admin/returns" },
    ],
  },
  {
    title: "ENGAGEMENT",
    items: [
      { label: "Customers", icon: Users, href: "/admin/customers" },
      { label: "Reviews", icon: Star, href: "/admin/reviews" },
      { label: "Messages", icon: Mail, href: "/admin/messages" },
      { label: "Marketing & Coupons", icon: Tag, href: "/admin/marketing" },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      { label: "Store Content", icon: LayoutTemplate, href: "/admin/content" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
];

export function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pathname = usePathname();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isNotificationsOpen) {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isNotificationsOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-[#FAF7F2] text-[#2A1D15] font-sans overflow-hidden selection:bg-[#563A29] selection:text-white">

      {/* Command Palette Modal */}
      <AdminCommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-[90] lg:hidden backdrop-blur-2xs transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[100] flex flex-col bg-white border-r border-[#E9DCCB] transition-[width,transform] duration-250 ease-out shadow-[0_4px_24px_rgba(86,58,41,0.03)]
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E9DCCB]/80 shrink-0 bg-[#FAF7F2]/60">
          <Link
            href="/admin"
            className={`flex items-center gap-3 overflow-hidden group ${!isSidebarOpen && "lg:justify-center w-full"}`}
          >
            <div className="shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-2xs">
              <AdminPanelIcon size={36} />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm tracking-wide text-[#36251A] whitespace-nowrap">
                    AURA CRAFT
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E4E8DE] text-[#2B3320] border border-[#A4AD91]/40 uppercase tracking-widest">
                    OPS
                  </span>
                </div>
                <p className="text-[10px] text-[#7D6B5E] truncate">Artisan Commerce Hub</p>
              </div>
            )}
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2] min-touch"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#7D6B5E]/70 mb-1.5 select-none">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors duration-150 group relative min-touch ${isActive
                        ? "bg-[#563A29] text-white shadow-xs font-bold"
                        : "text-[#7D6B5E] hover:bg-[#FAF7F2] hover:text-[#36251A] font-semibold"
                      } ${!isSidebarOpen ? "lg:justify-center px-0" : ""}`}
                    title={!isSidebarOpen ? item.label : ""}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && isSidebarOpen && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#CDAE91] rounded-r-full" />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${isActive ? "text-white" : "text-[#7D6B5E] group-hover:text-[#563A29]"
                        }`}
                    />

                    {isSidebarOpen && (
                      <span className="whitespace-nowrap flex-1 truncate">{item.label}</span>
                    )}

                    {isSidebarOpen && item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-[#FAF7F2] text-[#563A29] border border-[#E9DCCB]"
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User & Store Link */}
        <div className="p-3 border-t border-[#E9DCCB]/80 shrink-0 bg-[#FAF7F2]/40 space-y-2">
          {/* Quick Storefront Link */}
          {isSidebarOpen ? (
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#563A29] bg-white border border-[#E9DCCB] hover:bg-[#FAF7F2] hover:border-[#CDAE91] transition-colors shadow-2xs group min-touch"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#CDAE91]" />
                <span>View Storefront</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#7D6B5E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center p-2.5 rounded-xl text-[#563A29] bg-white border border-[#E9DCCB] hover:bg-[#FAF7F2] transition-colors min-touch"
              title="View Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          {/* User Profile & Sign Out */}
          <div className={`flex items-center justify-between p-2 rounded-xl bg-white border border-[#E9DCCB]/60 ${!isSidebarOpen && "lg:justify-center p-1.5"}`}>
            <div className={`flex items-center gap-2.5 min-w-0 ${!isSidebarOpen && "hidden"}`}>
              <div className="w-7 h-7 rounded-lg bg-[#563A29] text-white flex items-center justify-center font-bold text-xs shrink-0 relative">
                {getInitials(user?.name, user?.email, "A")}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#A4AD91] ring-2 ring-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#36251A] truncate">{user?.name || "Administrator"}</p>
                <p className="text-[10px] text-[#7D6B5E] truncate">Online • Super Admin</p>
              </div>
            </div>

            <a
              href="/api/auth/signout"
              className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#FFF5F4] transition-colors shrink-0 group min-touch flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Navbar Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E9DCCB] flex items-center justify-between px-4 lg:px-8 shrink-0 z-40 sticky top-0 shadow-2xs">

          {/* Left Actions: Mobile Menu, Sidebar Toggle, Command Bar Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2] min-touch flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2] transition-colors min-touch items-center justify-center"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-250 ${!isSidebarOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Command Palette Trigger Bar */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center justify-between bg-[#FAF7F2] border border-[#E9DCCB] hover:border-[#CDAE91] hover:bg-white rounded-2xl px-3.5 py-1.5 transition-colors text-xs text-[#7D6B5E] w-52 sm:w-64 md:w-80 shadow-2xs cursor-pointer group min-touch"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#563A29] group-hover:scale-105 transition-transform" />
                <span className="truncate">Search commands, crafts, orders...</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-[#E9DCCB] text-[10px] font-mono text-[#563A29] shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">

            {/* Live Storefront Status Beacon */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4E8DE] border border-[#A4AD91]/50 text-[11px] font-bold text-[#2B3320]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A4AD91] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B6648]"></span>
              </span>
              <span>Store Live</span>
            </div>

            {/* View Storefront Pill Button */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9DCCB] bg-white hover:bg-[#FAF7F2] text-[#563A29] text-xs font-semibold transition-colors shadow-2xs group min-touch"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {/* Notification Bell with Hierarchy */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-[#7D6B5E] hover:text-[#563A29] hover:bg-[#FAF7F2] rounded-xl transition-colors cursor-pointer min-touch flex items-center justify-center"
                title="System Notifications"
                aria-label="Open notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-[0_15px_40px_rgba(86,58,41,0.12)] border border-[#E9DCCB] p-4 z-[110] animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#36251A]">Operational Alerts</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF7F2] text-[#563A29] rounded-md border border-[#E9DCCB]">
                        3 Unread
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[#7D6B5E] hover:text-[#36251A] text-xs"
                      aria-label="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="py-2 space-y-2 text-xs">
                    {/* Order alert */}
                    <Link
                      href="/admin/orders"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB]/60 hover:bg-[#F1E7DA] transition-colors group block"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#E4E8DE] text-[#2B3320] flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#36251A] group-hover:text-[#563A29]">New Order Placed</p>
                        <p className="text-[11px] text-[#7D6B5E] mt-0.5 truncate">Blooming Pink Lily Duo requires dispatch.</p>
                        <span className="text-[10px] text-[#7D6B5E]/80 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Just now
                        </span>
                      </div>
                    </Link>

                    {/* Stock alert */}
                    <Link
                      href="/admin/inventory"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF9F8] border border-[#FDD0CD] hover:bg-[#FFF1F0] transition-colors group block"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#FFF1F0] text-[#ba1a1a] flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#ba1a1a]">Low Stock Warning</p>
                        <p className="text-[11px] text-[#7D6B5E] mt-0.5 truncate">Crochet Sunflower has only 2 units left.</p>
                        <span className="text-[10px] text-[#7D6B5E]/80 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 2 hours ago
                        </span>
                      </div>
                    </Link>

                    {/* Review alert */}
                    <Link
                      href="/admin/reviews"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors group block border border-transparent hover:border-[#E9DCCB]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-[#92400E]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#36251A] group-hover:text-[#563A29]">5-Star Artisan Review</p>
                        <p className="text-[11px] text-[#7D6B5E] mt-0.5 truncate">"Absolutely stunning craftsmanship!"</p>
                        <span className="text-[10px] text-[#7D6B5E]/80 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 5 hours ago
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-[#E9DCCB] text-center">
                    <Link
                      href="/admin/orders"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-semibold text-[#563A29] hover:underline"
                    >
                      View All Operations Activity →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-[#E9DCCB] hidden sm:block"></div>

            {/* Admin Avatar & Role */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#563A29] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-2xs ring-2 ring-[#E9DCCB]">
                {getInitials(user?.name, user?.email, "A")}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#36251A] leading-tight truncate max-w-[120px]">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-[#7D6B5E]">Admin Ops</p>
              </div>
            </div>

          </div>
        </header>

        {/* ===================== PAGE CONTENT VIEWPORT ===================== */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
