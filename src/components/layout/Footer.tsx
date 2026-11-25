"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, Truck, Check, Mail, ArrowRight, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubscribed(true);
    toast({
      title: "Subscribed to Aura Craft",
      message: "Thank you for joining our artisan community. Welcome offer on its way!",
      type: "success",
    });
    setEmail("");
  };

  return (
    <footer className="w-full relative bg-gradient-to-b from-[#FAF7F8] to-[#F5ECEF] border-t border-[#F3E1E5] mt-16 pb-24 md:pb-0 text-[#382025]">

      {/* 1. Artisan Value Pillars Bar */}
      <div className="border-b border-[#F3E1E5] py-8 px-6 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="clay-icon-pod w-11 h-11">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-[#382025]">100% Handcrafted</h4>
              <p className="text-[11px] text-[#8B5E6B] mt-0.5">Crocheted with eco yarns</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="clay-icon-pod w-11 h-11">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-[#382025]">Pan-India Shipping</h4>
              <p className="text-[11px] text-[#8B5E6B] mt-0.5">Free delivery over ₹1,000</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="clay-icon-pod w-11 h-11">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-[#382025]">Everlasting Beauty</h4>
              <p className="text-[11px] text-[#8B5E6B] mt-0.5">Colors never fade or wilt</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="clay-icon-pod w-11 h-11">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-[#382025]">Direct Artisan Chat</h4>
              <p className="text-[11px] text-[#8B5E6B] mt-0.5">Instant WhatsApp support</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Newsletter */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand & Story */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-[#382025] to-[#D45B7A] bg-clip-text text-transparent inline-block">
              AURA CRAFT
            </Link>
            <p className="text-xs text-[#8B5E6B] leading-relaxed max-w-sm">
              Handcrafting timeless floral bouquets, auspicious festive torans, and customized gifting hampers that bring warmth, wonder, and elegance into everyday spaces.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/919324488603?text=Hi%20Aura%20Craft%20team%2C%20I%20have%20an%20inquiry%20regarding%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#382025] border-[#F3E1E5] text-xs font-bold hover:bg-[#FAF7F8] transition-all shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#382025]">Explore</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/custom-gifts" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Custom Gifts & Hampers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#382025]">Customer Care</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account/orders" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/about#shipping" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="text-[#8B5E6B] hover:text-[#D45B7A] transition-colors font-medium">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#382025]">Artisan Letters</h3>
            <p className="text-xs text-[#8B5E6B] leading-relaxed">
              Subscribe to receive private previews of seasonal blooms, festive launch alerts, and artisan craft stories.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-[#FFF9FA] border border-[#F3E1E5] rounded-2xl px-3.5 py-2.5 text-xs text-[#382025] placeholder-[#A88C94] focus:outline-none focus:border-[#F2A4B7] focus:ring-4 focus:ring-[#F8CAD5]/20 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]"
              />
              <button
                type="submit"
                className="clay-btn px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
              >
                {subscribed ? <Check className="w-4 h-4 text-white" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {subscribed && (
              <p className="text-[11px] text-[#0f5223] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Thank you! Welcome to the family.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F3E1E5] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B5E6B]">
          <p>© {new Date().getFullYear()} AURA CRAFT. Handcrafted with love in Mumbai, India.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/about" className="hover:text-[#382025] transition-colors">Terms of Service</Link>
            <Link href="/about" className="hover:text-[#382025] transition-colors">Privacy Policy</Link>
            <Link href="/admin/login" className="hover:text-[#382025] transition-colors opacity-70 hover:opacity-100">Staff Portal</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
