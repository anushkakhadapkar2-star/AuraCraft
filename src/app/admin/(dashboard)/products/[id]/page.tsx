import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productSnap = await getDoc(doc(db, "products", resolvedParams.id));
  
  if (!productSnap.exists()) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-headline-md text-error mb-4">Product Not Found</h2>
        <Link href="/admin/products" className="text-primary hover:underline">
          Return to Products
        </Link>
      </div>
    );
  }

  const product = { id: productSnap.id, ...productSnap.data() } as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="font-display-sm text-primary mb-2">Edit Product</h1>
          <p className="text-on-surface-variant">Update the details for "{product.name}".</p>
        </div>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
