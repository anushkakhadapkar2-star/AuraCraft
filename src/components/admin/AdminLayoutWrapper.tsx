"use client";

import { useState } from "react";
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
  Mail
} from "lucide-react";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
}

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Categories", icon: Layers, href: "/admin/categories" },
  { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { label: "Inventory", icon: Package, href: "/admin/inventory" },
  { label: "Returns", icon: RefreshCcw, href: "/admin/returns" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Reviews", icon: Star, href: "/admin/reviews" },
  { label: "Marketing", icon: Tag, href: "/admin/marketing" },
  { label: "Content", icon: LayoutTemplate, href: "/admin/content" },
  { label: "Messages", icon: Mail, href: "/admin/messages" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-surface-container-lowest text-on-surface font-body-md overflow-hidden selection:bg-primary/20">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[100] flex flex-col bg-surface border-r border-outline-variant/30 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/30 shrink-0">
          <Link href="/admin" className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'lg:justify-center'}`}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-on-primary font-bold font-headline-sm text-lg">A</span>
            </div>
            {isSidebarOpen && (
              <span className="font-headline-sm font-bold text-primary tracking-tight whitespace-nowrap">
                AURA CRAFT
              </span>
            )}
          </Link>
          <button onClick={toggleMobileMenu} className="lg:hidden text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/20' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }
                  ${!isSidebarOpen ? 'lg:justify-center' : ''}
                `}
                title={!isSidebarOpen ? item.label : ""}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'} transition-colors`} />
                {isSidebarOpen && (
                  <span className="font-body-md whitespace-nowrap font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-outline-variant/30 shrink-0">
          <a 
            href="/api/auth/signout" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error/10 transition-colors group
              ${!isSidebarOpen ? 'lg:justify-center' : ''}
            `}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Logout</span>}
          </a>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-8 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-container"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Global Search */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('q') as HTMLInputElement;
                if (input.value.trim()) {
                  window.location.href = `/admin/search?q=${encodeURIComponent(input.value.trim())}`;
                }
              }}
              className="hidden md:flex items-center bg-surface-container-low border border-outline-variant/50 rounded-full px-4 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all w-64 lg:w-96"
            >
              <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
              <input 
                name="q"
                type="text" 
                placeholder="Search products, orders, customers..." 
                className="bg-transparent border-none outline-none text-sm w-full ml-2 text-on-surface placeholder:text-on-surface-variant/70"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <button className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            
            <div className="h-8 w-px bg-outline-variant/30 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-on-surface leading-tight">{user?.name || "Admin User"}</p>
                <p className="text-xs text-on-surface-variant">{user?.role || "Administrator"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-4 lg:p-8 custom-scrollbar relative">
          {children}
        </main>

      </div>
    </div>
  );
}
