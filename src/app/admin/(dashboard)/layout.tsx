import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

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
