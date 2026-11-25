"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Phone as PhoneIcon, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  X
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const isAdminLoginAttempt = callbackUrl?.includes("/admin");

  // Mode: "PASSWORD" (Default matching reference image) or "OTP"
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");

  // Saved / Previous Account (Myntra/Amazon style)
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Password Login Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login Fields
  const [otpTarget, setOtpTarget] = useState("");
  const [otpType, setOtpType] = useState<"PHONE" | "EMAIL">("PHONE");
  const [otpStep, setOtpStep] = useState<"INPUT" | "VERIFY">("INPUT");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [googleDisabledError, setGoogleDisabledError] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const emailContainerRef = useRef<HTMLDivElement>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Load previous account on mount (Amazon / Myntra style)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("aura_craft_last_email");
      const name = localStorage.getItem("aura_craft_last_name");
      if (email) {
        setSavedEmail(email);
        setSavedName(name || email.split("@")[0]);
        setIdentifier(email); // Pre-fill like Amazon
      }
    }
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Select recommended account (Myntra style)
  const handleSelectAccount = (email: string) => {
    setIdentifier(email);
    setShowSuggestions(false);
    passwordInputRef.current?.focus();
  };

  // Remove saved account from device
  const handleRemoveSavedAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      localStorage.removeItem("aura_craft_last_email");
      localStorage.removeItem("aura_craft_last_name");
    }
    setSavedEmail(null);
    setSavedName(null);
    setIdentifier("");
    setShowSuggestions(false);
  };

  // 1. Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setGoogleDisabledError(false);

    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const cleanId = identifier.trim();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: cleanId,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      // Save email for next time
      if (cleanId.includes("@") && typeof window !== "undefined") {
        localStorage.setItem("aura_craft_last_email", cleanId);
      }

      setSuccessMsg("Logged in successfully! Redirecting...");

      const isAdmin = data.user?.role === "ADMIN";
      setTimeout(() => {
        if (isAdminLoginAttempt) {
          if (!isAdmin) {
            setError("Access Denied: Administrator privileges required.");
            setIsLoading(false);
            return;
          }
          if (typeof window !== "undefined" && window.location.port === "3000") {
            window.location.href = "http://localhost:3001/admin";
            return;
          }
          router.push("/admin");
          return;
        }

        if (isAdmin && callbackUrl?.includes("/admin")) {
          router.push("/admin");
        } else if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  // 2. Real Google Sign In (recommends previous email via prompt: select_account)
  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setGoogleDisabledError(false);
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("Unable to retrieve email from your Google account.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("aura_craft_last_email", user.email);
        if (user.displayName) {
          localStorage.setItem("aura_craft_last_name", user.displayName);
        }
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create session with Google");
      }

      setSuccessMsg(`Welcome, ${user.displayName || user.email}! Redirecting...`);

      const isAdmin = data.user?.role === "ADMIN";
      setTimeout(() => {
        if (isAdminLoginAttempt) {
          if (!isAdmin) {
            setError("Access Denied: Administrator privileges required.");
            setIsLoading(false);
            return;
          }
          if (typeof window !== "undefined" && window.location.port === "3000") {
            window.location.href = "http://localhost:3001/admin";
            return;
          }
          router.push("/admin");
          return;
        }

        if (isAdmin && callbackUrl?.includes("/admin")) {
          router.push("/admin");
        } else if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setGoogleDisabledError(true);
        if (!identifier && savedEmail) {
          setIdentifier(savedEmail);
        }
      } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setError("Google sign-in popup was closed.");
      } else {
        setError(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle OTP Send
  const handleSendOtp = async (customTarget?: string, customType?: "PHONE" | "EMAIL") => {
    setError("");
    setSuccessMsg("");

    const targetToSend = customTarget || otpTarget;
    const typeToSend = customType || otpType;

    if (!targetToSend.trim()) {
      setError(`Please enter your ${typeToSend === "PHONE" ? "phone number" : "email"}.`);
      return;
    }

    const cleanTarget = typeToSend === "EMAIL"
      ? targetToSend.trim().toLowerCase()
      : (targetToSend.startsWith("+") ? targetToSend : `+91${targetToSend.replace(/\D/g, "")}`);

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: cleanTarget,
          type: typeToSend,
          mode: "LOGIN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setSuccessMsg(data.message || "4-digit OTP sent successfully!");
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setOtpStep("VERIFY");
      setResendCooldown(30);

      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "Unable to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle OTP Digits
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 3);
    otpRefs[nextIdx].current?.focus();
  };

  // 5. Handle OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length < 4) {
      setError("Please enter the complete 4-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const cleanTarget = otpType === "EMAIL"
        ? otpTarget.trim().toLowerCase()
        : (otpTarget.startsWith("+") ? otpTarget : `+91${otpTarget.replace(/\D/g, "")}`);

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: cleanTarget,
          type: otpType,
          otp: fullOtp,
          mode: "LOGIN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      if (otpType === "EMAIL" && typeof window !== "undefined") {
        localStorage.setItem("aura_craft_last_email", cleanTarget);
      }

      setSuccessMsg("Verified successfully! Redirecting...");

      const isAdmin = data.user?.role === "ADMIN";
      setTimeout(() => {
        if (isAdminLoginAttempt) {
          if (!isAdmin) {
            setError("Access Denied: Administrator privileges required.");
            setIsLoading(false);
            return;
          }
          if (typeof window !== "undefined" && window.location.port === "3000") {
            window.location.href = "http://localhost:3001/admin";
            return;
          }
          router.push("/admin");
          return;
        }

        if (isAdmin && callbackUrl?.includes("/admin")) {
          router.push("/admin");
        } else if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP. Please check and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[36px] p-5 sm:p-6 shadow-[0_14px_34px_rgba(212,91,122,0.14),_0_2px_8px_rgba(56,32,37,0.04),_inset_0_2px_4px_rgba(255,255,255,0.9)] relative z-20">
      
      {/* Mode Switcher: Password vs 4-Digit OTP */}
      <div className="flex bg-[#FDF2F5] p-1 rounded-2xl mb-4 border border-[#F3E1E5]">
        <button
          type="button"
          onClick={() => { setLoginMode("PASSWORD"); setError(""); setSuccessMsg(""); setGoogleDisabledError(false); }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            loginMode === "PASSWORD" 
              ? "bg-white text-[#D45B7A] shadow-[0_2px_6px_rgba(212,91,122,0.2)]" 
              : "text-[#8B5E6B] hover:text-[#D45B7A]"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setLoginMode("OTP"); setError(""); setSuccessMsg(""); setGoogleDisabledError(false); }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            loginMode === "OTP" 
              ? "bg-white text-[#D45B7A] shadow-[0_2px_6px_rgba(212,91,122,0.2)]" 
              : "text-[#8B5E6B] hover:text-[#D45B7A]"
          }`}
        >
          4-Digit OTP
        </button>
      </div>

      {/* Google Sign-in Not Enabled Warning & Helper */}
      {googleDisabledError && (
        <div className="mb-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/90 text-amber-900 text-xs animate-in fade-in slide-in-from-top-1 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 text-xs">Google Sign-in not enabled in Firebase</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                In your Firebase Console, turn on Google under <strong>Authentication &rarr; Sign-in method</strong>.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
            <a
              href="https://console.firebase.google.com/project/aura-craft-1bae8/authentication/providers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-700 text-white font-bold text-[10px] hover:bg-amber-800 transition-colors shadow-2xs"
            >
              <span>Enable in Firebase</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => {
                const target = identifier || savedEmail || "anushkakhadapkar2@gmail.com";
                setLoginMode("OTP");
                setOtpType("EMAIL");
                setOtpTarget(target);
                handleSendOtp(target, "EMAIL");
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[10px] hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span>Instant OTP to {identifier || savedEmail || "Email"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && !googleDisabledError && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MODE 1: PASSWORD LOGIN */}
      {loginMode === "PASSWORD" && (
        <form onSubmit={handlePasswordLogin} className="space-y-3.5" autoComplete="on">
          
          {/* Email or Username Input with Myntra/Amazon style focus suggestion dropdown */}
          <div ref={emailContainerRef} className="relative">
            <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-[22px] p-1.5 pr-3 transition-all focus-within:bg-white focus-within:border-[#F2A4B7] focus-within:ring-4 focus-within:ring-[#F8CAD5]/30 shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]">
              <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shrink-0 mr-3 shadow-[0_4px_10px_rgba(212,91,122,0.35),_inset_0_1px_2px_rgba(255,255,255,0.6)]">
                <User className="w-5 h-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username email"
                inputMode="email"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Email or Username"
                required
                disabled={isLoading}
                className="w-full bg-transparent border-none text-[#382025] placeholder-[#B08B95] text-sm font-medium focus:outline-hidden disabled:opacity-60"
              />

              {/* Clear / Change button if value is filled */}
              {identifier && (
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier("");
                    setShowSuggestions(true);
                  }}
                  className="text-xs font-bold text-[#D45B7A] hover:text-[#382025] px-2 py-1 rounded-md hover:bg-[#FDF2F5] transition-colors cursor-pointer shrink-0"
                  title="Clear or change account"
                >
                  Change
                </button>
              )}
            </div>

            {/* Myntra / Amazon Style Autocomplete Dropdown */}
            {showSuggestions && savedEmail && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-[0_12px_32px_rgba(212,91,122,0.18)] border border-[#F3E1E5] p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E6B] px-2 py-1 mb-1">
                  Saved Account
                </div>
                <div
                  onClick={() => handleSelectAccount(savedEmail)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FDF2F5] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {savedEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate text-left">
                      <div className="font-semibold text-xs text-[#382025] truncate group-hover:text-[#D45B7A]">
                        {savedEmail}
                      </div>
                      <div className="text-[10px] text-[#8B5E6B]">
                        {savedName || "Previously used on this device"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveSavedAccount}
                    className="text-[#F2A4B7] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                    title="Remove from saved accounts"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-[22px] p-1.5 pr-4 transition-all focus-within:bg-white focus-within:border-[#F2A4B7] focus-within:ring-4 focus-within:ring-[#F8CAD5]/30 shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]">
            <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shrink-0 mr-3 shadow-[0_4px_10px_rgba(212,91,122,0.35),_inset_0_1px_2px_rgba(255,255,255,0.6)]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
              className="w-full bg-transparent border-none text-[#382025] placeholder-[#B08B95] text-sm font-medium focus:outline-hidden disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#B08B95] hover:text-[#D45B7A] transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-semibold text-[#D45B7A] hover:text-[#382025] hover:underline transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* 3D Clay Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 mt-2 rounded-[22px] bg-gradient-to-b from-[#F2A4B7] to-[#D45B7A] text-white font-bold text-base tracking-wide shadow-[0_8px_20px_rgba(212,91,122,0.4),_inset_0_2px_4px_rgba(255,255,255,0.7),_inset_0_-3px_6px_rgba(130,30,55,0.35)] hover:shadow-[0_12px_26px_rgba(212,91,122,0.5),_inset_0_2px_4px_rgba(255,255,255,0.8)] active:translate-y-0.5 active:shadow-[0_3px_10px_rgba(212,91,122,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      )}

      {/* MODE 2: 4-DIGIT REAL-TIME OTP LOGIN */}
      {loginMode === "OTP" && (
        <div>
          {otpStep === "INPUT" ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-3.5">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setOtpType("PHONE")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    otpType === "PHONE" 
                      ? "border-[#F2A4B7] bg-[#FFF9FA] text-[#D45B7A]" 
                      : "border-transparent text-[#8B5E6B]"
                  }`}
                >
                  <PhoneIcon className="w-3.5 h-3.5" /> Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => setOtpType("EMAIL")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    otpType === "EMAIL" 
                      ? "border-[#F2A4B7] bg-[#FFF9FA] text-[#D45B7A]" 
                      : "border-transparent text-[#8B5E6B]"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>

              <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-[22px] p-1.5 pr-4 transition-all focus-within:bg-white focus-within:border-[#F2A4B7] focus-within:ring-4 focus-within:ring-[#F8CAD5]/30 shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]">
                <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shrink-0 mr-3 shadow-[0_4px_10px_rgba(212,91,122,0.35),_inset_0_1px_2px_rgba(255,255,255,0.6)]">
                  {otpType === "PHONE" ? <PhoneIcon className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type={otpType === "PHONE" ? "tel" : "email"}
                  value={otpTarget}
                  onChange={(e) => setOtpTarget(e.target.value)}
                  placeholder={otpType === "PHONE" ? "Enter 10-digit mobile number" : "Enter your email"}
                  required
                  disabled={isLoading}
                  className="w-full bg-transparent border-none text-[#382025] placeholder-[#B08B95] text-sm font-medium focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 mt-2 rounded-[22px] bg-gradient-to-b from-[#F2A4B7] to-[#D45B7A] text-white font-bold text-base tracking-wide shadow-[0_8px_20px_rgba(212,91,122,0.4),_inset_0_2px_4px_rgba(255,255,255,0.7),_inset_0_-3px_6px_rgba(130,30,55,0.35)] hover:shadow-[0_12px_26px_rgba(212,91,122,0.5),_inset_0_2px_4px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send 4-Digit Code →</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-[#8B5E6B]">
                  Enter 4-digit code sent to <strong className="text-[#382025]">{otpTarget}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpStep("INPUT"); setOtpDigits(["", "", "", ""]); }}
                  className="text-[11px] font-semibold text-[#D45B7A] hover:underline mt-0.5 cursor-pointer"
                >
                  Change {otpType === "PHONE" ? "Number" : "Email"}
                </button>
              </div>

              {/* 4 Digit Inputs */}
              <div className="flex justify-center gap-3 my-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 rounded-2xl bg-[#FFF9FA] border-2 border-[#F3E1E5] text-center font-bold text-xl text-[#382025] focus:bg-white focus:border-[#F2A4B7] focus:ring-4 focus:ring-[#F8CAD5]/30 focus:outline-hidden transition-all shadow-[inset_0_2px_4px_rgba(212,91,122,0.06)]"
                  />
                ))}
              </div>

              {devOtp && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-center">
                  <span className="text-[11px] text-amber-900 font-medium">
                    Test Code: <strong>{devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = devOtp.split("").slice(0, 4);
                      setOtpDigits(d);
                    }}
                    className="ml-2 text-[10px] bg-amber-200 px-2 py-0.5 rounded-md font-bold text-amber-900 cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-[22px] bg-gradient-to-b from-[#F2A4B7] to-[#D45B7A] text-white font-bold text-base tracking-wide shadow-[0_8px_20px_rgba(212,91,122,0.4),_inset_0_2px_4px_rgba(255,255,255,0.7),_inset_0_-3px_6px_rgba(130,30,55,0.35)] hover:shadow-[0_12px_26px_rgba(212,91,122,0.5)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Sign In</span>
                )}
              </button>

              <div className="text-center pt-1">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-[#8B5E6B]">Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-xs font-semibold text-[#D45B7A] hover:underline cursor-pointer"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* "or continue with" Divider */}
      <div className="flex items-center my-4 text-center">
        <div className="flex-1 h-px bg-[#F3E1E5]"></div>
        <div className="px-3 text-[11px] font-semibold text-[#8B5E6B] uppercase tracking-wider">
          or continue with
        </div>
        <div className="flex-1 h-px bg-[#F3E1E5]"></div>
      </div>

      {/* 3 Circular Clay Social Buttons */}
      <div className="flex justify-center gap-3.5 mb-4">
        {/* Real Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          title="Sign in with Google (selects/recommends your Gmail)"
          className="w-12 h-12 rounded-full bg-white border border-[#F3E1E5] flex items-center justify-center shadow-[0_6px_14px_rgba(212,91,122,0.1),_inset_0_2px_3px_rgba(255,255,255,0.95)] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(212,91,122,0.18)] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => {
            setError("Apple Sign-In is coming soon. Please use Google or Email/Phone OTP.");
          }}
          title="Sign in with Apple"
          className="w-12 h-12 rounded-full bg-white border border-[#F3E1E5] flex items-center justify-center shadow-[0_6px_14px_rgba(212,91,122,0.1),_inset_0_2px_3px_rgba(255,255,255,0.95)] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(212,91,122,0.18)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.63-.77 1.06-1.85.94-2.92-.91.04-2.03.61-2.68 1.37-.58.66-1.08 1.74-.95 2.8.01 0 .02 0 .03 0 1.01 0 2.03-.48 2.66-1.25z"/>
          </svg>
        </button>

        {/* Facebook / Phone quick icon */}
        <button
          type="button"
          onClick={() => {
            setLoginMode("OTP");
            setOtpType("PHONE");
          }}
          title="Sign in with Phone OTP"
          className="w-12 h-12 rounded-full bg-white border border-[#F3E1E5] flex items-center justify-center shadow-[0_6px_14px_rgba(212,91,122,0.1),_inset_0_2px_3px_rgba(255,255,255,0.95)] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(212,91,122,0.18)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
      </div>

      {/* Don't have an account? Sign Up */}
      <div className="text-center text-xs text-[#8B5E6B]">
        Don&apos;t have an account?{" "}
        <Link 
          href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register"}
          className="font-bold text-[#D45B7A] hover:text-[#382025] hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-[#F3E1E5] animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-[#382025] mb-2">Reset Password</h3>
            <p className="text-xs text-[#8B5E6B] mb-4">
              Enter your email or mobile number. We will send you instructions or a 4-digit code to regain access.
            </p>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs mb-4">
                Password recovery link sent! Check your inbox or SMS.
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Enter email or mobile"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFF9FA] border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.trim()) setForgotSent(true);
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-b from-[#F2A4B7] to-[#D45B7A] text-white font-bold text-xs shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  Send Reset Link
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
              className="w-full py-2 text-xs font-semibold text-[#D45B7A] hover:underline cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
