import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { Check, ClipboardCheck, PackageCheck, Package, Truck, Home, XCircle } from "lucide-react";
import Link from "next/link";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";

export const metadata = {
  title: "Track Order - Aura Craft",
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const orderSnap = await getDoc(doc(db, "orders", orderId));

  const isOwner = orderSnap.exists() && orderSnap.data()?.userId === session?.user?.uid;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!orderSnap.exists() || (!isOwner && !isAdmin)) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-serif text-2xl text-red-600 font-bold mb-4">Order Not Found</h2>
        <p className="text-sm text-[#8B5E6B] mb-8">We couldn't find the order you're looking for, or you do not have permission to view it.</p>
        <Link href="/shop" className="bg-[#D45B7A] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#B03E5D] transition-colors shadow-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const order = { id: orderSnap.id, ...orderSnap.data() } as any;

  // Calculate estimated delivery date (7 days from order date)
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryDateString = deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const isCancelled = order.orderStatus === "CANCELLED";

  // Map backend status to our 5-step progress bar (matching Admin statuses)
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
  
  const currentStep = statusMap[order.orderStatus] ?? 0;
  
  // Real or deterministic tracking number
  const trackingId = order.trackingNumber || `AC-TRK-${order.id.slice(-8).toUpperCase()}`;

  const steps = [
    {
      key: "ORDER_PLACED",
      title: "Order\nPlaced",
      icon: <ClipboardCheck className="w-8 h-8 text-[#0066FF]" />,
    },
    {
      key: "PROCESSING",
      title: "Order\nProcessing",
      icon: <PackageCheck className="w-8 h-8 text-[#8B5CF6]" />,
    },
    {
      key: "SHIPPED",
      title: "Order\nShipped",
      icon: <Package className="w-8 h-8 text-[#FFB800]" />,
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for\nDelivery",
      icon: <Truck className="w-8 h-8 text-[#00B4D8]" />,
    },
    {
      key: "DELIVERED",
      title: "Order\nDelivered",
      icon: <Home className="w-8 h-8 text-[#2E7D32]" />,
    }
  ];

  return (
    <div className="pt-8 pb-32 max-w-5xl mx-auto px-4 w-full">
      <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border-4 border-[#2E7D32] p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#2E7D32] mb-8">Aura Craft</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[#0066FF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </div>
                <span className="font-semibold text-lg text-gray-800">Order ID : <span className="text-[#2E7D32]">#{order.id.slice(-6).toUpperCase()}</span></span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {order.paymentMethod === "UPI" ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                  }`}>
                    {order.paymentStatus === "PAID" ? "UPI Paid ✓" : "UPI: Verification Pending"}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    Cash on Delivery
                  </span>
                )}
                {order.utrNumber && (
                  <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    UTR: {order.utrNumber}
                  </span>
                )}
              </div>
              {!isCancelled && order.orderStatus !== "DELIVERED" && (
                <CancelOrderButton
                  orderId={order.id}
                  orderShortId={order.id.slice(-6).toUpperCase()}
                  currentStatus={order.orderStatus}
                />
              )}
            </div>
            
            <div className="flex flex-col gap-3 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="font-semibold text-gray-800">Expected Arrival</span>
                <span className="bg-[#0066FF] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  {deliveryDateString}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="font-semibold text-gray-800">Tracking ID</span>
                <span className="bg-[#DC2626] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  {trackingId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancelled Alert Banner */}
        {isCancelled && (
          <div className="mb-10 p-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-sm">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="font-bold">This order has been cancelled.</p>
                {order.cancelReason && (
                  <p className="text-xs font-normal text-red-600/90 mt-0.5">Reason: {order.cancelReason}</p>
                )}
              </div>
            </div>
            <Link 
              href="/shop"
              className="px-4 py-2 bg-white text-red-700 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              Shop Again
            </Link>
          </div>
        )}

        {/* Timeline */}
        <div className="relative mt-20 mb-16">
          {/* Progress Bar Background */}
          <div className="absolute top-4 left-[10%] right-[10%] h-1.5 bg-gray-500 z-0"></div>
          {/* Progress Bar Fill */}
          {!isCancelled && (
            <div 
              className="absolute top-4 left-[10%] h-1.5 bg-[#2E7D32] z-0 transition-all duration-500 ease-in-out" 
              style={{ width: `${Math.max(0, Math.min(80, (currentStep / 4) * 80))}%` }}
            ></div>
          )}
          
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              const isCompleted = !isCancelled && index <= currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center w-1/5">
                  {/* Status Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-8 border-[3px] border-white shadow-sm transition-colors duration-300 ${
                    isCompleted ? 'bg-[#2E7D32]' : 'bg-gray-500'
                  }`}>
                    {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                  </div>
                  
                  {/* Status Icon & Label */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 text-center whitespace-pre-line leading-tight">
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
