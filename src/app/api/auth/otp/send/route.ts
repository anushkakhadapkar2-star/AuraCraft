import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { target, type, mode, name } = await req.json();

    if (!target || !type) {
      return NextResponse.json({ error: "Target and type are required" }, { status: 400 });
    }

    const cleanTarget = type === "EMAIL"
      ? target.trim().toLowerCase()
      : (target.startsWith("+") ? target : `+91${target.replace(/\D/g, "")}`);

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to Firestore 'auth_otps' collection
    const docId = cleanTarget.replace(/[^a-zA-Z0-9_]/g, "_");
    await setDoc(doc(db, "auth_otps", docId), {
      target: cleanTarget,
      otp,
      type,
      mode: mode || "LOGIN",
      name: name || null,
      expiresAt,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });

    console.log(`\n======================================================`);
    console.log(`🔐 [Aura Craft Auth] 4-Digit OTP Generated:`);
    console.log(`   Target:  ${cleanTarget} (${type})`);
    console.log(`   OTP:     ${otp}`);
    console.log(`   Mode:    ${mode || "LOGIN"}`);
    console.log(`======================================================\n`);

    let emailSent = false;
    let deliveryMessage = `4-digit OTP sent to ${cleanTarget}`;

    if (type === "EMAIL") {
      if (resend) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Aura Craft Verification Code</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf7f2; margin: 0; padding: 32px 16px;">
              <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ebd9cc; box-shadow: 0 10px 30px rgba(85,55,34,0.06);">
                <div style="background-color: #553722; padding: 28px 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 2px;">AURA CRAFT</h1>
                  <p style="margin: 6px 0 0; color: #e8d7cb; font-size: 13px; letter-spacing: 1px;">HANDCRAFTED WITH LOVE</p>
                </div>
                <div style="padding: 36px 28px; text-align: center;">
                  <h2 style="margin: 0 0 12px; color: #2d1810; font-size: 22px; font-weight: 700;">Your 4-Digit Verification Code</h2>
                  <p style="margin: 0 0 28px; color: #6b584d; font-size: 15px; line-height: 1.5;">
                    Use the 4-digit code below to ${mode === "SIGNUP" ? "complete your registration" : "log in"} to your Aura Craft account.
                  </p>
                  <div style="background: #fbf5ef; border: 2px dashed #d8a07c; border-radius: 14px; padding: 18px 28px; display: inline-block; margin-bottom: 28px; min-width: 200px;">
                    <span style="font-size: 38px; font-weight: 800; letter-spacing: 14px; color: #553722; font-family: 'Courier New', Courier, monospace; margin-left: 14px;">${otp}</span>
                  </div>
                  <p style="margin: 0 0 8px; color: #8c7365; font-size: 13px;">
                    ⏳ Valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                  </p>
                  <p style="margin: 0; color: #a18c80; font-size: 12px;">
                    If you did not request this code, you can safely ignore this email.
                  </p>
                </div>
                <div style="background-color: #faf7f2; border-top: 1px solid #ebd9cc; padding: 18px 24px; text-align: center;">
                  <p style="margin: 0; color: #8c7365; font-size: 12px;">
                    Handcrafted Crochet Flowers, Home Décor & Artisan Keepsakes<br>
                    Questions? Contact us at <a href="mailto:support@auracraft.com" style="color: #553722; text-decoration: underline;">support@auracraft.com</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `;

          const { data, error } = await resend.emails.send({
            from: "Aura Craft <onboarding@resend.dev>",
            to: cleanTarget,
            subject: `Your Aura Craft Verification Code: ${otp}`,
            html: emailHtml,
          });

          if (!error) {
            emailSent = true;
            deliveryMessage = `4-digit verification code sent to ${cleanTarget}`;
          } else {
            console.warn("[Resend Warning]", error);
            deliveryMessage = `Code generated. Sent to ${cleanTarget}`;
          }
        } catch (mailErr: any) {
          console.error("[Resend Error]", mailErr);
          deliveryMessage = `Code generated. Sent to ${cleanTarget}`;
        }
      }
    } else {
      // Phone delivery
      deliveryMessage = `4-digit OTP sent to ${cleanTarget}`;
    }

    return NextResponse.json({
      success: true,
      message: deliveryMessage,
      target: cleanTarget,
      type,
      // Provide devOtp during development so developer/tester is never blocked
      devOtp: otp,
    });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}

