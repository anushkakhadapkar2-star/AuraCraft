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
  Sparkle
} from "lucide-react";
import { Spotlight } from "@/components/ui/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/ui/aceternity/TextGenerateEffect";

export interface HeroSlide {
  id: string;
  badge: {
    icon: any;
    text: string;
  };
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
    icon?: any;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  imageUrl: string;
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
  
  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advance duration (milliseconds)
  const SLIDE_DURATION = 6000;

  const slides: HeroSlide[] = [
    // Slide 1: Signature Handcrafted Blooms & Torans (Original Hero)
    {
      id: "slide-signature",
      badge: {
        icon: Sparkles,
        text: "100% Artisan Handcrafted in India",
      },
      title: initialContent?.headingText || "Handmade Pieces That Add a Little Magic to Everyday Life.",
      subtitle: "Everlasting crochet floral bouquets, auspicious festive torans, and bespoke craft hampers made with sustainable yarns.",
      primaryCta: {
        text: initialContent?.buttonText || "Shop the Collection",
        href: initialContent?.buttonLink || "/shop",
        icon: ArrowRight,
      },
      secondaryCta: {
        text: "Explore Collections",
        href: "/categories",
      },
      imageUrl: initialContent?.bannerUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuA9tvSnps6IHsJvimKcQ0dknXS8LRr4k0ymD7gMzAvuBgb5c61ttf5OgXAnABd1qmw_O20Dh8iiPY7UHU1B6BbkRaL581X5VdUZYEW_QRVSsqaG9MH9WWoAaXspWThN5M2UMzFAlwHksKrOILjkoLW5k4ICuF6s4dxNjcMHHOR8GZTcNnOTolE-YRl1G3sfom6zABts9tU6j_hHgKAkXzUiSfk1p7oEfrMODrxIxsXQhY9WEQ_CL1G28A",
    },

    // Slide 2: Customized Gift Box Experience (Custom Gift Feature)
    {
      id: "slide-custom-gifts",
      badge: {
        icon: Gift,
        text: "Bespoke Custom Gift Box Builder",
      },
      title: "Design a Customized Gift Box For Your Loved Ones.",
      subtitle: "Choose luxury keepsake boxes, hand-pick everlasting flowers, artisan jewellery, & Ferrero chocolates with a personalized wax-sealed note.",
      primaryCta: {
        text: "Build Your Custom Box 🎁",
        href: "/custom-gifts",
        icon: ArrowRight,
      },
      secondaryCta: {
        text: "Browse Gift Hampers",
        href: "/shop?category=gift-hampers",
      },
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1600",
      accentNote: "Includes personalized handwritten love note & wax seal ❤️",
    },

    // Slide 3: Special Celebration Offer & Free Delivery
    {
      id: "slide-offers",
      badge: {
        icon: Tag,
        text: "Special Celebration Offer • Limited Time",
      },
      title: "Enjoy Flat 10% OFF + Free Pan-India Delivery.",
      subtitle: "Surprise someone special with timeless crochet treasures, luxury chocolates, and festive torans crafted to last forever.",
      primaryCta: {
        text: "Shop With 10% OFF 🏷️",
        href: "/shop",
        icon: ArrowRight,
      },
      secondaryCta: {
        text: "Explore Best Sellers",
        href: "/shop?sort=popular",
      },
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1600",
      couponCode: "AURA10",
      accentNote: "Free Pan-India Delivery on orders above ₹499",
    },

    // Slide 4: Curated Jewellery for Him & Her
    {
      id: "slide-him-her",
      badge: {
        icon: Users,
        text: "Curated Gifts for Him & Her",
      },
      title: "Artisan Jewellery Crafted to Spark Warmth & Joy.",
      subtitle: "Heavyweight brass & surgical steel kadas for men, paired with floral choker sets, pastel enamel bangles & daisy drop earrings for women.",
      primaryCta: {
        text: "Gifts for Men 👨",
        href: "/shop?category=jewellery&for=men",
        icon: ArrowRight,
      },
      secondaryCta: {
        text: "Gifts for Women 👩",
        href: "/shop?category=jewellery&for=women",
      },
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600",
      accentNote: "Non-tarnish surgical steel & hypoallergenic floral finishes",
    },
  ];

  // Next slide (slides right to left)
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Prev slide (slides left to right)
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance timer (sliding right to left)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, SLIDE_DURATION]);

  // Copy coupon helper
  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide(); // Swiped left -> advance right to left
    } else if (distance < -50) {
      prevSlide(); // Swiped right -> advance left to right
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section 
      className="relative min-h-[560px] md:min-h-[640px] flex items-center justify-center rounded-[36px] md:rounded-[44px] overflow-hidden mt-3 border-[3px] border-white shadow-[0_20px_50px_rgba(212,91,122,0.14),_inset_0_2px_4px_rgba(255,255,255,0.95)] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Aura Craft Highlights & Offers"
    >
      {/* Aceternity Warm Ambient Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-10 md:-top-20 opacity-80" />

      {/* 1. HORIZONTAL SLIDING TRACK (Smooth Right-to-Left / Left-to-Right Carousel) */}
      <div 
        className="flex w-full h-full min-h-[560px] md:min-h-[640px] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const BadgeIcon = slide.badge.icon;
          const PrimaryCtaIcon = slide.primaryCta.icon || ArrowRight;

          return (
            <div
              key={slide.id}
              className="min-w-full w-full h-full min-h-[560px] md:min-h-[640px] relative flex-shrink-0 flex items-center overflow-hidden"
            >
              {/* Full-Bleed Background Image */}
              <div className="absolute inset-0 z-0 bg-[#FFF9FA]/60">
                <Image 
                  className="w-full h-full object-cover object-center md:object-right transition-transform duration-1000 ease-out"
                  alt={slide.title} 
                  src={slide.imageUrl}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  unoptimized={slide.imageUrl.startsWith("http")}
                />
                
                {/* Natural Ambient Vignette Overlay (Preserves open view of the image while ensuring crystal clear text contrast on left) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F8]/95 via-[#FAF7F8]/75 to-transparent md:bg-gradient-to-r md:from-[#FAF7F8]/95 md:via-[#FAF7F8]/65 md:to-transparent"></div>
              </div>

              {/* Seamless Open Hero Content (Sitting directly on banner with NO boxy white card) */}
              <div className="relative z-10 max-w-2xl md:ml-0 md:mr-auto text-center md:text-left px-6 py-12 md:p-14 w-full">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 text-[#D45B7A] text-xs font-bold uppercase tracking-wider mb-5 border border-[#F3E1E5] shadow-[0_4px_12px_rgba(212,91,122,0.08),_inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-md">
                  <BadgeIcon className="w-3.5 h-3.5 text-[#F2A4B7]" />
                  <span>{slide.badge.text}</span>
                </div>
                
                {/* Headline */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#382025] mb-5 leading-[1.12] font-bold tracking-tight drop-shadow-2xs">
                  {index === 0 ? (
                    <TextGenerateEffect words={slide.title} />
                  ) : (
                    slide.title
                  )}
                </h1>
                
                {/* Subtitle */}
                <p className="font-sans text-sm md:text-base text-[#6B424D] mb-6 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                  {slide.subtitle}
                </p>

                {/* Coupon Code Pill (Slide 3) */}
                {slide.couponCode && (
                  <div className="mb-6 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCoupon(slide.couponCode!, e)}
                      className="clay-badge bg-white/95 border border-[#F3E1E5] px-4 py-2 rounded-full text-xs font-bold text-[#D45B7A] hover:border-[#F2A4B7] transition-all cursor-pointer flex items-center gap-2 group/btn shadow-[0_2px_8px_rgba(212,91,122,0.1)] active:scale-95 backdrop-blur-md"
                      title="Click to copy coupon code"
                    >
                      <span>Coupon:</span>
                      <strong className="tracking-wider bg-[#D45B7A] text-white px-2 py-0.5 rounded-md font-mono text-xs">
                        {slide.couponCode}
                      </strong>
                      {copiedCoupon ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] animate-in fade-in">
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#8B5E6B] group-hover/btn:text-[#D45B7A] text-[11px]">
                          <Copy className="w-3.5 h-3.5" /> Tap to copy
                        </span>
                      )}
                    </button>
                    {slide.accentNote && (
                      <span className="text-[11px] text-[#8B5E6B] font-semibold bg-white/80 px-3 py-1 rounded-full border border-[#F3E1E5]/60 backdrop-blur-xs">
                        {slide.accentNote}
                      </span>
                    )}
                  </div>
                )}

                {/* Accent Note (Slide 2 & 4) */}
                {!slide.couponCode && slide.accentNote && (
                  <div className="mb-6 inline-flex items-center gap-1.5 text-xs text-[#8B5E6B] font-medium bg-white/80 px-3.5 py-1.5 rounded-full border border-[#F3E1E5]/60 shadow-2xs backdrop-blur-xs">
                    <Sparkle className="w-3.5 h-3.5 text-[#D45B7A]" />
                    <span>{slide.accentNote}</span>
                  </div>
                )}
                
                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center md:justify-start">
                  <Link 
                    href={slide.primaryCta.href} 
                    className="clay-btn px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(212,91,122,0.4)] cursor-pointer group/btn"
                  >
                    <span>{slide.primaryCta.text}</span>
                    <PrimaryCtaIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  {slide.secondaryCta && (
                    <Link 
                      href={slide.secondaryCta.href} 
                      className="clay-btn-secondary px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center cursor-pointer"
                    >
                      {slide.secondaryCta.text}
                    </Link>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 2. FLOATING CLAY NAVIGATION ARROWS (Slide Left / Slide Right) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-[#8B5E6B] hover:text-[#D45B7A] backdrop-blur-md border border-[#F3E1E5] flex items-center justify-center transition-all duration-200 shadow-[0_4px_16px_rgba(212,91,122,0.15)] cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          nextSlide();
        }}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-[#8B5E6B] hover:text-[#D45B7A] backdrop-blur-md border border-[#F3E1E5] flex items-center justify-center transition-all duration-200 shadow-[0_4px_16px_rgba(212,91,122,0.15)] cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 3. SLIDE COUNTER (Desktop top-right) */}
      <div className="hidden sm:flex absolute top-5 right-6 z-20 items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#8B5E6B] border border-[#F3E1E5] shadow-xs">
        <span className="text-[#D45B7A] font-extrabold">{currentSlide + 1}</span>
        <span className="opacity-50">/</span>
        <span>{slides.length}</span>
      </div>
    </section>
  );
}
