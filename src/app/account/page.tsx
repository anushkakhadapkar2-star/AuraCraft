import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Package, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "My Account - Aura Craft",
};

export default async function AccountPage() {
  const session = await auth();

  // Fetch recent orders
  const ordersSnap = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", session?.user?.uid)
    )
  );

  let allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const topOrders = allOrders.slice(0, 3);

  const recentOrders = await Promise.all(topOrders.map(async (orderData) => {
    
    // Fetch product details for the first item to show an image
    let firstItemWithProduct = null;
    if (orderData.items && orderData.items.length > 0) {
      const item = orderData.items[0];
      const productSnap = await getDoc(doc(db, "products", item.productId));
      firstItemWithProduct = {
        ...item,
        product: productSnap.exists() ? productSnap.data() : { images: [] }
      };
    }

    return {
      id: orderData.id,
      ...orderData,
      items: firstItemWithProduct ? [firstItemWithProduct] : []
    };
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-md text-primary mb-2">Welcome Back, {session?.user?.name?.split(' ')[0] || 'Customer'}!</h1>
        <p className="text-on-surface-variant font-body-md">Manage your orders, addresses, and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/account/orders" className="bg-surface p-6 rounded-3xl border border-outline-variant/30 hover:border-primary transition-colors group">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors text-primary">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="font-headline-sm text-primary mb-2">My Orders</h2>
          <p className="text-on-surface-variant text-sm">Track, return, or buy things again</p>
        </Link>
        <Link href="/wishlist" className="bg-surface p-6 rounded-3xl border border-outline-variant/30 hover:border-primary transition-colors group">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors text-primary">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="font-headline-sm text-primary mb-2">Your Wishlist</h2>
          <p className="text-on-surface-variant text-sm">View items you've saved for later</p>
        </Link>
      </div>

      <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden mt-8">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-headline-sm text-primary">Recent Orders</h2>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
              <Package className="w-8 h-8" />
            </div>
            <p className="font-headline-sm text-primary mb-2">No orders yet</p>
            <p className="text-on-surface-variant text-sm mb-6">Looks like you haven't placed an order yet.</p>
            <Link href="/shop" className="bg-primary text-on-primary px-6 py-2 btn-radius inline-block hover:bg-tertiary transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-surface-container-low transition-colors">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                  {order.items[0]?.product?.images?.[0]?.url && (
                    <Image 
                      src={order.items[0].product.images[0].url} 
                      alt="Product" 
                      fill 
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <p className="font-headline-sm text-primary truncate">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-surface-container rounded-full text-xs font-medium uppercase text-primary">
                    {order.orderStatus.toLowerCase().replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="flex-shrink-0 text-center md:text-right">
                  <p className="font-headline-sm text-primary mb-2">₹{order.totalAmount?.toFixed(2)}</p>
                  <Link href={`/account/orders/${order.id}`} className="px-4 py-2 border border-primary text-primary btn-radius text-sm hover:bg-primary hover:text-white transition-colors">
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
