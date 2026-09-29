"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { Star, CheckCircle, Trash2, Clock, AlertCircle } from "lucide-react";

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED">("PENDING");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      // In a real large app, we would paginate and query by status. 
      // For simplicity, we fetch all and filter client-side, but ideally we query by status.
      const snapshot = await getDocs(collection(db, "reviews"));
      const data = await Promise.all(snapshot.docs.map(async (reviewDoc) => {
        const review = { id: reviewDoc.id, ...reviewDoc.data() } as any;
        // Fetch product name to display in the table
        if (review.productId) {
          try {
            const productSnap = await getDoc(doc(db, "products", review.productId));
            if (productSnap.exists()) {
              review.productName = productSnap.data().name;
            }
          } catch (e) {
             review.productName = "Unknown Product";
          }
        }
        return review;
      }));

      // Sort by newest
      data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "reviews", id), {
        status: "APPROVED"
      });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const filteredReviews = reviews.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-outline-variant/30 pb-4">
        <button 
          onClick={() => setFilter("PENDING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "PENDING" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <Clock className="w-5 h-5" />
          Pending Approval ({reviews.filter(r => r.status === "PENDING").length})
        </button>
        <button 
          onClick={() => setFilter("APPROVED")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "APPROVED" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          Approved ({reviews.filter(r => r.status === "APPROVED").length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-on-surface-variant">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertCircle className="w-16 h-16 text-on-surface-variant/30 mb-4" />
          <h2 className="font-headline-md text-primary mb-2">No {filter.toLowerCase()} reviews</h2>
          <p className="text-on-surface-variant max-w-sm">
            {filter === "PENDING" 
              ? "All caught up! There are no new reviews waiting for your approval."
              : "You haven't approved any reviews yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-headline-sm text-on-background">{review.userName}</h3>
                    <p className="text-sm text-primary font-medium">{review.productName || 'Unknown Product'}</p>
                  </div>
                  <span className="text-sm text-on-surface-variant">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                
                <div className="flex text-primary mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4" fill={star <= review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                
                <p className="font-body-md text-on-surface-variant">{review.comment}</p>
              </div>
              
              <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-center">
                {filter === "PENDING" && (
                  <button 
                    onClick={() => handleApprove(review.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-xl hover:bg-[#1b5e20] transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-error text-error rounded-xl hover:bg-error-container transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
