"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface ProfileSettingsClientProps {
  initialData: any;
  uid: string;
}

export default function ProfileSettingsClient({ initialData, uid }: ProfileSettingsClientProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError("");

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        email,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 soft-shadow">
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium text-sm">Your profile has been updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error/10 text-error border border-error/20 rounded-xl">
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Read-only Phone Number */}
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <label className="block font-label-caps text-on-surface-variant mb-1">Mobile Number</label>
          <div className="flex justify-between items-center">
            <p className="font-body-lg text-primary font-medium tracking-wide">{initialData?.phone || "Not provided"}</p>
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Your mobile number is used for secure login and cannot be changed here.</p>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md transition-colors"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block font-label-caps text-on-surface-variant mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md transition-colors"
              placeholder="e.g. jane@example.com"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/30 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (name === initialData?.name && email === initialData?.email)}
            className="bg-primary text-on-primary px-8 py-3 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
