import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, User, Heart, Settings, LogOut } from "lucide-react";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="py-12 md:py-24 max-w-7xl mx-auto w-full px-4 lg:px-8 fade-in-up">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-surface-container-low rounded-3xl p-6 sticky top-32 border border-outline-variant/30">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-outline-variant/30">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-display-md text-xl">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-headline-sm text-primary line-clamp-1">{session.user?.name || 'Customer'}</p>
                <p className="font-body-sm text-on-surface-variant line-clamp-1">{session.user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-background font-body-md">
                <User className="w-5 h-5 text-on-surface-variant" />
                Dashboard
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-background font-body-md">
                <Package className="w-5 h-5 text-on-surface-variant" />
                My Orders
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-background font-body-md">
                <Heart className="w-5 h-5 text-on-surface-variant" />
                Wishlist
              </Link>
              <Link href="/account/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-background font-body-md">
                <Settings className="w-5 h-5 text-on-surface-variant" />
                Settings
              </Link>
              
              <div className="pt-4 mt-4 border-t border-outline-variant/30">
                <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 transition-colors text-error font-body-md">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
