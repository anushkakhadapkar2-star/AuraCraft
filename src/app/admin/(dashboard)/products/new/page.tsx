import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="font-display-sm text-primary mb-2">Add New Product</h1>
          <p className="text-on-surface-variant">Create a new product in your store.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
