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
  
  const [step, setStep] = useState<"SELECT" | "PHONE" | "OTP" | "EMAIL" | "EMAIL_SENT" | "REGISTER_SELECT" | "REGISTER_PHONE" | "REGISTER_OTP">("SELECT");
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isDev, setIsDev] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDev(window.location.hostname === "localhost");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "admin-recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("OTP");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
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
        throw new Error("Failed to create secure session");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!confirmationResult) return;

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const uid = result.user.uid;
      const formattedPhone = result.user.phoneNumber || phone;

      if (isRegistering) {
        if (adminPasscode !== "AURA2026") {
          await auth.signOut();
          setError("Invalid Admin Passcode.");
          setIsLoading(false);
          return;
        }
        
        await setDoc(doc(db, "admins", uid), {
          id: uid,
          phone: formattedPhone,
          role: "ADMIN",
          createdAt: new Date().toISOString()
        });
        
        await finalizeLogin(idToken);
        return;
      }

      // 1. Check if user is in 'admins' collection
      const adminSnap = await getDoc(doc(db, "admins", uid));
      
      const isHardcodedAdmin = 
        formattedPhone.includes("9324488603") || 
        (adminSnap.exists() && adminSnap.data()?.email?.includes("anushkakhadapkar2@gmail.com"));

      if (!adminSnap.exists() && !isHardcodedAdmin) {
        // Not an admin. Sign them out of client auth immediately.
        await auth.signOut();
        setError("Access Denied: You are not registered as an Administrator.");
        setIsLoading(false);
        return;
      }

      // If hardcoded admin and not in admins collection, add them automatically
      if (isHardcodedAdmin && !adminSnap.exists()) {
         await setDoc(doc(db, "admins", uid), {
           id: uid,
           phone: formattedPhone,
           role: "ADMIN",
           createdAt: new Date().toISOString()
         });
      }

      await finalizeLogin(idToken);
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP or expired. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDevBypass = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devBypass: true, adminPhone: "9324488603" }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        throw new Error("Dev bypass failed");
      }
    } catch (err: any) {
      setError(err.message);
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
            className="w-full bg-primary text-on-primary py-2 rounded-lg hover:bg-tertiary transition-colors"
          >
            Bypass Firebase Login
          </button>
        </div>
      )}

      {step === "SELECT" && (
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl mb-4">
             <button 
               className={`flex-1 py-2 font-headline-sm text-sm rounded-lg transition-colors ${!isRegistering ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
               onClick={() => setIsRegistering(false)}
             >
               Login
             </button>
             <button 
               className={`flex-1 py-2 font-headline-sm text-sm rounded-lg transition-colors ${isRegistering ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
               onClick={() => setIsRegistering(true)}
             >
               Register
             </button>
          </div>

          {!isRegistering ? (
            <>
              <button 
                onClick={() => { setAuthMethod("PHONE"); setStep("PHONE"); }}
                className="w-full bg-[#f6f3f2] text-[#553722] border border-[#d4c3ba] py-4 rounded-full font-bold text-lg hover:bg-[#eae8e7] transition-colors flex items-center justify-center gap-3"
              >
                <PhoneIcon className="w-5 h-5" /> Admin Phone Login
              </button>
              <button 
                onClick={() => { setAuthMethod("EMAIL"); setStep("EMAIL"); }}
                className="w-full bg-[#f6f3f2] text-[#553722] border border-[#d4c3ba] py-4 rounded-full font-bold text-lg hover:bg-[#eae8e7] transition-colors flex items-center justify-center gap-3"
              >
                <Mail className="w-5 h-5" /> Admin Email Login
              </button>
            </>
          ) : (
            <button 
                onClick={() => { setAuthMethod("PHONE"); setStep("REGISTER_PHONE"); }}
                className="w-full bg-[#553722] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-colors flex items-center justify-center gap-3"
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
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Sending Link..." : "Send Secure Link"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline">
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
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline">
            Back
          </button>
        </form>
      )}

      {step === "REGISTER_PHONE" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Admin Passcode</label>
            <input
              type="password"
              placeholder="Enter Secret Passcode"
              required
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md mb-4"
            />
            <label className="block font-label-caps text-on-surface-variant mb-2">Mobile Number to Register</label>
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
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Sending OTP..." : "Send OTP to Register"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline">
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
              placeholder="123456"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md text-center tracking-[0.5em]"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Verifying..." : "Verify Identity"}
          </button>
          
          <button 
            type="button" 
            onClick={() => setStep("PHONE")}
            disabled={isLoading}
            className="w-full text-primary font-body-md hover:underline"
          >
            Change Phone Number
          </button>
        </form>
      )}

      <div id="admin-recaptcha-container"></div>
    </div>
  );
}
