"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { Star } from "lucide-react";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          where("status", "==", "APPROVED")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Firestore requires composite index for where + orderBy. We will just sort in client for simplicity.
        data.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateB - dateA; // Descending
        });

        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userName: name.trim(),
        rating,
        comment: comment.trim(),
        status: "PENDING",
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setName("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section id="reviews" className="border-t border-outline-variant/30 pt-12 pb-12 mt-12 scroll-mt-24">
      <h2 className="font-display-sm text-primary mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Left: Review Stats & List */}
        <div className="md:col-span-7 space-y-8">
          <div className="flex items-center gap-4 bg-surface-container-low p-6 rounded-2xl">
            <div className="text-center border-r border-outline-variant/30 pr-6">
              <span className="font-display-lg text-primary block">{averageRating}</span>
              <div className="flex text-primary justify-center my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-5 h-5" 
                    fill={star <= Number(averageRating) ? "currentColor" : "none"} 
                    color={star <= Number(averageRating) ? "currentColor" : "#d1d5db"} 
                  />
                ))}
              </div>
              <span className="text-sm text-on-surface-variant">{reviews.length} Reviews</span>
            </div>
            
            <div className="flex-grow pl-2">
              <p className="text-on-surface-variant font-body-md">
                {reviews.length > 0 ? "Read what our customers are saying!" : "No reviews yet. Be the first to share your thoughts!"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <p className="text-on-surface-variant animate-pulse">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-outline-variant/20 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-headline-sm text-on-background">{review.userName}</span>
                    <span className="text-sm text-on-surface-variant">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div className="flex text-primary mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4" fill={star <= review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="font-body-md text-on-surface-variant">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                No approved reviews yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Submit Form */}
        <div className="md:col-span-5">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 soft-shadow sticky top-[100px]">
            <h3 className="font-headline-md text-primary mb-6">Write a Review</h3>
            
            {submitted ? (
              <div className="bg-primary-container text-on-primary-container p-4 rounded-xl border border-primary/20 text-center">
                <p className="font-semibold mb-2">Thank you!</p>
                <p className="text-sm">Your review has been submitted and is waiting for admin approval.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Write another review
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-error text-sm">{error}</p>}
                
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-primary hover:scale-110 transition-transform"
                      >
                        <Star className="w-8 h-8" fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Review</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like about this product?"
                    rows={4}
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
