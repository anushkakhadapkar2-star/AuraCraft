"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone as PhoneIcon,
  Lock,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Fields
  const [fullName, setFullName] = useState("");
  const [authMethod, setAuthMethod] = useState<"PHONE" | "EMAIL">("PHONE");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step: INPUT vs OTP
  const [step, setStep] = useState<"INPUT" | "OTP">("INPUT");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const currentTarget = authMethod === "EMAIL"
    ? email.trim().toLowerCase()
    : (phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (authMethod === "PHONE") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: currentTarget,
          type: authMethod,
          name: fullName.trim(),
          mode: "REGISTER",
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
      setStep("OTP");
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
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: currentTarget,
          type: authMethod,
          name: fullName.trim(),
          otp: fullOtp,
          mode: "REGISTER",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setSuccessMsg("Account verified! Redirecting to shop...");

      setTimeout(() => {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[36px] p-6 sm:p-7 shadow-[0_14px_34px_rgba(212,91,122,0.14),_0_2px_8px_rgba(56,32,37,0.04),_inset_0_2px_4px_rgba(255,255,255,0.9)] relative z-20">

      {/* Header Info */}
      <div className="text-center mb-4">
        <h2 className="font-serif text-2xl font-bold text-[#382025]">Create Account</h2>
        <p className="text-xs text-[#8B5E6B] mt-1">
          {step === "OTP" ? `Enter code sent to ${currentTarget}` : "Begin your handcrafted journey with us"}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === "INPUT" ? (
        <form onSubmit={handleSendOtp} className="space-y-3.5">
          {/* Full Name */}
          <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-[22px] p-1.5 pr-4 transition-all focus-within:bg-white focus-within:border-[#F2A4B7] focus-within:ring-4 focus-within:ring-[#F8CAD5]/30 shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]">
            <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shrink-0 mr-3 shadow-[0_4px_10px_rgba(212,91,122,0.35),_inset_0_1px_2px_rgba(255,255,255,0.6)]">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              required
              disabled={isLoading}
              className="w-full bg-transparent border-none text-[#382025] placeholder-[#B08B95] text-sm font-medium focus:outline-hidden"
            />
          </div>

          {/* Toggle Phone vs Email */}
          <div className="flex bg-[#FDF2F5] p-1 rounded-2xl border border-[#F3E1E5]">
            <button
              type="button"
              onClick={() => { setAuthMethod("PHONE"); setError(""); }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${authMethod === "PHONE"
                  ? "bg-white text-[#D45B7A] shadow-[0_2px_6px_rgba(212,91,122,0.2)]"
                  : "text-[#8B5E6B] hover:text-[#D45B7A]"
                }`}
            >
              <PhoneIcon className="w-3.5 h-3.5" /> Mobile
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod("EMAIL"); setError(""); }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${authMethod === "EMAIL"
                  ? "bg-white text-[#D45B7A] shadow-[0_2px_6px_rgba(212,91,122,0.2)]"
                  : "text-[#8B5E6B] hover:text-[#D45B7A]"
                }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          </div>

          {/* Contact Input */}
          <div className="flex items-center bg-[#FFF9FA] border border-[#F3E1E5] rounded-[22px] p-1.5 pr-4 transition-all focus-within:bg-white focus-within:border-[#F2A4B7] focus-within:ring-4 focus-within:ring-[#F8CAD5]/30 shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]">
            <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#F8CAD5] to-[#D45B7A] flex items-center justify-center text-white shrink-0 mr-3 shadow-[0_4px_10px_rgba(212,91,122,0.35),_inset_0_1px_2px_rgba(255,255,255,0.6)]">
              {authMethod === "PHONE" ? <PhoneIcon className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <input
              type={authMethod === "PHONE" ? "tel" : "email"}
              value={authMethod === "PHONE" ? phone : email}
              onChange={(e) => authMethod === "PHONE" ? setPhone(e.target.value.replace(/\D/g, "")) : setEmail(e.target.value)}
              placeholder={authMethod === "PHONE" ? "10-digit mobile number" : "your@email.com"}
              required
              disabled={isLoading}
              maxLength={authMethod === "PHONE" ? 10 : undefined}
              className="w-full bg-transparent border-none text-[#382025] placeholder-[#B08B95] text-sm font-medium focus:outline-hidden"
            />
          </div>

          {/* 3D Clay Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 mt-2 rounded-[22px] bg-gradient-to-b from-[#F2A4B7] to-[#D45B7A] text-white font-bold text-base tracking-wide shadow-[0_8px_20px_rgba(212,91,122,0.4),_inset_0_2px_4px_rgba(255,255,255,0.7),_inset_0_-3px_6px_rgba(130,30,55,0.35)] hover:shadow-[0_12px_26px_rgba(212,91,122,0.5),_inset_0_2px_4px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Send 4-Digit OTP →</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                className="ml-2 text-[10px] bg-amber-200 px-2 py-0.5 rounded-md font-bold text-amber-900"
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
                <span>Completing Sign Up...</span>
              </>
            ) : (
              <span>Complete Verification</span>
            )}
          </button>

          <div className="text-center pt-1">
            {resendCooldown > 0 ? (
              <span className="text-xs text-[#8B5E6B]">Resend code in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-xs font-semibold text-[#D45B7A] hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {/* Already have an account */}
      <div className="text-center text-xs text-[#8B5E6B] mt-4 pt-3 border-t border-[#F3E1E5]">
        Already have an account?{" "}
        <Link
          href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
          className="font-bold text-[#D45B7A] hover:text-[#382025] hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>

    </div>
  );
}
