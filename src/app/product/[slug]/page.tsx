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
                <span className="bg-gradient-to-r from-[#B03E5D] to-[#6E1C32] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(176,62,93,0.35)]">Sale</span>
              )}
            </div>
            
            <div className="flex gap-2 items-center text-[#8B5E6B] text-xs font-semibold mt-2">
              <Link href="/shop" className="hover:text-[#382025] transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-[#382025] transition-colors">{product.categoryName || 'Uncategorized'}</Link>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#382025] leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400 gap-0.5" aria-label={`Rating: ${averageRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(averageRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-amber-200 fill-amber-50"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-sm text-[#382025]">{averageRating}</span>
              <a className="text-xs text-[#8B5E6B] hover:text-[#D45B7A] hover:underline font-semibold transition-colors" href="#reviews">({reviewsCount} reviews)</a>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="space-y-2 py-4 border-y border-[#F3E1E5]">
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-2xl md:text-3xl font-bold text-[#382025]">₹{price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-base text-[#8B5E6B]/70 line-through">₹{product.price}</span>
                  <span className="bg-[#FDF2F5] text-[#B03E5D] border border-[#F3E1E5] font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            {inStock ? (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Only {product.inventory?.currentStock || 'a few'} left in stock - order soon!
              </p>
            ) : (
              <p className="text-xs font-semibold text-rose-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Out of Stock
              </p>
            )}
          </div>

          {/* Actions: Quantity, Wishlist, Add to Cart, Buy Now, and Pincode Check */}
          <ProductPurchaseActions product={product} inStock={inStock} />

          {/* Custom Handmade Request Card */}
          <div className="clay-card p-4 rounded-[22px] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="clay-icon-pod-sm w-9 h-9">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-[#382025]">Need a Custom Color or Size?</p>
                <p className="text-[#8B5E6B] text-[11px]">Our artisans can customize this design for you.</p>
              </div>
            </div>
            <a
              href={`https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20am%20interested%20in%20customizing%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Inquire</span>
            </a>
          </div>
        </div>
      </section>

      {/* Details Accordion / Text */}
      <section className="border-t border-outline-variant/30 pt-12 pb-12">
        <h3 className="font-headline-sm text-primary mb-6">Product Details</h3>
        <p className="font-body-md text-on-surface-variant whitespace-pre-line mb-8">{product.description}</p>
        
        {(product.material || product.dimensions || product.weight) && (
          <div className="bg-surface-container-low p-6 rounded-2xl max-w-2xl mb-12">
            <h3 className="font-body-lg font-semibold text-primary mb-4">Specifications</h3>
            <ul className="space-y-3 font-body-md text-on-surface-variant">
              {product.material && <li className="flex justify-between border-b border-outline-variant/20 pb-2"><span className="text-on-surface">Material</span> <span>{product.material}</span></li>}
              {product.dimensions && <li className="flex justify-between border-b border-outline-variant/20 pb-2"><span className="text-on-surface">Dimensions</span> <span>{product.dimensions}</span></li>}
              {product.weight && <li className="flex justify-between border-b border-outline-variant/20 pb-2"><span className="text-on-surface">Weight</span> <span>{product.weight}</span></li>}
            </ul>
          </div>
        )}
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
