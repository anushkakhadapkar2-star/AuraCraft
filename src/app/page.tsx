import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { InfiniteMovingCards } from "@/components/ui/aceternity/InfiniteMovingCards";
import { BackgroundGradient } from "@/components/ui/aceternity/BackgroundGradient";
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Palette, 
  Star, 
  Gift, 
  Check, 
  MessageCircle,
  Clock
} from "lucide-react";

export default async function Home() {
  const session = await auth();
  
  // 1. Fetch dynamic homepage settings
  let content = null;
  try {
    const docRef = doc(db, "settings", "homepage");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      content = docSnap.data();
    }
  } catch (error) {
    console.error("Error fetching homepage content:", error);
  }

  // 2. Fetch categories for visual circular category nav
  let categories: any[] = [];
  try {
    const categoriesSnap = await getDocs(collection(db, "categories"));
    categories = categoriesSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as any))
      .filter(c => c.status !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .slice(0, 8);
  } catch (err) {
    console.error("Error loading categories for homepage:", err);
  }

  // 3. Fetch featured & best-seller products
  let products: any[] = [];
  try {
    const productsSnap = await getDocs(
      query(collection(db, "products"), where("status", "==", "ACTIVE"), limit(12))
    );
    products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  } catch (err) {
    console.error("Error loading products for homepage:", err);
  }

  const bestSellers = products.filter(p => p.isBestSeller).length > 0
    ? products.filter(p => p.isBestSeller).slice(0, 4)
    : products.slice(0, 4);

  const newArrivals = products.filter(p => p.isNewArrival).length > 0
    ? products.filter(p => p.isNewArrival).slice(0, 4)
    : products.slice(4, 8);

  return (
    <div className="flex flex-col gap-14 md:gap-24 pb-16 text-[#292825] relative">
      
      {/* 1. Hero Section: Editorial Carousel */}
      <HomeHeroSlider initialContent={content} />

      {/* 2. Shop by Category / Collections */}
      {categories.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="clay-badge text-[11px] mb-1.5">
                Curated Aesthetics
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B]">
                Shop by Collection
              </h2>
            </div>
            <Link 
              href="/categories" 
              className="text-[#24483B] hover:text-[#C9A45C] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1.5 transition-colors"
            >
              <span>View all collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.slug}`} 
                className="group clay-card tactile-bounce flex flex-col items-center text-center p-4 rounded-[28px] hover:border-[#DFD3C3] transition-all duration-300"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative mb-3 bg-[#FAF7F2] border-2 border-white shadow-xs group-hover:scale-105 transition-transform duration-300 ring-2 ring-[#EDE3D5] group-hover:ring-[#24483B]/30">
                  {cat.imageUrl ? (
                    <Image 
                      src={cat.imageUrl} 
                      alt={cat.name} 
                      fill 
                      sizes="96px" 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#24483B]">
                      <Gift className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-xs md:text-sm font-bold text-[#292825] line-clamp-1 group-hover:text-[#24483B] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#706E6B] mt-0.5 font-medium group-hover:text-[#24483B] transition-colors">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Handcrafted Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-8 border-b border-[#E6DDCF] pb-4">
            <div>
              <div className="clay-badge mb-1.5">
                <Star className="w-3.5 h-3.5 fill-[#C9A45C] text-[#C9A45C]" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B]">
                Artisan Best Sellers
              </h2>
            </div>
            <Link 
              href="/shop?sort=newest" 
              className="text-[#24483B] hover:text-[#C9A45C] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>Shop full collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Seasonal Spotlight: The Spring Bloom & Festive Torans Edit */}
      <section className="relative rounded-[36px] overflow-hidden bg-[#EDE3D5]/50 border border-[#E6DDCF] p-8 md:p-14 fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            <span className="clay-badge">
              <Sparkles className="w-3 h-3 text-[#C9A45C]" />
              <span>Limited Edition Showcase</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#24483B] leading-[1.15]">
              Everlasting Flora That Never Fade or Wilt.
            </h2>
            <p className="text-sm md:text-base text-[#5C5853] max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Carefully crocheted stitch-by-stitch with soft milk cotton yarns. Our botanicals capture nature's grace while lasting a lifetime in your home.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link 
                href="/shop?category=crochet-flowers" 
                className="clay-btn px-7 py-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2"
              >
                <span>Explore Bouquets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link 
                href="/shop?category=festive-torans" 
                className="clay-btn-secondary px-7 py-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center"
              >
                <span>Festive Door Torans</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            <div className="rounded-[24px] overflow-hidden relative aspect-[4/5] shadow-xs border border-white">
              <Image 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800" 
                alt="Artisan Keepsake Floral Bouquet"
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-xl text-[11px] font-bold text-[#24483B] text-center shadow-xs">
                Keepsake Hampers
              </div>
            </div>

            <div className="rounded-[24px] overflow-hidden relative aspect-[4/5] shadow-xs border border-white mt-6">
              <Image 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800" 
                alt="Festive Handcrafted Floral Torans"
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-xl text-[11px] font-bold text-[#24483B] text-center shadow-xs">
                Festive Torans
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Handmade Brand Story: From Loom to Living Room */}
      <section className="py-12 px-6 md:px-12 bg-white rounded-[36px] border border-[#E6DDCF] shadow-[0_12px_36px_rgba(41,40,37,0.04)] fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative aspect-square sm:aspect-[4/3] md:aspect-[4/5] rounded-[28px] overflow-hidden border border-[#E6DDCF]">
            <Image 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000" 
              alt="Artisan Craftswoman hands at work with crochet yarn"
              fill
              sizes="(max-width: 768px) 100vw, 450px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#24483B]/80 via-transparent to-transparent flex items-end p-6">
              <p className="text-white font-serif text-sm italic">
                "Every petal carries the quiet joy and care of human hands."
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-5 md:pl-4">
            <span className="clay-badge">
              Artisan Philosophy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#24483B] leading-tight">
              Slow Made with Love, Designed to Stay Forever.
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5853] leading-relaxed font-sans">
              In a world crowded with fast, disposable plastics and mass production, Aura Craft celebrates the timeless warmth of handmade craft. Every bloom, door toran, and bespoke hamper is created in India by skilled craftswomen using sustainable, baby-safe milk cotton yarns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DDCF]">
                <h4 className="font-serif font-bold text-sm text-[#24483B] mb-1">0% Machine Waste</h4>
                <p className="text-xs text-[#706E6B]">Pure needlework with zero industrial plastics or toxic chemical dyes.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DDCF]">
                <h4 className="font-serif font-bold text-sm text-[#24483B] mb-1">Empowering Artisans</h4>
                <p className="text-xs text-[#706E6B]">Providing dignified livelihood to skilled women artisans across regional India.</p>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/about" className="text-xs font-bold text-[#24483B] hover:text-[#C9A45C] inline-flex items-center gap-1.5 transition-colors">
                <span>Read our full artisan story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Showcase */}
      {newArrivals.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-8 border-b border-[#E6DDCF] pb-4">
            <div>
              <div className="clay-badge mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Fresh Off The Loom</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B]">
                New Handmade Arrivals
              </h2>
            </div>
            <Link 
              href="/shop?new=true" 
              className="text-[#24483B] hover:text-[#C9A45C] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>View all new items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Pinterest-Style Inspiration Moodboard ("Styled in Real Homes") */}
      <section className="fade-in-up">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="clay-badge mb-2">
            Home Aesthetics
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B] mb-2">
            Styled in Real Homes
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#706E6B]">
            Discover how customers bring everlasting warmth into their study nooks, festive doorways, and gift tables.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          <div className="group relative rounded-[24px] overflow-hidden aspect-[3/4] border border-[#E6DDCF] shadow-xs">
            <Image 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600" 
              alt="Bouquet on morning coffee table"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#292825]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-bold">Bedside Morning Bloom</p>
              <span className="text-[10px] text-white/80">Styled by Rhea • Mumbai</span>
            </div>
          </div>

          <div className="group relative rounded-[24px] overflow-hidden aspect-[3/4] border border-[#E6DDCF] shadow-xs">
            <Image 
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600" 
              alt="Festive Toran at main entrance"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#292825]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-bold">Festive Door Entrance</p>
              <span className="text-[10px] text-white/80">Styled by Pooja • Pune</span>
            </div>
          </div>

          <div className="group relative rounded-[24px] overflow-hidden aspect-[3/4] border border-[#E6DDCF] shadow-xs">
            <Image 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600" 
              alt="Artisan Keepsake Gift Hamper Unboxing"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#292825]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-bold">Wedding Favor Hamper</p>
              <span className="text-[10px] text-white/80">Styled by Ananya • Kolkata</span>
            </div>
          </div>

          <div className="group relative rounded-[24px] overflow-hidden aspect-[3/4] border border-[#E6DDCF] shadow-xs">
            <Image 
              src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600" 
              alt="Ceramic vase with tulip bouquet"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#292825]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-bold">Ceramic Desk Florals</p>
              <span className="text-[10px] text-white/80">Styled by Sneha • Ahmedabad</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Brand Value / The Aura Craft Artisan Promise */}
      <section className="py-12 px-6 md:px-12 bg-white rounded-[36px] border border-[#E6DDCF] shadow-[0_12px_36px_rgba(41,40,37,0.04)] fade-in-up">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="clay-badge mb-2">
            Artisanship & Care
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B] mb-2">
            The Aura Craft Artisan Promise
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#706E6B] leading-relaxed">
            Every creation is spun from premium fibers and delivered to your doorstep with guaranteed craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#24483B] mb-1">100% Handcrafted</h3>
            <p className="text-xs text-[#706E6B] leading-relaxed font-sans">
              Meticulously knitted petal-by-petal by passionate Indian craftswomen without any machinery.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#24483B] mb-1">Custom Colorways</h3>
            <p className="text-xs text-[#706E6B] leading-relaxed font-sans">
              Tailor any bouquet, toran, or favor to match your festive theme or home interior aesthetic.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#24483B] mb-1">Fragile-Safe Packaging</h3>
            <p className="text-xs text-[#706E6B] leading-relaxed font-sans">
              Shockproof corrugated boxing guarantees flowers arrive in pristine, un-creased condition.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#24483B] mb-1">Everlasting Flowers</h3>
            <p className="text-xs text-[#706E6B] leading-relaxed font-sans">
              Unlike fresh blooms that fade in 3 days, our crochet florals keep their vibrant charm forever.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Customer Stories / Verified Reviews Carousel */}
      <section className="fade-in-up">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 text-[#C9A45C] mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-[#C9A45C] text-[#C9A45C]" />
            ))}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B] mb-2">
            Loved By Craft Enthusiasts Across India
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#706E6B]">
            Read authentic reviews from happy customers who gifted or styled their homes with Aura Craft.
          </p>
        </div>

        {/* Aceternity Infinite Moving Reviews Marquee */}
        <InfiniteMovingCards
          items={[
            {
              id: 1,
              quote: "Ordered the sunflower and rose bouquet for my sister's graduation. The stitching and packaging exceeded my expectations. She keeps it on her study desk!",
              name: "Rhea Deshmukh",
              title: "Mumbai • Verified Buyer",
              rating: 5,
            },
            {
              id: 2,
              quote: "The festive toran is stunning! It looks so rich on our front entrance door. Beautifully crafted with high quality yarn that doesn't fray.",
              name: "Pooja Kulkarni",
              title: "Pune • Verified Buyer",
              rating: 5,
            },
            {
              id: 3,
              quote: "Requested custom pastel colors for a wedding hamper gift. The artisan team was super responsive on WhatsApp and delivered right on time.",
              name: "Aditya Sharma",
              title: "Bengaluru • Verified Buyer",
              rating: 5,
            },
            {
              id: 4,
              quote: "The crochet tulip bunch brought such a delicate warmth to my living room. Never wilts, beautifully wrapped with craft paper and satin ribbon.",
              name: "Ananya Roy",
              title: "Kolkata • Verified Buyer",
              rating: 5,
            },
            {
              id: 5,
              quote: "Got the brass kada along with chocolate box for my fiancé. The unboxing experience felt super premium and handcrafted with immense care.",
              name: "Sneha Patel",
              title: "Ahmedabad • Verified Buyer",
              rating: 5,
            },
          ]}
          speed="slow"
        />

        <div className="text-center mt-6">
          <Link 
            href="/reviews" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24483B] hover:text-[#C9A45C] hover:underline"
          >
            <span>Read all customer photo reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 10. Bespoke Custom Orders Callout */}
      <BackgroundGradient containerClassName="w-full">
        <section className="p-8 md:p-14 rounded-[35px] bg-gradient-to-br from-[#24483B] via-[#1D3B30] to-[#142921] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(36,72,59,0.2),_inset_0_1px_2px_rgba(255,255,255,0.2)]">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[#EDE3D5] font-bold text-xs uppercase tracking-wider mb-3 backdrop-blur-xs">
              Artisan Concierge
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">
              Have a Dream Craft Idea?
            </h2>
            <p className="font-sans text-[#EDE3D5]/90 text-xs md:text-sm leading-relaxed">
              Need customized floral arrangements for weddings, baby showers, or corporate gifts? Share your inspiration and our artisans will handcraft it for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/custom-gifts"
              className="px-8 py-3.5 rounded-2xl text-xs font-bold text-[#24483B] bg-[#EDE3D5] hover:bg-white transition-all text-center shadow-xs"
            >
              Customize Your Gift →
            </Link>
            <a
              href="https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20want%20to%20discuss%20a%20custom%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center backdrop-blur-xs"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </BackgroundGradient>

    </div>
  );
}
