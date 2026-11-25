"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export interface ReviewPhotoItem {
  photoUrl: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  date?: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  verifiedPurchase?: boolean;
  adminReply?: {
    message: string;
    author?: string;
    repliedAt?: string;
  } | null;
}

interface PhotoLightboxModalProps {
  photos: ReviewPhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightboxModal({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  if (!isOpen || photos.length === 0) return null;

  const current = photos[currentIndex] || photos[0];

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#1a171e] text-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-[0_25px_70px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Photo View */}
        <div className="relative flex-1 bg-black/50 min-h-[300px] md:min-h-[540px] flex items-center justify-center p-4">
          <div className="relative w-full h-[300px] sm:h-[420px] md:h-[500px]">
            <Image
              src={current.photoUrl}
              alt={current.title || current.productName || "Customer review photo"}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Nav Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentIndex < photos.length - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Photo Counter */}
          <div className="absolute bottom-3 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-medium text-white/90">
            {currentIndex + 1} of {photos.length} photos
          </div>
        </div>

        {/* Right Side: Amazon-style Review Details */}
        <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between bg-[#221e28] overflow-y-auto max-h-[40vh] md:max-h-[540px]">
          <div>
            {/* Product tag */}
            {current.productName && (
              <div className="mb-4 pb-4 border-b border-white/10">
                <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">
                  Product Reviewed
                </span>
                {current.productSlug ? (
                  <Link 
                    href={`/product/${current.productSlug}`}
                    onClick={onClose}
                    className="font-medium text-sm text-[#eabda0] hover:underline line-clamp-2 block"
                  >
                    {current.productName}
                  </Link>
                ) : (
                  <p className="font-medium text-sm text-white/90 line-clamp-2">
                    {current.productName}
                  </p>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#ec4899] text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                {current.userName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{current.userName}</p>
                {current.verifiedPurchase !== false && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
            </div>

            {/* Rating Stars & Date */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-[#fbbf24]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4"
                    fill={star <= current.rating ? "currentColor" : "none"}
                    color={star <= current.rating ? "currentColor" : "#4b5563"}
                  />
                ))}
              </div>
              {current.date && (
                <span className="text-xs text-white/50">{current.date}</span>
              )}
            </div>

            {/* Review Title */}
            {current.title && (
              <h4 className="font-semibold text-white text-base mb-2">
                {current.title}
              </h4>
            )}

            {/* Review Comment */}
            <p className="text-sm text-white/80 leading-relaxed font-sans whitespace-pre-line mb-4">
              {current.comment}
            </p>

            {/* Official Seller Response */}
            {current.adminReply?.message && (
              <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center gap-1.5 text-[#eabda0] font-bold mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eabda0]"></span>
                  <span>{current.adminReply.author || "Aura Craft Team"} (Seller Response)</span>
                </div>
                <p className="text-white/85 leading-relaxed font-sans pl-2.5 border-l border-[#eabda0]/30 whitespace-pre-line">
                  {current.adminReply.message}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {photos.length > 1 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-2">More customer photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {photos.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === currentIndex ? "border-[#eabda0] scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={item.photoUrl}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
