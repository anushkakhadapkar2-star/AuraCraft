import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Package } from "lucide-react";
import Image from "next/image";

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
    <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30">
        <h1 className="font-headline-sm text-primary">Order History</h1>
        <p className="text-on-surface-variant text-sm mt-1">View and track all your past orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <Package className="w-8 h-8" />
          </div>
          <p className="font-headline-sm text-primary mb-2">No orders found</p>
          <p className="text-on-surface-variant text-sm mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop" className="bg-primary text-on-primary px-6 py-2 btn-radius inline-block hover:bg-tertiary transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/30">
          {orders.map((order: any) => (
            <div key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline-sm text-primary">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium uppercase text-primary">
                      {order.orderStatus.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left md:text-right">
                    <p className="text-sm text-on-surface-variant">Total Amount</p>
                    <p className="font-headline-sm text-primary">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Link href={`/account/orders/${order.id}`} className="px-4 py-2 border border-primary text-primary btn-radius text-sm hover:bg-primary hover:text-white transition-colors">
                    View Details
                  </Link>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 pr-6 w-64">
                    <div className="relative w-12 h-12 rounded bg-surface overflow-hidden flex-shrink-0">
                      {item.product.images?.[0]?.url && (
                        <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
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
