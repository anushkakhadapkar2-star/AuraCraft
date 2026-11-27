"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  AlertCircle, 
  ExternalLink, 
  Package, 
  Copy, 
  Check, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  X
} from "lucide-react";
import { db } from "@/lib/firebase/client";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"newest" | "price_high" | "price_low" | "stock">("newest");
  
  // Pagination & Bulk Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Deletion modal
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  const router = useRouter();

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.categoryName) cats.add(p.categoryName);
      else if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Inventory KPI calculations
  const stats = useMemo(() => {
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let activeCount = 0;

    products.forEach(p => {
      const stock = Number(p.inventory?.currentStock ?? 0);
      const threshold = Number(p.inventory?.lowStockThreshold ?? 5);
      totalStockUnits += stock;
      if (stock === 0) outOfStockCount++;
      else if (stock <= threshold) lowStockCount++;
      if (p.status === "ACTIVE" || !p.status) activeCount++;
    });

    return {
      total: products.length,
      active: activeCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalUnits: totalStockUnits
    };
  }, [products]);

  // Handle SKU copy
  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Toggle active/inactive
  const handleToggleStatus = async (productId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingStatusId(productId);
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
      showFeedback("success", `Product is now ${newStatus === "ACTIVE" ? "Active in store" : "Hidden from catalog"}.`);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showFeedback("error", "Failed to update product status.");
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      showFeedback("success", `"${productToDelete.name}" was removed from the catalog.`);
      setProductToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      showFeedback("error", "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
      const skuMatch = p.sku?.toLowerCase().includes(search.toLowerCase());
      const catMatch = selectedCategory === "ALL" || p.categoryName === selectedCategory || p.category === selectedCategory;

      const stock = Number(p.inventory?.currentStock ?? 0);
      const threshold = Number(p.inventory?.lowStockThreshold ?? 5);

      let stockMatch = true;
      if (stockFilter === "IN_STOCK") stockMatch = stock > threshold;
      else if (stockFilter === "LOW_STOCK") stockMatch = stock > 0 && stock <= threshold;
      else if (stockFilter === "OUT_OF_STOCK") stockMatch = stock === 0;

      return (nameMatch || skuMatch) && catMatch && stockMatch;
    }).sort((a, b) => {
      if (sortBy === "price_high") {
        return (Number(b.discountPrice || b.price || 0)) - (Number(a.discountPrice || a.price || 0));
      }
      if (sortBy === "price_low") {
        return (Number(a.discountPrice || a.price || 0)) - (Number(b.discountPrice || b.price || 0));
      }
      if (sortBy === "stock") {
        return (Number(b.inventory?.currentStock || 0)) - (Number(a.inventory?.currentStock || 0));
      }
      return 0; // default newest
    });
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6 text-[#563A29]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E9DCCB]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
              Product Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
              {stats.active} Active Online
            </span>
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Manage handcrafted bouquets, artisanal decor, pricing, and live inventory levels.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white border border-[#E9DCCB] rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-[#563A29] text-white" : "text-[#563A29]/60 hover:text-[#563A29]"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-[#563A29] text-white" : "text-[#563A29]/60 hover:text-[#563A29]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Add Product CTA */}
          <Link
            href="/admin/products/new"
            className="btn-press btn-shimmer flex items-center gap-2 bg-[#563A29] text-white px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success" 
              ? "bg-[#c3e8ca]/40 text-[#0f5223] border-[#86efac]" 
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-0.5 hover:opacity-70 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Catalog</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{stats.total}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5">{stats.totalUnits} items in warehouse</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Active in Store</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{stats.active}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5">Visible to customers</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Low Stock Warning</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{stats.lowStock}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5">Below alert threshold</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#991b1b]">Out of Stock</div>
            <div className="text-xl font-bold font-serif text-[#991b1b] mt-1">{stats.outOfStock}</div>
            <div className="text-[11px] text-[#991b1b]/80 mt-0.5">Needs craft reorder</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs space-y-3.5">
          {/* Stock filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All Items", count: stats.total },
              { id: "IN_STOCK", label: "In Stock", count: stats.total - stats.lowStock - stats.outOfStock },
              { id: "LOW_STOCK", label: "Low Stock Alert", count: stats.lowStock },
              { id: "OUT_OF_STOCK", label: "Out of Stock", count: stats.outOfStock }
            ].map((tab) => {
              const isActive = stockFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStockFilter(tab.id as any)}
                  className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-[#563A29] text-white shadow-xs"
                      : "bg-[#F8F4EE] text-[#563A29]/80 hover:bg-[#E9DCCB]/60 hover:text-[#563A29]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#E9DCCB] text-[#563A29]"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-[#E9DCCB]/60 w-full" />

          {/* Search, Category, and Sorter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title or SKU..."
                className="w-full bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl pl-9.5 pr-8 py-2 text-xs font-medium text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#563A29]/50 hover:text-[#563A29]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right selects */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Category Select */}
              <div className="flex items-center gap-1.5 bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl px-3 py-1.5 text-xs">
                <Tag className="w-3.5 h-3.5 text-[#563A29]/60" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#563A29] focus:outline-none cursor-pointer max-w-[130px] truncate"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-1.5 bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl px-3 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#563A29]/60" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-[#563A29] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Catalog Order</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="stock">Stock Available</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Display: Table View or Grid View */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#E9DCCB]/40 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-[#563A29]/60" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#563A29]">No products found</h3>
            <p className="text-xs text-[#563A29]/60 max-w-sm mx-auto mt-1">
              Try adjusting your search query, clearing category filters, or add a new handmade craft item.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {(search || selectedCategory !== "ALL" || stockFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("ALL");
                    setStockFilter("ALL");
                  }}
                  className="btn-press px-4 py-1.5 rounded-xl bg-white border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#F8F4EE] transition-all"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href="/admin/products/new"
                className="btn-press px-4 py-1.5 rounded-xl bg-[#563A29] text-white text-xs font-semibold hover:bg-[#3d2719] transition-all"
              >
                + Add Product
              </Link>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-[#E9DCCB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#F8F4EE]/80 border-b border-[#E9DCCB] text-[#563A29]/70 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Product Name & Craft</th>
                    <th className="py-3.5 px-3">SKU</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Price & Offers</th>
                    <th className="py-3.5 px-3">Stock Units</th>
                    <th className="py-3.5 px-3">Store Visibility</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs font-sans">
                  {paginatedProducts.map((product) => {
                    const stock = Number(product.inventory?.currentStock ?? 0);
                    const threshold = Number(product.inventory?.lowStockThreshold ?? 5);
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= threshold;
                    const isActive = product.status === "ACTIVE" || !product.status;

                    return (
                      <tr 
                        key={product.id} 
                        className="group hover:bg-[#F8F4EE]/70 transition-all duration-150"
                      >
                        {/* Product Title & Image */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl bg-[#F8F4EE] border border-[#E9DCCB] overflow-hidden flex-shrink-0">
                              {product.images?.[0]?.url ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#563A29]/40">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link 
                                href={`/admin/products/${product.id}`}
                                className="font-serif font-bold text-sm text-[#563A29] hover:underline truncate block max-w-[220px]"
                              >
                                {product.name}
                              </Link>
                              <span className="text-[11px] text-[#563A29]/60">
                                ID: #{product.id.slice(0, 6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-medium text-[#563A29]/80 bg-[#F8F4EE] px-2 py-0.5 rounded-md border border-[#E9DCCB]">
                              {product.sku || "NO-SKU"}
                            </span>
                            {product.sku && (
                              <button
                                onClick={(e) => handleCopySku(product.sku, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#563A29]/60 hover:text-[#563A29]"
                                title="Copy SKU"
                              >
                                {copiedSku === product.sku ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E9DCCB]/60 text-[#563A29] border border-[#CDAE91]/50">
                            {product.categoryName || product.category || "Uncategorized"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3">
                          <div className="font-serif font-bold text-sm text-[#563A29]">
                            ₹{Number(product.discountPrice || product.price || 0).toLocaleString("en-IN")}
                          </div>
                          {product.discountPrice && product.discountPrice < product.price && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-[#563A29]/50 line-through">
                                ₹{product.price}
                              </span>
                              <span className="text-[10px] font-bold text-[#0f5223] bg-[#c3e8ca]/50 px-1 rounded">
                                SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              isOutOfStock ? "bg-red-500 animate-pulse" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <span className="font-bold text-xs text-[#563A29]">
                              {stock} units
                            </span>
                          </div>
                          <span className="text-[10px] text-[#563A29]/60 block mt-0.5">
                            {isOutOfStock ? "Out of stock" : isLowStock ? `Alert at ≤ ${threshold}` : "Optimal"}
                          </span>
                        </td>

                        {/* Store Visibility */}
                        <td className="py-3.5 px-3">
                          <button
                            onClick={(e) => handleToggleStatus(product.id, product.status || "ACTIVE", e)}
                            disabled={togglingStatusId === product.id}
                            className={`btn-press inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                              isActive
                                ? "bg-[#c3e8ca] text-[#0f5223] border-[#86efac]"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#0f5223]" : "bg-gray-400"}`} />
                            <span>{isActive ? "Active" : "Hidden"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="btn-press p-1.5 rounded-lg text-[#563A29]/70 hover:text-[#563A29] hover:bg-[#E9DCCB]/50 transition-all"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                              className="btn-press p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.map((product) => {
              const stock = Number(product.inventory?.currentStock ?? 0);
              const threshold = Number(product.inventory?.lowStockThreshold ?? 5);
              const isOutOfStock = stock === 0;
              const isLowStock = stock > 0 && stock <= threshold;
              const isActive = product.status === "ACTIVE" || !product.status;

              return (
                <div 
                  key={product.id}
                  className="card-hover bg-white rounded-2xl border border-[#E9DCCB] p-4 flex flex-col justify-between shadow-xs transition-all duration-200"
                >
                  <div>
                    {/* Image & Status Badge */}
                    <div className="relative w-full aspect-square rounded-xl bg-[#F8F4EE] border border-[#E9DCCB]/60 overflow-hidden mb-3">
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#563A29]/40">
                          <Package className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-2.5 right-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          isActive
                            ? "bg-[#c3e8ca] text-[#0f5223]"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      {product.categoryName && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="bg-[#563A29]/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-medium">
                            {product.categoryName}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#563A29] line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-[#563A29]/60 font-mono mt-0.5">
                      SKU: {product.sku || "N/A"}
                    </p>

                    <div className="mt-2.5 flex items-baseline justify-between">
                      <div>
                        <span className="font-serif font-bold text-base text-[#563A29]">
                          ₹{Number(product.discountPrice || product.price || 0).toLocaleString("en-IN")}
                        </span>
                        {product.discountPrice && (
                          <span className="text-xs text-[#563A29]/50 line-through ml-1.5">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${
                        isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-emerald-700"
                      }`}>
                        {stock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E9DCCB]/60 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="btn-press flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#F8F4EE] border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-[#E9DCCB]/50 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                      className="btn-press p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 60 FPS Pagination Bar */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-xs text-[#563A29]/70 font-medium">
              Showing <span className="font-bold text-[#563A29]">{(safeCurrentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-[#563A29]">{Math.min(safeCurrentPage * pageSize, filteredProducts.length)}</span> of{" "}
              <span className="font-bold text-[#563A29]">{filteredProducts.length}</span> products
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2 text-xs text-[#563A29]/70">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#F8F4EE] border border-[#E9DCCB] rounded-lg px-2 py-1 text-xs font-semibold text-[#563A29] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="btn-press px-3 py-1.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold bg-white text-[#563A29] hover:bg-[#F8F4EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Previous
              </button>

              <span className="text-xs font-bold text-[#563A29] px-2">
                Page {safeCurrentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="btn-press px-3 py-1.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold bg-white text-[#563A29] hover:bg-[#F8F4EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-[#F8F4EE] rounded-3xl p-6 shadow-2xl border border-[#E9DCCB] space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-[#563A29]">
                Delete Product?
              </h2>
              <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
                Are you sure you want to remove <strong className="text-[#563A29]">"{productToDelete.name}"</strong> from your catalog? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="btn-press px-4 py-2 rounded-xl bg-white border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#E9DCCB]/40 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn-press px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}