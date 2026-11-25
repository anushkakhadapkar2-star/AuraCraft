import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import * as jose from "jose";

export async function POST(req: Request) {
  try {
    const { uid, email, displayName, photoURL } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Google account must have a verified email." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const effectiveUid = uid || `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Look up user by email in "users" collection
    let userDoc: any = null;
    let userId: string = effectiveUid;

    const q = query(collection(db, "users"), where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (!snap.empty) {
      userDoc = snap.docs[0].data();
      userId = snap.docs[0].id;
    } else {
      // Check admin collection
      const adminQ = query(collection(db, "admins"), where("email", "==", cleanEmail));
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) {
        userDoc = adminSnap.docs[0].data();
        userId = adminSnap.docs[0].id;
      }
    }

    // 2. Hardcoded Admin check
    const isHardcodedAdmin =
      cleanEmail.includes("anushkakhadapkar2@gmail.com") ||
      cleanEmail.includes("admin@auracraft.com") ||
      cleanEmail.includes("9324488603");

    if (!userDoc) {
      // Create new user profile in Firestore
      const newUserData = {
        id: userId,
        name: displayName || cleanEmail.split("@")[0],
        email: cleanEmail,
        avatar: photoURL || null,
        provider: "google",
        role: isHardcodedAdmin ? "ADMIN" : "CUSTOMER",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userId), newUserData);
      userDoc = newUserData;
    } else {
      // Update avatar or name if available
      const updates: any = {};
      if (photoURL && !userDoc.avatar) updates.avatar = photoURL;
      if (displayName && (!userDoc.name || userDoc.name.startsWith("Crafter"))) updates.name = displayName;
      if (Object.keys(updates).length > 0) {
        await setDoc(doc(db, "users", userId), updates, { merge: true });
        userDoc = { ...userDoc, ...updates };
      }
    }

    const finalRole = isHardcodedAdmin ? "ADMIN" : (userDoc.role || "CUSTOMER");

    // 3. Issue signed session JWT
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET || "aura_craft_secure_session_secret_key_2026"
    );

    const sessionToken = await new jose.SignJWT({
      uid: userId,
      user_id: userId,
      email: cleanEmail,
      name: userDoc.name || displayName || "Aura Crafter",
      role: finalRole,
      avatar: userDoc.avatar || photoURL || null,
      provider: "google",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    // 4. Store session in secure HTTP-only cookie
    const host = req.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Signed in with Google successfully!",
      user: {
        id: userId,
        name: userDoc.name,
        email: cleanEmail,
        role: finalRole,
        avatar: userDoc.avatar,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Google login." },
      { status: 500 }
    );
  }
}

