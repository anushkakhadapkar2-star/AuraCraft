import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const q = query(collection(serverDb, "products"), orderBy("createdAt", "desc"));
  const productsSnap = await getDocs(q);
  
  const products = productsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Inventory Dashboard</h1>
        <p className="text-on-surface-variant">Track stock levels across all your products in real-time.</p>
      </div>

      <InventoryClient initialProducts={products} />
    </div>
  );
}
