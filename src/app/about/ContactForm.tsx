"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      createdAt: serverTimestamp(),
      status: "unread"
    };

    try {
      await addDoc(collection(db, "contact_messages"), data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-8 md:p-12 soft-shadow border border-outline-variant/30 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-display-sm text-primary mb-3">We'd Love to Hear From You</h2>
        <p className="text-on-surface-variant font-body-lg">
          Tell us how we can help and our team will get back to you.
        </p>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 text-center font-headline-sm">
          Your message has been sent successfully! We'll be in touch soon.
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-error/10 text-error rounded-xl border border-error/20 text-center font-headline-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block font-label-caps text-on-surface-variant mb-2">Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            required
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-label-caps text-on-surface-variant mb-2">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block font-label-caps text-on-surface-variant mb-2">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone"
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block font-label-caps text-on-surface-variant mb-2">Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            required
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-label-caps text-on-surface-variant mb-2">Message</label>
          <textarea 
            id="message" 
            name="message" 
            required
            rows={5}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md resize-y"
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-[#8DAA91] text-white btn-radius font-headline-sm hover:bg-[#7a967e] transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            ) : null}
            Send Message
          </button>
          <p className="text-center text-xs text-on-surface-variant/70 mt-4">
            Your message is sent securely to our support team.
          </p>
        </div>
      </form>
    </div>
  );
}
