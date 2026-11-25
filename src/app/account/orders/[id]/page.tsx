import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  MapPin, 
  Check, 
  XCircle, 
  Truck, 
  Package, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  CreditCard,
  Calendar,
  ClipboardCheck,
  PackageCheck,
  Home
} from "lucide-react";
import { OrderActions } from "@/components/account/OrderActions";
import { WriteOrderReviewModal } from "@/components/reviews/WriteOrderReviewModal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Order #${id.slice(-6).toUpperCase()} | Aura Craft`,
  };
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const orderSnap = await getDoc(doc(db, "orders", id));
  
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
  const shortId = order.id.slice(-6).toUpperCase();
  const trackingId = order.trackingNumber || `AC-TRK-${order.id.slice(-8).toUpperCase()}`;

  // Calculate estimated delivery date (7 days from order date)
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryDateString = deliveryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedPlacedDate = orderDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Define 5 unified status steps
  const steps = [
    { key: "ORDER_PLACED", label: "Order Placed", desc: "Order confirmed", icon: ClipboardCheck },
    { key: "PROCESSING", label: "Processing", desc: "Handcrafting in studio", icon: PackageCheck },
    { key: "SHIPPED", label: "Shipped", desc: "In transit with courier", icon: Package },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "On delivery vehicle", icon: Truck },
    { key: "DELIVERED", label: "Delivered", desc: "Arrived at doorstep", icon: Home },
  ];

  const statusMap: Record<string, number> = {
    "ORDER_PLACED": 0,
    "PLACED": 0,
    "PENDING": 0,
    "CONFIRMED": 0,
    "PROCESSING": 1,
    "SHIPPED": 2,
    "OUT_FOR_DELIVERY": 3,
    "DELIVERED": 4,
  };

  const isCancelled = order.orderStatus === "CANCELLED";
  const activeStep = statusMap[order.orderStatus] ?? 0;

  // Status Badge Configuration
  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#ba1a1a] border border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (order.orderStatus === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4E8DE] text-[#2B3320] border border-[#A4AD91]/50">
          <Check className="w-3.5 h-3.5 text-[#5B6648]" />
          <span>Delivered</span>
        </span>
      );
    }
    if (order.orderStatus === "OUT_FOR_DELIVERY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]"></span>
          </span>
          <span>Out for Delivery</span>
        </span>
      );
    }
    if (order.orderStatus === "SHIPPED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF2F5] text-[#B03E5D] border border-[#F3E1E5]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D45B7A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#382025]"></span>
          </span>
          <span>Shipped • In Transit</span>
        </span>
      );
    }
    if (order.orderStatus === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FBBF24] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]"></span>
          </span>
          <span>Processing • In Studio</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F8] text-[#382025] border border-[#F3E1E5]">
        <Clock className="w-3.5 h-3.5 text-[#F2A4B7]" />
        <span>Order Placed</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SUB-HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link 
          href="/account/orders" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B5E6B] hover:text-[#382025] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Orders</span>
        </Link>

        {/* Action Buttons: Copy ID, Live Tracker, Print, and Single Cancel Button */}
        <OrderActions 
          orderId={order.id} 
          orderShortId={shortId} 
          orderStatus={order.orderStatus} 
        />
      </div>

      {/* 2. PREMIUM HERO ORDER CARD */}
      <div className="bg-white rounded-3xl border border-[#F3E1E5] p-6 sm:p-8 shadow-[0_4px_24px_rgba(212,91,122,0.06)] space-y-6">
        
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3E1E5]/80">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#382025] tracking-tight">
                Order #{shortId}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-[#8B5E6B] mt-1 font-mono">
              ID: {order.id}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#8B5E6B]">
              Total Amount
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#D45B7A] tracking-tight">
              ₹{order.totalAmount?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Quick Metadata Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FAF7F8] rounded-2xl p-4 sm:p-5 border border-[#F3E1E5]/70 text-xs">
          <div>
            <span className="text-[11px] font-medium text-[#8B5E6B] flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#382025]" />
              <span>Placed On</span>
            </span>
            <p className="font-semibold text-[#382025]">{formattedPlacedDate}</p>
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#8B5E6B] flex items-center gap-1.5 mb-1">
              <Truck className="w-3.5 h-3.5 text-[#382025]" />
              <span>Estimated Delivery</span>
            </span>
            <p className="font-semibold text-[#382025]">
              {isCancelled ? "Cancelled" : deliveryDateString}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#8B5E6B] flex items-center gap-1.5 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-[#382025]" />
              <span>Payment</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-[#382025]">
                {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                order.paymentStatus === "PAID" 
                  ? "bg-[#E4E8DE] text-[#2B3320]" 
                  : "bg-[#FEF3C7] text-[#92400E]"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#8B5E6B] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#382025]" />
              <span>Artisan Tracking ID</span>
            </span>
            <p className="font-mono font-semibold text-[#382025] truncate" title={trackingId}>
              {trackingId}
            </p>
          </div>
        </div>

        {/* 3. MODERN SAAS TRACKING PROGRESS STEPPER */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#382025]">
                Fulfillment & Tracking
              </h2>
              <p className="text-xs text-[#8B5E6B] mt-0.5">
                Real-time status updates from our handcrafted workshop to your doorstep
              </p>
            </div>
            <Link
              href={`/track-order/${order.id}`}
              className="text-xs font-semibold text-[#D45B7A] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Full Screen Tracker</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isCancelled ? (
            <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">This order was cancelled.</p>
                  {order.cancelReason && (
                    <p className="text-xs text-red-600/90 mt-0.5">
                      Reason: <strong className="font-medium">{order.cancelReason}</strong>
                    </p>
                  )}
                  {order.cancelledAt && (
                    <p className="text-[11px] text-red-600/70 mt-0.5">
                      Cancelled on {new Date(order.cancelledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href="/shop"
                className="px-4 py-2 bg-white text-red-700 border border-red-200 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors text-center shrink-0"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="relative py-4">
              {/* Stepper Progress Bar Line Background */}
              <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-[#F3E1E5] z-0 rounded-full"></div>
              {/* Active Fill Line */}
              <div 
                className="absolute top-8 left-[10%] h-1 bg-gradient-to-r from-[#F2A4B7] to-[#D45B7A] z-0 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${Math.max(0, Math.min(80, (activeStep / 4) * 80))}%` }}
              ></div>

              {/* 5 Steps */}
              <div className="flex justify-between relative z-10">
                {steps.map((step, index) => {
                  const isCompleted = index <= activeStep;
                  const isCurrent = index === activeStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center w-1/5 text-center">
                      {/* Step Circle Node */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 transition-all duration-300 border-2 ${
                          isCompleted
                            ? "bg-gradient-to-br from-[#F2A4B7] to-[#D45B7A] text-white border-[#D45B7A] shadow-xs"
                            : "bg-white text-[#8B5E6B]/50 border-[#F3E1E5]"
                        } ${isCurrent ? "ring-4 ring-[#D45B7A]/20 scale-105" : ""}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                        ) : (
                          <StepIcon className="w-4 h-4 text-[#8B5E6B]/50" />
                        )}
                      </div>

                      {/* Step Title & Sub-caption */}
                      <p className={`text-xs font-bold leading-tight ${isCompleted ? "text-[#382025]" : "text-[#8B5E6B]/60"}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-[#8B5E6B] hidden sm:block mt-0.5 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. MAIN BENTO GRID: ITEMS & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: ITEMS ORDERED ================= */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#F3E1E5] overflow-hidden shadow-[0_4px_20px_rgba(212,91,122,0.03)]">
            <div className="px-6 py-5 border-b border-[#F3E1E5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-[#D45B7A]" />
                <h2 className="font-serif font-bold text-base text-[#382025]">
                  Items in this Order ({items.length})
                </h2>
              </div>
              <span className="text-xs text-[#8B5E6B]">
                All items carefully packaged
              </span>
            </div>

            <div className="divide-y divide-[#F3E1E5]/60 p-6">
              {items.map((item: any, idx: number) => {
                const product = item.product || {};
                const imageUrl = product.images?.[0]?.url || product.imageUrl || "/uploads/all-products.png";

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 sm:gap-5">
                    {/* High-res Image Container */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF7F8] border border-[#F3E1E5] overflow-hidden shrink-0 shadow-2xs">
                      <Image
                        src={imageUrl}
                        alt={product.name || "Handmade Item"}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    {/* Product Meta */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product.slug || ""}`}
                        className="font-serif font-bold text-sm sm:text-base text-[#382025] hover:text-[#D45B7A] transition-colors line-clamp-1"
                      >
                        {product.name || "Handcrafted Bouquet"}
                      </Link>
                      
                      <p className="text-xs text-[#8B5E6B] mt-1 capitalize">
                        {product.categorySlug ? product.categorySlug.replace(/-/g, " ") : "Everlasting Botanical"}
                      </p>

                      {item.customGift && (
                        <div className="mt-2 p-2.5 bg-[#FAF7F8] rounded-xl border border-[#F3E1E5] text-xs space-y-1">
                          <div className="font-bold text-[#D45B7A] flex items-center gap-1.5 flex-wrap">
                            <span>🎁 Custom Gift for: {item.customGift.recipientName}</span>
                            <span>• {item.customGift.occasion}</span>
                          </div>
                          {item.customGift.box && (
                            <p className="text-[11px] text-[#8B5E6B]">Box: <strong className="text-[#382025]">{item.customGift.box}</strong></p>
                          )}
                          {item.customGift.items && item.customGift.items.length > 0 && (
                            <p className="text-[11px] text-[#8B5E6B]">
                              Contents: <span className="text-[#382025]">{item.customGift.items.map((i: any) => i.name).join(", ")}</span>
                            </p>
                          )}
                          {item.customGift.note && (
                            <p className="text-[11px] italic text-[#382025] pt-0.5">
                              &ldquo;{item.customGift.note}&rdquo; — <span className="font-medium">{item.customGift.senderName}</span>
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FDF2F5] text-[#382025] border border-[#F3E1E5]">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs text-[#8B5E6B]">
                          ₹{item.price?.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Line Total & Action */}
                    <div className="text-right shrink-0 flex flex-col items-end justify-between py-1">
                      <p className="font-serif font-bold text-base sm:text-lg text-[#382025]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      <div className="flex flex-col items-end gap-1.5 mt-2">
                        {order.orderStatus === "DELIVERED" ? (
                          <WriteOrderReviewModal
                            productId={item.productId || product.id}
                            productName={product.name || "Handcrafted Bouquet"}
                            productSlug={product.slug || ""}
                            productImage={imageUrl}
                            orderId={order.id}
                            userName={shippingAddress.fullName || "Verified Buyer"}
                          />
                        ) : (
                          <WriteOrderReviewModal
                            productId={item.productId || product.id}
                            productName={product.name || "Handcrafted Bouquet"}
                            productSlug={product.slug || ""}
                            productImage={imageUrl}
                            orderId={order.id}
                            userName={shippingAddress.fullName || "Verified Buyer"}
                          />
                        )}

                        <Link
                          href={`/product/${product.slug || ""}`}
                          className="text-[11px] font-semibold text-[#8B5E6B] hover:text-[#D45B7A] hover:underline"
                        >
                          Buy Again
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Artisan Handcrafted Guarantee Callout */}
          <div className="bg-[#FAF7F8] border border-[#F3E1E5] rounded-3xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#382025] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#D45B7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#382025]">
                100% Handcrafted Artisan Guarantee
              </h3>
              <p className="text-xs text-[#8B5E6B] mt-1 leading-relaxed">
                Every stem, petal, and yarn strand in this order was individually crocheted by local women artisans. Designed to never fade, requiring zero watering.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SHIPPING & SUMMARY ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-[#F3E1E5] p-6 shadow-[0_4px_20px_rgba(212,91,122,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F3E1E5]">
              <MapPin className="w-4 h-4 text-[#D45B7A]" />
              <h2 className="font-serif font-bold text-sm text-[#382025]">
                Delivery Address
              </h2>
            </div>

            <div className="text-xs text-[#8B5E6B] space-y-1.5 leading-relaxed">
              <p className="font-bold text-sm text-[#382025]">
                {shippingAddress.fullName || "Customer"}
              </p>
              <p>{shippingAddress.street}</p>
              {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
              </p>
              
              {shippingAddress.phone && (
                <div className="pt-2 flex items-center gap-2 text-[#382025] font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#8B5E6B]" />
                  <span>{shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Financial Receipt */}
          <div className="bg-white rounded-3xl border border-[#F3E1E5] p-6 shadow-[0_4px_20px_rgba(212,91,122,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E1E5]">
              <h2 className="font-serif font-bold text-sm text-[#382025]">
                Order Summary
              </h2>
              <span className="text-[11px] font-semibold text-[#8B5E6B]">
                Receipt Breakdown
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#8B5E6B]">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
                <span className="font-medium text-[#382025]">₹{order.subtotal?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Artisan Shipping & Handling</span>
                <span className="font-medium text-[#382025]">
                  {order.shipping === 0 ? (
                    <span className="text-[#2E7D32] font-semibold">FREE</span>
                  ) : (
                    `₹${order.shipping?.toFixed(2)}`
                  )}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-[#2E7D32] font-medium">
                  <span className="flex items-center gap-1">
                    <span>Discount</span>
                    {order.couponCode && (
                      <span className="text-[10px] bg-[#E4E8DE] px-1.5 py-0.2 rounded border border-[#A4AD91]/50 font-bold">
                        {order.couponCode}
                      </span>
                    )}
                  </span>
                  <span>-₹{order.discount?.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-[#F3E1E5] flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#382025]">Total Amount</span>
                <span className="font-serif text-xl font-bold text-[#D45B7A]">
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Support & Assistance */}
          <div className="bg-[#FAF7F8] rounded-3xl border border-[#F3E1E5] p-5 text-xs text-[#8B5E6B] space-y-2">
            <p className="font-bold text-[#382025]">Need assistance with this order?</p>
            <p className="leading-relaxed">
              Our artisan care team is ready to help you with deliveries, custom notes, or returns.
            </p>
            <Link
              href="/about"
              className="inline-block text-xs font-semibold text-[#D45B7A] hover:underline pt-1"
            >
              Contact Support →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
