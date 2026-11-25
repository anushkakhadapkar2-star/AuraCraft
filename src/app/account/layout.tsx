import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";

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
    <div className="py-8 sm:py-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Modern SaaS Sidebar */}
        <AccountSidebar 
          user={{
            name: session.user?.name,
            email: session.user?.email,
            phone: typeof session.user?.phone === "string" ? session.user.phone : undefined
          }} 
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
