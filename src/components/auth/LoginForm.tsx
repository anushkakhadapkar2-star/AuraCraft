"use client";

import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, sendSignInLinkToEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone as PhoneIcon } from "lucide-react";

export function LoginForm() {
  const [authMethod, setAuthMethod] = useState<"PHONE" | "EMAIL">("PHONE");
  const [phone, setPhone] = useState("");
  const [emailAuth, setEmailAuth] = useState("");
  
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [step, setStep] = useState<"SELECT" | "PHONE" | "OTP" | "EMAIL" | "EMAIL_SENT" | "PROFILE">("SELECT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [tempAuthData, setTempAuthData] = useState<{idToken: string, uid: string, phone: string, email?: string} | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const isAdminLoginAttempt = callbackUrl?.includes("/admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
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
      url: `${window.location.origin}/login/finish${isAdminLoginAttempt ? "?callbackUrl=/admin" : ""}`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, emailAuth, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", emailAuth);
      setStep("EMAIL_SENT");
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError("Failed to send login link. Please make sure Email Link is enabled in Firebase Console.");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeLogin = async (idToken: string, isTestAdmin: boolean) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        if (isAdminLoginAttempt) {
          router.push("/admin");
        } else {
          router.push("/");
        }
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

      const userSnap = await getDoc(doc(db, "users", uid));
      
      const isHardcodedAdmin = 
        formattedPhone.includes("9324488603") || 
        (userSnap.exists() && userSnap.data()?.email?.includes("anushkakhadapkar2@gmail.com"));

      if (isAdminLoginAttempt) {
        if (!isHardcodedAdmin && (!userSnap.exists() || userSnap.data()?.role !== "ADMIN")) {
           setError("Access Denied: Admin credentials required.");
           setIsLoading(false);
           return;
        }
      }

      if (!userSnap.exists()) {
        setTempAuthData({ idToken, uid, phone: formattedPhone, email: "" });
        setStep("PROFILE");
        setIsLoading(false);
        return;
      }

      await finalizeLogin(idToken, userSnap.data()?.role === "ADMIN");
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP or expired. Please try again.");
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAuthData) return;
    
    setIsLoading(true);
    setError("");

    try {
      await setDoc(doc(db, "users", tempAuthData.uid), {
        id: tempAuthData.uid,
        phone: authMethod === "PHONE" ? tempAuthData.phone : phone,
        name: name,
        email: authMethod === "EMAIL" ? tempAuthData.email : email,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      });

      await finalizeLogin(tempAuthData.idToken, false);
    } catch (err: any) {
      setError("Failed to save profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="font-display-md text-primary mb-2 hidden md:block">
        {isAdminLoginAttempt ? "Admin Login" : step === "PROFILE" ? "Complete Profile" : "Welcome"}
      </h2>
      <h2 className="font-display-md text-primary mb-2 md:hidden">
        {isAdminLoginAttempt ? "Admin Login" : step === "PROFILE" ? "Complete Profile" : "Welcome to Aura Craft"}
      </h2>
      <p className="text-on-surface-variant font-body-md mb-8 md:text-left">
        {step === "SELECT" && "How would you like to continue?"}
        {step === "PHONE" && "Enter your mobile number to login"}
        {step === "OTP" && "Enter the 6-digit OTP sent to your phone"}
        {step === "EMAIL" && "Enter your email for a magic link"}
        {step === "EMAIL_SENT" && "Check your inbox for the login link!"}
        {step === "PROFILE" && "Just a few more details to create your account"}
      </p>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl text-sm mb-6 border border-error/20 font-medium">
          {error}
        </div>
      )}

      {step === "SELECT" && (
        <div className="space-y-4">
          <button 
            onClick={() => { setAuthMethod("PHONE"); setStep("PHONE"); }}
            className="w-full bg-surface-container-low text-primary border border-outline-variant/50 py-4 btn-radius font-headline-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-3"
          >
            <PhoneIcon className="w-5 h-5" /> Continue with Phone
          </button>
          <button 
            onClick={() => { setAuthMethod("EMAIL"); setStep("EMAIL"); }}
            className="w-full bg-surface-container-low text-primary border border-outline-variant/50 py-4 btn-radius font-headline-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" /> Continue with Email
          </button>
        </div>
      )}

      {step === "EMAIL" && (
        <form onSubmit={handleSendMagicLink} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Email Address</label>
            <input
              type="email"
              placeholder="hello@example.com"
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
            {isLoading ? "Sending Link..." : "Send Magic Link"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline">
            Back to Options
          </button>
        </form>
      )}

      {step === "PHONE" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Mobile Number</label>
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
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
          <button type="button" onClick={() => setStep("SELECT")} className="w-full text-primary font-body-md hover:underline">
            Back to Options
          </button>
        </form>
      )}

      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Enter OTP</label>
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
            {isLoading ? "Verifying..." : "Verify OTP"}
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

      {step === "PROFILE" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Full Name *</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
            />
          </div>
          
          {authMethod === "PHONE" && (
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
              />
            </div>
          )}

          {authMethod === "EMAIL" && (
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Mobile Number *</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      )}

      {/* Invisible Recaptcha */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
