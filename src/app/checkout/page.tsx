import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout - Aura Craft",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user?.uid) {
    redirect("/login?callbackUrl=/checkout");
  }

  let savedAddresses: any[] = [];
  const rawPhone = (session.user as any)?.phone;
  let userDetails: { name: string; email: string; phone: string } = {
    name: typeof session.user.name === "string" ? session.user.name : "",
    email: typeof session.user.email === "string" ? session.user.email : "",
    phone: typeof rawPhone === "string" ? rawPhone : "",
  };

  try {
    const userSnap = await getDoc(doc(db, "users", session.user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (Array.isArray(data.addresses) && data.addresses.length > 0) {
        savedAddresses = data.addresses;
      }
      userDetails = {
        name: typeof data.name === "string" ? data.name : (typeof session.user.name === "string" ? session.user.name : ""),
        email: typeof data.email === "string" ? data.email : (typeof session.user.email === "string" ? session.user.email : ""),
        phone: typeof data.phone === "string" ? data.phone : (typeof rawPhone === "string" ? rawPhone : ""),
      };
    }

    // Also check subcollection 'addresses' if array is empty
    if (savedAddresses.length === 0) {
      const addrSnap = await getDocs(collection(db, "users", session.user.uid, "addresses"));
      savedAddresses = addrSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("Could not load saved addresses:", err);
  }

  return (
    <div className="pt-8 pb-stack-xl max-w-6xl mx-auto w-full px-4">
      <h1 className="font-display-lg-mobile md:font-display-lg text-primary text-center mb-2">Checkout</h1>
      <p className="text-center font-body-md text-on-surface-variant">Complete your order securely</p>

      <CheckoutClient savedAddresses={savedAddresses} userDetails={userDetails} />
    </div>
  );
}
