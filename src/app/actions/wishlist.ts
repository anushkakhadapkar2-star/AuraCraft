"use server";

import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { revalidatePath } from "next/cache";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, documentId } from "firebase/firestore";

export async function getWishlist() {
  const session = await auth();
  
  if (!session?.user?.uid) {
    return { error: "Unauthorized" };
  }

  try {
    const wishlistSnap = await getDoc(doc(db, "wishlists", session.user.uid));
    
    if (!wishlistSnap.exists()) {
      return { wishlist: { items: [] } };
    }

    const productIds = wishlistSnap.data()?.items || [];
    
    if (productIds.length === 0) {
      return { wishlist: { items: [] } };
    }

    const chunks = [];
    for (let i = 0; i < productIds.length; i += 10) {
      chunks.push(productIds.slice(i, i + 10));
    }

    let fetchedProducts: any[] = [];
    for (const chunk of chunks) {
      const pSnap = await getDocs(query(collection(db, "products"), where(documentId(), "in", chunk)));
      pSnap.docs.forEach(d => fetchedProducts.push({ id: d.id, ...d.data() }));
    }

    return {
      wishlist: {
        items: fetchedProducts.map((p: any) => ({
          productId: p.id,
          product: p
        }))
      }
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch wishlist" };
  }
}

export async function toggleWishlist(productId: string) {
  const session = await auth();
  
  if (!session?.user?.uid) {
    return { error: "Please login to add items to your wishlist" };
  }

  const uid = session.user.uid;

  try {
    const docRef = doc(db, "wishlists", uid);
    const snap = await getDoc(docRef);
    
    let isAdding = true;

    if (!snap.exists()) {
      await setDoc(docRef, { items: [productId] });
    } else {
      const data = snap.data();
      const items = data?.items || [];
      if (items.includes(productId)) {
        await updateDoc(docRef, { items: arrayRemove(productId) });
        isAdding = false;
      } else {
        await updateDoc(docRef, { items: arrayUnion(productId) });
      }
    }

    revalidatePath('/wishlist');
    revalidatePath('/shop');
    revalidatePath(`/product/[slug]`);
    
    return { success: true, action: isAdding ? "added" : "removed" };
  } catch (error) {
    console.error("Wishlist error:", error);
    return { error: "Failed to update wishlist" };
  }
}
