"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, doc, updateDoc, query, orderBy, writeBatch } from "firebase/firestore";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  ExternalLink,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    addressLine1?: string;
    state?: string;
    pincode?: string;
    [key: string]: any;
  };
  items: any[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  ALL: { label: "All Orders", color: "text-[#563A29]", bg: "bg-[#E9DCCB]/40", border: "border-[#CDAE91]", dot: "bg-[#563A29]" },
  ORDER_PLACED: { label: "Placed", color: "text-[#563A29]", bg: "bg-[#E9DCCB]/50", border: "border-[#CDAE91]/60", dot: "bg-[#CDAE91]" },
  PROCESSING: { label: "Processing", color: "text-[#92400e]", bg: "bg-[#fef3c7]", border: "border-[#fde68a]", dot: "bg-[#f59e0b]" },
  SHIPPED: { label: "Shipped", color: "text-[#1e3a8a]", bg: "bg-[#dbeafe]", border: "border-[#bfdbfe]", dot: "bg-[#3b82f6]" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-[#0369a1]", bg: "bg-[#e0f2fe]", border: "border-[#bae6fd]", dot: "bg-[#0284c7]" },
  DELIVERED: { label: "Delivered", color: "text-[#0f5223]", bg: "bg-[#c3e8ca]", border: "border-[#86efac]", dot: "bg-[#22c55e]" },
  CANCELLED: { label: "Cancelled", color: "text-[#991b1b]", bg: "bg-[#fee2e2]", border: "border-[#fca5a5]", dot: "bg-[#ef4444]" },
};

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, sortBy]);

  // Selection & Details Drawer
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrderForDrawer?.id === orderId) {
        setSelectedOrderForDrawer(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }
      showFeedback("success", `Order status updated to ${newStatus}.`);
    } catch (err: any) {
      console.error("Error updating status:", err);
      showFeedback("error", "Failed to update order status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      selectedOrderIds.forEach(id => {
        const ref = doc(db, "orders", id);
        batch.update(ref, {
          orderStatus: newStatus,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();

      setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, orderStatus: newStatus } : o));
      showFeedback("success", `Updated ${selectedOrderIds.length} orders to ${newStatus}.`);
      setSelectedOrderIds([]);
    } catch (err) {
      console.error("Batch update failed:", err);
      showFeedback("error", "Failed to update selected orders.");
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(paginatedOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Status counts for pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      ORDER_PLACED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    orders.forEach(order => {
      const status = (order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED")
        ? "ORDER_PLACED"
        : order.orderStatus;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  }, [orders]);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress?.phone?.includes(searchQuery);

      const normalizedStatus = (order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED")
        ? "ORDER_PLACED"
        : order.orderStatus;

      const matchesStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
      const matchesPayment = paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "highest") {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      if (sortBy === "lowest") {
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safeCurrentPage, pageSize]);

  // CSV Exporter
  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ["Order ID", "Date", "Customer Name", "Phone", "City", "Total Amount", "Payment Status", "Payment Method", "Fulfillment Status"];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
      `"${o.shippingAddress?.fullName || 'N/A'}"`,
      `"${o.shippingAddress?.phone || 'N/A'}"`,
      `"${o.shippingAddress?.city || 'N/A'}"`,
      o.totalAmount,
      o.paymentStatus,
      o.paymentMethod,
      o.orderStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_craft_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F4EE] text-[#563A29]">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-3 ${feedback.type === "success" ? "bg-[#2B3320] border border-[#A4AD91]" : "bg-[#ba1a1a] border border-red-300"
            }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 text-[#CDAE91]" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E9DCCB]/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
                Orders & Fulfillment
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29] animate-pulse"></span>
                Live
              </span>
            </div>
            <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
              Manage artisan deliveries, track dispatch statuses, and process customer fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#E9DCCB]/30 hover:border-[#CDAE91] transition-all shadow-xs"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#563A29]" : "text-[#563A29]/70"}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#E9DCCB]/30 hover:border-[#CDAE91] transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#563A29]/70" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Orders</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{orders.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">All time placed</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">In Processing</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{statusCounts.PROCESSING}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Crafting in studio</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a8a]">In Transit</div>
            <div className="text-xl font-bold font-serif text-[#1e3a8a] mt-1">
              {statusCounts.SHIPPED + statusCounts.OUT_FOR_DELIVERY}
            </div>
            <div className="text-[11px] text-[#1e3a8a]/80 mt-0.5 font-medium">Shipped & Out</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Delivered</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{statusCounts.DELIVERED}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Completed orders</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#991b1b]">Cancelled</div>
            <div className="text-xl font-bold font-serif text-[#991b1b] mt-1">{statusCounts.CANCELLED}</div>
            <div className="text-[11px] text-[#991b1b]/80 mt-0.5 font-medium">Restocked</div>
          </div>

          <div className="bg-gradient-to-br from-[#563A29] to-[#3d2719] text-white rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E9DCCB]/80">Orders GMV</div>
            <div className="text-xl font-bold font-serif mt-1">₹{totalFilteredRevenue.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-[#CDAE91] mt-0.5 font-medium">{filteredOrders.length} filtered items</div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs space-y-3.5">
          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(["ALL", "ORDER_PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const).map((key) => {
              const isActive = statusFilter === key;
              const count = statusCounts[key] ?? 0;
              const conf = STATUS_CONFIG[key] || STATUS_CONFIG.ALL;

              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${isActive
                    ? "bg-[#563A29] text-white shadow-xs"
                    : "bg-[#F8F4EE] text-[#563A29]/80 hover:bg-[#E9DCCB]/60 hover:text-[#563A29]"
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? "bg-[#CDAE91]" : conf.dot}`} />
                  <span>{conf.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#E9DCCB] text-[#563A29]"
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-[#E9DCCB]/60 w-full" />

          {/* Search, Payment, and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, customer name, phone..."
                className="w-full bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl pl-9.5 pr-8 py-2 text-xs font-medium text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#563A29]/50 hover:text-[#563A29]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Filters */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Payment Filter */}
              <div className="flex items-center gap-1.5 bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl px-3 py-1.5 text-xs">
                <CreditCard className="w-3.5 h-3.5 text-[#563A29]/60" />
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#563A29] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Payments</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Sorter */}
              <div className="flex items-center gap-1.5 bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl px-3 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#563A29]/60" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-[#563A29] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Value</option>
                  <option value="lowest">Lowest Value</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Actions Bar (when orders selected) */}
        {selectedOrderIds.length > 0 && (
          <div className="flex items-center justify-between bg-[#563A29] text-white px-5 py-3 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CDAE91] animate-ping" />
              <span className="text-xs font-bold font-serif tracking-wide">
                {selectedOrderIds.length} {selectedOrderIds.length === 1 ? "order" : "orders"} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#E9DCCB]/80 font-sans hidden sm:inline">Set Status:</span>
              <button
                onClick={() => handleBatchStatusUpdate("PROCESSING")}
                className="btn-press px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
              >
                Processing
              </button>
              <button
                onClick={() => handleBatchStatusUpdate("SHIPPED")}
                className="btn-press px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
              >
                Shipped
              </button>
              <button
                onClick={() => handleBatchStatusUpdate("DELIVERED")}
                className="btn-press px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#A4AD91] text-[#2d381e] hover:bg-[#8e987b] transition-all"
              >
                Delivered
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="btn-press ml-2 p-1 text-white/70 hover:text-white"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Orders Table Container */}
        <div className="bg-white rounded-2xl border border-[#E9DCCB] shadow-xs overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-9 h-9 border-3 border-[#563A29] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#563A29]/70">Loading artisan orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DCCB]/40 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-[#563A29]/60" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#563A29]">No orders found</h3>
              <p className="text-xs text-[#563A29]/60 max-w-sm mt-1">
                {searchQuery || statusFilter !== "ALL" || paymentFilter !== "ALL"
                  ? "No orders match your filter criteria. Try clearing search or resetting filters."
                  : "No orders have been recorded yet."}
              </p>
              {(searchQuery || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setPaymentFilter("ALL");
                  }}
                  className="btn-press mt-4 px-4 py-1.5 rounded-xl bg-[#563A29] text-white text-xs font-semibold hover:bg-[#3d2719] transition-all"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#F8F4EE]/80 border-b border-[#E9DCCB] text-[#563A29]/70 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-5 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedOrders.length > 0 && selectedOrderIds.length === paginatedOrders.length}
                        onChange={toggleSelectAll}
                        className="rounded border-[#CDAE91] text-[#563A29] focus:ring-[#563A29] cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-3">Order Details</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Craft Items</th>
                    <th className="py-3.5 px-3">Amount & Payment</th>
                    <th className="py-3.5 px-3">Fulfillment Status</th>
                    <th className="py-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs font-sans">
                  {paginatedOrders.map((order) => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    const normalizedStatus = (order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED")
                      ? "ORDER_PLACED"
                      : order.orderStatus;
                    const statusStyle = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.ORDER_PLACED;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderForDrawer(order)}
                        className={`group transition-all duration-150 cursor-pointer ${isSelected ? "bg-[#E9DCCB]/30" : "hover:bg-[#F8F4EE]/70"
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 pl-5 pr-3" onClick={(e) => toggleSelectOrder(order.id, e)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="rounded border-[#CDAE91] text-[#563A29] focus:ring-[#563A29] cursor-pointer"
                          />
                        </td>

                        {/* Order ID & Date */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#563A29]">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <button
                              onClick={(e) => handleCopyId(order.id, e)}
                              className="btn-press opacity-40 group-hover:opacity-100 transition-opacity p-1 hover:text-[#563A29]"
                              title="Copy Full Order ID"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-[#563A29]/60 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#563A29]/40" />
                            <span>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                                : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#E9DCCB] text-[#563A29] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                              {order.shippingAddress?.fullName ? order.shippingAddress.fullName.charAt(0).toUpperCase() : "C"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#563A29] truncate max-w-[140px]">
                                {order.shippingAddress?.fullName || "Guest Customer"}
                              </div>
                              <div className="text-[11px] text-[#563A29]/60 truncate max-w-[140px]">
                                {order.shippingAddress?.city || "India"} • {order.shippingAddress?.phone || "No phone"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Craft Items */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#E9DCCB]/60 text-[#563A29] font-bold text-[11px]">
                              {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                            </span>
                            <span className="text-[11px] text-[#563A29]/70 truncate max-w-[150px]">
                              {order.items?.[0]?.product?.name || order.items?.[0]?.name || "Artisan product"}
                            </span>
                          </div>
                        </td>

                        {/* Amount & Payment */}
                        <td className="py-4 px-3">
                          <div className="font-serif font-bold text-sm text-[#563A29]">
                            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-[#563A29]/60 uppercase">
                              {order.paymentMethod || "COD"}
                            </span>
                            <span className="text-[10px] text-[#563A29]/40">•</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${order.paymentStatus === "PAID"
                              ? "bg-[#c3e8ca] text-[#0f5223]"
                              : order.paymentStatus === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                              }`}>
                              <span className={`w-1 h-1 rounded-full ${order.paymentStatus === "PAID"
                                ? "bg-[#0f5223]"
                                : order.paymentStatus === "FAILED"
                                  ? "bg-red-700"
                                  : "bg-amber-700"
                                }`} />
                              {order.paymentStatus || "PENDING"}
                            </span>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              value={normalizedStatus}
                              disabled={updatingStatusId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`btn-press appearance-none pl-3 pr-7 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border shadow-2xs focus:outline-none ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                            >
                              <option value="ORDER_PLACED">Placed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70 text-[9px]">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-5 text-right">
                          <button
                            onClick={() => setSelectedOrderForDrawer(order)}
                            className="btn-press p-1.5 rounded-lg text-[#563A29]/70 hover:text-[#563A29] hover:bg-[#E9DCCB]/40 transition-all inline-flex items-center gap-1 text-xs font-semibold"
                            title="View Full Details"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredOrders.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#E9DCCB] bg-[#F8F4EE]/50 text-xs text-[#563A29]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#563A29]/70">
                      Showing{" "}
                      <strong className="text-[#563A29]">
                        {(safeCurrentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-[#563A29]">
                        {Math.min(safeCurrentPage * pageSize, filteredOrders.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-[#563A29]">{filteredOrders.length}</strong> orders
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[#563A29]/60">Per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="btn-press bg-white border border-[#E9DCCB] rounded-lg px-2 py-1 text-xs text-[#563A29] font-medium focus:outline-none focus:ring-1 focus:ring-[#563A29]"
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
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all"
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
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all"
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
      </main>

      {/* Slide-out Order Details Drawer */}
      {selectedOrderForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#F8F4EE] h-full shadow-2xl border-l border-[#E9DCCB] flex flex-col justify-between animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#E9DCCB] bg-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-[#563A29]">
                    Order #{selectedOrderForDrawer.id.slice(-6).toUpperCase()}
                  </h2>
                  <button
                    onClick={(e) => handleCopyId(selectedOrderForDrawer.id, e)}
                    className="p-1 text-[#563A29]/60 hover:text-[#563A29]"
                    title="Copy full ID"
                  >
                    {copiedId === selectedOrderForDrawer.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#563A29]/60 mt-0.5">
                  Placed on {new Date(selectedOrderForDrawer.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderForDrawer(null)}
                className="btn-press p-2 rounded-xl text-[#563A29]/60 hover:text-[#563A29] hover:bg-[#F8F4EE] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status & Quick Change */}
              <div className="bg-white rounded-2xl p-4 border border-[#E9DCCB] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#563A29]/70">
                    Fulfillment Status
                  </span>
                  <span className="text-[11px] text-[#563A29]/60">Change below:</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["ORDER_PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const).map(st => {
                    const isCur = (selectedOrderForDrawer.orderStatus === "PLACED" || selectedOrderForDrawer.orderStatus === "CONFIRMED")
                      ? st === "ORDER_PLACED"
                      : selectedOrderForDrawer.orderStatus === st;
                    const conf = STATUS_CONFIG[st];

                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedOrderForDrawer.id, st)}
                        className={`btn-press px-2.5 py-2 rounded-xl text-[11px] font-bold text-center border transition-all ${isCur
                          ? `${conf.bg} ${conf.color} ${conf.border} shadow-xs ring-2 ring-[#563A29]/20`
                          : "bg-[#F8F4EE] text-[#563A29]/70 border-[#E9DCCB] hover:bg-[#E9DCCB]/40"
                          }`}
                      >
                        {conf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-2xl p-4 border border-[#E9DCCB] shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#563A29]/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#CDAE91]" />
                  Shipping Destination
                </h3>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#563A29] text-sm">
                    {selectedOrderForDrawer.shippingAddress?.fullName}
                  </p>
                  <p className="text-[#563A29]/80">
                    {selectedOrderForDrawer.shippingAddress?.addressLine1 || selectedOrderForDrawer.shippingAddress?.address}
                  </p>
                  <p className="text-[#563A29]/80">
                    {selectedOrderForDrawer.shippingAddress?.city}, {selectedOrderForDrawer.shippingAddress?.state} - {selectedOrderForDrawer.shippingAddress?.pincode}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[#563A29] font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#563A29]/60" />
                    <span>{selectedOrderForDrawer.shippingAddress?.phone}</span>
                    <a
                      href={`tel:${selectedOrderForDrawer.shippingAddress?.phone}`}
                      className="text-[11px] text-[#563A29] underline font-bold ml-1 hover:text-[#3d2719]"
                    >
                      Call
                    </a>
                    <span>•</span>
                    <a
                      href={`https://wa.me/91${selectedOrderForDrawer.shippingAddress?.phone?.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#0f5223] font-bold hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl p-4 border border-[#E9DCCB] shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#563A29]/70 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#CDAE91]" />
                  Items Ordered ({selectedOrderForDrawer.items?.length || 0})
                </h3>

                <div className="divide-y divide-[#E9DCCB]/60">
                  {selectedOrderForDrawer.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-[#F8F4EE] border border-[#E9DCCB] overflow-hidden flex-shrink-0">
                        {item.image || item.product?.images?.[0]?.url ? (
                          <Image
                            src={item.image || item.product?.images?.[0]?.url}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#563A29]/40">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#563A29] truncate">
                          {item.name || item.product?.name || "Craft Item"}
                        </div>
                        <div className="text-[11px] text-[#563A29]/60">
                          Qty: {item.quantity || 1} × ₹{item.price || item.product?.price || 0}
                        </div>
                      </div>
                      <div className="text-xs font-serif font-bold text-[#563A29]">
                        ₹{(Number(item.price || item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Cost Summary */}
              <div className="bg-white rounded-2xl p-4 border border-[#E9DCCB] shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#563A29]/70">
                  Billing Summary
                </h3>

                <div className="space-y-1.5 text-xs text-[#563A29]/80 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedOrderForDrawer.subtotal || selectedOrderForDrawer.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{Number(selectedOrderForDrawer.shipping || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-px bg-[#E9DCCB] my-1" />
                  <div className="flex justify-between font-serif font-bold text-sm text-[#563A29]">
                    <span>Total Amount</span>
                    <span>₹{Number(selectedOrderForDrawer.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#563A29]/70 pt-1">
                    <span>Payment Method: {selectedOrderForDrawer.paymentMethod || "COD"}</span>
                    <span className="font-bold">{selectedOrderForDrawer.paymentStatus || "PENDING"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E9DCCB] bg-white flex items-center gap-3">
              <Link
                href={`/track-order/${selectedOrderForDrawer.id}`}
                target="_blank"
                className="btn-press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#563A29] text-white text-xs font-semibold hover:bg-[#3d2719] transition-all"
              >
                <span>Live Public Tracker</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}