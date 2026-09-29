import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout - Aura Craft",
};

export default async function CheckoutPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <div className="pt-8 pb-stack-xl max-w-6xl mx-auto w-full">
      <h1 className="font-display-lg-mobile md:font-display-lg text-primary text-center mb-2">Checkout</h1>
      <p className="text-center font-body-md text-on-surface-variant">Complete your order securely</p>
      
      <CheckoutClient />
    </div>
  );
}
