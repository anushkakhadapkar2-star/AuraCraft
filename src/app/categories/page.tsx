import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Craft Categories | Aura Craft",
  description: "Explore our handmade crochet bouquets, festive torans, bespoke hampers, and floral artisan gifts.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: any[] = [];
  let productsByCategory: Record<string, number> = {};

  try {
    const categoriesSnap = await getDocs(collection(serverDb, "categories"));
    categories = categoriesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(c => c.status !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Fetch active products to compute real counts per category
    const productsSnap = await getDocs(
      query(collection(serverDb, "products"), where("status", "==", "ACTIVE"))
    );

    productsSnap.docs.forEach(doc => {
      const data = doc.data();
      const slug = data.categorySlug;
      if (slug) {
        productsByCategory[slug] = (productsByCategory[slug] || 0) + 1;
      }
    });
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  // Fallback category imagery if not uploaded
  const fallbackImages: Record<string, string> = {
    "crochet-bouquets": "https://images.unsplash.com/photo-1599827552599-4f51e0db01cb?auto=format&fit=crop&q=80&w=800",
    "crochet-torans": "https://images.unsplash.com/photo-1615526676136-2244bbd1b585?auto=format&fit=crop&q=80&w=800",
    "crochet-flowers": "https://images.unsplash.com/photo-1515276427842-f85802d514a2?auto=format&fit=crop&q=80&w=800",
    "pipe-cleaners": "https://images.unsplash.com/photo-1582736183424-9b88235210c4?auto=format&fit=crop&q=80&w=800",
    "gift-hampers": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    "jewellery": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    "chocolates": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=800",
  };

  return (
    <div className="flex-grow pb-16 max-w-7xl mx-auto w-full">
      {/* Category Header */}
      <section className="mb-10 md:mb-14 text-center max-w-3xl mx-auto fade-in-up">
        <div className="clay-badge mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>Artisan Handmade Collections</span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-[#24483B] font-bold mb-4 tracking-tight">
          Explore Our Craft Categories
        </h1>
        <p className="font-sans text-[#706E6B] text-sm md:text-base leading-relaxed">
          From everlasting crochet floral bouquets to traditional festive torans, each piece is handcrafted with love, patience, and premium eco-friendly yarns.
        </p>
      </section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 fade-in-up">
        {categories.map((cat) => {
          const count = productsByCategory[cat.slug] || 0;
          const imageSrc = cat.imageUrl || fallbackImages[cat.slug] || "https://images.unsplash.com/photo-1599827552599-4f51e0db01cb?auto=format&fit=crop&q=80&w=800";

          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group clay-card flex flex-col rounded-[32px] overflow-hidden hover:border-[#24483B]/30 transition-all duration-300 relative"
            >
              {/* Category Image with Hover Zoom */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F2]">
                <Image
                  src={imageSrc}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"></div>
                
                {/* Count Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-[#24483B] text-xs font-bold px-3 py-1 rounded-full border border-[#EDE3D5] shadow-xs">
                  {count} {count === 1 ? "Product" : "Products"}
                </div>

                {/* Mobile/Bottom Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-xl md:text-2xl font-bold tracking-tight drop-shadow-xs">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-6 flex flex-col justify-between flex-grow gap-4 bg-white">
                <p className="font-sans text-xs sm:text-sm text-[#706E6B] line-clamp-2 leading-relaxed">
                  {cat.description || `Handmade ${cat.name.toLowerCase()} curated for home styling, gifting, and special celebrations.`}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#EDE3D5]">
                  <span className="text-xs font-bold text-[#24483B] uppercase tracking-wider group-hover:text-[#C9A45C] transition-colors">
                    Explore Collection
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#24483B] text-[#24483B] group-hover:text-white flex items-center justify-center transition-all border border-[#EDE3D5] shadow-2xs">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Bespoke Custom Orders Banner */}
      <section className="mt-16 md:mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] border border-[#EDE3D5] flex flex-col md:flex-row items-center justify-between gap-6 fade-in-up">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24483B] bg-[#EDE3D5] px-3.5 py-1 rounded-full mb-3 border border-[#DFD3C3]">
            <Heart className="w-3 h-3 text-[#D99A9C] fill-[#D99A9C]" />
            <span>Custom Craft Requests</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24483B] mb-2">
            Looking for a Custom Colorway or Festive Hamper?
          </h2>
          <p className="font-sans text-[#706E6B] text-sm md:text-base leading-relaxed">
            Our artisan crochet team creates custom flower bouquets, personalized wedding favors, and bespoke torans suited to your interior palette.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/about"
            className="clay-btn px-6 py-3 rounded-full text-sm font-bold shadow-[0_4px_14px_rgba(36,72,59,0.25)]"
          >
            Request Custom Order
          </Link>
          <Link
            href="/shop"
            className="clay-btn-secondary px-6 py-3 rounded-full text-sm font-bold"
          >
            All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
