"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginFinishClient() {
  const [status, setStatus] = useState<"VERIFYING" | "NEED_EMAIL" | "NEED_PROFILE" | "SUCCESS" | "ERROR">("VERIFYING");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailForProfile, setEmailForProfile] = useState("");
  const [uid, setUid] = useState("");
  const [idToken, setIdToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const isAdminLoginAttempt = callbackUrl?.includes("/admin");

  useEffect(() => {
    const verifyLink = async () => {
      if (typeof window === "undefined") return;

      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setStatus("ERROR");
        setErrorMsg("This login link is invalid or has expired.");
        return;
      }

      let email = window.localStorage.getItem("emailForSignIn");
      
      // If missing email, prompt user for it
      if (!email) {
        // We could prompt them, but for simplicity we will just throw an error here
        // as a standard flow usually has the email in localStorage (same device).
        setStatus("ERROR");
        setErrorMsg("Email not found. Please open the link on the same device you requested it from.");
        return;
      }

      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("emailForSignIn");

        const token = await result.user.getIdToken();
        const userUid = result.user.uid;

        setIdToken(token);
        setUid(userUid);
        setEmailForProfile(result.user.email || email);

        const userSnap = await getDoc(doc(db, "users", userUid));
        
        if (isAdminLoginAttempt) {
          if (!userSnap.exists() || userSnap.data()?.role !== "ADMIN") {
             setStatus("ERROR");
             setErrorMsg("Access Denied: Admin credentials required.");
             return;
          }
        }

        if (!userSnap.exists()) {
          setStatus("NEED_PROFILE");
          return;
        }

        // If user exists, finalize login
        await finalizeLogin(token, userSnap.data()?.role === "ADMIN");

      } catch (error: any) {
        console.error("Error signing in with email link", error);
        setStatus("ERROR");
        setErrorMsg(error.message || "Failed to sign in. The link may have expired.");
      }
    };

    verifyLink();
  }, [isAdminLoginAttempt]);

  const finalizeLogin = async (token: string, isTestAdmin: boolean) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      if (res.ok) {
        setStatus("SUCCESS");
        if (isAdminLoginAttempt) {
          router.push("/admin/orders");
        } else {
          router.push(isTestAdmin ? "/admin/orders" : "/");
        }
        router.refresh();
      } else {
        throw new Error("Failed to create secure session");
      }
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err.message);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await setDoc(doc(db, "users", uid), {
        id: uid,
        phone: phone,
        name: name,
        email: emailForProfile,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      });

      await finalizeLogin(idToken, false);
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-surface p-8 rounded-3xl border border-outline-variant/30 soft-shadow text-center">
      
      {status === "VERIFYING" && (
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="font-headline-sm text-primary">Verifying Secure Link...</h2>
          <p className="text-sm text-on-surface-variant mt-2">Please wait while we log you in securely.</p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="material-symbols-outlined text-3xl">check</span>
          </div>
          <h2 className="font-headline-sm text-primary">Login Successful!</h2>
          <p className="text-sm text-on-surface-variant mt-2">Redirecting you now...</p>
        </div>
      )}

      {status === "ERROR" && (
        <div className="py-8">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="font-headline-sm text-error mb-2">Login Failed</h2>
          <p className="text-sm text-on-surface-variant mb-6">{errorMsg}</p>
          <button 
            onClick={() => router.push('/login')}
            className="text-primary font-medium hover:underline"
          >
            Return to Login
          </button>
        </div>
      )}

      {status === "NEED_PROFILE" && (
        <div className="text-left">
          <h1 className="font-display-md text-primary text-center mb-2">Complete Profile</h1>
          <p className="text-on-surface-variant font-body-md text-center mb-8">
            Just a few more details to create your account
          </p>

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
            
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Mobile Number *</label>
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
              className="w-full bg-primary text-on-primary py-4 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
