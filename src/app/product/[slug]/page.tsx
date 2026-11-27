import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import { db as serverDb } from "@/lib/firebase/client";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RecentlyViewedProducts } from "@/components/product/RecentlyViewedProducts";
import { MessageCircle, Heart, Sparkles, CheckCircle2, Star } from "lucide-react";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const productsSnap = await getDocs(
    query(collection(serverDb, "products"), where("slug", "==", decodedSlug), where("status", "==", "ACTIVE"), limit(1))
  );

  if (productsSnap.empty) {
    notFound();
  }

  const product = { id: productsSnap.docs[0].id, ...productsSnap.docs[0].data() } as any;

  // Fetch reviews for rating
  const reviewsSnap = await getDocs(
    query(collection(serverDb, "reviews"), where("productId", "==", product.id), where("status", "==", "APPROVED"))
  );
  
  const reviewsCount = reviewsSnap.size;
  let averageRating = "0.0";
  if (reviewsCount > 0) {
    let totalRating = 0;
    reviewsSnap.forEach(doc => {
      totalRating += doc.data().rating || 0;
    });
    averageRating = (totalRating / reviewsCount).toFixed(1);
  }

  const inStock = (product.inventory?.currentStock ?? 0) > 0;
  const price = product.discountPrice || product.price;

  return (
    <div className="flex-grow pt-[80px] md:pt-[100px] pb-stack-xl max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop space-y-stack-xl">
      {/* Product Top Section: 2 Column Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-stack-md md:gap-gutter">
        {/* Left: Interactive Image Gallery (7 Cols Desktop) */}
        <div className="md:col-span-7">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Right: Product Details (5 Cols Desktop) */}
        <div className="md:col-span-5 flex flex-col gap-6 pt-4 md:pl-4">
          {/* Badges & Title */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {product.isNewArrival && (
                <span className="clay-badge uppercase text-[10px]">New Arrival</span>
              )}
              {product.discountPrice && (
                <span className="bg-[#D99A9C] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-xs">Sale</span>
              )}
            </div>
            
            <div className="flex gap-2 items-center text-[#706E6B] text-xs font-semibold mt-2">
              <Link href="/shop" className="hover:text-[#24483B] transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-[#24483B] transition-colors">{product.categoryName || 'Uncategorized'}</Link>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#24483B] leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex text-amber-500 gap-0.5" aria-label={`Rating: ${averageRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(averageRating))
                        ? "fill-[#C9A45C] text-[#C9A45C]"
                        : "text-amber-200 fill-amber-50"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-sm text-[#24483B]">{averageRating}</span>
              <a className="text-xs text-[#706E6B] hover:text-[#24483B] hover:underline font-semibold transition-colors" href="#reviews">({reviewsCount} reviews)</a>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="space-y-2 py-4 border-y border-[#E6DDCF]">
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-2xl md:text-3xl font-bold text-[#24483B]">₹{price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-base text-[#706E6B]/70 line-through">₹{product.price}</span>
                  <span className="bg-[#EDE3D5] text-[#24483B] border border-[#E6DDCF] font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            {inStock ? (
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> In Stock • Handcrafted and ready to dispatch
              </p>
            ) : (
              <p className="text-xs font-semibold text-rose-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Currently Out of Stock
              </p>
            )}
          </div>

          {/* Actions: Quantity, Wishlist, Add to Cart, Buy Now, and Pincode Check */}
          <ProductPurchaseActions product={product} inStock={inStock} />

          {/* Custom Handmade Request Card */}
          <div className="clay-card p-4 rounded-[22px] flex items-center justify-between gap-3 text-xs border border-[#E6DDCF]">
            <div className="flex items-center gap-2.5">
              <div className="clay-icon-pod-sm w-9 h-9">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-[#24483B]">Need a Custom Colorway or Size?</p>
                <p className="text-[#706E6B] text-[11px]">Our Mumbai artisans can customize this piece for your home.</p>
              </div>
            </div>
            <a
              href={`https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20am%20interested%20in%20customizing%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Inquire</span>
            </a>
          </div>
        </div>
      </section>

      {/* Details & Specifications & Care Guide */}
      <section className="border-t border-[#E6DDCF] pt-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="clay-badge mb-2">Artisan Notes</span>
              <h3 className="font-serif text-2xl font-bold text-[#24483B] mb-4">Product Details & Story</h3>
              <p className="font-body-md text-[#5C5853] whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

            {/* Care Instructions Accordion / Guide */}
            <div className="bg-[#EDE3D5]/40 p-6 rounded-2xl border border-[#E6DDCF] space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#24483B]">Artisanal Care Guide</h4>
              <p className="text-xs text-[#706E6B] leading-relaxed">
                • <strong>Cleaning:</strong> Use a soft blush brush or a hair dryer on the lowest cool setting to gently dust off petals.<br/>
                • <strong>Wash:</strong> Spot clean with a damp cotton swab and mild baby detergent. Do not machine wash or soak.<br/>
                • <strong>Longevity:</strong> Store out of constant direct scorching sunlight to preserve the vibrant yarn dye tones.
              </p>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-[#E6DDCF] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#24483B]">Specifications & Crafting</h3>
              <ul className="space-y-3 text-xs text-[#5C5853]">
                <li className="flex justify-between border-b border-[#E6DDCF] pb-2">
                  <span className="font-bold text-[#24483B]">Craft Technique</span>
                  <span>100% Hand Crochet</span>
                </li>
                <li className="flex justify-between border-b border-[#E6DDCF] pb-2">
                  <span className="font-bold text-[#24483B]">Material</span>
                  <span>{product.material || "Premium Eco Milk Cotton Yarn"}</span>
                </li>
                {product.dimensions && (
                  <li className="flex justify-between border-b border-[#E6DDCF] pb-2">
                    <span className="font-bold text-[#24483B]">Dimensions</span>
                    <span>{product.dimensions}</span>
                  </li>
                )}
                {product.weight && (
                  <li className="flex justify-between border-b border-[#E6DDCF] pb-2">
                    <span className="font-bold text-[#24483B]">Weight</span>
                    <span>{product.weight}</span>
                  </li>
                )}
                <li className="flex justify-between border-b border-[#E6DDCF] pb-2">
                  <span className="font-bold text-[#24483B]">Packaging</span>
                  <span>Shockproof Rigid Gift Box</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-bold text-[#24483B]">Origin</span>
                  <span>Handcrafted in India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Reviews */}
      <ProductReviews 
        productId={product.id} 
        productName={product.name}
        productSlug={product.slug}
      />

      {/* Related Products */}
      <RelatedProducts categorySlug={product.categorySlug} currentProductId={product.id} />

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts currentProduct={product} />
    </div>
  );
}

async function RelatedProducts({ categorySlug, currentProductId }: { categorySlug: string, currentProductId: string }) {
  if (!categorySlug) return null;

  const relatedSnap = await getDocs(
    query(
      collection(serverDb, "products"),
      where("categorySlug", "==", categorySlug),
      where("status", "==", "ACTIVE"),
      limit(5)
    )
  );

  const relatedProducts = relatedSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) return null;

  // We need to import ProductCard if it's not imported at the top. Let's assume it's imported or we'll import it.
  return (
    <section className="border-t border-outline-variant/30 pt-12 pb-12">
      <h2 className="font-display-sm text-primary mb-8">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {relatedProducts.map(prod => (
          // @ts-ignore
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
}
