import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AdminProductsClient from "./AdminProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const q = query(collection(serverDb, "products"), orderBy("createdAt", "desc"));
  const productsSnap = await getDocs(q);
  
  const products = productsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Products Management</h1>
        <p className="text-on-surface-variant">View, add, update, and remove products from your store.</p>
      </div>

      <AdminProductsClient initialProducts={products} />
    </div>
  );
}
