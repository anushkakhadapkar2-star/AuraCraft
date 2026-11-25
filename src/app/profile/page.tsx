import { Metadata } from "next";
import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, query, where, getDocs, documentId } from "firebase/firestore";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: "Your Account | Aura Craft",
  description: "Manage your Aura Craft orders, delivery addresses, profile details, wishlist, and exclusive craft rewards.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.uid) {
    redirect("/login?callbackUrl=/profile");
  }

  const uid = session.user.uid;

  // 1. Fetch User Data
  let userData: any = {
    id: uid,
    name: session.user.name || "Aura Craft Lover",
    email: session.user.email || "",
    phone: session.user.phone || "",
    role: session.user.role || "CUSTOMER",
    createdAt: new Date().toISOString(),
    addresses: [],
    preferences: {
      emailUpdates: true,
      smsOrderUpdates: true,
      festiveOffers: true,
    },
  };

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      const createdDate = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt?.seconds 
            ? new Date(data.createdAt.seconds * 1000).toISOString() 
            : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString()));

      userData = {
        ...userData,
        ...data,
        id: uid,
        name: (data.name && data.name !== "Developer Admin") ? data.name : (session.user.name || "Anushka Khadapkar"),
        email: (data.email && data.email !== "admin@auracraft.com") ? data.email : (session.user.email || "anushkakhadapkar2@gmail.com"),
        phone: data.phone || session.user.phone || "",
        role: session.user.role || data.role || "CUSTOMER",
        createdAt: createdDate,
        addresses: Array.isArray(data.addresses) ? data.addresses : [],
        preferences: data.preferences || userData.preferences,
      };
    }
  } catch (err) {
    console.error("Error fetching user data in ProfilePage:", err);
  }

  // 2. Fetch User Orders with Product Details
  let orders: any[] = [];
  try {
    const ordersSnap = await getDocs(
      query(collection(db, "orders"), where("userId", "==", uid))
    );
    const rawOrders = ordersSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      const orderDate = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt?.seconds 
            ? new Date(data.createdAt.seconds * 1000).toISOString() 
            : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString()));

      return {
        id: docSnap.id,
        ...data,
        createdAt: orderDate,
      };
    });

    // Populate order items product images if missing
    orders = await Promise.all(rawOrders.map(async (order: any) => {
      let enrichedItems = Array.isArray(order.items) ? [...order.items] : [];
      if (enrichedItems.length > 0 && !enrichedItems[0]?.product?.images?.length && enrichedItems[0]?.productId) {
        try {
          const pSnap = await getDoc(doc(db, "products", enrichedItems[0].productId));
          if (pSnap.exists()) {
            const pData = pSnap.data();
            enrichedItems[0] = {
              ...enrichedItems[0],
              product: {
                name: pData.name,
                image: pData.images?.[0]?.url || pData.image || "",
                images: pData.images || [],
                slug: pData.slug || "",
              }
            };
          }
        } catch (e) {}
      }
      return {
        ...order,
        items: enrichedItems,
      };
    }));

    // Sort descending by date
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error fetching user orders:", err);
  }

  // 3. Fetch User Reviews
  let userReviews: any[] = [];
  try {
    const reviewsSnap = await getDocs(
      query(collection(db, "reviews"), where("userId", "==", uid))
    );
    userReviews = reviewsSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      const reviewDate = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt?.seconds 
            ? new Date(data.createdAt.seconds * 1000).toISOString() 
            : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString()));

      let adminReply = null;
      if (data.adminReply) {
        adminReply = {
          message: data.adminReply.message || "",
          author: data.adminReply.author || "Aura Craft Team",
          repliedAt: data.adminReply.repliedAt?.toDate 
            ? data.adminReply.repliedAt.toDate().toISOString()
            : (typeof data.adminReply.repliedAt === "string" ? data.adminReply.repliedAt : null),
        };
      }

      return {
        id: docSnap.id,
        ...data,
        createdAt: reviewDate,
        adminReply,
      };
    });
  } catch (err) {
    console.error("Error fetching user reviews:", err);
  }

  // 4. Fetch Wishlist Items (Amazon/Myntra style)
  let wishlistProducts: any[] = [];
  try {
    const wishlistSnap = await getDoc(doc(db, "wishlists", uid));
    if (wishlistSnap.exists()) {
      const productIds = wishlistSnap.data()?.items;
      if (Array.isArray(productIds) && productIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < productIds.length; i += 10) {
          chunks.push(productIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
          const pSnap = await getDocs(query(collection(db, "products"), where(documentId(), "in", chunk)));
          pSnap.docs.forEach(d => {
            const data = d.data();
            wishlistProducts.push({
              id: d.id,
              name: data.name,
              price: data.price,
              discountPrice: data.discountPrice,
              image: data.images?.[0]?.url || data.image || "",
              slug: data.slug || "",
              category: data.category || "Handmade Crafts",
            });
          });
        }
      }
    }
  } catch (err) {
    console.error("Error fetching wishlist items:", err);
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-on-background py-6 md:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProfileClient
          initialUser={userData}
          initialOrders={orders}
          initialReviews={userReviews}
          wishlistProducts={wishlistProducts}
        />
      </div>
    </div>
  );
}
