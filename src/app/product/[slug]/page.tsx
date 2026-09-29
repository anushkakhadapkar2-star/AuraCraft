import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { db as serverDb } from "@/lib/firebase/client";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductReviews } from "@/components/product/ProductReviews";

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
        {/* Left: Gallery (7 Cols Desktop) */}
        <div className="md:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails (Vertical Desktop, Horizontal Mobile) */}
          <div className="flex md:flex-col gap-4 overflow-x-auto hide-scroll md:overflow-visible w-full md:w-24 shrink-0">
            {product.images?.map((img: any, idx: number) => (
              <button key={idx} className={`w-20 h-24 md:w-full md:h-32 rounded-xl overflow-hidden relative transition-opacity ${idx === 0 ? 'border-2 border-primary opacity-100' : 'border border-outline-variant/30 opacity-60 hover:opacity-100'}`}>
                <Image className="w-full h-full object-cover" alt="Thumbnail" src={img.url} fill />
              </button>
            ))}
          </div>
          {/* Main Image */}
          <div className="w-full rounded-2xl overflow-hidden bg-surface-container-low relative flex-grow aspect-square md:aspect-[4/5]">
            {product.images?.length > 0 ? (
              <Image className="w-full h-full object-cover" alt={product.name} src={product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url} fill priority />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-on-surface-variant">No image</div>
            )}
          </div>
        </div>

        {/* Right: Product Details (5 Cols Desktop) */}
        <div className="md:col-span-5 flex flex-col gap-6 pt-4 md:pl-4">
          {/* Badges & Title */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {product.isNewArrival && (
                <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase px-3 py-1 rounded-full">New Arrival</span>
              )}
              {product.discountPrice && (
                <span className="bg-error-container text-on-error-container font-label-caps text-label-caps uppercase px-3 py-1 rounded-full">Sale</span>
              )}
            </div>
            
            <div className="flex gap-2 items-center text-on-surface-variant text-sm mt-2">
              <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-primary transition-colors">{product.categoryName || 'Uncategorized'}</Link>
            </div>

            <h1 className="font-headline-md text-headline-md md:text-display-lg font-bold text-on-background">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {star <= Math.round(Number(averageRating)) ? 'star' : 'star_border'}
                  </span>
                ))}
              </div>
              <span className="font-body-md text-body-md font-semibold text-on-background">{averageRating}</span>
              <a className="font-body-md text-body-md text-on-surface-variant underline decoration-1 underline-offset-4 hover:text-primary transition-colors" href="#reviews">({reviewsCount} reviews)</a>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="space-y-2 py-4 border-y border-outline-variant/30">
            <div className="flex items-baseline gap-4">
              <span className="font-headline-sm text-headline-sm font-bold text-primary">₹{price}</span>
              {product.discountPrice && (
                <>
                  <span className="font-body-lg text-body-lg text-on-surface-variant line-through">₹{product.price}</span>
                  <span className="font-label-caps text-label-caps text-error bg-error-container px-2 py-1 rounded">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            {inStock ? (
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-outline"></span> Only {product.inventory?.currentStock || 'a few'} left in stock - order soon!
              </p>
            ) : (
              <p className="font-body-md text-body-md text-error flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span> Out of Stock
              </p>
            )}
          </div>

          {/* Actions: Quantity & Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-outline-variant rounded-full bg-surface-container-lowest h-12">
                <button className="px-4 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>remove</span></button>
                <span className="font-body-md text-body-md font-semibold text-on-background w-8 text-center">1</span>
                <button className="px-4 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>add</span></button>
              </div>
              <WishlistButton 
                productId={product.id} 
                className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant/50 text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shrink-0 bg-transparent"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <AddToCartButton product={product} disabled={!inStock} />
            </div>
          </div>

          {/* Pincode Checker */}
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-4 mt-2">
            <p className="font-body-md text-body-md font-semibold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>local_shipping</span> Delivery Options
            </p>
            <div className="flex gap-2">
              <input className="flex-grow bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Enter Pincode" type="text" />
              <button className="px-6 py-3 border border-outline-variant/50 rounded-xl font-body-md text-body-md text-primary font-semibold hover:bg-surface-container-high transition-colors">Check</button>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant normal-case tracking-normal">Usually dispatches in 1-2 business days.</p>
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
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <RelatedProducts categorySlug={product.categorySlug} currentProductId={product.id} />
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
