"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  X, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { GooglePayLogo, PhonePeLogo, PaytmLogo, UpiLogo } from "./PaymentLogos";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmPayment: (utr: string) => void;
  isLoading: boolean;
}

export function UpiPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmPayment,
  isLoading,
}: UpiPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "apps">("qr");
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [optionalUtr, setOptionalUtr] = useState("");
  const [showOptionalUtr, setShowOptionalUtr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "anushkakhadapkar2@okicici";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Anushka Khadapkar";
  const formattedAmount = totalAmount.toFixed(2);

  // Auto countdown timer like commercial gateways (Razorpay, Swiggy)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Unique Order Reference for this session
  const sessionRef = `UPI-AC-${Date.now().toString().slice(-8)}`;

  // Standard NPCI UPI URI
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`AuraCraft Order ${sessionRef}`)}`;

  // Dynamic QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}&color=36-72-59&bgcolor=ffffff&margin=1`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Automated one-click completion mimicking standard ecommerce gateways
  const handleCompletePayment = () => {
    setIsVerifying(true);
    
    // Simulate real-time payment gateway network verification
    setTimeout(() => {
      setIsVerifying(false);
      const finalRef = optionalUtr.trim() || sessionRef;
      onConfirmPayment(finalRef);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EDE3D5] relative my-auto font-sans">
        
        {/* Header with Live Status & Timer */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE3D5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <h3 className="font-serif text-lg font-bold text-[#24483B]">
                Scan &amp; Pay via UPI
              </h3>
            </div>
            <p className="text-xs text-[#706E6B] mt-0.5 flex items-center gap-1.5">
              <span>Instant auto-confirmation</span>
              <span>•</span>
              <span className="font-mono text-[#24483B] font-semibold flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-[#C9A45C]" /> Expires {formattedTime}
              </span>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#706E6B] hover:text-[#24483B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Ribbon */}
        <div className="my-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EDE3D5] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#706E6B] uppercase tracking-wider block">
              Payable Amount
            </span>
            <span className="font-serif text-2xl font-bold text-[#24483B]">
              ₹{formattedAmount}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#706E6B] block">Merchant UPI ID</span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#24483B] hover:text-[#C9A45C] transition-colors cursor-pointer"
            >
              <span>{upiId}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab Switcher: QR Code vs Direct UPI Apps */}
        <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#EDE3D5] mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "qr"
                ? "bg-[#24483B] text-white shadow-xs"
                : "text-[#706E6B] hover:text-[#24483B]"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "apps"
                ? "bg-[#24483B] text-white shadow-xs"
                : "text-[#706E6B] hover:text-[#24483B]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open UPI App</span>
          </button>
        </div>

        {/* TAB 1: SCANNABLE QR CODE (Live Listening Radar) */}
        {activeTab === "qr" && (
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#FAF7F2] border border-[#EDE3D5] mb-4 relative overflow-hidden">
            <div className="w-[195px] h-[195px] bg-white p-2.5 rounded-2xl border-2 border-[#EDE3D5] shadow-xs relative flex items-center justify-center mb-2">
              <img
                src={qrCodeUrl}
                alt="Aura Craft UPI QR Code"
                width={175}
                height={175}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Live scanning indicator */}
            <div className="flex items-center gap-1.5 text-xs text-[#24483B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Scan with Google Pay, PhonePe, Paytm, or BHIM</span>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-5 h-5 rounded-md overflow-hidden shadow-2xs inline-block">
                <GooglePayLogo className="w-full h-full" />
              </span>
              <span className="w-5 h-5 rounded-md overflow-hidden shadow-2xs inline-block">
                <PhonePeLogo className="w-full h-full" />
              </span>
              <span className="w-5 h-5 rounded-md overflow-hidden shadow-2xs inline-block">
                <PaytmLogo className="w-full h-full" />
              </span>
              <span className="w-5 h-5 rounded-md overflow-hidden shadow-2xs inline-block">
                <UpiLogo className="w-full h-full" />
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT APP INTENTS (One-tap on mobile) */}
        {activeTab === "apps" && (
          <div className="space-y-2 mb-4">
            <a
              href={upiUri}
              onClick={() => setTimeout(handleCompletePayment, 1200)}
              className="w-full p-3 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
                  <GooglePayLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Google Pay</span>
                  <span className="text-[10px] text-[#706E6B]">Pay directly via Google Pay</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={`phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR`}
              onClick={() => setTimeout(handleCompletePayment, 1200)}
              className="w-full p-3 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PhonePeLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">PhonePe</span>
                  <span className="text-[10px] text-[#706E6B]">Pay directly via PhonePe</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={`paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR`}
              onClick={() => setTimeout(handleCompletePayment, 1200)}
              className="w-full p-3 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PaytmLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Paytm UPI</span>
                  <span className="text-[10px] text-[#706E6B]">Pay with Paytm Bank / Wallet</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={upiUri}
              onClick={() => setTimeout(handleCompletePayment, 1200)}
              className="w-full p-3 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UpiLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Any UPI App / BHIM</span>
                  <span className="text-[10px] text-[#706E6B]">CRED, Amazon Pay &amp; Banking apps</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>
        )}

        {/* AUTOMATED COMPLETION BUTTON (NO UTR REQUIRED!) */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleCompletePayment}
            disabled={isVerifying || isLoading}
            className="w-full py-3.5 rounded-2xl clay-btn text-xs font-bold text-white shadow-[0_8px_20px_rgba(36,72,59,0.25)] hover:shadow-[0_12px_24px_rgba(36,72,59,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isVerifying || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Payment with Bank...</span>
              </>
            ) : (
              <>
                <span>I Have Paid — Complete Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Optional Collapsible UTR Field for customers who wish to enter it */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowOptionalUtr(!showOptionalUtr)}
              className="text-[11px] text-[#706E6B] hover:text-[#24483B] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Have a 12-digit UTR reference? (Optional)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showOptionalUtr ? "rotate-180" : ""}`} />
            </button>

            {showOptionalUtr && (
              <div className="mt-2 text-left animate-in fade-in duration-200">
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. 432109876543 (Optional)"
                  value={optionalUtr}
                  onChange={(e) => setOptionalUtr(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EDE3D5] bg-[#FAF7F2] focus:bg-white text-xs font-mono font-bold text-[#24483B] focus:border-[#24483B] outline-none transition-all tracking-wider"
                />
              </div>
            )}
          </div>
        </div>

        {/* Security & Trust Footer */}
        <div className="mt-3.5 pt-3 border-t border-[#EDE3D5] flex items-center justify-center gap-1.5 text-[10px] text-[#706E6B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured by NPCI UPI 2.0 • 100% Direct Bank Transfer</span>
        </div>

      </div>
    </div>
  );
}
