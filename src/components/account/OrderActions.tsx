"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Truck } from "lucide-react";
import { CancelOrderButton } from "./CancelOrderButton";

interface OrderActionsProps {
  orderId: string;
  orderShortId: string;
  orderStatus: string;
}

export function OrderActions({ orderId, orderShortId, orderStatus }: OrderActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCancelled = orderStatus === "CANCELLED";
  const isDelivered = orderStatus === "DELIVERED";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1-Click Copy ID */}
      <button
        type="button"
        onClick={handleCopyId}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9DCCB] bg-white hover:bg-[#FAF7F2] text-[#563A29] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        title="Copy full Order ID"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span className="text-[#2E7D32]">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-[#7D6B5E]" />
            <span>Copy ID</span>
          </>
        )}
      </button>

      {/* Track Shipment Link */}
      <Link
        href={`/track-order/${orderId}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CDAE91] bg-[#FAF7F2] hover:bg-[#F1E7DA] text-[#563A29] text-xs font-semibold transition-all shadow-2xs"
      >
        <Truck className="w-3.5 h-3.5 text-[#563A29]" />
        <span>Live Tracker</span>
      </Link>

      {/* Single, cleanly styled Cancel Order Button */}
      {!isCancelled && !isDelivered && (
        <CancelOrderButton
          orderId={orderId}
          orderShortId={orderShortId}
          currentStatus={orderStatus}
        />
      )}
    </div>
  );
}

