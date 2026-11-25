import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import * as jose from "jose";

export async function POST(req: Request) {
  try {
    const { target, otp, type, name, mode } = await req.json();

    if (!target || !otp) {
      return NextResponse.json({ error: "Target and OTP are required" }, { status: 400 });
    }

    const cleanTarget = type === "EMAIL"
      ? target.trim().toLowerCase()
      : (target.startsWith("+") ? target : `+91${target.replace(/\D/g, "")}`);

    const docId = cleanTarget.replace(/[^a-zA-Z0-9_]/g, "_");
    const otpRef = doc(db, "auth_otps", docId);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: "No OTP found or code expired. Please request a new code." }, { status: 400 });
    }

    const otpData = otpSnap.data();

    // Check expiration
    if (Date.now() > otpData.expiresAt) {
      await deleteDoc(otpRef);
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Verify OTP code
    const enteredOtp = otp.toString().trim();
    const storedOtp = otpData.otp.toString().trim();

    if (enteredOtp !== storedOtp) {
      return NextResponse.json({ error: "Invalid OTP. Please check the code and try again." }, { status: 400 });
    }

    // Delete used OTP
    await deleteDoc(otpRef);

    // Look up user in Firestore
    let userDoc: any = null;
    let userId: string = "";

    const fieldToMatch = type === "EMAIL" ? "email" : "phone";
    const userQuery = query(collection(db, "users"), where(fieldToMatch, "==", cleanTarget));
    const userQuerySnap = await getDocs(userQuery);

    if (!userQuerySnap.empty) {
      userDoc = userQuerySnap.docs[0].data();
      userId = userQuerySnap.docs[0].id;
    } else {
      // Check admin collection
      const adminQuery = query(collection(db, "admins"), where(fieldToMatch, "==", cleanTarget));
      const adminQuerySnap = await getDocs(adminQuery);
      if (!adminQuerySnap.empty) {
        userDoc = adminQuerySnap.docs[0].data();
        userId = adminQuerySnap.docs[0].id;
      }
    }

    const isHardcodedAdmin =
      cleanTarget.includes("9324488603") ||
      cleanTarget.includes("anushkakhadapkar2@gmail.com") ||
      cleanTarget.includes("admin@auracraft.com");

    if (!userDoc) {
      // Create new user record
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fallbackName = name?.trim() || (type === "EMAIL" ? cleanTarget.split("@")[0] : `Crafter ${cleanTarget.slice(-4)}`);

      const newUserData = {
        id: userId,
        name: fallbackName,
        email: type === "EMAIL" ? cleanTarget : null,
        phone: type === "PHONE" ? cleanTarget : null,
        role: isHardcodedAdmin ? "ADMIN" : "CUSTOMER",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userId), newUserData);
      userDoc = newUserData;
    } else {
      if (name && (!userDoc.name || userDoc.name.startsWith("Crafter"))) {
        await setDoc(doc(db, "users", userId), { name: name.trim() }, { merge: true });
        userDoc.name = name.trim();
      }
    }

    const finalRole = isHardcodedAdmin ? "ADMIN" : (userDoc.role || "CUSTOMER");

    // Generate signed JWT Session Token
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "aura_craft_secure_session_secret_key_2026");
    const sessionToken = await new jose.SignJWT({
      uid: userId,
      user_id: userId,
      email: userDoc.email || (type === "EMAIL" ? cleanTarget : ""),
      phone_number: userDoc.phone || (type === "PHONE" ? cleanTarget : ""),
      role: finalRole,
      name: userDoc.name || "",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const host = req.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const expiresInSeconds = 60 * 60 * 24 * 7; // 7 days in seconds

    (await cookies()).set("session", sessionToken, {
      maxAge: expiresInSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      path: "/",
      sameSite: "lax",
    });

    console.log(`[Aura Craft Auth] Login successful for ${cleanTarget} as ${finalRole}`);

    return NextResponse.json({
      success: true,
      user: {
        uid: userId,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: finalRole,
      },
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}

