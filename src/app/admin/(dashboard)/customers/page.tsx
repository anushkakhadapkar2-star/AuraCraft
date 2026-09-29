import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AdminCustomersClient from "./AdminCustomersClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const q = query(collection(serverDb, "users"), orderBy("createdAt", "desc"));
  const usersSnap = await getDocs(q);
  
  const customers = usersSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Customer Database</h1>
        <p className="text-on-surface-variant">View customer profiles, track total spend, and manage accounts.</p>
      </div>

      <AdminCustomersClient initialCustomers={customers} />
    </div>
  );
}
