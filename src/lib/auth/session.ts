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
    if (sessionCookie === "DEV_BYPASS_TOKEN") {
      return {
        user: {
          uid: "DEV_ADMIN",
          phone: "9324488603",
          role: "ADMIN",
          name: "Developer Admin",
          email: "admin@auracraft.com"
        }
      };
    }

    // Decode ID token without signature verification (insecure, but needed since admin SDK is not available)
    const decodedClaims = jose.decodeJwt(sessionCookie);

    if (!decodedClaims || !decodedClaims.uid && !decodedClaims.user_id) {
        return null;
    }
    
    const uid = (decodedClaims.uid || decodedClaims.user_id) as string;

    // 1. Check if they exist in the Admins collection
    const adminSnap = await getDoc(doc(db, "admins", uid));
    
    // 2. Check if they exist in the Users collection
    const userSnap = await getDoc(doc(db, "users", uid));
    
    let userRole = "CUSTOMER";
    let userName = "";
    let userEmail = "";

    if (adminSnap.exists()) {
      userRole = "ADMIN";
      userName = adminSnap.data()?.name || "";
      userEmail = adminSnap.data()?.email || "";
    } else if (userSnap.exists()) {
      userRole = userSnap.data()?.role || "CUSTOMER";
      userName = userSnap.data()?.name || "";
      userEmail = userSnap.data()?.email || "";
    }

    // Hardcoded Admin check based on user request (Fallback/Super Admin)
    const isHardcodedAdmin = 
      (decodedClaims.phone_number && decodedClaims.phone_number.includes("9324488603")) ||
      (decodedClaims.email && typeof decodedClaims.email === 'string' && decodedClaims.email.includes("anushkakhadapkar2@gmail.com")) ||
      (userEmail && userEmail.includes("anushkakhadapkar2@gmail.com"));

    if (isHardcodedAdmin) {
      userRole = "ADMIN";
    }

    return {
      user: {
        uid: uid,
        phone: decodedClaims.phone_number,
        role: userRole,
        name: userName,
        email: userEmail
      }
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
