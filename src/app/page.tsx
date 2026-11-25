import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Palette, 
  Star, 
  Gift, 
  PackageCheck,
  CheckCircle2,
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

  const bannerUrl = content?.bannerUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuA9tvSnps6IHsJvimKcQ0dknXS8LRr4k0ymD7gMzAvuBgb5c61ttf5OgXAnABd1qmw_O20Dh8iiPY7UHU1B6BbkRaL581X5VdUZYEW_QRVSsqaG9MH9WWoAaXspWThN5M2UMzFAlwHksKrOILjkoLW5k4ICuF6s4dxNjcMHHOR8GZTcNnOTolE-YRl1G3sfom6zABts9tU6j_hHgKAkXzUiSfk1p7oEfrMODrxIxsXQhY9WEQ_CL1G28A";
  const headingText = content?.headingText || "Handmade Pieces That Add a Little Magic to Everyday Life.";
  const buttonText = content?.buttonText || "Shop the Collection";
  const buttonLink = content?.buttonLink || "/shop";

  return (
    <div className="flex flex-col gap-14 md:gap-24 pb-16 text-[#382025] relative">
      
      {/* Decorative Floating 3D Clay Clouds */}
      <div className="absolute top-[4%] left-[-2%] w-28 opacity-60 pointer-events-none hidden lg:block drop-shadow-[0_12px_24px_rgba(212,91,122,0.15)] animate-pulse" style={{ animationDuration: '7s' }}>
        <svg viewBox="0 0 100 60" fill="none">
          <path d="M20 45 Q10 45 10 35 Q10 25 22 25 Q25 10 42 10 Q58 10 64 22 Q75 18 82 28 Q90 32 90 42 Q90 45 80 45 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M25 45 Q15 45 15 38 Q15 28 26 28 Q28 15 42 15 Q56 15 62 25 Q72 22 78 30 Q85 34 85 42 Q85 45 76 45 Z" fill="#FDF2F5" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute top-[35%] right-[-1%] w-24 opacity-50 pointer-events-none hidden lg:block drop-shadow-[0_12px_24px_rgba(212,91,122,0.12)] animate-pulse" style={{ animationDuration: '9s' }}>
        <svg viewBox="0 0 100 60" fill="none">
          <path d="M20 45 Q10 45 10 35 Q10 25 22 25 Q25 10 42 10 Q58 10 64 22 Q75 18 82 28 Q90 32 90 42 Q90 45 80 45 Z" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>

      {/* 1. Hero Section: Interactive Sliding Cards / Carousel */}
      <HomeHeroSlider initialContent={content} />

      {/* 2. Shop by Category Circles with 3D Clay Lift */}
      {categories.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="clay-badge text-[11px] mb-1.5">
                Curated Aesthetics
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#382025]">
                Featured Craft Categories
              </h2>
            </div>
            <Link 
              href="/categories" 
              className="text-[#D45B7A] hover:text-[#382025] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1.5 transition-colors"
            >
              <span>View all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.slug}`} 
                className="group clay-card flex flex-col items-center text-center p-4 rounded-[28px] hover:border-[#F8CAD5] transition-all duration-300"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative mb-3 bg-[#FAF7F8] border-2 border-white shadow-[0_6px_16px_rgba(212,91,122,0.12)] group-hover:scale-105 transition-transform duration-300 ring-2 ring-[#F3E1E5] group-hover:ring-[#F8CAD5]">
                  {cat.imageUrl ? (
                    <Image 
                      src={cat.imageUrl} 
                      alt={cat.name} 
                      fill 
                      sizes="96px" 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D45B7A]">
                      <Gift className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-xs md:text-sm font-bold text-[#382025] line-clamp-1 group-hover:text-[#D45B7A] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#8B5E6B] mt-0.5 font-medium">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Handcrafted Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-8 border-b border-[#F3E1E5] pb-4">
            <div>
              <div className="clay-badge mb-1.5">
                <Star className="w-3.5 h-3.5 fill-[#FFBF00] text-[#FFBF00]" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#382025]">
                Artisan Best Sellers
              </h2>
            </div>
            <Link 
              href="/shop?sort=newest" 
              className="text-[#D45B7A] hover:text-[#382025] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
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

      {/* 4. Brand Value / The Aura Craft Promise */}
      <section className="py-12 px-6 md:px-12 bg-white/70 backdrop-blur-md rounded-[36px] border border-[#F3E1E5] shadow-[0_14px_34px_rgba(212,91,122,0.06),_inset_0_2px_4px_rgba(255,255,255,0.95)] fade-in-up">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="clay-badge mb-2">
            Artisanship & Care
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#382025] mb-2">
            The Aura Craft Artisan Promise
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#8B5E6B] leading-relaxed">
            Every creation is spun from premium fibers and delivered to your doorstep with guaranteed craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#382025] mb-1">100% Handcrafted</h3>
            <p className="text-xs text-[#8B5E6B] leading-relaxed font-sans">
              Meticulously knitted petal-by-petal by passionate Indian craftswomen without any machinery.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#382025] mb-1">Custom Colorways</h3>
            <p className="text-xs text-[#8B5E6B] leading-relaxed font-sans">
              Tailor any bouquet, toran, or favor to match your festive theme or home interior aesthetic.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#382025] mb-1">Fragile-Safe Packaging</h3>
            <p className="text-xs text-[#8B5E6B] leading-relaxed font-sans">
              Shockproof corrugated boxing guarantees flowers arrive in pristine, un-creased condition.
            </p>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col items-start">
            <div className="clay-icon-pod w-12 h-12 mb-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#382025] mb-1">Everlasting Flowers</h3>
            <p className="text-xs text-[#8B5E6B] leading-relaxed font-sans">
              Unlike fresh blooms that fade in 3 days, our crochet florals keep their vibrant charm forever.
            </p>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Showcase */}
      {newArrivals.length > 0 && (
        <section className="fade-in-up">
          <div className="flex justify-between items-end mb-8 border-b border-[#F3E1E5] pb-4">
            <div>
              <div className="clay-badge mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F2A4B7]" />
                <span>Fresh Off The Loom</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#382025]">
                New Handmade Arrivals
              </h2>
            </div>
            <Link 
              href="/shop?new=true" 
              className="text-[#D45B7A] hover:text-[#382025] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
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

      {/* 6. Customer Stories / Verified Reviews Carousel */}
      <section className="fade-in-up">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 text-[#FFBF00] mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-[#FFBF00] text-[#FFBF00]" />
            ))}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#382025] mb-2">
            Loved By Craft Enthusiasts Across India
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#8B5E6B]">
            Read authentic reviews from happy customers who gifted or styled their homes with Aura Craft.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clay-card p-6 rounded-[28px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-[#FFBF00]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#FFBF00] text-[#FFBF00]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#382025] leading-relaxed italic font-serif">
                "Ordered the sunflower and rose bouquet for my sister's graduation. The stitching and packaging exceeded my expectations. She keeps it on her study desk!"
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3E1E5] flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-xs text-[#382025]">Rhea Deshmukh</h4>
                <p className="text-[11px] text-[#8B5E6B]">Mumbai • Verified Buyer</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-[#FFBF00]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#FFBF00] text-[#FFBF00]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#382025] leading-relaxed italic font-serif">
                "The festive toran is stunning! It looks so rich on our front entrance door. Beautifully crafted with high quality yarn that doesn't fray."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3E1E5] flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-xs text-[#382025]">Pooja Kulkarni</h4>
                <p className="text-[11px] text-[#8B5E6B]">Pune • Verified Buyer</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="clay-card p-6 rounded-[28px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-[#FFBF00]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#FFBF00] text-[#FFBF00]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#382025] leading-relaxed italic font-serif">
                "Requested custom pastel colors for a wedding hamper gift. The artisan team was super responsive on WhatsApp and delivered right on time."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3E1E5] flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-xs text-[#382025]">Aditya Sharma</h4>
                <p className="text-[11px] text-[#8B5E6B]">Bengaluru • Verified Buyer</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/reviews" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D45B7A] hover:text-[#382025] hover:underline"
          >
            <span>Read all customer photo reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 7. Bespoke Custom Orders Callout */}
      <section className="p-8 md:p-14 rounded-[36px] bg-gradient-to-br from-[#D45B7A] via-[#B03E5D] to-[#6E1C32] text-white flex flex-col md:flex-row items-center justify-between gap-8 fade-in-up shadow-[0_20px_50px_rgba(212,91,122,0.25),_inset_0_2px_4px_rgba(255,255,255,0.3)]">
        <div className="max-w-xl text-center md:text-left">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider mb-3 backdrop-blur-xs">
            Have a Dream Craft Idea?
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">
            We Create Custom Handmade Orders
          </h2>
          <p className="font-sans text-white/90 text-xs md:text-sm leading-relaxed">
            Need customized floral arrangements for weddings, baby showers, or corporate gifts? Share your inspiration and we'll handcraft it for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/custom-gifts"
            className="clay-btn-secondary px-8 py-3.5 rounded-2xl text-xs font-bold text-[#D45B7A] bg-white hover:bg-[#FAF7F8] transition-all text-center shadow-[0_6px_16px_rgba(0,0,0,0.1)]"
          >
            Customize Your Gift →
          </Link>
          <a
            href="https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20want%20to%20discuss%20a%20custom%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 transition-all text-center backdrop-blur-xs"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
