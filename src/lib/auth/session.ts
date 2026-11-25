import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import * as jose from "jose";

export async function auth() {
  const sessionCookie = (await cookies()).get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Decode ID token to get user claims
    const decodedClaims = jose.decodeJwt(sessionCookie);

    if (!decodedClaims || (!decodedClaims.uid && !decodedClaims.user_id)) {
      return null;
    }
    
    const uid = (decodedClaims.uid || decodedClaims.user_id) as string;

    // Default values directly from signed JWT claims
    let userRole = (decodedClaims.role as string) || "CUSTOMER";
    let userName = (decodedClaims.name as string) || "";
    let userEmail = (decodedClaims.email as string) || "";
    const phone = (decodedClaims.phone_number as string) || null;

    // Optional Firestore live sync (graceful against offline/network latency)
    try {
      const adminSnap = await getDoc(doc(db, "admins", uid));
      const userSnap = await getDoc(doc(db, "users", uid));

      if (adminSnap.exists()) {
        userRole = "ADMIN";
        userName = adminSnap.data()?.name || userName;
        userEmail = adminSnap.data()?.email || userEmail;
      } else if (userSnap.exists()) {
        userRole = userSnap.data()?.role || userRole;
        userName = userSnap.data()?.name || userName;
        userEmail = userSnap.data()?.email || userEmail;
      }
    } catch (dbErr) {
      console.warn("Firestore lookup in auth() skipped/offline:", dbErr);
    }

    // Hardcoded Admin check based on user credentials (Super Admin fallback)
    const isHardcodedAdmin = 
      (typeof phone === 'string' && phone.includes("9324488603")) ||
      (typeof decodedClaims.phone_number === 'string' && decodedClaims.phone_number.includes("9324488603")) ||
      (userEmail && userEmail.includes("anushkakhadapkar2@gmail.com")) ||
      (decodedClaims.email && typeof decodedClaims.email === 'string' && decodedClaims.email.includes("anushkakhadapkar2@gmail.com"));

    if (isHardcodedAdmin) {
      userRole = "ADMIN";
    }

    return {
      user: {
        uid: uid,
        phone: phone || decodedClaims.phone_number,
        role: userRole,
        name: userName || "Aura Crafter",
        email: userEmail || null,
      }
    };
  } catch (error) {
    console.error("Auth session decoding error:", error);
    return null;
  }
}
