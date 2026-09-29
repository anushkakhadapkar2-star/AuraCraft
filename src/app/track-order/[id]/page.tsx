import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { Check, ClipboardCheck, Package, Truck, Home } from "lucide-react";
import Link from "next/link";

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

  if (!orderSnap.exists || orderSnap.data()?.userId !== session.user?.uid) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-headline-md text-error mb-4">Order Not Found</h2>
        <p className="mb-8">We couldn't find the order you're looking for.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 btn-radius">
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

  // Map backend status to our 4-step progress bar
  const statusMap = {
    "PENDING": 0,
    "PROCESSING": 0,
    "CONFIRMED": 0,
    "SHIPPED": 1,
    "OUT_FOR_DELIVERY": 2,
    "DELIVERED": 3,
  };
  
  const currentStep = (statusMap as any)[order.orderStatus] ?? 0;
  
  // Dummy tracking ID
  const trackingId = Math.floor(10000000 + Math.random() * 90000000).toString();

  const steps = [
    {
      title: "Order\nConfirmed",
      icon: <ClipboardCheck className="w-8 h-8 text-[#0066FF]" />,
    },
    {
      title: "Order\nShipped",
      icon: <Package className="w-8 h-8 text-[#FFB800]" />,
    },
    {
      title: "Out for\nDelivery",
      icon: <Truck className="w-8 h-8 text-[#00B4D8]" />,
    },
    {
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
            <div className="flex items-center gap-3">
              <div className="text-[#0066FF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <span className="font-semibold text-lg text-gray-800">Order ID : <span className="text-[#2E7D32]">#{order.id.slice(-6).toUpperCase()}</span></span>
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

        {/* Timeline */}
        <div className="relative mt-20 mb-16">
          {/* Progress Bar Background */}
          <div className="absolute top-4 left-[12%] right-[12%] h-1.5 bg-gray-500 z-0"></div>
          {/* Progress Bar Fill */}
          <div className="absolute top-4 left-[12%] h-1.5 bg-[#2E7D32] z-0 transition-all duration-500 ease-in-out" 
               style={{ width: `${Math.max(0, Math.min(100, (currentStep / 3) * 76))}%` }}></div>
          
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center w-1/4">
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
                    <span className="text-sm font-bold text-gray-800 text-center whitespace-pre-line leading-tight">
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
