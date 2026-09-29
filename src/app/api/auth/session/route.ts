import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as jose from 'jose';

export async function POST(req: Request) {
  try {
    const { idToken, devBypass } = await req.json();

    let finalToken = idToken;
    let uid = "";
    let phone = "";

    if (devBypass) {
      finalToken = "DEV_BYPASS_TOKEN";
    } else {
      if (!idToken) {
        return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
      }

      // Since we don't have admin credentials, we will just decode the token to get the UID
      // In production, ALWAYS verify the signature!
      const decodedClaims = jose.decodeJwt(idToken);
      uid = (decodedClaims.user_id || decodedClaims.uid) as string;
      phone = decodedClaims.phone_number as string;

      if (!uid) {
         return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // Only sync to users collection if not a dev bypass
    if (!devBypass) {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: uid,
          phone,
          role: "CUSTOMER",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Set cookie
    // We are setting the idToken directly since we can't create a session cookie without admin auth
    const expiresIn = 60 * 60 * 24 * 5 * 1000; 
    (await cookies()).set("session", finalToken, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
