"use client";

import { useState } from "react";
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

export default function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        "inventory.currentStock": newStock
      });
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, inventory: { ...p.inventory, currentStock: newStock } } 
          : p
      ));
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden">
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30 border-b border-outline-variant/30">
         <div className="p-6">
            <p className="font-label-caps text-on-surface-variant mb-2">Total Products in Stock</p>
            <p className="font-display-sm text-primary">{products.filter(p => p.inventory?.currentStock > 0).length}</p>
         </div>
         <div className="p-6">
            <p className="font-label-caps text-on-surface-variant mb-2 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-[#FF9800]" /> Low Stock Warnings
            </p>
            <p className="font-display-sm text-[#FF9800]">
               {products.filter(p => p.inventory?.currentStock > 0 && p.inventory?.currentStock <= (p.inventory?.lowStockThreshold || 5)).length}
            </p>
         </div>
         <div className="p-6">
            <p className="font-label-caps text-on-surface-variant mb-2 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-error" /> Out of Stock
            </p>
            <p className="font-display-sm text-error">
               {products.filter(p => !p.inventory?.currentStock || p.inventory?.currentStock === 0).length}
            </p>
         </div>
      </div>

      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-surface-container-lowest">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Search products to update stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary font-body-md"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
              <th className="p-4 font-label-caps text-on-surface-variant">Product</th>
              <th className="p-4 font-label-caps text-on-surface-variant">SKU</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Category</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Available Stock</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Low Stock Alert At</th>
              <th className="p-4 font-label-caps text-on-surface-variant text-right">Quick Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const stock = product.inventory?.currentStock || 0;
              const threshold = product.inventory?.lowStockThreshold || 5;
              let statusColor = "bg-[#4CAF50]"; // Healthy
              if (stock === 0) statusColor = "bg-error";
              else if (stock <= threshold) statusColor = "bg-[#FF9800]";

              return (
                <tr key={product.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                        {product.images?.[0]?.url && (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="font-headline-sm text-primary line-clamp-1">{product.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-body-md">{product.sku || "N/A"}</td>
                  <td className="p-4 text-on-surface-variant font-body-md">{product.categoryName || "N/A"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                      <span className="font-body-md text-on-surface font-bold">{stock} Units</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-body-md">{threshold} Units</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => updateStock(product.id, stock - 1)}
                        disabled={updatingId === product.id}
                        className="p-1.5 text-error hover:bg-error/10 rounded border border-error/30 transition-colors disabled:opacity-50" 
                        title="Decrease Stock"
                      >
                        <ArrowDownRight className="w-4 h-4" />
                      </button>
                      <input 
                        type="number" 
                        value={stock} 
                        onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                        disabled={updatingId === product.id}
                        className="w-16 bg-surface-container-low border border-outline-variant/50 rounded px-2 py-1 focus:outline-none focus:border-primary font-body-md text-center disabled:opacity-50" 
                      />
                      <button 
                        onClick={() => updateStock(product.id, stock + 1)}
                        disabled={updatingId === product.id}
                        className="p-1.5 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded border border-[#4CAF50]/30 transition-colors disabled:opacity-50" 
                        title="Increase Stock"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-md">
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
