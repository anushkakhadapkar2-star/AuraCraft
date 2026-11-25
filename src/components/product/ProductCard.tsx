import Link from "next/link";
import { WishlistButton } from "./WishlistButton";
import { ProductQuickAdd } from "./ProductQuickAdd";
import { ProductCardImage } from "./ProductCardImage";
import { Star } from "lucide-react";

export function ProductCard({ product }: { product: any }) {
  const isNew = product.isNewArrival;
  const price = product.discountPrice || product.price;

  const currentStock = Number(product.inventory?.currentStock ?? 10);
  const lowStockThreshold = Number(product.inventory?.lowStockThreshold ?? 5);
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= lowStockThreshold;
  const rating = Number(product.averageRating || product.rating || 0);

  const primaryImage = product.images && product.images.length > 0 
    ? (product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url)
    : product.imageUrl || "/products/bouquet_pink_rose_wrap.jpg";
    
  const hoverImage = product.images && product.images.length > 1
    ? product.images[1].url
    : undefined;

  const isChocolate = product.categorySlug?.toLowerCase() === "chocolates";
  const isJewellery = product.categorySlug?.toLowerCase() === "jewellery";
  const disableHoverSwap = isChocolate || isJewellery;

  const isMenGift = product.gender === "men" || product.name?.toLowerCase().includes("(men)") || product.name?.toLowerCase().includes("men's");
  const isWomenGift = product.gender === "women" || (isJewellery && !isMenGift);

  let subtitleDisplay = product.categorySlug ? product.categorySlug.replace(/-/g, ' ') : 'Handcrafted';
  if (isJewellery) {
    if (isMenGift) subtitleDisplay = "Jewellery • For Him 👨";
    else if (isWomenGift) subtitleDisplay = "Jewellery • For Her 👩";
  }

  return (
    <div className={`group clay-card flex flex-col cursor-pointer relative p-3 rounded-[28px] border transition-all duration-300 ${
      isOutOfStock ? "border-[#F3E1E5] opacity-90" : "border-[#F3E1E5] hover:border-[#F8CAD5]"
    }`}>
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
        <span className="sr-only">View {product.name}</span>
      </Link>
      
      {/* Image Container */}
      <div className={`relative w-full aspect-[4/5] rounded-[22px] overflow-hidden mb-3 bg-[#FAF7F8] border border-[#F3E1E5] shadow-xs transition-all duration-300 ${
        isOutOfStock ? "grayscale-[0.25]" : "group-hover:border-[#F8CAD5]"
      }`}>
        <ProductCardImage
          primarySrc={primaryImage}
          hoverSrc={hoverImage}
          alt={product.name}
          disableHover={disableHoverSwap || isOutOfStock}
          fallbackSrc={
            isChocolate 
              ? "/products/chocolates/cadbury-celebrations.jpg" 
              : isJewellery 
                ? "/products/jewellery/pearl-daisy-earrings.jpg" 
                : "/products/bouquet_pink_rose_wrap.jpg"
          }
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
          {isOutOfStock ? (
            <span className="text-[10px] tracking-wider font-extrabold px-3 py-1 rounded-full uppercase bg-[#382025]/80 text-white backdrop-blur-xs shadow-xs">
              Out of Stock
            </span>
          ) : (
            <>
              {isNew && (
                <span className="text-[10px] tracking-wider font-extrabold px-3 py-1 rounded-full uppercase bg-gradient-to-r from-[#F2A4B7] to-[#D45B7A] text-white shadow-[0_2px_8px_rgba(212,91,122,0.35)]">
                  New
                </span>
              )}
              {product.discountPrice && (
                <span className="text-[10px] tracking-wider font-extrabold px-3 py-1 rounded-full uppercase bg-gradient-to-r from-[#B03E5D] to-[#6E1C32] text-white shadow-[0_2px_8px_rgba(176,62,93,0.35)]">
                  Sale
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick Actions (Wishlist) */}
        <div className="absolute top-2.5 right-2.5 z-20 md:opacity-0 md:group-hover:opacity-100 opacity-90 transition-opacity duration-200">
          <WishlistButton 
            productId={product.id} 
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#D45B7A] hover:text-[#382025] hover:bg-white transition-colors duration-200 shadow-[0_3px_8px_rgba(212,91,122,0.12),_inset_0_1px_2px_rgba(255,255,255,0.95)] border border-[#F3E1E5]" 
          />
        </div>

        {/* Quick Add To Bag overlay on hover (desktop) */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 hidden sm:block">
          <ProductQuickAdd product={product} disabled={isOutOfStock} />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-[15px] sm:text-[16px] leading-snug font-bold text-[#382025] mb-1 line-clamp-1 group-hover:text-[#D45B7A] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <p className="text-xs text-[#8B5E6B] capitalize line-clamp-1 font-medium">
              {subtitleDisplay}
            </p>
            {rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200/60 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-sm sm:text-base text-[#382025]">
                ₹{Number(price).toLocaleString("en-IN")}
              </p>
              {product.discountPrice && (
                <span className="text-xs text-[#8B5E6B]/70 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Quick Add mobile button */}
            <div className="sm:hidden z-20 relative">
              <ProductQuickAdd product={product} disabled={isOutOfStock} />
            </div>
          </div>

          {/* Stock Warning Notice */}
          {isLowStock && !isOutOfStock && (
            <p className="text-[10px] font-bold text-rose-600 mt-1">
              ⚡ Only {currentStock} left in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
