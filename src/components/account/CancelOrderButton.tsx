"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle, Loader2, CheckCircle2, X } from "lucide-react";

interface CancelOrderButtonProps {
  orderId: string;
  orderShortId?: string;
  currentStatus?: string;
  className?: string;
  onCancelled?: () => void;
}

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found better price / alternative",
  "Delivery time is too long",
  "Need to modify order items or address",
  "Other reason",
];

export function CancelOrderButton({
  orderId,
  orderShortId,
  currentStatus,
  className = "",
  onCancelled,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(CANCELLATION_REASONS[0]);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const displayId = orderShortId || orderId.slice(-6).toUpperCase();

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
    setError(null);
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason,
          note: note.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order.");
      }

      setIsSuccess(true);
      if (onCancelled) onCancelled();

      // Refresh server components
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error("Cancellation error:", err);
      setError(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#DDB9B4] text-[#ba1a1a] bg-[#FFF8F8] hover:bg-[#FDF0EE] hover:border-[#ba1a1a] transition-all cursor-pointer shadow-2xs ${className}`}
        title="Cancel this order"
      >
        <XCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
        <span>Cancel Order</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(86,58,41,0.2)] border border-[#E9DCCB] relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 text-[#7D6B5E] hover:text-[#563A29] rounded-full hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E4E8DE] text-[#2B3320] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-[#8E9979]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#36251A]">
                  Order Cancelled
                </h3>
                <p className="text-sm text-[#7D6B5E]">
                  Order #{displayId} has been successfully cancelled.
                </p>
              </div>
            ) : (
              <>
                {/* Header with warning icon */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF1F0] text-[#ba1a1a] flex items-center justify-center shrink-0 border border-[#FDD0CD]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#36251A] tracking-tight">
                      Cancel Order #{displayId}?
                    </h3>
                    <p className="text-xs text-[#7D6B5E] mt-1">
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {error}
                  </div>
                )}

                {/* Cancellation Reason Selector */}
                <div className="space-y-3.5 my-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#563A29] mb-1.5">
                      Please select a reason for cancellation *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] text-[#36251A] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#563A29] focus:bg-white transition-all shadow-2xs"
                    >
                      {CANCELLATION_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#563A29] mb-1.5">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={isLoading}
                      placeholder="Help us improve our handmade service..."
                      rows={2}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] text-[#36251A] placeholder:text-[#7D6B5E]/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#563A29] focus:bg-white transition-all shadow-2xs resize-none"
                    />
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E9DCCB]">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2] transition-colors"
                  >
                    Keep Order
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#ba1a1a] hover:bg-[#961515] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Confirm Cancellation</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

