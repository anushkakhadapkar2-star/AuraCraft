import { Metadata } from "next";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db as serverDb } from "@/lib/firebase/client";
import { ReviewsClient } from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Customer Photo Reviews & Community Gallery | Aura Craft",
  description: "Browse authentic customer unboxings, living room decor photos, and genuine reviews from handmade craft lovers across India.",
};

// Force dynamic so new reviews appear immediately
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  // Fetch reviews
  let reviews: any[] = [];
  try {
    const snap = await getDocs(collection(serverDb, "reviews"));
    reviews = snap.docs.map(doc => {
      const data = doc.data();
      const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
      
      let adminReply = null;
      if (data.adminReply) {
        const replyDateObj = data.adminReply.repliedAt?.toDate 
          ? data.adminReply.repliedAt.toDate() 
          : (data.adminReply.repliedAt?.seconds 
              ? new Date(data.adminReply.repliedAt.seconds * 1000) 
              : (typeof data.adminReply.repliedAt === "string" ? new Date(data.adminReply.repliedAt) : null));
        
        adminReply = {
          message: data.adminReply.message || "",
          author: data.adminReply.author || "Aura Craft Team",
          repliedAt: replyDateObj ? replyDateObj.toISOString() : (typeof data.adminReply.repliedAt === "string" ? data.adminReply.repliedAt : null),
        };
      }

      return {
        id: doc.id,
        ...data,
        createdAt: dateObj ? dateObj.toISOString() : null,
        adminReply: adminReply,
      };
    }).filter((r: any) => r.status === "APPROVED" || r.status === undefined);

    // Sort descending by date
    reviews.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
  }

  // Fetch products for selector
  let products: any[] = [];
  try {
    const prodSnap = await getDocs(collection(serverDb, "products"));
    products = prodSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Handcrafted Product",
        slug: data.slug || "",
        imageUrl: data.images?.[0]?.url || data.image || "",
        price: data.price || 0,
      };
    });
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <ReviewsClient 
      initialReviews={reviews} 
      products={products} 
    />
  );
}
