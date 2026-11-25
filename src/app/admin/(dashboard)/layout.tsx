import type { Metadata } from "next";
import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Aura Craft Operations | Admin Console",
  description: "Artisan e-commerce management and fulfillment hub",
  icons: {
    icon: [
      { url: "/icons/aura-admin-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/aura-admin-icon.svg",
    shortcut: "/icons/aura-admin-icon.svg",
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutWrapper user={session.user}>
      {children}
    </AdminLayoutWrapper>
  );
}
