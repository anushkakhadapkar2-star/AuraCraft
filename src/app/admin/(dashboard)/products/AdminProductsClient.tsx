"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary font-body-md"
          />
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 btn-radius font-headline-sm hover:bg-tertiary transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
              <th className="p-4 font-label-caps text-on-surface-variant">Product</th>
              <th className="p-4 font-label-caps text-on-surface-variant">SKU</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Category</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Price</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Stock</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Status</th>
              <th className="p-4 font-label-caps text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {product.images?.[0]?.url ? (
                        <Image 
                          src={product.images[0].url} 
                          alt={product.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="font-headline-sm text-primary line-clamp-1">{product.name}</div>
                  </div>
                </td>
                <td className="p-4 text-on-surface-variant font-body-md">{product.sku || "N/A"}</td>
                <td className="p-4 text-on-surface-variant font-body-md">{product.categoryName || "N/A"}</td>
                <td className="p-4">
                  <div className="font-headline-sm text-primary">₹{product.discountPrice || product.price}</div>
                  {product.discountPrice && (
                    <div className="text-xs text-on-surface-variant line-through">₹{product.price}</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${product.inventory?.currentStock > (product.inventory?.lowStockThreshold || 5) ? 'bg-[#4CAF50]' : product.inventory?.currentStock > 0 ? 'bg-[#FF9800]' : 'bg-error'}`}></span>
                    <span className="font-body-md text-on-surface-variant">{product.inventory?.currentStock || 0}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.status === 'ACTIVE' ? 'bg-[#c3e8ca] text-[#0f5223]' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {product.status || 'INACTIVE'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting === product.id}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant font-body-md">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
