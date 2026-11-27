import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { ShopCatalogClient } from "@/components/shop/ShopCatalogClient";

export const metadata = {
  title: "Shop Handcrafted Treasures | Aura Craft",
  description: "Browse our boutique collection of handmade crochet flowers, bouquets, home decor, and artisanal gifts.",
};

export default async function ShopPage() {
  let categories: any[] = [];
  let products: any[] = [];
  let shopContent: any = null;

  try {
    // 1. Fetch categories
    const categoriesSnap = await getDocs(collection(serverDb, "categories"));
    categories = categoriesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(c => c.status === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // 2. Fetch products
    const productsSnap = await getDocs(
      query(collection(serverDb, "products"), where("status", "==", "ACTIVE"))
    );
    products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // 3. Fetch shop page settings
    const shopPageRef = doc(serverDb, "settings", "shoppage");
    const shopPageSnap = await getDoc(shopPageRef);
    if (shopPageSnap.exists()) {
      shopContent = shopPageSnap.data();
    }
  } catch (err: any) {
    console.error("Firebase fetch error in ShopPage:", err);
  }

  return (
    <div className="flex-grow pb-20 max-w-7xl mx-auto w-full">
      <ShopCatalogClient 
        initialProducts={products}
        categories={categories}
        shopContent={shopContent}
      />
    </div>
  );
}
