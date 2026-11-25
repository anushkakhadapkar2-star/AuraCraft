import { auth } from "@/lib/auth/session";
import { getWishlist } from "@/app/actions/wishlist";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartCrack, ShoppingCart } from "lucide-react";

import { WishlistButton } from "@/components/product/WishlistButton";
import { WishlistAddToCartButton } from "@/components/product/WishlistAddToCartButton";

export default async function WishlistPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const { wishlist, error } = await getWishlist();

  if (error) {
    return (
      <div className="py-12 md:py-24 text-center">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16 fade-in-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#382025] font-bold mb-1">Your Wishlist</h1>
          <p className="text-[#8B5E6B] font-medium text-xs sm:text-sm">
            {wishlist?.items.length || 0} {wishlist?.items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {(!wishlist?.items || wishlist.items.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 clay-card rounded-[32px] text-center px-6">
          <div className="clay-icon-pod w-20 h-20 mb-6">
            <HeartCrack className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#382025] mb-2">Your wishlist is empty</h2>
          <p className="text-[#8B5E6B] text-xs sm:text-sm mb-8 max-w-md">
            Save items you love to your wishlist to easily find them later and keep track of pieces you're dreaming of.
          </p>
          <Link 
            href="/shop"
            className="clay-btn px-8 py-3 rounded-2xl text-xs font-bold shadow-[0_6px_16px_rgba(212,91,122,0.35)]"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.items.map((item) => {
            const product = item.product;
            const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=600&auto=format&fit=crop';
            
            return (
              <div key={item.productId || item.product?.id} className="group flex flex-col clay-card rounded-[28px] overflow-hidden border border-[#F3E1E5] hover:border-[#F8CAD5] transition-all relative">
                <Link href={`/product/${product.slug}`} className="relative h-[260px] w-full overflow-hidden bg-[#FAF7F8]">
                  <Image 
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {product.discountPrice && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#B03E5D] to-[#6E1C32] text-white px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider z-10 shadow-xs">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton productId={product.id} initialIsWishlisted={true} />
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <div className="flex justify-between items-start mb-1.5 gap-4">
                    <Link href={`/product/${product.slug}`} className="hover:text-[#D45B7A] transition-colors">
                      <h3 className="font-serif text-base font-bold text-[#382025] line-clamp-1">{product.name}</h3>
                    </Link>
                  </div>
                  <p className="text-[#8B5E6B] text-xs mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#F3E1E5]">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#382025]">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && (
                        <span className="text-[#8B5E6B]/70 line-through text-xs">₹{product.price}</span>
                      )}
                    </div>
                    <WishlistAddToCartButton product={product} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
