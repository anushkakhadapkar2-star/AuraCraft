import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import AdminCategoriesClient from "./AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const q = query(collection(serverDb, "categories"), orderBy("displayOrder", "asc"));
  const categoriesSnap = await getDocs(q);
  
  const categories = categoriesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Categories Management</h1>
        <p className="text-on-surface-variant">View, add, update, and remove categories for your products.</p>
      </div>

      <AdminCategoriesClient initialCategories={categories} />
    </div>
  );
}
