"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Star, Camera, X, Loader2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface WriteOrderReviewModalProps {
  productId: string;
  productName: string;
  productSlug?: string;
  productImage?: string;
  orderId: string;
  userName?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Disappointed",
  2: "Could be better",
  3: "Average craftsmanship",
  4: "Very good! Loved it",
  5: "Handcrafted perfection! ✨",
};

export function WriteOrderReviewModal({
  productId,
  productName,
  productSlug,
  productImage,
  orderId,
  userName = "Verified Customer",
}: WriteOrderReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setError("You can upload a maximum of 5 photos per review.");
      return;
    }

    setIsUploadingImage(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        const data = await res.json();
        return data.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please share your feedback or experience with this handcrafted item.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        productName,
        productSlug: productSlug || "",
        orderId,
        userName: userName.trim() || "Verified Buyer",
        rating,
        title: title.trim() || (rating >= 4 ? "Beautiful Handcrafted Quality" : "My Review"),
        comment: comment.trim(),
        images: uploadedImages,
        isVerifiedPurchase: true,
        verifiedPurchase: true,
        status: "APPROVED",
        helpfulCount: 0,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setError("Unable to submit review right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitted ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Reviewed (5★)</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D45B7A] hover:text-[#B03E5D] bg-[#FDF2F5] hover:bg-[#FCE5EB] border border-[#F3E1E5] px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Star className="w-3.5 h-3.5 fill-[#D45B7A] text-[#D45B7A]" />
          <span>Rate & Review</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FAF7F8] rounded-[32px] border border-[#F3E1E5] shadow-[0_20px_50px_rgba(212,91,122,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-[#F3E1E5] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {productImage && (
                  <div className="relative w-12 h-12 rounded-xl bg-[#FAF7F8] border border-[#F3E1E5] overflow-hidden shrink-0">
                    <Image src={productImage} alt={productName} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#382025] truncate mt-0.5">
                    {productName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F8] hover:bg-[#FDF2F5] border border-[#F3E1E5] text-[#8B5E6B] hover:text-[#382025] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
              {submitted ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-[#382025]">Thank You for Your Review!</h4>
                  <p className="text-xs text-[#8B5E6B] max-w-sm mx-auto leading-relaxed">
                    Your authentic photo and review have been published to the handcrafted community. Your feedback supports our women artisans directly!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* 1. Star Rating */}
                  <div className="bg-white p-4 rounded-2xl border border-[#F3E1E5] text-center space-y-2">
                    <label className="block text-xs font-bold text-[#8B5E6B] uppercase tracking-wider">
                      Overall Rating
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-hidden"
                            title={`${star} star`}
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                active
                                  ? "fill-[#D45B7A] text-[#D45B7A] drop-shadow-xs"
                                  : "text-[#E0CBD1]"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs font-semibold text-[#D45B7A]">
                      {RATING_LABELS[hoverRating || rating]}
                    </p>
                  </div>

                  {/* 2. Review Headline */}
                  <div>
                    <label className="block text-xs font-bold text-[#382025] mb-1.5">
                      Review Headline (optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stunning craftsmanship, wife loved it!"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7] focus:ring-2 focus:ring-[#F8CAD5]/30"
                    />
                  </div>

                  {/* 3. Review Comment */}
                  <div>
                    <label className="block text-xs font-bold text-[#382025] mb-1.5">
                      Your Experience / Unboxing Story <span className="text-[#D45B7A]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you love most about this crochet piece? How was the texture, color, and packaging?"
                      required
                      className="w-full p-4 rounded-xl bg-white border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7] focus:ring-2 focus:ring-[#F8CAD5]/30 leading-relaxed resize-none"
                    ></textarea>
                  </div>

                  {/* 4. Photo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-[#382025] mb-1.5 flex items-center justify-between">
                      <span>Add Unboxing / Display Photos (Max 5)</span>
                      <span className="text-[11px] font-normal text-[#8B5E6B]">{uploadedImages.length}/5 photos</span>
                    </label>

                    <div className="flex flex-wrap gap-2.5 items-center">
                      {uploadedImages.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#F3E1E5] group shrink-0 shadow-2xs">
                          <Image src={url} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {uploadedImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-[#F3E1E5] hover:border-[#D45B7A] bg-white hover:bg-[#FDF2F5] text-[#8B5E6B] hover:text-[#D45B7A] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#D45B7A]" />
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span className="text-[9px] font-bold">Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || isUploadingImage}
                      className="w-full clay-btn py-3.5 rounded-2xl text-xs font-bold shadow-[0_8px_20px_rgba(212,91,122,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publishing Verified Review...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit Verified Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
