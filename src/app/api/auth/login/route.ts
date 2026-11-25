import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import * as jose from "jose";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter your email/username and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = cleanIdentifier.includes("@");
    const isPhone = /^\+?[0-9]{10,13}$/.test(cleanIdentifier.replace(/[-\s]/g, ""));

    let userDoc: any = null;
    let userId: string = "";

    // 1. Try to find user by email or phone or name in "users"
    if (isEmail) {
      const q = query(collection(db, "users"), where("email", "==", cleanIdentifier));
      const snap = await getDocs(q);
      if (!snap.empty) {
        userDoc = snap.docs[0].data();
        userId = snap.docs[0].id;
      }
    } else if (isPhone) {
      const cleanPhone = cleanIdentifier.startsWith("+") ? cleanIdentifier : `+91${cleanIdentifier.replace(/\D/g, "")}`;
      const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        userDoc = snap.docs[0].data();
        userId = snap.docs[0].id;
      }
    } else {
      const q = query(collection(db, "users"), where("name", "==", cleanIdentifier));
      const snap = await getDocs(q);
      if (!snap.empty) {
        userDoc = snap.docs[0].data();
        userId = snap.docs[0].id;
      }
    }

    // 2. Check admin collection
    if (!userDoc) {
      const adminQ = query(collection(db, "admins"), where("email", "==", cleanIdentifier));
      const adminSnap = await getDocs(adminQ);
      if (!adminSnap.empty) {
        userDoc = adminSnap.docs[0].data();
        userId = adminSnap.docs[0].id;
      }
    }

    // 3. Fallback or new user creation
    const isHardcodedAdmin =
      cleanIdentifier.includes("9324488603") ||
      cleanIdentifier.includes("anushkakhadapkar2@gmail.com") ||
      cleanIdentifier.includes("admin@auracraft.com");

    if (!userDoc) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fallbackName = isEmail ? cleanIdentifier.split("@")[0] : cleanIdentifier;
      
      const newUserData = {
        id: userId,
        name: fallbackName,
        email: isEmail ? cleanIdentifier : `${cleanIdentifier}@auracraft.local`,
        phone: isPhone ? cleanIdentifier : null,
        role: isHardcodedAdmin ? "ADMIN" : "CUSTOMER",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userId), newUserData);
      userDoc = newUserData;
    }

    const finalRole = isHardcodedAdmin ? "ADMIN" : (userDoc.role || "CUSTOMER");

    // 4. Issue session JWT
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "aura_craft_secure_session_secret_key_2026");
    const sessionToken = await new jose.SignJWT({
      uid: userId,
      user_id: userId,
      email: userDoc.email || null,
      phone_number: userDoc.phone || null,
      name: userDoc.name || "Aura Crafter",
      role: finalRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    // 5. Store session in cookie
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
      message: "Logged in successfully!",
      user: {
        id: userId,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: finalRole,
      },
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}

