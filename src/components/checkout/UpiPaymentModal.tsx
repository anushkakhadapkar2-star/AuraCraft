"use client";

import React, { useState } from "react";
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
  AlertCircle
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
  const [utrNumber, setUtrNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "auracraft@okaxis";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Aura Craft Handmade";
  const formattedAmount = totalAmount.toFixed(2);

  // Standard UPI URI format supported by all NPCI certified apps
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent("AuraCraft Order")}`;

  // QR Code URL via high-reliability QR renderer
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}&color=38-32-37&bgcolor=ffffff&margin=1`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      setError("Please enter the 12-digit UPI reference (UTR) from your payment app.");
      return;
    }
    setError("");
    onConfirmPayment(cleanUtr);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EDE3D5] relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE3D5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="font-serif text-lg font-bold text-[#24483B]">
                Direct UPI Payment
              </h3>
            </div>
            <p className="text-xs text-[#706E6B] mt-0.5">
              Zero fee • Instant transfer directly to Aura Craft
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#706E6B] hover:text-[#24483B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Ribbon */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EDE3D5] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#706E6B] uppercase tracking-wider block">
              Payable Amount
            </span>
            <span className="font-serif text-xl font-bold text-[#24483B]">
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

        {/* Toggle Option: Scan QR vs Direct Apps */}
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

        {/* TAB 1: SCANNABLE QR CODE */}
        {activeTab === "qr" && (
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#FAF7F2] border border-[#EDE3D5] mb-5">
            <div className="w-[190px] h-[190px] bg-white p-2 rounded-2xl border-2 border-[#EDE3D5] shadow-xs relative flex items-center justify-center mb-2.5">
              <img
                src={qrCodeUrl}
                alt="Aura Craft UPI QR Code"
                width={170}
                height={170}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-[#24483B] font-semibold">
              Scan with any UPI app on your phone
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
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

        {/* TAB 2: DIRECT APP LAUNCH (Ideal on Mobile) */}
        {activeTab === "apps" && (
          <div className="space-y-2.5 mb-5">
            <a
              href={upiUri}
              className="w-full p-3.5 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                  <GooglePayLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Google Pay</span>
                  <span className="text-[10px] text-[#706E6B]">Pay with Google Pay app</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={`phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR`}
              className="w-full p-3.5 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PhonePeLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">PhonePe</span>
                  <span className="text-[10px] text-[#706E6B]">Pay with PhonePe UPI</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={`paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR`}
              className="w-full p-3.5 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PaytmLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Paytm UPI</span>
                  <span className="text-[10px] text-[#706E6B]">Pay with Paytm Wallet / Bank</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>

            <a
              href={upiUri}
              className="w-full p-3.5 rounded-2xl border border-[#EDE3D5] bg-white hover:bg-[#FAF7F2] hover:border-[#24483B]/40 flex items-center justify-between transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UpiLogo className="w-full h-full" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#24483B] block">Any UPI App / BHIM</span>
                  <span className="text-[10px] text-[#706E6B]">CRED, Amazon Pay, BHIM & others</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#706E6B] group-hover:text-[#24483B] group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>
        )}

        {/* UTR Reference Input Form */}
        <form onSubmit={handleConfirm} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-[#24483B] mb-1">
              Enter 12-Digit UPI Ref / UTR No. <span className="text-[#C9A45C]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. 432109876543"
              value={utrNumber}
              onChange={(e) => {
                setUtrNumber(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EDE3D5] bg-[#FAF7F2] focus:bg-white text-xs font-mono font-bold text-[#24483B] focus:border-[#24483B] outline-none transition-all tracking-wider"
            />
            {error && (
              <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </p>
            )}
            <p className="text-[10px] text-[#706E6B] mt-1">
              Found on your GPay/PhonePe payment successful screen as "UPI transaction ID" or "UTR".
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl clay-btn text-xs font-bold text-white shadow-[0_8px_20px_rgba(36,72,59,0.25)] hover:shadow-[0_12px_24px_rgba(36,72,59,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <span>Confirm & Place Order →</span>
            )}
          </button>
        </form>

        {/* Safe notice */}
        <div className="mt-4 pt-3 border-t border-[#EDE3D5] flex items-center justify-center gap-1.5 text-[10px] text-[#706E6B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Payment is verified before dispatching your handcrafted order</span>
        </div>

      </div>
    </div>
  );
}
