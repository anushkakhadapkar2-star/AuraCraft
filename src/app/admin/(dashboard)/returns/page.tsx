import { db as serverDb } from "@/lib/firebase/client";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { PackageX, RefreshCcw, ExternalLink, Calendar, IndianRupee, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Returns & Refunds | Aura Craft Admin",
};

export default async function AdminReturnsPage() {
  let cancelledOrders: any[] = [];

  try {
    const q = query(
      collection(serverDb, "orders"),
      where("orderStatus", "==", "CANCELLED")
    );
    const snap = await getDocs(q);
    cancelledOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort newest first
    cancelledOrders.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  } catch (err) {
    console.error("Error fetching cancelled orders:", err);
  }

  const totalRefundAmount = cancelledOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F4EE] text-[#563A29]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E9DCCB]/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
                Returns & Cancellations
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                {cancelledOrders.length} Cancelled / Returned
              </span>
            </div>
            <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
              Monitor cancelled handcrafted orders, customer return reasons, and restocked items.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="btn-press px-4 py-2 rounded-xl bg-white border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#FAF7F2] transition-all shadow-2xs"
            >
              View Active Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Cancellations</div>
            <div className="text-xl font-bold font-serif text-red-700 mt-1">{cancelledOrders.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5">Orders marked cancelled</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Reversed Volume</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">₹{totalRefundAmount.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5">Gross order value restored</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Inventory Status</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">Auto-Restocked</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5">Units returned to live inventory</div>
          </div>
        </div>

        {/* Orders Table or Empty State */}
        {cancelledOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#CDAE91] flex items-center justify-center mx-auto mb-4 border border-[#E9DCCB]">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#563A29] mb-1">No Active Cancellations</h2>
            <p className="text-xs text-[#7D6B5E] max-w-sm mx-auto mb-6">
              All customer orders are currently active or fulfilled. When an order is cancelled or a return is requested, details will appear here.
            </p>
            <Link
              href="/admin/orders"
              className="btn-press inline-flex items-center gap-2 px-6 py-2.5 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-xs"
            >
              Browse Orders
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9DCCB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F8F4EE]/80 border-b border-[#E9DCCB] text-[#563A29]/70 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Order ID & Date</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Items Cancelled</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3">Cancellation Reason</th>
                    <th className="py-3.5 pr-6 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs font-sans">
                  {cancelledOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 pl-6 pr-3">
                        <span className="font-mono font-bold text-xs text-[#563A29]">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="text-[11px] text-[#7D6B5E] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#CDAE91]" />
                          <span>
                            {order.updatedAt 
                              ? new Date(order.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "Recent"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-[#563A29]">
                          {order.shippingAddress?.fullName || "Customer"}
                        </div>
                        <div className="text-[11px] text-[#7D6B5E]">
                          {order.shippingAddress?.city} • {order.shippingAddress?.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#563A29] font-bold text-[11px] border border-[#E9DCCB]">
                          {order.items?.length || 1} items
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-serif font-bold text-sm text-[#563A29]">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] text-red-700 font-semibold uppercase">
                          {order.paymentMethod || "COD"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-xs text-[#563A29] font-medium max-w-[240px] truncate" title={order.cancelReason || "Cancelled by customer"}>
                          {order.cancelReason || "Cancelled by customer via order tracker"}
                        </div>
                        <span className="text-[10px] text-[#0f5223] font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Restocked to warehouse
                        </span>
                      </td>

                      <td className="py-3.5 pr-6 text-right">
                        <Link
                          href={`/track-order/${order.id}`}
                          target="_blank"
                          className="btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] hover:bg-[#E9DCCB]/40 text-xs font-semibold transition-all"
                        >
                          <span>Tracker</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
