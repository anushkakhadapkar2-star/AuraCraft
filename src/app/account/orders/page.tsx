import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Package } from "lucide-react";
import Image from "next/image";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";
import { WriteOrderReviewModal } from "@/components/reviews/WriteOrderReviewModal";

export const metadata = {
  title: "My Orders - Aura Craft",
};

export default async function OrdersPage() {
  const session = await auth();

  const ordersSnap = await getDocs(
    query(collection(db, "orders"), where("userId", "==", session?.user?.uid))
  );

  let rawOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  rawOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const orders = await Promise.all(rawOrders.map(async (orderData) => {
    
    // Fetch product details for items
    const items = await Promise.all(orderData.items.map(async (item: any) => {
      const productSnap = await getDoc(doc(db, "products", item.productId));
      const productData = productSnap.exists() ? productSnap.data() : { name: "Unknown Product", images: [] };
      return {
        ...item,
        product: productData
      };
    }));

    return {
      id: orderData.id,
      ...orderData,
      items
    };
  }));

  return (
    <div className="clay-card rounded-[32px] overflow-hidden border border-[#F3E1E5]">
      <div className="p-6 border-b border-[#F3E1E5]">
        <h1 className="font-serif text-2xl font-bold text-[#382025]">Order History</h1>
        <p className="text-[#8B5E6B] text-xs mt-1 font-medium">View and track all your past handcrafted orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="clay-icon-pod w-16 h-16 mx-auto mb-4">
            <Package className="w-7 h-7 text-white" />
          </div>
          <p className="font-serif text-xl font-bold text-[#382025] mb-1">No orders found</p>
          <p className="text-[#8B5E6B] text-xs mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop" className="clay-btn px-6 py-2.5 rounded-2xl inline-block text-xs font-bold shadow-[0_4px_12px_rgba(212,91,122,0.35)]">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F3E1E5]">
          {orders.map((order: any) => (
            <div key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-serif font-bold text-lg text-[#382025]">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span className="clay-badge text-[11px] font-bold uppercase">
                      {order.orderStatus.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B5E6B]">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-left md:text-right mr-1">
                    <p className="text-[11px] text-[#8B5E6B]">Total Amount</p>
                    <p className="font-serif font-bold text-base text-[#382025]">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Link href={`/account/orders/${order.id}`} className="clay-btn-secondary px-4 py-2 rounded-xl text-xs font-bold">
                    View Details
                  </Link>
                  {order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED" && (
                    <CancelOrderButton
                      orderId={order.id}
                      orderShortId={order.id.slice(-6).toUpperCase()}
                      currentStatus={order.orderStatus}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 flex items-center justify-between gap-3 bg-[#FAF7F8] p-3 rounded-2xl border border-[#F3E1E5] w-72">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-[#F3E1E5]">
                        {item.product.images?.[0]?.url && (
                          <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-primary line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="shrink-0 pl-2">
                      <WriteOrderReviewModal
                        productId={item.productId || item.product.id}
                        productName={item.product.name}
                        productSlug={item.product.slug}
                        productImage={item.product.images?.[0]?.url}
                        orderId={order.id}
                        userName={session?.user?.name || "Verified Customer"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
