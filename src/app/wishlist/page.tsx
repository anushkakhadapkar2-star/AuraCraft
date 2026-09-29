import { auth } from "@/lib/auth/session";
import { getWishlist } from "@/app/actions/wishlist";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartCrack, ShoppingCart } from "lucide-react";

import { WishlistButton } from "@/components/product/WishlistButton";

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
    <div className="py-12 md:py-24 fade-in-up">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Your Wishlist</h1>
          <p className="text-on-surface-variant font-body-md">
            {wishlist?.items.length || 0} {wishlist?.items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {(!wishlist?.items || wishlist.items.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30 text-center px-6">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm">
            <HeartCrack className="w-8 h-8 text-outline" strokeWidth={1.5} />
          </div>
          <h2 className="font-headline-sm text-primary mb-3">Your wishlist is empty</h2>
          <p className="text-on-surface-variant mb-8 max-w-md">
            Save items you love to your wishlist to easily find them later and keep track of pieces you're dreaming of.
          </p>
          <Link 
            href="/shop"
            className="bg-primary text-on-primary px-8 py-3 btn-radius font-body-md font-medium hover:bg-tertiary transition-colors"
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
              <div key={item.id} className="group flex flex-col bg-surface rounded-[24px] overflow-hidden border border-outline-variant/30 hover:border-outline-variant transition-colors soft-shadow relative">
                <Link href={`/product/${product.slug}`} className="relative h-[280px] w-full overflow-hidden bg-surface-container-low">
                  <Image 
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {product.discountPrice && (
                    <div className="absolute top-4 left-4 bg-error text-on-error px-3 py-1 rounded-full text-label-caps tracking-wider z-10">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton productId={product.id} initialIsWishlisted={true} />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="font-headline-sm text-[20px] text-on-background line-clamp-1">{product.name}</h3>
                    </Link>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-sm mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-[20px] text-primary">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && (
                        <span className="text-on-surface-variant line-through text-sm">₹{product.price}</span>
                      )}
                    </div>
                    <button 
                      className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-background hover:bg-primary hover:text-on-primary transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
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
