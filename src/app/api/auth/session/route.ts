import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as jose from 'jose';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken, devBypass, adminPhone } = body;

    const host = req.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

    // Local development & localhost bypass support
    if (devBypass && (isLocalhost || process.env.NODE_ENV !== "production")) {
      const devUid = "admin_dev_bypass_uid";
      const devPhone = adminPhone || "+919324488603";

      try {
        await setDoc(doc(db, "admins", devUid), {
          id: devUid,
          phone: devPhone,
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } catch (dbErr) {
        console.warn("Could not sync dev admin to Firestore (offline/network):", dbErr);
      }

      const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "aura_craft_secure_session_secret_key_2026");
      const sessionToken = await new jose.SignJWT({
        uid: devUid,
        user_id: devUid,
        phone_number: devPhone,
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("5d")
        .sign(secret);

      (await cookies()).set("session", sessionToken, {
        maxAge: 60 * 60 * 24 * 5, // 5 days in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" && !isLocalhost,
        path: "/",
        sameSite: "lax",
      });

      return NextResponse.json({ success: true });
    }

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    // Decode and validate token to get user credentials
    const decodedClaims = jose.decodeJwt(idToken);
    const uid = (decodedClaims.user_id || decodedClaims.uid) as string;
    const phone = decodedClaims.phone_number as string;

    if (!uid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Sync user in database if first time login (safe against offline / latency)
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: uid,
          phone: phone || null,
          role: "CUSTOMER",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Could not sync user to Firestore in session route:", dbErr);
    }

    // Set secure HTTP-only session cookie (5 days in seconds)
    const expiresInSeconds = 60 * 60 * 24 * 5; 
    (await cookies()).set("session", idToken, {
      maxAge: expiresInSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  (await cookies()).delete("session");
  return NextResponse.json({ success: true });
}
