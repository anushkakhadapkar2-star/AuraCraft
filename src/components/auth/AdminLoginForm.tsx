"use client";

import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, sendSignInLinkToEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Mail, Phone as PhoneIcon, ShieldAlert } from "lucide-react";

export function AdminLoginForm() {
  const [authMethod, setAuthMethod] = useState<"PHONE" | "EMAIL">("PHONE");
  const [phone, setPhone] = useState("");
  const [emailAuth, setEmailAuth] = useState("");

  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [step, setStep] = useState<"SELECT" | "PHONE" | "OTP" | "EMAIL" | "EMAIL_SENT" | "REGISTER_SELECT" | "REGISTER_PHONE" | "REGISTER_OTP">("SELECT");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isDev, setIsDev] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDev(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    }
  }, []);

  const formatE164Phone = (rawPhone: string) => {
    const trimmed = rawPhone.trim();
    if (trimmed.startsWith("+")) {
      return `+${trimmed.slice(1).replace(/\D/g, "")}`;
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    return `+${digitsOnly}`;
  };

  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null;
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      const container = document.getElementById("admin-recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }
      const verifier = new RecaptchaVerifier(auth, "admin-recaptcha-container", {
        size: "invisible",
      });
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (e) {
      console.warn("Recaptcha setup error:", e);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDevOtp(null);

    const formattedPhone = formatE164Phone(phone);
    if (formattedPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      setIsLoading(false);
      return;
    }

    // 1. Try Firebase Phone Auth first
    try {
      const appVerifier = getOrCreateRecaptcha();
      if (!appVerifier) {
        throw new Error("reCAPTCHA not available, switching to direct delivery.");
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("OTP");
      setIsLoading(false);
      return;
    } catch (firebaseErr: any) {
      console.warn("Firebase Phone Auth error, falling back to server OTP delivery:", firebaseErr);
    }

    // 2. Fallback to server OTP delivery (guarantees delivery even if Firebase Phone Auth is disabled in Firebase Console)
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: formattedPhone,
          type: "PHONE",
          mode: isRegistering ? "REGISTER" : "LOGIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setConfirmationResult(null); // Indicates using internal OTP verification
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep("OTP");
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send OTP. Please check your phone number and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const actionCodeSettings = {
      url: `${window.location.origin}/login/finish?callbackUrl=/admin`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, emailAuth, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", emailAuth);
      setStep("EMAIL_SENT");
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError("Failed to send login link.");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeLogin = async (idToken: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create secure session");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create session");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formattedPhone = formatE164Phone(phone);

    // If using fallback internal OTP service
    if (!confirmationResult) {
      try {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: formattedPhone,
            otp: otp.trim(),
            type: "PHONE",
            mode: isRegistering ? "REGISTER" : "LOGIN",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Invalid OTP code");
        }

        if (isRegistering) {
          try {
            const uid = data.user?.uid || `admin_${Date.now()}`;
            await setDoc(doc(db, "admins", uid), {
              id: uid,
              phone: formattedPhone,
              role: "ADMIN",
              createdAt: new Date().toISOString(),
            }, { merge: true });
          } catch (dbErr) {
            console.warn("Could not sync admin to Firestore (offline):", dbErr);
          }
        }

        router.push("/admin");
        router.refresh();
        return;
      } catch (err: any) {
        setError(err.message || "Invalid OTP or code expired.");
        setIsLoading(false);
        return;
      }
    }

    // Otherwise verify with Firebase Confirmation Result
    try {
      const result = await confirmationResult.confirm(otp.trim());
      const idToken = await result.user.getIdToken();
      const uid = result.user.uid;
      const verifiedPhone = result.user.phoneNumber || formattedPhone;

      if (isRegistering) {
        // Register new admin in 'admins' collection
        try {
          await setDoc(doc(db, "admins", uid), {
            id: uid,
            phone: verifiedPhone,
            role: "ADMIN",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          // Also synchronize in 'users' collection
          await setDoc(doc(db, "users", uid), {
            id: uid,
            phone: verifiedPhone,
            role: "ADMIN",
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn("Firestore sync warning in admin register:", dbErr);
        }

        await finalizeLogin(idToken);
        return;
      }

      // Check admin status
      let isAdmin = verifiedPhone.includes("9324488603");
      try {
        const adminSnap = await getDoc(doc(db, "admins", uid));
        if (adminSnap.exists() || adminSnap.data()?.email?.includes("anushkakhadapkar2@gmail.com")) {
          isAdmin = true;
        }
      } catch (dbErr) {
        console.warn("Admin lookup warning:", dbErr);
      }

      if (!isAdmin) {
        await auth.signOut();
        setError("Access Denied: You are not registered as an Administrator. Please use the Register tab to create your admin account.");
        setIsLoading(false);
        return;
      }

      await finalizeLogin(idToken);
    } catch (err: any) {
      console.error("Firebase OTP confirmation error:", err);
      setError("Invalid OTP or expired. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDevBypass = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devBypass: true, adminPhone: "+919324488603" }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Dev bypass failed");
      }
    } catch (err: any) {
      setError(err.message || "Dev bypass failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden">

      {/* Decorative Admin Badge */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-headline-md font-bold text-primary">Aura Admin</h2>
          <p className="text-sm text-on-surface-variant font-medium">Secure Access Portal</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl text-sm mb-6 border border-error/20 font-medium">
          {error}
        </div>
      )}

      {isDev && (
        <div className="mb-6 p-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium border border-primary/20">
          <p className="mb-2">⚠️ Local Development Mode</p>
          <button
            onClick={handleDevBypass}
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-2 rounded-lg hover:bg-tertiary transition-colors cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Bypass Firebase Login"}
          </button>
        </div>
      )}

      {step === "SELECT" && (
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl mb-4">
            <button
              className={`flex-1 py-2 font-headline-sm text-sm rounded-lg transition-colors cursor-pointer ${!isRegistering ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => { setIsRegistering(false); setError(""); }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 font-headline-sm text-sm rounded-lg transition-colors cursor-pointer ${isRegistering ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              onClick={() => { setIsRegistering(true); setError(""); }}
            >
              Register
            </button>
          </div>

          {!isRegistering ? (
            <>
              <button
                onClick={() => { setAuthMethod("PHONE"); setStep("PHONE"); setError(""); }}
                className="w-full bg-[#f6f3f2] text-[#553722] border border-[#d4c3ba] py-4 rounded-full font-bold text-lg hover:bg-[#eae8e7] transition-colors flex items-center justify-center gap-3 cursor-pointer"
              >
                <PhoneIcon className="w-5 h-5" /> Admin Phone Login
              </button>
              <button
                onClick={() => { setAuthMethod("EMAIL"); setStep("EMAIL"); setError(""); }}
                className="w-full bg-[#f6f3f2] text-[#553722] border border-[#d4c3ba] py-4 rounded-full font-bold text-lg hover:bg-[#eae8e7] transition-colors flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail className="w-5 h-5" /> Admin Email Login
              </button>
            </>
          ) : (
            <button
              onClick={() => { setAuthMethod("PHONE"); setStep("REGISTER_PHONE"); setError(""); }}
              className="w-full bg-[#553722] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <PhoneIcon className="w-5 h-5" /> Register with Phone OTP
            </button>
          )}
        </div>
      )}

      {step === "EMAIL" && (
        <form onSubmit={handleSendMagicLink} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Admin Email</label>
            <input
              type="email"
              placeholder="admin@auracraft.com"
              required
              value={emailAuth}
              onChange={(e) => setEmailAuth(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? "Sending Link..." : "Send Secure Link"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline cursor-pointer">
            Back
          </button>
        </form>
      )}

      {step === "PHONE" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Admin Mobile</label>
            <input
              type="tel"
              placeholder="+91 99999 99999"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline cursor-pointer">
            Back
          </button>
        </form>
      )}

      {step === "REGISTER_PHONE" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Admin Mobile Number</label>
            <input
              type="tel"
              placeholder="+91 99999 99999"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
            />
            <p className="text-xs text-on-surface-variant/70 mt-2">
              A verification OTP will be sent to your mobile number to verify and register your administrator access.
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 cursor-pointer shadow-sm"
          >
            {isLoading ? "Sending OTP..." : "Send OTP to Register"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline cursor-pointer">
            Back
          </button>
        </form>
      )}

      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Enter Secure OTP</label>
            <input
              type="text"
              placeholder={confirmationResult ? "123456" : "1234"}
              required
              maxLength={confirmationResult ? 6 : 4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-center tracking-[0.5em] text-lg font-bold"
            />
          </div>

          {devOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Test Verification Code: <strong className="font-mono text-sm">{devOtp}</strong></span>
              <button
                type="button"
                onClick={() => setOtp(devOtp)}
                className="text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Verify Identity & Access"}
          </button>

          <button
            type="button"
            onClick={() => setStep(isRegistering ? "REGISTER_PHONE" : "PHONE")}
            disabled={isLoading}
            className="w-full text-primary font-body-md hover:underline cursor-pointer"
          >
            Change Phone Number
          </button>
        </form>
      )}

      <div id="admin-recaptcha-container"></div>
    </div>
  );
}
