"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  Plus,
  Minus,
  Package,
  Check,
  ArrowUpDown,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

export default function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "HEALTHY" | "LOW" | "OUT">("ALL");
  const [products, setProducts] = useState(initialProducts || []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stockFilter]);

  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    setErrorMsg(null);
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        "inventory.currentStock": newStock,
        updatedAt: new Date().toISOString()
      });
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, inventory: { ...p.inventory, currentStock: newStock } }
          : p
      ));
      setRecentlyUpdatedId(productId);
      setTimeout(() => setRecentlyUpdatedId(null), 2000);
    } catch (error: any) {
      console.error("Error updating stock:", error);
      setErrorMsg("Failed to update stock: " + (error.message || "Network error"));
    } finally {
      setUpdatingId(null);
    }
  };

  // Inventory stats
  const stats = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let out = 0;
    let totalUnits = 0;

    products.forEach(p => {
      const stock = Number(p.inventory?.currentStock ?? 0);
      const threshold = Number(p.inventory?.lowStockThreshold ?? 5);
      totalUnits += stock;
      if (stock === 0) out++;
      else if (stock <= threshold) low++;
      else healthy++;
    });

    return { total: products.length, healthy, low, out, totalUnits };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
      const skuMatch = p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesSearch = nameMatch || skuMatch;

      const stock = Number(p.inventory?.currentStock ?? 0);
      const threshold = Number(p.inventory?.lowStockThreshold ?? 5);

      let matchesStock = true;
      if (stockFilter === "HEALTHY") matchesStock = stock > threshold;
      else if (stockFilter === "LOW") matchesStock = stock > 0 && stock <= threshold;
      else if (stockFilter === "OUT") matchesStock = stock === 0;

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

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
              Inventory & Stock Control
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
              Live Units Sync
            </span>
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Instant inventory adjustments, threshold monitoring, and out-of-stock restocking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60 block">Total Units</span>
            <span className="font-serif font-bold text-lg text-[#563A29]">{stats.totalUnits.toLocaleString("en-IN")} units</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Tracked SKUs</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{stats.total}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">Catalog items</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Healthy Stock</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{stats.healthy}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Above thresholds</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Low Stock Alerts</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{stats.low}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Needs craft batch</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#991b1b]">Out of Stock</div>
            <div className="text-xl font-bold font-serif text-[#991b1b] mt-1">{stats.out}</div>
            <div className="text-[11px] text-[#991b1b]/80 mt-0.5 font-medium">0 available</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All SKUs", count: stats.total },
              { id: "HEALTHY", label: "Healthy Stock", count: stats.healthy },
              { id: "LOW", label: "Low Stock Alert", count: stats.low },
              { id: "OUT", label: "Out of Stock", count: stats.out }
            ].map(tab => {
              const isActive = stockFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStockFilter(tab.id as any)}
                  className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${isActive
                      ? "bg-[#563A29] text-white shadow-xs"
                      : "bg-[#F8F4EE] text-[#563A29]/80 hover:bg-[#E9DCCB]/60 hover:text-[#563A29]"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#E9DCCB] text-[#563A29]"
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-[#E9DCCB]/60 w-full" />

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
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
        </div>

        {/* Inventory Data Table */}
        <div className="bg-white rounded-2xl border border-[#E9DCCB] shadow-xs overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DCCB]/40 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-[#563A29]/60" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#563A29]">No inventory items found</h3>
              <p className="text-xs text-[#563A29]/60 max-w-sm mt-1">
                Try modifying your search query or reset your stock filter.
              </p>
              {(search || stockFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStockFilter("ALL");
                  }}
                  className="btn-press mt-4 px-4 py-1.5 rounded-xl bg-[#563A29] text-white text-xs font-semibold hover:bg-[#3d2719] transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F8F4EE]/80 border-b border-[#E9DCCB] text-[#563A29]/70 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Product Name</th>
                    <th className="py-3.5 px-3">SKU</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Threshold Alert</th>
                    <th className="py-3.5 px-3">Stock Health</th>
                    <th className="py-3.5 pr-6 text-right">Quick Stock Stepper</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs font-sans">
                  {paginatedProducts.map((product) => {
                    const stock = Number(product.inventory?.currentStock ?? 0);
                    const threshold = Number(product.inventory?.lowStockThreshold ?? 5);
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= threshold;
                    const isUpdating = updatingId === product.id;
                    const wasRecentlyUpdated = recentlyUpdatedId === product.id;

                    return (
                      <tr
                        key={product.id}
                        className="group hover:bg-[#F8F4EE]/70 transition-all duration-150"
                      >
                        {/* Title & Image */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl bg-[#F8F4EE] border border-[#E9DCCB] overflow-hidden flex-shrink-0">
                              {product.images?.[0]?.url ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#563A29]/40">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="font-serif font-bold text-sm text-[#563A29] truncate max-w-[220px]">
                              {product.name}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-3 font-mono text-xs text-[#563A29]/80">
                          {product.sku || "N/A"}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E9DCCB]/50 text-[#563A29]">
                            {product.categoryName || product.category || "General"}
                          </span>
                        </td>

                        {/* Threshold */}
                        <td className="py-3.5 px-3 text-[#563A29]/70 text-xs">
                          Alert at ≤ {threshold} units
                        </td>

                        {/* Stock Health */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                            <span className="font-bold text-xs text-[#563A29]">
                              {stock} units
                            </span>
                          </div>
                          <span className={`text-[10px] font-medium block mt-0.5 ${isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-700" : "text-emerald-700"
                            }`}>
                            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock Warning" : "Healthy"}
                          </span>
                        </td>

                        {/* Quick Stepper */}
                        <td className="py-3.5 pr-6 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl p-1 shadow-xs">
                            <button
                              onClick={() => updateStock(product.id, stock - 1)}
                              disabled={isUpdating || stock <= 0}
                              className="btn-press p-1.5 rounded-lg text-[#563A29] hover:bg-white disabled:opacity-30 transition-all min-touch"
                              title="Decrease Stock"
                              aria-label="Decrease Stock"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min={0}
                              value={stock}
                              onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                              disabled={isUpdating}
                              className="w-12 bg-white border border-[#E9DCCB] rounded-lg text-center font-bold text-xs py-1 text-[#563A29] focus:outline-none focus:border-[#563A29]"
                              aria-label="Stock count"
                            />

                            <button
                              onClick={() => updateStock(product.id, stock + 1)}
                              disabled={isUpdating}
                              className="btn-press p-1.5 rounded-lg text-[#563A29] hover:bg-white disabled:opacity-30 transition-all min-touch"
                              title="Increase Stock"
                              aria-label="Increase Stock"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {wasRecentlyUpdated && (
                              <span className="text-emerald-600 pl-1 pr-1.5 animate-in fade-in zoom-in duration-200">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredProducts.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#E9DCCB] bg-[#F8F4EE]/50 text-xs text-[#563A29]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#563A29]/70">
                      Showing{" "}
                      <strong className="text-[#563A29]">
                        {(safeCurrentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-[#563A29]">
                        {Math.min(safeCurrentPage * pageSize, filteredProducts.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-[#563A29]">{filteredProducts.length}</strong> items
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[#563A29]/60">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E9DCCB] rounded-lg px-2 py-1 text-xs text-[#563A29] font-medium focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all min-touch"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <span key={p} className="flex items-center">
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-[#563A29]/40">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(p)}
                              className={`btn-press w-8 h-8 rounded-lg text-xs font-semibold transition-all ${safeCurrentPage === p
                                  ? "bg-[#563A29] text-white"
                                  : "border border-[#E9DCCB] bg-white text-[#563A29] hover:bg-[#F8F4EE]"
                                }`}
                            >
                              {p}
                            </button>
                          </span>
                        );
                      })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all min-touch"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
