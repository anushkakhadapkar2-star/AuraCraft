import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Order #${params.id.slice(-6).toUpperCase()} - Aura Craft`,
  };
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const orderSnap = await getDoc(doc(db, "orders", params.id));
  
  if (!orderSnap.exists() || orderSnap.data()?.userId !== session?.user?.uid) {
    redirect("/account/orders");
  }

  const order = { id: orderSnap.id, ...orderSnap.data() } as any;

  // Fetch product details
  const items = await Promise.all(order.items.map(async (item: any) => {
    const productSnap = await getDoc(doc(db, "products", item.productId));
    const productData = productSnap.exists() ? productSnap.data() : { name: "Unknown Product", images: [] };
    return {
      ...item,
      product: productData
    };
  }));

  const shippingAddress = order.shippingAddress || {};
  
  // Define status pipeline
  const statuses = [
    { key: "ORDER_PLACED", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "PACKED", label: "Packed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === order.orderStatus) || 0;
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="font-display-md text-primary">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-on-surface-variant mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-on-surface-variant">Total Amount</p>
          <p className="font-display-sm text-primary">₹{order.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30">
        <h2 className="font-headline-sm text-primary mb-8">Tracking Status</h2>
        
        {isCancelled ? (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">This order has been cancelled.</span>
          </div>
        ) : (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-outline-variant/30 hidden md:block md:top-[15px] md:left-4 md:right-4 md:bottom-auto md:h-0.5 md:w-auto"></div>
            
            <div className="flex flex-col md:flex-row justify-between gap-6 relative">
              {statuses.slice(0, 7).map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={status.key} className="flex md:flex-col items-start md:items-center gap-4 md:gap-2 relative z-10 md:w-24 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-surface transition-colors ${
                      isCompleted 
                        ? 'border-primary text-primary' 
                        : 'border-outline-variant/30 text-outline-variant/50'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-primary text-surface" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50"></div>}
                    </div>
                    <div>
                      <p className={`text-xs font-medium md:mt-2 ${isCompleted ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                        {status.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-headline-sm text-primary">Items Ordered</h2>
            </div>
            <div className="divide-y divide-outline-variant/30 p-6">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="relative w-20 h-24 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url && (
                      <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <Link href={`/product/${item.product.slug}`} className="font-body-md font-medium text-primary hover:underline line-clamp-1">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-on-surface-variant mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm text-on-surface-variant mt-1">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <p className="font-medium text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Summary */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <MapPin className="w-5 h-5" />
              <h2 className="font-headline-sm">Shipping Address</h2>
            </div>
            <div className="text-sm text-on-surface-variant space-y-1">
              <p className="font-medium text-on-background">{shippingAddress.fullName}</p>
              <p>{shippingAddress.street}</p>
              {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
              <p className="pt-2">Phone: {shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="font-headline-sm text-primary mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping?.toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-outline-variant/30 flex justify-between font-headline-sm text-primary text-base">
                <span>Total</span>
                <span>₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="font-headline-sm text-primary mb-2">Payment Info</h2>
            <p className="text-sm text-on-surface-variant mb-1">
              Method: <span className="font-medium text-on-background">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
            </p>
            <p className="text-sm text-on-surface-variant">
              Status: <span className="font-medium text-on-background">{order.paymentStatus}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
