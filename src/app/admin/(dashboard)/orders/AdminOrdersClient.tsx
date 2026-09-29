"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";

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
    [key: string]: any;
  };
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header section similar to Dashboard */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Orders</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage and track customer orders.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant/50 rounded-full focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors font-body-md text-sm w-full" 
                placeholder="Search ID or Customer..." 
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">search</span>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant/50 rounded-full px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ORDER_PLACED">Placed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant/50 rounded-full px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-6">
        {error && <div className="p-4 bg-error/10 text-error rounded-xl mb-4">{error}</div>}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/20 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md">
                    <th className="p-4 pl-6 font-medium uppercase tracking-wider">Order ID & Date</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Customer</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Items</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Amount</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Payment</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-semibold text-primary font-mono text-sm max-w-[120px] truncate" title={order.id}>
                            #{order.id.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-on-surface-variant mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.shippingAddress?.fullName}</div>
                          <div className="text-xs text-on-surface-variant mt-1">{order.shippingAddress?.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center justify-center bg-surface-container-high px-2 py-1 rounded text-xs font-medium">
                            {order.items?.length || 0} items
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          ₹{order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium uppercase">{order.paymentMethod}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit font-bold ${
                              order.paymentStatus === 'PAID' ? 'bg-[#c3e8ca] text-[#0f5223]' : 
                              order.paymentStatus === 'FAILED' ? 'bg-error-container text-on-error-container' : 
                              'bg-surface-variant text-on-surface-variant'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 pr-6">
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold rounded-full px-3 py-1.5 focus:outline-none cursor-pointer border ${
                              order.orderStatus === 'DELIVERED' ? 'bg-[#c3e8ca] text-[#0f5223] border-[#c3e8ca]' : 
                              order.orderStatus === 'SHIPPED' ? 'bg-primary-container text-on-primary-container border-primary-container' :
                              order.orderStatus === 'CANCELLED' ? 'bg-error-container text-on-error-container border-error-container' :
                              'bg-surface-container-high text-on-surface border-outline-variant'
                            }`}
                          >
                            <option value="ORDER_PLACED">PLACED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
