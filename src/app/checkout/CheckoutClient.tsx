"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutClient() {
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

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    }, 2000);
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
            quantity: item.quantity,
            price: item.product.discountPrice || item.product.price,
          })),
          shippingAddress: formData,
          totalAmount: total,
          subtotal,
          shipping,
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
        paymentMethod: paymentMethod
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
      <div className="py-24 text-center">
        <h2 className="font-headline-md text-primary mb-4">Your cart is empty</h2>
        <button onClick={() => router.push("/shop")} className="bg-primary text-on-primary px-8 py-3 btn-radius">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-12 py-12 fade-in-up">
        {/* Left Column: Form/Steps */}
        <div className="flex-1">
          {/* Step Indicators */}
          <div className="flex items-center mb-8 border-b border-outline-variant/30 pb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center mr-2 font-headline-sm text-sm">1</span>
              <span className="font-headline-sm">Shipping</span>
            </div>
            <div className="w-12 h-px bg-outline-variant/30 mx-4"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center mr-2 font-headline-sm text-sm">2</span>
              <span className="font-headline-sm">Payment</span>
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-xl border border-error/20">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6 bg-surface p-6 rounded-3xl border border-outline-variant/30">
              <h2 className="font-headline-sm text-primary mb-4">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Full Name</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-on-surface-variant mb-2">Phone</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-on-surface-variant mb-2">Street Address</label>
                  <input required type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-on-surface-variant mb-2">Apartment / Suite (Optional)</label>
                  <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">State</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Pincode</label>
                  <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
              </div>

              <button type="submit" className="w-full mt-8 bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6 bg-surface p-6 rounded-3xl border border-outline-variant/30">
              <h2 className="font-headline-sm text-primary mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-surface-container-low' : 'border-outline-variant/50 hover:bg-surface-container-lowest'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div>
                    <p className={`font-headline-sm ${paymentMethod === 'COD' ? 'text-primary' : 'text-on-surface'}`}>Cash on Delivery (COD)</p>
                    <p className="text-sm text-on-surface-variant">Pay when your order arrives at your doorstep.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-primary bg-surface-container-low' : 'border-outline-variant/50 hover:bg-surface-container-lowest'}`}>
                  <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div>
                    <p className={`font-headline-sm ${paymentMethod === 'CARD' ? 'text-primary' : 'text-on-surface'}`}>Credit / Debit Card</p>
                    <p className="text-sm text-on-surface-variant">Pay securely with your Visa, Mastercard, or RuPay card.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-primary bg-surface-container-low' : 'border-outline-variant/50 hover:bg-surface-container-lowest'}`}>
                  <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div>
                    <p className={`font-headline-sm ${paymentMethod === 'UPI' ? 'text-primary' : 'text-on-surface'}`}>UPI Apps</p>
                    <p className="text-sm text-on-surface-variant">Pay instantly using Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                </label>
              </div>

              <div className="pt-6 flex gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-4 btn-radius border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                  Back
                </button>
                <button 
                  onClick={onPlaceOrderClick} 
                  disabled={isLoading}
                  className="flex-1 bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full md:w-96 flex-shrink-0">
          <div className="bg-surface-container-low p-6 rounded-3xl sticky top-32">
            <h2 className="font-headline-sm text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                    <Image 
                      src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=600&auto=format&fit=crop'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -top-1 -right-1 bg-primary text-on-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md font-medium text-primary line-clamp-1">{item.product.name}</p>
                    <p className="text-on-surface-variant text-sm mt-1">₹{item.product.discountPrice || item.product.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 space-y-3 font-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-headline-sm text-primary text-lg pt-3 border-t border-outline-variant/30 mt-3">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentSimulation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl flex flex-col transform transition-all scale-100 animate-in zoom-in-95 duration-300">
            {isSimulatingPayment ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="font-display-sm text-primary mb-2">Processing Payment...</h2>
                <p className="text-on-surface-variant">Please do not close this window.</p>
              </div>
            ) : (
              <>
                <h2 className="font-headline-md text-primary mb-2">
                  {paymentMethod === 'CARD' ? 'Enter Card Details' : 'Enter UPI ID'}
                </h2>
                <p className="font-body-sm text-on-surface-variant mb-6 border-b border-outline-variant/30 pb-4">
                  Test environment. No real money will be deducted.
                </p>

                {paymentMethod === 'CARD' && (
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Card Number</label>
                      <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Expiry (MM/YY)</label>
                        <input type="text" placeholder="12/26" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">CVV</label>
                        <input type="password" placeholder="123" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">UPI ID / VPA</label>
                      <input type="text" placeholder="username@okbank" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowPaymentSimulation(false)}
                    className="flex-1 py-3 btn-radius border border-outline-variant text-on-surface font-headline-sm hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmSimulatedPayment}
                    className="flex-1 bg-primary text-on-primary py-3 btn-radius font-headline-sm hover:bg-tertiary transition-colors"
                  >
                    Pay ₹{total.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && confirmedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl flex flex-col items-center text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#c3e8ca] text-[#2e7d32] rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="font-display-sm text-[#2e7d32] mb-2">Order Confirmed!</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Thank you for shopping with Aura Craft. Your order <span className="font-bold text-primary">#{confirmedOrderId?.slice(0,8).toUpperCase()}</span> has been placed successfully.
            </p>
            
            {/* Product Images Preview */}
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-4">
                {confirmedOrderDetails.items.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="relative w-16 h-16 rounded-full border-2 border-surface bg-surface-container overflow-hidden z-10 shadow-sm" style={{ zIndex: 10 - idx }}>
                    {item.product.images?.[0]?.url && (
                      <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="relative w-16 h-16 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center font-bold text-on-surface z-0 shadow-sm">
                    +{items.length - 3}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full space-y-3 mb-8 text-left bg-surface-container-low p-5 rounded-2xl">
              <div className="flex justify-between items-center bg-[#c3e8ca]/30 p-3 rounded-xl border border-[#c3e8ca]">
                <div className="flex items-center gap-2 text-[#0f5223]">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span className="font-medium text-xs">Delivery Date</span>
                </div>
                <span className="font-bold text-[#0f5223] text-sm">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-3">
                <span className="text-on-surface-variant">Order Total</span>
                <span className="font-headline-sm text-primary">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Payment Method</span>
                <span className="font-medium text-primary">{paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}</span>
              </div>
            </div>
            
            <div className="flex flex-row w-full gap-4 mt-2">
              <button 
                onClick={() => window.location.href = `/track-order/${confirmedOrderId}`}
                className="flex-1 bg-transparent border border-primary text-primary py-4 btn-radius font-headline-sm hover:bg-surface-container transition-colors"
              >
                Track Order
              </button>
              <button 
                onClick={() => window.location.href = '/shop'}
                className="flex-1 bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
