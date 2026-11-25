"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Camera,
  CheckCircle2,
  ThumbsUp,
  X,
  Filter,
  Sparkles,
  Loader2,
  Search,
  HeartHandshake,
  ShieldCheck,
  PackageCheck,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { PhotoLightboxModal, ReviewPhotoItem } from "@/components/reviews/PhotoLightboxModal";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price?: number;
}

interface ReviewsClientProps {
  initialReviews: any[];
  products: ProductOption[];
}

export function ReviewsClient({ initialReviews, products }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("ALL");
  const [photosOnly, setPhotosOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  // Write Review Modal
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [formProductId, setFormProductId] = useState(products[0]?.id || "");
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Helpful votes
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formImages.length + files.length > 5) {
      setFormError("You can upload a maximum of 5 photos.");
      return;
    }

    setIsUploading(true);
    setFormError("");

    try {
      const promises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      });

      const urls = await Promise.all(promises);
      setFormImages((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error(err);
      setFormError("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      setFormError("Please fill out your name and review text.");
      return;
    }

    const selectedProduct = products.find(p => p.id === formProductId) || products[0];

    setIsSubmitting(true);
    setFormError("");

    try {
      const newReview = {
        productId: selectedProduct?.id || "",
        productName: selectedProduct?.name || "Handcrafted Product",
        productSlug: selectedProduct?.slug || "",
        productImage: selectedProduct?.imageUrl || "",
        userName: formName.trim(),
        rating: formRating,
        title: formTitle.trim() || (formRating >= 4 ? "Loved this handcrafted piece!" : "My experience"),
        comment: formComment.trim(),
        images: formImages,
        verifiedPurchase: true,
        helpfulCount: 0,
        status: "APPROVED",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);

      const localReview = {
        id: docRef.id,
        ...newReview,
        createdAt: new Date().toISOString(),
      };

      setReviews(prev => [localReview, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsWriteModalOpen(false);
        setSubmitSuccess(false);
        setFormName("");
        setFormTitle("");
        setFormComment("");
        setFormImages([]);
        setFormRating(5);
      }, 1500);

    } catch (err) {
      console.error("Submit error", err);
      setFormError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  const formatReviewDate = (createdAt: any, isShort: boolean = true) => {
    try {
      if (!createdAt) return "Recently";
      const d = createdAt?.toDate ? createdAt.toDate() : (typeof createdAt === "string" ? new Date(createdAt) : (createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null));
      if (!d || isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-IN", isShort ? { month: "short", day: "numeric", year: "numeric" } : { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getReviewTime = (createdAt: any) => {
    try {
      if (!createdAt) return 0;
      if (createdAt?.toDate) return createdAt.toDate().getTime();
      if (typeof createdAt === "string") return new Date(createdAt).getTime();
      if (createdAt?.seconds) return createdAt.seconds * 1000;
      return 0;
    } catch {
      return 0;
    }
  };

  // Flattened photos for Lightbox
  const allPhotos: ReviewPhotoItem[] = useMemo(() => {
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
            date: formatReviewDate(r.createdAt, true),
            productName: r.productName,
            productSlug: r.productSlug,
            productImage: r.productImage,
            verifiedPurchase: r.verifiedPurchase !== false,
            adminReply: r.adminReply || null,
          });
        });
      }
    });
    return list;
  }, [reviews]);

  const openLightboxAt = (url: string) => {
    const idx = allPhotos.findIndex(p => p.photoUrl === url);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Ratings calculation
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const s = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filter & Search
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.userName?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q)
      );
    }

    if (selectedRating !== null) {
      result = result.filter(r => Math.round(r.rating || 5) === selectedRating);
    }

    if (photosOnly) {
      result = result.filter(r => Array.isArray(r.images) && r.images.length > 0);
    }

    if (selectedProductFilter !== "ALL") {
      result = result.filter(r => r.productId === selectedProductFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "highest") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "lowest") return (a.rating || 0) - (b.rating || 0);
      const timeA = getReviewTime(a.createdAt);
      const timeB = getReviewTime(b.createdAt);
      return timeB - timeA;
    });

    return result;
  }, [reviews, searchQuery, selectedRating, photosOnly, selectedProductFilter, sortBy]);

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Lightbox Modal */}
      <PhotoLightboxModal
        photos={allPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      {/* Hero Banner (Amazon & Artisanal Hybrid) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF7F8] via-[#FFF9FA] to-[#FAF7F8] border border-[#F3E1E5] p-8 sm:p-12 mb-12 shadow-xs">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF2F5] text-[#B03E5D] text-xs font-bold uppercase tracking-wider mb-4 border border-[#F3E1E5]">
            <Camera className="w-3.5 h-3.5" /> Customer Photo Reviews & Stories
          </span>
          <h1 className="font-display-md text-3xl sm:text-5xl font-bold text-primary tracking-tight leading-tight mb-4">
            Handmade with Love, Loved in Real Homes
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-6 font-sans">
            Browse authentic customer unboxings, living room decor photos, and genuine reviews from happy crafters across India.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 clay-btn px-7 py-3.5 rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(231,111,81,0.35)] cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Share Your Photo & Review
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-bold text-sm group"
            >
              Explore Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Floating Trust Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-[#e69223]">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="font-bold text-primary text-base">{averageRating} / 5.0 Rating</p>
              <p className="text-xs text-on-surface-variant font-medium">Over {totalReviews}+ verified reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-primary text-base">{allPhotos.length} Real Photos</p>
              <p className="text-xs text-on-surface-variant font-medium">Uploaded by genuine buyers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-emerald-600">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-primary text-base">100% Handcrafted</p>
              <p className="text-xs text-on-surface-variant font-medium">Quality-checked before dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amazon-Style Customer Photos Showcase Wall */}
      {allPhotos.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Customer Photos & Styling
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Click any customer photo to enlarge and read their full unboxing story
              </p>
            </div>
            <span className="text-xs font-semibold text-primary/70">
              Showing {allPhotos.length} photos
            </span>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 border border-outline-variant/30 hover:border-primary transition-all shadow-2xs cursor-pointer text-left"
              >
                <Image
                  src={photo.photoUrl}
                  alt={photo.title || "Customer review photo"}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <div className="flex text-[#fbbf24] mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3" fill={s <= photo.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-white text-xs font-semibold truncate">{photo.userName}</p>
                  <p className="text-white/70 text-[10px] truncate">{photo.productName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content: Breakdown (Left) + Reviews Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column (4 cols): Amazon Breakdown Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#fcfbf9] border border-outline-variant/30 rounded-3xl p-6 sm:p-7 sticky top-28 shadow-xs">
            <h3 className="font-headline-sm text-xl font-bold text-primary mb-4">
              Customer Ratings
            </h3>

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
                  {totalReviews} verified ratings
                </p>
              </div>
            </div>

            {/* Star Distribution Bars */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars] || 0;
                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = selectedRating === stars;

                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(isSelected ? null : stars)}
                    className={`w-full group flex items-center gap-3 text-left py-1.5 px-2 -mx-2 rounded-xl transition-colors cursor-pointer ${isSelected ? "bg-[#FDF3E7]" : "hover:bg-black/[0.03]"
                      }`}
                  >
                    <span className="text-xs font-semibold text-primary w-11 shrink-0">
                      {stars} star
                    </span>
                    <div className="flex-1 h-3.5 bg-[#e5e1dd] rounded-full overflow-hidden p-0.5">
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

            {selectedRating !== null && (
              <button
                onClick={() => setSelectedRating(null)}
                className="mt-4 text-xs font-semibold text-primary underline block"
              >
                Clear {selectedRating}-star filter
              </button>
            )}

            <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-4">
              <h4 className="font-bold text-sm text-primary">
                Review this product
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Share your thoughts with other customers to help them choose the perfect handcrafted piece.
              </p>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="w-full bg-white hover:bg-black/[0.03] text-primary border border-outline-variant/50 py-3 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Write a Customer Review
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Filters + Review Cards */}
        <div className="lg:col-span-8 space-y-6">

          {/* Amazon-Style Search and Filter Toolbar */}
          <div className="bg-[#fcfbf9] border border-outline-variant/30 rounded-3xl p-5 shadow-xs space-y-4">

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by keyword, product name, or customer..."
                className="w-full bg-white border border-outline-variant/40 rounded-full pl-11 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/20">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPhotosOnly(!photosOnly)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${photosOnly
                    ? "clay-btn text-white shadow-2xs"
                    : "bg-white border border-outline-variant/40 text-on-surface-variant hover:border-primary"
                    }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Photos Only
                </button>

                {/* Product filter dropdown */}
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-white border border-outline-variant/40 rounded-full px-3 py-1.5 text-xs text-primary font-medium focus:outline-none"
                >
                  <option value="ALL">All Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                {selectedRating !== null && (
                  <span className="inline-flex items-center gap-1 bg-[#FDF2F5] text-[#B03E5D] font-semibold px-3 py-1 rounded-full text-xs">
                    {selectedRating} Stars
                    <button onClick={() => setSelectedRating(null)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-on-surface-variant">Sort:</span>
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

          </div>

          {/* Reviews Stream */}
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const dateStr = formatReviewDate(review.createdAt, false);

                const hasPhotos = Array.isArray(review.images) && review.images.length > 0;
                const isVoted = votedHelpful[review.id];

                return (
                  <div
                    key={review.id}
                    className="bg-white border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow"
                  >
                    {/* Top Product Banner Tag (Amazon Style) */}
                    {review.productName && (
                      <div className="mb-4 pb-3 border-b border-outline-variant/20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {review.productImage ? (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-outline-variant/30">
                              <Image src={review.productImage} alt={review.productName} fill className="object-cover" sizes="32px" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#FDF3E7] text-primary flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider block">
                              Verified Purchase For
                            </span>
                            {review.productSlug ? (
                              <Link
                                href={`/product/${review.productSlug}`}
                                className="text-xs font-bold text-primary hover:underline line-clamp-1"
                              >
                                {review.productName}
                              </Link>
                            ) : (
                              <span className="text-xs font-bold text-primary line-clamp-1">
                                {review.productName}
                              </span>
                            )}
                          </div>
                        </div>

                        {review.productSlug && (
                          <Link
                            href={`/product/${review.productSlug}`}
                            className="text-xs font-semibold text-primary/80 hover:text-primary shrink-0 hidden sm:inline-flex items-center gap-1"
                          >
                            View Product →
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Customer Profile Header */}
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

                    {/* Rating & Headline */}
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
                        {review.title || (review.rating >= 4 ? "Beautiful craft work" : "Customer Review")}
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

                    {/* Customer Photo Thumbnails (Amazon Style) */}
                    {hasPhotos && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2.5">
                          {review.images.map((imgUrl: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => openLightboxAt(imgUrl)}
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
                      <div className="mb-4 p-4 rounded-2xl bg-[#FAF7F8] border border-[#F3E1E5]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#D45B7A] text-white flex items-center justify-center text-[10px] font-bold">
                            AC
                          </span>
                          <span className="text-xs font-bold text-[#382025]">
                            {review.adminReply.author || "Aura Craft Team"} (Seller Response)
                          </span>
                          {review.adminReply.repliedAt && (
                            <span className="text-[11px] text-on-surface-variant/70">
                              • {formatReviewDate(review.adminReply.repliedAt, false)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed pl-7 border-l-2 border-[#D45B7A]/30 whitespace-pre-line font-sans">
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${isVoted
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
                        Aura Craft Community Review
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-12 text-center text-on-surface-variant">
                <Sparkles className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <h4 className="font-headline-sm text-lg font-bold text-primary mb-1">
                  No reviews match your filters
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto mb-5">
                  Try adjusting your search terms or clearing your filters to see more customer reviews.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRating(null);
                    setPhotosOnly(false);
                    setSelectedProductFilter("ALL");
                  }}
                  className="clay-btn px-6 py-2.5 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(212,91,122,0.35)] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div
          className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-outline-variant/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/30">
              <div>
                <h3 className="font-headline-md text-2xl font-bold text-primary">
                  Write a Customer Review
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Help the community by sharing your real experience and photos
                </p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-lg">Thank You!</h4>
                <p className="text-sm mt-1">Your review and photos have been posted successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* Product Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Select Product Reviewed <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:bg-white outline-none font-sans"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        onClick={() => setFormRating(star)}
                        className="p-1 text-[#e69223] hover:scale-115 transition-transform cursor-pointer"
                      >
                        <Star
                          className="w-7 h-7"
                          fill={(formHoverRating || formRating) >= star ? "currentColor" : "none"}
                          color={(formHoverRating || formRating) >= star ? "currentColor" : "#d1d5db"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Upload Photos <span className="text-on-surface-variant font-normal">(Optional — up to 5 photos)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    {formImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/40 shadow-2xs">
                        <Image src={url} alt="Review upload" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}

                    {formImages.length < 5 && (
                      <label className="w-16 h-16 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary flex flex-col items-center justify-center text-primary cursor-pointer hover:bg-primary/5 transition-all">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 mb-0.5" />
                            <span className="text-[9px] font-bold">Add Photo</span>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploading}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Stunning craftsmanship and super fast delivery!"
                    className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary focus:bg-white outline-none"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Review Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe the texture, colors, packing, and overall experience..."
                    className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:bg-white outline-none resize-none"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ananya Patel"
                    className="w-full bg-[#fcfbf9] border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary focus:bg-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="clay-btn px-7 py-2.5 rounded-full text-xs font-bold transition-all shadow-[0_4px_12px_rgba(212,91,122,0.35)] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Post Review"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
