"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Gift,
  Tag,
  ChevronLeft,
  ChevronRight,
  Users,
  Copy,
  Check,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Palette
} from "lucide-react";
import { Spotlight } from "@/components/ui/aceternity/Spotlight";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroSlide {
  id: string;
  categoryLabel: string;
  badgeText: string;
  title: string;
  italicWord?: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  imageUrl: string;
  productName: string;
  productPrice: string;
  craftTime: string;
  couponCode?: string;
  accentNote?: string;
}

interface HomeHeroSliderProps {
  initialContent?: {
    headingText?: string;
    bannerUrl?: string;
    buttonText?: string;
    buttonLink?: string;
  } | null;
}

export function HomeHeroSlider({ initialContent }: HomeHeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 6500;

  const slides: HeroSlide[] = [
    // Slide 1: Signature Handcrafted Blooms
    {
      id: "slide-signature",
      categoryLabel: "🌸 Everlasting Blooms",
      badgeText: "100% Artisan Handcrafted in India",
      title: initialContent?.headingText || "Handmade Pieces That Add Magic to Everyday Life.",
      italicWord: "Magic",
      subtitle: "Slow-crafted petal by petal with certified organic milk cotton. Everlasting floral art designed to bring timeless romance and warmth into your home without ever wilting.",
      primaryCta: {
        text: initialContent?.buttonText || "Shop the Collection",
        href: initialContent?.buttonLink || "/shop?category=crochet-bouquets",
      },
      secondaryCta: {
        text: "Explore Collections",
        href: "/categories",
      },
      imageUrl: initialContent?.bannerUrl || "https://images.unsplash.com/photo-1599827552599-4f51e0db01cb?auto=format&fit=crop&q=80&w=1600",
      productName: "Signature Sunflower & Rose Bouquet",
      productPrice: "₹899",
      craftTime: "14+ Hours Hand-Stitched",
      accentNote: "Includes keepsake packaging & care guide",
    },

    // Slide 2: Bespoke Custom Gift Box Experience
    {
      id: "slide-custom-gifts",
      categoryLabel: "🎁 Custom Gift Studio",
      badgeText: "Bespoke Keepsake Box Builder",
      title: "Design a Personalized Gift Box For Someone Special.",
      italicWord: "Personalized",
      subtitle: "Curate luxury hardboard keepsake boxes with hand-stitched crochet blooms, artisan jewellery, and Ferrero chocolates, sealed with your custom wax-stamped note.",
      primaryCta: {
        text: "Build Your Custom Box 🎁",
        href: "/custom-gifts",
      },
      secondaryCta: {
        text: "Browse Ready Hampers",
        href: "/shop?category=gift-hampers",
      },
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1600",
      productName: "Artisan Velvet Gift Hamper",
      productPrice: "Custom Curation",
      craftTime: "Hand-Packed with Wax Seal",
      accentNote: "Includes personalized handwritten calligraphy note",
    },

    // Slide 3: Festive Torans & Sacred Decor
    {
      id: "slide-torans",
      categoryLabel: "🌿 Festive Torans",
      badgeText: "Auspicious Festivity Collection",
      title: "Auspicious Festive Torans Woven with Grace & Devotion.",
      italicWord: "Auspicious",
      subtitle: "Traditional marigold, lotus, and jasmine door torans hand-crocheted with golden brass bells to welcome warmth, joy, and blessings to your home.",
      primaryCta: {
        text: "Shop Festive Torans 🪔",
        href: "/shop?category=crochet-torans",
      },
      secondaryCta: {
        text: "View Home Decor",
        href: "/shop?category=home-decor",
      },
      imageUrl: "https://images.unsplash.com/photo-1615526676136-2244bbd1b585?auto=format&fit=crop&q=80&w=1600",
      productName: "Marigold & Brass Bell Toran",
      productPrice: "₹1,249",
      craftTime: "18+ Hours Hand-Knitted",
      couponCode: "AURA10",
      accentNote: "Flat 10% OFF + Free Pan-India Delivery",
    },

    // Slide 4: Curated Jewellery & Keepsakes
    {
      id: "slide-jewellery",
      categoryLabel: "✨ Artisan Adornments",
      badgeText: "Heirloom Crafts & Jewellery",
      title: "Artisan Adornments Crafted to Spark Warmth & Joy.",
      italicWord: "Adornments",
      subtitle: "Heavyweight brass & surgical steel kadas for him, paired with delicate floral choker sets, pastel enamel bangles, and daisy drop earrings for her.",
      primaryCta: {
        text: "Gifts for Him 👨",
        href: "/shop?category=jewellery&for=men",
      },
      secondaryCta: {
        text: "Gifts for Her 👩",
        href: "/shop?category=jewellery&for=women",
      },
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600",
      productName: "Artisan Kada & Daisy Choker Set",
      productPrice: "From ₹499",
      craftTime: "Hypoallergenic Finish",
      accentNote: "Non-tarnish surgical steel & floral resin",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, SLIDE_DURATION]);

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const current = slides[currentSlide];

  return (
    <section
      className="relative rounded-[32px] md:rounded-[44px] overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE6] to-[#FAF7F2] border border-[#E6DDCF] shadow-[0_16px_40px_rgba(41,40,37,0.06)] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Aura Craft Editorial Showcase"
    >
      {/* Subtle Warm Ambient Glow */}
      <Spotlight className="-top-40 left-0 md:left-10 md:-top-20 opacity-70" />

      {/* Decorative Editorial Border Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C]/40 to-transparent" />

      {/* TOP SEGMENTED COLLECTION SWITCHER */}
      <div className="pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full relative z-20">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-[#E6DDCF]/70">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#24483B] text-[#EDE3D5] shadow-xs scale-102"
                      : "bg-white/80 hover:bg-white text-[#706E6B] hover:text-[#24483B] border border-[#E6DDCF]/60"
                  }`}
                >
                  <span>{slide.categoryLabel}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide Indicator & Autoplay Status */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-[#706E6B] shrink-0">
            <span className="text-[#24483B]">{String(currentSlide + 1).padStart(2, "0")}</span>
            <span className="text-[#C9A45C]">/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* MAIN EDITORIAL HERO CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Editorial Storytelling & Conversions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center lg:items-start"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6DDCF] shadow-2xs text-[#24483B] text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>{current.badgeText}</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-[#24483B] font-bold leading-[1.14] tracking-tight mb-4 max-w-xl">
                  {current.title}
                </h1>

                {/* Subtitle / Description */}
                <p className="font-sans text-sm md:text-base text-[#5C5853] leading-relaxed mb-6 max-w-lg font-medium">
                  {current.subtitle}
                </p>

                {/* Coupon Code Pill (if available) */}
                {current.couponCode && (
                  <div className="mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCoupon(current.couponCode!, e)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E6DDCF] hover:border-[#24483B] text-xs font-bold text-[#24483B] shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Click to copy coupon code"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>Use Code:</span>
                      <strong className="font-mono bg-[#24483B] text-white px-2 py-0.5 rounded-md text-[11px]">
                        {current.couponCode}
                      </strong>
                      {copiedCoupon ? (
                        <span className="flex items-center gap-1 text-emerald-700 text-[11px]">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#706E6B] text-[11px]">
                          <Copy className="w-3 h-3" /> Tap to copy
                        </span>
                      )}
                    </button>
                    {current.accentNote && (
                      <span className="text-xs text-[#706E6B] font-semibold bg-white/70 px-3 py-1 rounded-xl border border-[#E6DDCF]/60">
                        {current.accentNote}
                      </span>
                    )}
                  </div>
                )}

                {/* Accent Note (Slide without coupon) */}
                {!current.couponCode && current.accentNote && (
                  <div className="mb-6 inline-flex items-center gap-1.5 text-xs text-[#706E6B] font-medium bg-white/80 px-3.5 py-1.5 rounded-full border border-[#E6DDCF] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>{current.accentNote}</span>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={current.primaryCta.href}
                    className="w-full sm:w-auto clay-btn px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(36,72,59,0.28)] hover:shadow-[0_12px_28px_rgba(36,72,59,0.36)] transition-all cursor-pointer group/btn"
                  >
                    <span>{current.primaryCta.text}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>

                  {current.secondaryCta && (
                    <Link
                      href={current.secondaryCta.href}
                      className="w-full sm:w-auto clay-btn-secondary px-7 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      {current.secondaryCta.text}
                    </Link>
                  )}
                </div>

                {/* Artisanal Trust Ribbon */}
                <div className="mt-8 pt-6 border-t border-[#E6DDCF]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#E6DDCF] flex items-center justify-center text-[#24483B] shrink-0 shadow-2xs">
                      <Heart className="w-3.5 h-3.5 fill-[#D99A9C] text-[#D99A9C]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#24483B]">Handcrafted</p>
                      <p className="text-[10px] text-[#706E6B]">Women artisans</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#E6DDCF] flex items-center justify-center text-[#24483B] shrink-0 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#24483B]">Everlasting</p>
                      <p className="text-[10px] text-[#706E6B]">Never wilts</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#E6DDCF] flex items-center justify-center text-[#24483B] shrink-0 shadow-2xs">
                      <Truck className="w-3.5 h-3.5 text-[#24483B]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#24483B]">Free Delivery</p>
                      <p className="text-[10px] text-[#706E6B]">Orders &gt; ₹999</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#E6DDCF] flex items-center justify-center text-[#24483B] shrink-0 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#24483B]">Eco Packaging</p>
                      <p className="text-[10px] text-[#706E6B]">Plastic-free</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: Layered Editorial Visual Canvas (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Decorative organic background aura */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#C9A45C]/15 via-[#D99A9C]/15 to-[#24483B]/10 rounded-[44px] filter blur-2xl opacity-60 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[4/5] max-w-md mx-auto"
              >
                {/* Main Hero Masterpiece Frame with Arch Curve */}
                <div className="w-full h-full rounded-[36px] overflow-hidden border-[4px] border-white shadow-[0_20px_50px_rgba(41,40,37,0.12)] relative bg-[#FAF7F2]">
                  <Image
                    src={current.imageUrl}
                    alt={current.productName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                    unoptimized={current.imageUrl.startsWith("http")}
                    className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
                  />
                  {/* Subtle Gradient Shadow Base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* FLOATING CARD 1: Product Spotlight & Rating (Top-Left) */}
                <motion.div
                  initial={{ opacity: 0, x: -16, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="absolute -top-3 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E6DDCF] rounded-2xl p-3 shadow-[0_10px_25px_rgba(41,40,37,0.08)] max-w-[210px] z-20"
                >
                  <div className="flex items-center gap-1 text-[#C9A45C] text-xs mb-1">
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    <span className="text-[10px] font-bold text-[#24483B] ml-1">4.9</span>
                  </div>
                  <p className="font-serif text-xs font-bold text-[#24483B] line-clamp-1">
                    {current.productName}
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#EDE3D5]">
                    <span className="text-[10px] text-[#706E6B]">Starting at</span>
                    <span className="text-xs font-bold text-[#24483B] font-mono">{current.productPrice}</span>
                  </div>
                </motion.div>

                {/* FLOATING CARD 2: Craftsmanship Marker (Bottom-Right) */}
                <motion.div
                  initial={{ opacity: 0, x: 16, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="absolute -bottom-3 -right-3 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E6DDCF] rounded-2xl p-3 shadow-[0_10px_25px_rgba(41,40,37,0.08)] z-20 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#24483B] text-[#EDE3D5] flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#C9A45C] tracking-wider">Artisan Process</p>
                    <p className="text-xs font-bold text-[#24483B]">{current.craftTime}</p>
                  </div>
                </motion.div>

              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous showcase slide"
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#24483B] border border-[#E6DDCF] shadow-xs flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next showcase slide"
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#24483B] border border-[#E6DDCF] shadow-xs flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>

      {/* BOTTOM PROGRESS TIMELINE */}
      <div className="w-full h-1 bg-[#E6DDCF]/40 relative overflow-hidden">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? "100%" : "100%" }}
          transition={{ duration: isPaused ? 0 : SLIDE_DURATION / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-[#24483B] via-[#C9A45C] to-[#24483B]"
        />
      </div>

    </section>
  );
}
