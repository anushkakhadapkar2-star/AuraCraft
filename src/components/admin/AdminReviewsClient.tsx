"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import {
  Star,
  CheckCircle,
  Trash2,
  Clock,
  AlertCircle,
  Camera,
  MessageSquare,
  CornerDownRight,
  Edit3,
  X,
  Send,
  Loader2,
  Check,
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Aura Craft Team");
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "reviews"));
      const data = await Promise.all(
        snapshot.docs.map(async (reviewDoc) => {
          const review = { id: reviewDoc.id, ...reviewDoc.data() } as any;
          if (review.productId) {
            try {
              const productSnap = await getDoc(doc(db, "products", review.productId));
              if (productSnap.exists()) {
                const prodData = productSnap.data();
                review.productName = prodData.name || "Handmade Product";
                review.productSlug = prodData.slug || "";
              }
            } catch (e) {
              review.productName = "Unknown Product";
            }
          }
          return review;
        })
      );

      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return timeB - timeA;
      });

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "reviews", id), {
        status: "APPROVED",
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
      );
      showNotification("Review approved and published on storefront.");
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "reviews", reviewToDelete.id));
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      showNotification("Review permanently deleted.");
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const startReply = (review: any) => {
    setReplyingToId(review.id);
    setReplyMessage(review.adminReply?.message || "");
    setReplyAuthor(review.adminReply?.author || "Aura Craft Team");
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyMessage("");
  };

  const handleSaveReply = async (reviewId: string) => {
    if (!replyMessage.trim()) return;
    setIsSavingReply(true);
    try {
      const replyData = {
        message: replyMessage.trim(),
        author: replyAuthor.trim() || "Aura Craft Team",
        repliedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "reviews", reviewId), {
        adminReply: replyData,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, adminReply: replyData } : r
        )
      );

      cancelReply();
      showNotification("Official reply published.");
    } catch (error) {
      console.error("Error replying to review:", error);
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), {
        adminReply: null,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, adminReply: null } : r))
      );
      showNotification("Reply removed.");
    } catch (error) {
      console.error("Error removing reply:", error);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return "Recent";
    const date = val?.toDate ? val.toDate() : new Date(val);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    }
    return "Recent";
  };

  const pendingCount = useMemo(() => reviews.filter((r) => r.status === "PENDING").length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter((r) => r.status === "APPROVED" || r.status === undefined).length, [reviews]);
  const repliedCount = useMemo(() => reviews.filter((r) => !!r.adminReply?.message).length, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === "PENDING" && r.status !== "PENDING") return false;
      if (filter === "APPROVED" && r.status === "PENDING") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const userName = (r.userName || "").toLowerCase();
        const comment = (r.comment || "").toLowerCase();
        const title = (r.title || "").toLowerCase();
        const prod = (r.productName || "").toLowerCase();
        return userName.includes(q) || comment.includes(q) || title.includes(q) || prod.includes(q);
      }
      return true;
    });
  }, [reviews, filter, searchQuery]);

  return (
    <div className="space-y-6 text-[#563A29]">
      {/* Toast Notification */}
      {actionSuccess && (
        <div
          role="status"
          className="fixed top-6 right-6 z-50 bg-[#2B3320] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-[#A4AD91] animate-in fade-in slide-in-from-top-3"
        >
          <Check className="w-4 h-4 text-[#CDAE91]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E9DCCB]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
              Customer Reviews & Testimonials
            </h1>
            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29] animate-pulse"></span>
                {pendingCount} Pending Moderation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F2] text-[#563A29]/70 border border-[#E9DCCB]">
                All Moderated
              </span>
            )}
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Moderate verified buyer reviews, view customer photos, and post official seller replies.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Reviews</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{reviews.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">All ratings received</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Pending Approval</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{pendingCount}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Awaiting moderation</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Live on Store</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{approvedCount}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Published reviews</div>
          </div>
          <div className="bg-gradient-to-br from-[#563A29] to-[#3d2719] text-white rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E9DCCB]/80">Official Replies</div>
            <div className="text-xl font-bold font-serif mt-1">{repliedCount}</div>
            <div className="text-[11px] text-[#CDAE91] mt-0.5 font-medium">Seller responses</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`btn-press px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${filter === "ALL"
                ? "bg-[#563A29] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#563A29]/70 hover:bg-[#E9DCCB]/60"
                }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`btn-press flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${filter === "PENDING"
                ? "bg-[#92400e] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#92400e] hover:bg-[#fef3c7]"
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`btn-press flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${filter === "APPROVED"
                ? "bg-[#0f5223] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#0f5223] hover:bg-[#c3e8ca]/40"
                }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#563A29]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, craft, or text..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl text-xs font-medium text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#563A29]/50 hover:text-[#563A29] p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#563A29] mx-auto mb-2" />
            <p className="text-xs text-[#563A29]/70 font-medium">Loading reviews from database...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#CDAE91] flex items-center justify-center mx-auto mb-4 border border-[#E9DCCB]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#563A29] mb-1">No Reviews Found</h2>
            <p className="text-xs text-[#563A29]/70 max-w-sm mx-auto">
              {searchQuery
                ? `No reviews matched "${searchQuery}". Try a different keyword.`
                : filter === "PENDING"
                  ? "All caught up! There are no new customer reviews waiting for approval."
                  : "No reviews found under this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const isReplying = replyingToId === review.id;
              const hasReply = !!review.adminReply?.message;
              const isPending = review.status === "PENDING";

              return (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#563A29] to-[#CDAE91] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {review.userName?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-[#563A29]">
                            {review.userName}
                          </h3>
                          {review.verifiedPurchase !== false && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f5223] bg-[#c3e8ca]/40 px-2 py-0.5 rounded-full border border-[#86efac]/50">
                              <ShieldCheck className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#92400e] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f5223] bg-[#c3e8ca]/50 px-2 py-0.5 rounded-full border border-[#86efac]">
                              <CheckCircle className="w-3 h-3" /> Live on Store
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <p className="text-xs text-[#563A29]/75 font-medium mt-1">
                          Product:{" "}
                          {review.productSlug ? (
                            <Link
                              href={`/product/${review.productSlug}`}
                              target="_blank"
                              className="font-bold text-[#563A29] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{review.productName || "Handmade Product"}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          ) : (
                            <span className="font-bold text-[#563A29]">
                              {review.productName || "Handmade Product"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#563A29]/60 font-medium shrink-0">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Rating & Headline */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-[#CDAE91]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4"
                          fill={star <= review.rating ? "currentColor" : "none"}
                          color={star <= review.rating ? "currentColor" : "#E9DCCB"}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h4 className="font-bold text-xs sm:text-sm text-[#563A29]">
                        {review.title}
                      </h4>
                    )}
                  </div>

                  {/* Customer Comment */}
                  <p className="text-xs sm:text-sm text-[#563A29]/85 mb-4 whitespace-pre-line leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Customer Photos */}
                  {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-[#E9DCCB]/60">
                      <p className="text-xs font-semibold text-[#563A29] mb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#CDAE91]" /> Customer Photos ({review.images.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {review.images.map((imgUrl: string, idx: number) => (
                          <a
                            key={idx}
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E9DCCB] hover:opacity-85 transition-opacity shadow-2xs group"
                            title="Click to view full image in new tab"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Admin Reply */}
                  {hasReply && !isReplying && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E9DCCB] relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#563A29] text-white flex items-center justify-center text-[10px] font-bold">
                            AC
                          </span>
                          <span className="text-xs font-bold text-[#563A29]">
                            {review.adminReply.author || "Aura Craft Team (Official Response)"}
                          </span>
                          <span className="text-[11px] text-[#563A29]/60">
                            • {formatDate(review.adminReply.repliedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startReply(review)}
                            className="btn-press text-xs text-[#563A29] hover:underline font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#CDAE91]" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReply(review.id)}
                            className="btn-press text-xs text-[#ba1a1a] hover:underline font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#563A29] leading-relaxed whitespace-pre-line pl-8 border-l-2 border-[#563A29]/40">
                        {review.adminReply.message}
                      </p>
                    </div>
                  )}

                  {/* Inline Reply Composer */}
                  {isReplying && (
                    <div className="mt-4 p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#CDAE91] space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#563A29]">
                          <CornerDownRight className="w-4 h-4 text-[#CDAE91]" />
                          <span>{hasReply ? "Edit Official Seller Reply" : "Write Official Seller Reply"}</span>
                        </div>
                        <button
                          onClick={cancelReply}
                          className="text-xs text-[#563A29]/60 hover:text-[#563A29] p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#563A29]/70 mb-1">
                          Reply As (Author Name / Role):
                        </label>
                        <input
                          type="text"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          placeholder="e.g. Aura Craft Team or Lead Artisan"
                          className="w-full sm:w-72 bg-white border border-[#E9DCCB] rounded-xl px-3 py-1.5 text-xs text-[#563A29] font-medium focus:outline-none focus:border-[#563A29]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#563A29]/70 mb-1">
                          Official Response Message:
                        </label>
                        <textarea
                          rows={3}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Thank the customer for their review, answer their questions, or share tips."
                          className="w-full bg-white border border-[#E9DCCB] rounded-xl p-3 text-xs sm:text-sm text-[#563A29] focus:outline-none focus:border-[#563A29] resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelReply}
                          disabled={isSavingReply}
                          className="btn-press px-4 py-2 rounded-xl text-xs font-semibold text-[#563A29]/70 hover:bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReply(review.id)}
                          disabled={isSavingReply}
                          className="btn-press btn-shimmer inline-flex items-center gap-1.5 bg-[#563A29] hover:bg-[#3d2719] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[38px]"
                        >
                          {isSavingReply ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-[#CDAE91]" /> Publish Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="mt-4 pt-3 border-t border-[#E9DCCB]/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!isReplying && !hasReply && (
                        <button
                          onClick={() => startReply(review)}
                          className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7F2] text-[#563A29] border border-[#E9DCCB] hover:bg-[#E9DCCB]/50 transition-all cursor-pointer min-h-[38px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#CDAE91]" />
                          <span>Reply to Review</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {isPending && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="btn-press btn-shimmer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f5223] text-white rounded-xl text-xs font-bold hover:bg-[#0c401b] transition-all cursor-pointer shadow-xs min-h-[38px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => setReviewToDelete(review)}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-red-200 text-[#ba1a1a] rounded-xl text-xs font-semibold hover:bg-red-50 transition-all cursor-pointer min-h-[38px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E9DCCB] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Delete Review?</h3>
                <p className="text-xs text-[#563A29]/70">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#563A29]/80 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#E9DCCB]">
              Are you sure you want to delete the review by <strong className="text-[#563A29]">{reviewToDelete.userName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-[#FAF7F2] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn-press px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 min-h-[44px] inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
