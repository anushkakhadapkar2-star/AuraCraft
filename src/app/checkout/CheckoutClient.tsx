"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle2, 
  MapPin, 
  Home, 
  Building, 
  Plus, 
  Tag, 
  Check, 
  X, 
  Loader2, 
  CreditCard, 
  Smartphone,
  ShieldCheck,
  Truck
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";

interface CheckoutClientProps {
  savedAddresses?: any[];
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function CheckoutClient({ savedAddresses = [], userDetails = {} }: CheckoutClientProps) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showPaymentSimulation, setShowPaymentSimulation] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Address selection state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "NEW">(
    savedAddresses.length > 0 ? 0 : "NEW"
  );

  const [formData, setFormData] = useState({
    fullName: userDetails.name || "",
    email: userDetails.email || "",
    phone: userDetails.phone || "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  // If saved addresses exist, populate with first one on mount
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressIndex !== "NEW") {
      const addr = savedAddresses[Number(selectedAddressIndex)];
      if (addr) {
        setFormData({
          fullName: addr.fullName || userDetails.name || "",
          email: addr.email || userDetails.email || "",
          phone: addr.phone || userDetails.phone || "",
          street: addr.street || "",
          apartment: addr.apartment || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
        });
      }
    }
  }, [selectedAddressIndex, savedAddresses, userDetails]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 50;

  // Compute discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectSavedAddress = (index: number) => {
    setSelectedAddressIndex(index);
    const addr = savedAddresses[index];
    if (addr) {
      setFormData({
        fullName: addr.fullName || userDetails.name || "",
        email: addr.email || userDetails.email || "",
        phone: addr.phone || userDetails.phone || "",
        street: addr.street || "",
        apartment: addr.apartment || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
      });
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsCheckingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const cleanCode = couponCode.trim().toUpperCase();
      const q = query(
        collection(db, "coupons"),
        where("code", "==", cleanCode),
        where("status", "==", "ACTIVE")
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Fallback for standard demo promo codes
        if (cleanCode === "WELCOME10") {
          setAppliedCoupon({ code: "WELCOME10", type: "PERCENTAGE", value: 10 });
          setCouponSuccess("Coupon WELCOME10 applied! (10% Off)");
          setIsCheckingCoupon(false);
          return;
        } else if (cleanCode === "AURA50") {
          setAppliedCoupon({ code: "AURA50", type: "FLAT", value: 50 });
          setCouponSuccess("Coupon AURA50 applied! (₹50 Flat Off)");
          setIsCheckingCoupon(false);
          return;
        }

        setCouponError("Invalid or expired coupon code.");
        return;
      }

      const couponData = snapshot.docs[0].data();
      setAppliedCoupon({
        code: cleanCode,
        type: couponData.discountType || "PERCENTAGE",
        value: Number(couponData.discountValue) || 10,
      });
      setCouponSuccess(`Coupon ${cleanCode} applied successfully!`);
    } catch (err) {
      console.error("Coupon check failed:", err);
      // Fallback
      if (couponCode.trim().toUpperCase() === "WELCOME10") {
        setAppliedCoupon({ code: "WELCOME10", type: "PERCENTAGE", value: 10 });
        setCouponSuccess("Coupon WELCOME10 applied! (10% Off)");
      } else {
        setCouponError("Could not verify coupon. Please try again.");
      }
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    }
  };

  const onPlaceOrderClick = () => {
    if (paymentMethod !== "COD") {
      setShowPaymentSimulation(true);
    } else {
      handleCheckout();
    }
  };

  const confirmSimulatedPayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setShowPaymentSimulation(false);
      handleCheckout();
    }, 1500);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.discountPrice || item.product.price,
            image: item.product.images?.[0]?.url || item.product.imageUrl || null,
            customGift: item.product.customGift || null,
          })),
          shippingAddress: formData,
          totalAmount: total,
          subtotal,
          shipping,
          discount: discountAmount,
          couponCode: appliedCoupon?.code || null,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setConfirmedOrderDetails({
        items: [...items],
        total: total,
        paymentMethod: paymentMethod,
        discount: discountAmount,
      });
      clearCart();
      setConfirmedOrderId(data.orderId);
      setShowSuccessPopup(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && step === 1 && !showSuccessPopup) {
    return (
      <div className="py-24 text-center bg-white rounded-3xl border border-[#F3E1E5] p-8 max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FDF2F5] text-[#382025] flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-[#D45B7A]" />
        </div>
        <h2 className="font-headline-md text-2xl font-bold text-[#382025] mb-2">Your cart is empty</h2>
        <p className="text-sm text-[#8B5E6B] mb-6">Explore our handmade flower bouquets, torans, and festive gifts.</p>
        <button 
          onClick={() => router.push("/shop")} 
          className="clay-btn px-8 py-3.5 rounded-full text-sm font-bold shadow-[0_8px_20px_rgba(212,91,122,0.36)]"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-10 py-8 fade-in-up">
        {/* Left Column: Form/Steps */}
        <div className="flex-1">
          {/* Step Indicators */}
          <div className="flex items-center mb-8 border-b border-[#F3E1E5] pb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-[#382025] font-bold' : 'text-[#8B5E6B]'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${step >= 1 ? 'clay-btn text-white shadow-xs' : 'border border-current'}`}>
                1
              </span>
              <span className="font-serif text-sm md:text-base">Delivery Address</span>
            </div>
            <div className="w-12 h-px bg-[#F3E1E5] mx-4"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#382025] font-bold' : 'text-[#8B5E6B]'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${step >= 2 ? 'clay-btn text-white shadow-xs' : 'border border-current'}`}>
                2
              </span>
              <span className="font-serif text-sm md:text-base">Payment Method</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 text-error rounded-2xl border border-error/20 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Saved Delivery Addresses Section (Amazon / Myntra Style) */}
              {savedAddresses.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-[#F3E1E5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-base font-bold text-[#382025] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D45B7A]" /> Choose from Saved Addresses
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressIndex("NEW");
                        setFormData({
                          fullName: userDetails.name || "",
                          email: userDetails.email || "",
                          phone: userDetails.phone || "",
                          street: "",
                          apartment: "",
                          city: "",
                          state: "",
                          pincode: "",
                        });
                      }}
                      className="text-xs font-semibold text-[#D45B7A] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx;
                      return (
                        <div
                          key={addr.id || idx}
                          onClick={() => handleSelectSavedAddress(idx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? "border-[#D45B7A] bg-[#FFF9FA] ring-2 ring-[#F8CAD5]/40 shadow-xs"
                              : "border-[#F3E1E5] bg-white hover:border-[#D45B7A]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDF2F5] text-[#B03E5D] uppercase">
                              {addr.type === "WORK" ? <Building className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                              {addr.type || "HOME"}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#D45B7A] text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-sm text-[#382025]">{addr.fullName}</h4>
                          <p className="text-xs text-[#8B5E6B] line-clamp-2 mt-1">
                            {addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs font-medium text-[#D45B7A] mt-2">📱 {addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address Form */}
              <form onSubmit={handleNextStep} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-[#F3E1E5] shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-lg font-bold text-[#382025]">
                    {selectedAddressIndex === "NEW" ? "Enter Delivery Destination" : "Confirm Delivery Address"}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Mobile Number (For Courier Updates) *
                    </label>
                    <input 
                      required 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Street Address & Landmark *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="street" 
                      placeholder="House/Flat No., Building Name, Street"
                      value={formData.street} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Apartment / Suite / Area (Optional)
                    </label>
                    <input 
                      type="text" 
                      name="apartment" 
                      value={formData.apartment} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Pincode *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={handleInputChange} 
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="clay-btn w-full mt-8 py-4 rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgba(212,91,122,0.4)]"
                >
                  Continue to Payment Options →
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 clay-card p-6 md:p-8 rounded-[32px] border border-[#F3E1E5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-[#382025]">Select Payment Method</h2>
                <span className="clay-badge text-emerald-800 border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit Secure
                </span>
              </div>
              
              <div className="space-y-3">
                <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#D45B7A] bg-[#FFF9FA] ring-2 ring-[#F8CAD5]/40 shadow-xs' : 'border-[#F3E1E5] hover:bg-[#FAF7F8]'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 accent-[#D45B7A]" />
                  <div className="flex-1">
                    <p className={`font-serif text-sm font-bold ${paymentMethod === 'COD' ? 'text-[#D45B7A]' : 'text-[#382025]'}`}>
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-[#8B5E6B] mt-0.5">Pay in cash or UPI QR code upon doorstep courier delivery.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#D45B7A] bg-[#FFF9FA] ring-2 ring-[#F8CAD5]/40 shadow-xs' : 'border-[#F3E1E5] hover:bg-[#FAF7F8]'}`}>
                  <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 accent-[#D45B7A]" />
                  <div className="flex-1">
                    <p className={`font-serif text-sm font-bold ${paymentMethod === 'UPI' ? 'text-[#D45B7A]' : 'text-[#382025]'}`}>
                      UPI (Google Pay, PhonePe, Paytm, BHIM)
                    </p>
                    <p className="text-xs text-[#8B5E6B] mt-0.5">Instant zero-fee transfer via any UPI app.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[#D45B7A] bg-[#FFF9FA] ring-2 ring-[#F8CAD5]/40 shadow-xs' : 'border-[#F3E1E5] hover:bg-[#FAF7F8]'}`}>
                  <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 accent-[#D45B7A]" />
                  <div className="flex-1">
                    <p className={`font-serif text-sm font-bold ${paymentMethod === 'CARD' ? 'text-[#D45B7A]' : 'text-[#382025]'}`}>
                      Credit / Debit Card / Net Banking
                    </p>
                    <p className="text-xs text-[#8B5E6B] mt-0.5">Visa, Mastercard, RuPay, and leading Indian banks.</p>
                  </div>
                </label>
              </div>

              {/* Delivery Destination Snippet */}
              <div className="p-4 rounded-2xl bg-[#FAF7F8] border border-[#F3E1E5] text-xs space-y-1">
                <span className="font-bold text-[#8B5E6B] uppercase tracking-wider text-[10px]">Delivering To:</span>
                <p className="font-bold text-[#382025]">{formData.fullName} • {formData.phone}</p>
                <p className="text-[#8B5E6B]">{formData.street}, {formData.city}, {formData.state} - {formData.pincode}</p>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)} 
                  className="clay-btn-secondary px-6 py-3.5 text-xs font-bold"
                >
                  ← Edit Address
                </button>
                <button 
                  type="button"
                  onClick={onPlaceOrderClick} 
                  disabled={isLoading}
                  className="clay-btn flex-1 py-3.5 text-xs font-bold shadow-[0_8px_20px_rgba(212,91,122,0.4)] disabled:opacity-70"
                >
                  {isLoading ? "Processing Order..." : `Confirm & Place Order (₹${total.toFixed(2)})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="clay-card p-6 rounded-[28px] border border-[#F3E1E5] sticky top-28 space-y-6">
            <h2 className="font-serif text-lg font-bold text-[#382025]">Order Summary</h2>
            
            {/* Items List */}
            <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3.5 items-center">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#FDF2F5] shrink-0 border border-[#F3E1E5]">
                    <Image 
                      src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=600&auto=format&fit=crop'}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <div className="absolute top-0.5 right-0.5 bg-[#D45B7A] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-[#382025] line-clamp-1">{item.product.name}</p>
                    {item.product.customGift && (
                      <p className="text-[10px] text-[#D45B7A] font-semibold truncate mt-0.5">
                        💌 For: {item.product.customGift.recipientName} • {item.product.customGift.box || item.product.customGift.packaging}
                      </p>
                    )}
                    <p className="text-[#8B5E6B] text-xs mt-0.5">
                      ₹{item.product.discountPrice || item.product.price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-xs text-[#382025] shrink-0">
                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="border-t border-[#F3E1E5] pt-4">
              <label className="block text-xs font-semibold text-[#8B5E6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D45B7A]" /> Have a Coupon or Gift Code?
              </label>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME10" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FFF9FA] border border-[#F3E1E5] rounded-xl px-3.5 py-2 text-xs font-medium uppercase tracking-wider outline-none focus:border-[#F2A4B7]"
                    />
                    <button 
                      type="submit" 
                      disabled={isCheckingCoupon || !couponCode.trim()}
                      className="clay-btn px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 shrink-0"
                    >
                      {isCheckingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-error font-medium">{couponError}</p>}
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-xs text-emerald-800">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-emerald-600">
                        {appliedCoupon.type === "PERCENTAGE" ? `${appliedCoupon.value}% discount applied` : `₹${appliedCoupon.value} off applied`}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveCoupon} 
                    className="p-1 text-emerald-800 hover:text-emerald-950 rounded-md"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-[#F3E1E5] pt-4 space-y-2.5 text-xs text-[#8B5E6B]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#382025]">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span>{shipping === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `₹${shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between font-bold text-base text-[#382025] pt-3 border-t border-[#F3E1E5]">
                <span>Final Order Amount</span>
                <span className="text-[#D45B7A]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Satisfaction guarantee badge */}
            <div className="pt-2 text-center text-[11px] text-[#8B5E6B] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aura Craft verified handmade packaging guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal (For UPI / Card Test Flow) */}
      {showPaymentSimulation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col transform transition-all scale-100 border border-[#F3E1E5]">
            {isSimulatingPayment ? (
              <div className="flex flex-col items-center text-center py-10">
                <Loader2 className="w-12 h-12 text-[#D45B7A] animate-spin mb-4" />
                <h3 className="font-headline-md text-lg font-bold text-[#382025] mb-1">Connecting to Payment Gateway...</h3>
                <p className="text-xs text-[#8B5E6B]">Verifying credentials and reserving your craft order.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3E1E5]">
                  <h3 className="font-headline-md text-lg font-bold text-[#382025]">
                    {paymentMethod === 'CARD' ? 'Simulate Card Payment' : 'Simulate UPI Payment'}
                  </h3>
                  <button onClick={() => setShowPaymentSimulation(false)} className="text-[#8B5E6B] hover:text-[#382025]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs mb-6 border border-amber-200">
                  Order Total: <strong className="font-bold">₹{total.toFixed(2)}</strong>. This is a testing simulation. Click below to verify real order placement.
                </div>

                <button 
                  onClick={confirmSimulatedPayment}
                  className="w-full clay-btn py-3.5 rounded-full font-headline-sm text-sm font-semibold shadow-[0_8px_20px_rgba(212,91,122,0.4)]"
                >
                  Authorize Payment (₹{total.toFixed(2)}) →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl flex flex-col items-center text-center border border-[#F3E1E5]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-display-md text-2xl md:text-3xl font-bold text-[#382025] mb-2">Order Confirmed!</h2>
            <p className="text-sm text-[#8B5E6B] mb-4">
              Thank you for supporting Indian artisans. Your order ID is:
            </p>
            
            <div className="px-4 py-2 rounded-xl bg-[#FDF2F5] text-[#D45B7A] font-mono font-bold text-sm mb-6 border border-[#F3E1E5]">
              #{confirmedOrderId || "AC-ORD-SUCCESS"}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {confirmedOrderId && (
                <Link
                  href={`/track-order/${confirmedOrderId}`}
                  className="flex-1 clay-btn py-3 rounded-full text-xs font-semibold text-center shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                >
                  Track Order Status →
                </Link>
              )}
              <Link
                href="/profile"
                className="flex-1 clay-btn-secondary py-3 rounded-full text-xs font-semibold text-center"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
