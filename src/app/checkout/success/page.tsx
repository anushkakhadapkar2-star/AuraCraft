import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId as string;
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }


  if (!orderId) {
    redirect("/shop");
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

  return (
    <div className="py-20 md:py-32 flex justify-center fade-in-up px-4">
      <div className="bg-surface p-8 md:p-12 rounded-[32px] border border-outline-variant/30 text-center max-w-lg w-full soft-shadow">
        <div className="flex justify-center mb-6 text-primary">
          <CheckCircle2 className="w-20 h-20" />
        </div>
        <h1 className="font-display-md text-primary mb-2">Order Confirmed!</h1>
        <p className="text-on-surface-variant font-body-md mb-8">
          Thank you for shopping with Aura Craft. Your order <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span> has been placed successfully.
        </p>
        
        <div className="space-y-4 mb-8 text-left bg-surface-container-low p-6 rounded-2xl">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Order Total</span>
            <span className="font-headline-sm text-primary">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Payment Method</span>
            <span className="font-body-md font-medium text-primary">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Status</span>
            <span className="font-body-md font-medium text-primary capitalize">{order.orderStatus.toLowerCase().replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/account/orders/${order.id}`} className="px-8 py-3 border border-primary text-primary btn-radius font-headline-sm hover:bg-surface-container-low transition-colors">
            Track Order
          </Link>
          <Link href="/shop" className="px-8 py-3 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
