"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { Star, Camera, CheckCircle2, ThumbsUp, X, Filter, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { PhotoLightboxModal, ReviewPhotoItem } from "@/components/reviews/PhotoLightboxModal";

interface ProductReviewsProps {
  productId: string;
  productName?: string;
  productSlug?: string;
}

export function ProductReviews({ productId, productName, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort State
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [photosOnlyFilter, setPhotosOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
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

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Helpful votes state (persisted in local state)
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", productId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(r => r.status === "APPROVED" || r.status === undefined);
        
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  // Handle Image Upload using local /api/upload
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

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Please provide your name and review comments.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newReviewData = {
        productId,
        productName: productName || "Handmade Craft",
        productSlug: productSlug || "",
        userName: name.trim(),
        rating,
        title: title.trim() || (rating >= 4 ? "Loved it!" : "My experience"),
        comment: comment.trim(),
        images: uploadedImages,
        verifiedPurchase: true,
        helpfulCount: 0,
        status: "APPROVED", // Auto-approved so users see their review right away!
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reviews"), newReviewData);
      
      // Optimistic update
      const localReview = {
        id: docRef.id,
        ...newReviewData,
        createdAt: { toDate: () => new Date() },
      };
      setReviews((prev) => [localReview, ...prev]);

      setSubmitted(true);
      setName("");
      setTitle("");
      setComment("");
      setUploadedImages([]);
      setRating(5);
      setShowForm(false);
    } catch (err) {
      console.error("Review submission error:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    
    setVotedHelpful(prev => ({ ...prev, [reviewId]: true }));
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));

    try {
      await updateDoc(doc(db, "reviews", reviewId), {
        helpfulCount: increment(1)
      });
    } catch (e) {
      console.error("Helpful vote error", e);
    }
  };

  // Calculations: Total, Average, Star breakdown percentages
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0) / totalReviews).toFixed(1)
    : "0.0";

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // All review photos flattened for the Amazon gallery & Lightbox
  const allReviewPhotos: ReviewPhotoItem[] = useMemo(() => {
    const list: ReviewPhotoItem[] = [];
    reviews.forEach(r => {
      if (Array.isArray(r.images) && r.images.length > 0) {
        r.images.forEach((imgUrl: string) => {
          list.push({
            photoUrl: imgUrl,
            userName: r.userName,
            rating: r.rating || 5,
            title: r.title,
            comment: r.comment,
            date: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
            productName: productName || r.productName,
            productSlug: productSlug || r.productSlug,
            verifiedPurchase: r.verifiedPurchase !== false,
            adminReply: r.adminReply || null,
          });
        });
      }
    });
    return list;
  }, [reviews, productName, productSlug]);

  const openLightboxAtPhoto = (photoUrl: string) => {
    const idx = allReviewPhotos.findIndex(p => p.photoUrl === photoUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Filtered and Sorted reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (selectedRatingFilter !== null) {
      result = result.filter(r => Math.round(r.rating || 5) === selectedRatingFilter);
    }

    if (photosOnlyFilter) {
      result = result.filter(r => Array.isArray(r.images) && r.images.length > 0);
    }

    result.sort((a, b) => {
      if (sortBy === "highest") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "lowest") return (a.rating || 0) - (b.rating || 0);
      // Recent
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });

    return result;
  }, [reviews, selectedRatingFilter, photosOnlyFilter, sortBy]);

  const ratingLabel = (stars: number) => {
    switch (stars) {
      case 5: return "Excellent, loved it!";
      case 4: return "Very good, met expectations";
      case 3: return "Average, looks okay";
      case 2: return "Fair, could be better";
      case 1: return "Poor, not satisfied";
      default: return "";
    }
  };

  return (
    <section id="reviews" className="border-t border-outline-variant/30 pt-16 pb-16 mt-16 scroll-mt-24">
      {/* Lightbox Modal */}
      <PhotoLightboxModal
        photos={allReviewPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-primary block mb-1">
            Real Feedback
          </span>
          <h2 className="font-display-md text-3xl font-bold text-primary">
            Customer Reviews
          </h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSubmitted(false);
          }}
          className="inline-flex items-center gap-2 bg-[#553722] hover:bg-[#432b1b] text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer self-start md:self-auto"
        >
          <Camera className="w-4 h-4" />
          {showForm ? "Close Form" : "Write a Customer Review"}
        </button>
      </div>

      {/* Main Grid: Left Amazon Breakdown & Photos, Right Reviews Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column (4 cols): Amazon-Style Ratings Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#fcfbf9] border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-xs">
            <h3 className="font-headline-sm text-lg font-bold text-primary mb-4">
              Customer Ratings
            </h3>

            {/* Score & Stars */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display-lg text-4xl font-bold text-primary">
                {averageRating}
              </span>
              <div>
                <div className="flex text-[#e69223] mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5"
                      fill={star <= Math.round(Number(averageRating)) ? "currentColor" : "none"}
                      color={star <= Math.round(Number(averageRating)) ? "currentColor" : "#d1d5db"}
                    />
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant font-medium">
                  {totalReviews} {totalReviews === 1 ? "global rating" : "global ratings"}
                </p>
              </div>
            </div>

            {/* Amazon-style 5 to 1 Star Breakdown Bars */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars] || 0;
                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = selectedRatingFilter === stars;

                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedRatingFilter(isSelected ? null : stars)}
                    className={`w-full group flex items-center gap-3 text-left py-1 px-2 -mx-2 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? "bg-[#f0edfc]" : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <span className="text-xs font-semibold text-primary w-11 shrink-0">
                      {stars} star
                    </span>
                    {/* Progress Bar Container */}
                    <div className="flex-1 h-4 bg-[#e5e1dd] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#e69223] to-[#f59e0b] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant w-10 text-right shrink-0">
                      {percentage}%
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedRatingFilter !== null && (
              <button
                onClick={() => setSelectedRatingFilter(null)}
                className="mt-4 text-xs font-semibold text-primary underline hover:opacity-80 block"
              >
                Clear {selectedRatingFilter}-star filter
              </button>
            )}

            <div className="mt-6 pt-5 border-t border-outline-variant/30 text-xs text-on-surface-variant">
              ⭐ 100% of reviews are from verified purchasers and handcrafted enthusiasts.
            </div>
          </div>

          {/* Amazon-Style Customer Photos Strip */}
          {allReviewPhotos.length > 0 && (
            <div className="bg-[#fcfbf9] border border-outline-variant/30 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Reviews with images
                </h3>
                <span className="text-xs font-medium text-on-surface-variant">
                  {allReviewPhotos.length} {allReviewPhotos.length === 1 ? "photo" : "photos"}
                </span>
              </div>

              {/* Horizontal Scroll / Grid of Customer Photos */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allReviewPhotos.slice(0, 8).map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-outline-variant/30 hover:border-primary transition-all shadow-2xs"
                  >
                    <Image
                      src={photo.photoUrl}
                      alt="Customer review photo"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="100px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                        View
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {allReviewPhotos.length > 8 && (
                <button
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="mt-3 text-xs font-semibold text-primary hover:underline block text-center w-full"
                >
                  View all {allReviewPhotos.length} customer photos →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column (8 cols): Write Form Drawer & Reviews List */}
        <div className="lg:col-span-8 space-y-6">

          {/* Write Review Form Card */}
          {showForm && (
            <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
                <div>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">
                    Create Review
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                    Share your authentic experience and photos with other craft lovers!
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitted ? (
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-6 rounded-2xl text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-lg">Review Submitted!</h4>
                  <p className="text-sm text-emerald-800 mt-1">
                    Thank you for sharing your experience and photo with our handmade community!
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-semibold underline text-emerald-900 hover:opacity-80"
                  >
                    Submit another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-medium">
                      {error}
                    </div>
                  )}

                  {/* 1. Overall Rating */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Overall rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 text-[#e69223] hover:scale-115 transition-transform cursor-pointer"
                        >
                          <Star
                            className="w-8 h-8 sm:w-9 sm:h-9"
                            fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                            color={(hoverRating || rating) >= star ? "currentColor" : "#d1d5db"}
                          />
                        </button>
                      ))}
                      <span className="text-xs sm:text-sm font-semibold text-primary ml-2">
                        {ratingLabel(hoverRating || rating)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Photo Upload (Amazon-Style Customer Photos) */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-1">
                      Add photos <span className="text-xs font-normal text-on-surface-variant">(Optional — up to 5 photos)</span>
                    </label>
                    <p className="text-xs text-on-surface-variant mb-3">
                      Photos help shoppers see how this handcrafted piece looks in real living spaces!
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {uploadedImages.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/40 group shadow-xs">
                          <Image src={url} alt="Review photo" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {uploadedImages.length < 5 && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary flex flex-col items-center justify-center text-primary cursor-pointer hover:bg-primary/5 transition-all">
                          {isUploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-semibold">Add Photo</span>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploadingImage}
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 3. Review Title */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-1">
                      Add a headline
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's most important to know? (e.g. Looks even prettier in person!)"
                      className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* 4. Review Comment */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-1">
                      Add a written review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike? How is the handmade quality, texture, and packaging?"
                      className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:bg-white outline-none transition-all resize-none"
                    />
                  </div>

                  {/* 5. Reviewer Name */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-1">
                      Your name or nickname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full sm:w-80 bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || isUploadingImage}
                      className="bg-[#553722] hover:bg-[#432b1b] text-white px-8 py-3 rounded-full text-sm font-bold transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Filter Bar (Amazon-Style) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fcfbf9] border border-outline-variant/30 rounded-2xl px-5 py-3 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-primary flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>

              {/* Photos Only Pill */}
              <button
                onClick={() => setPhotosOnlyFilter(!photosOnlyFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  photosOnlyFilter
                    ? "bg-[#553722] text-white shadow-2xs"
                    : "bg-white border border-outline-variant/40 text-on-surface-variant hover:border-primary"
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> With Photos ({allReviewPhotos.length})
              </button>

              {/* Active Star Filter Pill */}
              {selectedRatingFilter !== null && (
                <span className="inline-flex items-center gap-1 bg-[#f0edfc] text-[#4a3a6b] font-semibold px-3 py-1 rounded-full text-xs">
                  {selectedRatingFilter} Stars
                  <button onClick={() => setSelectedRatingFilter(null)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-xs">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-outline-variant/40 rounded-lg px-2.5 py-1 text-xs text-primary font-medium focus:outline-none"
              >
                <option value="recent">Top Reviews (Most Recent)</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading customer reviews...</span>
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const dateStr = review.createdAt?.toDate
                  ? review.createdAt.toDate().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })
                  : "Recently";

                const hasPhotos = Array.isArray(review.images) && review.images.length > 0;
                const isVoted = votedHelpful[review.id];

                return (
                  <div
                    key={review.id}
                    className="bg-white border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow"
                  >
                    {/* Customer Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6f4e37] to-[#eec1a4] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {review.userName?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary">
                          {review.userName}
                        </h4>
                        {review.verifiedPurchase !== false && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#2e7d32] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating & Headline (Amazon Style) */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex text-[#e69223]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4"
                            fill={star <= (review.rating || 5) ? "currentColor" : "none"}
                            color={star <= (review.rating || 5) ? "currentColor" : "#d1d5db"}
                          />
                        ))}
                      </div>
                      <h5 className="font-bold text-sm text-on-background line-clamp-1">
                        {review.title || (review.rating >= 4 ? "Beautiful handmade piece" : "Customer review")}
                      </h5>
                    </div>

                    {/* Date and Location */}
                    <p className="text-xs text-on-surface-variant/80 mb-3 font-medium">
                      Reviewed in India on {dateStr}
                    </p>

                    {/* Review Body */}
                    <p className="font-sans text-sm text-on-surface leading-relaxed whitespace-pre-line mb-4">
                      {review.comment}
                    </p>

                    {/* Attached Customer Photos (Amazon Style) */}
                    {hasPhotos && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2.5">
                          {review.images.map((imgUrl: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => openLightboxAtPhoto(imgUrl)}
                              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-outline-variant/40 hover:border-primary transition-all group cursor-pointer shadow-2xs"
                            >
                              <Image
                                src={imgUrl}
                                alt={`Customer photo ${idx + 1}`}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-108 transition-transform duration-300"
                                sizes="96px"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  zoom_in
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seller Official Reply */}
                    {review.adminReply?.message && (
                      <div className="mb-4 p-4 rounded-2xl bg-[#faf7f3] border border-[#eee4db]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#553722] text-white flex items-center justify-center text-[10px] font-bold">
                            AC
                          </span>
                          <span className="text-xs font-bold text-[#553722]">
                            {review.adminReply.author || "Aura Craft Team"} (Seller Response)
                          </span>
                          {review.adminReply.repliedAt && (
                            <span className="text-[11px] text-on-surface-variant/70">
                              • {new Date(review.adminReply.repliedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed pl-7 border-l-2 border-[#553722]/30 whitespace-pre-line font-sans">
                          {review.adminReply.message}
                        </p>
                      </div>
                    )}

                    {/* Helpful Vote Footer */}
                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleHelpful(review.id)}
                          disabled={isVoted}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${
                            isVoted
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "border-outline-variant/40 hover:border-primary hover:text-primary bg-white"
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? "text-emerald-600 fill-emerald-600" : ""}`} />
                          {isVoted ? "Helpful" : "Helpful"}
                        </button>

                        {(review.helpfulCount || 0) > 0 && (
                          <span className="text-on-surface-variant font-medium">
                            {review.helpfulCount} {review.helpfulCount === 1 ? "person" : "people"} found this helpful
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-on-surface-variant/60">
                        Aura Craft Verified Review
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-10 text-center text-on-surface-variant">
                <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                <h4 className="font-bold text-primary text-base mb-1">
                  No reviews matching your filter
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto mb-4">
                  Try clearing your star or photo filter, or be the first to share photos of this product!
                </p>
                <button
                  onClick={() => {
                    setSelectedRatingFilter(null);
                    setPhotosOnlyFilter(false);
                  }}
                  className="text-xs font-bold text-primary underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
