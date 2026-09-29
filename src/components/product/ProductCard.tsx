import Link from "next/link";
import Image from "next/image";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: any }) {
  const isNew = product.isNewArrival;
  const price = product.discountPrice || product.price;

  return (
    <div className="group flex flex-col cursor-pointer relative">
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {product.name}</span>
      </Link>
      
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden mb-4 bg-surface-container-low">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            No image
          </div>
        )}

        {/* Hover Image (if second image exists) */}
        {product.images && product.images.length > 1 && (
          <Image
            src={product.images[1].url}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        {(isNew || product.discountPrice) && (
          <div className="absolute top-3 left-3 bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps px-3 py-1 rounded-full uppercase border border-beige z-20">
            {isNew ? 'New' : 'Sale'}
          </div>
        )}

        {/* Quick Actions (Wishlist) */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton productId={product.id} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors duration-300" />
        </div>
      </div>

      {/* Product Info */}
      <h3 className="font-headline-sm text-[20px] leading-[1.4] font-semibold text-primary mb-1 line-clamp-1">
        {product.name}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-2 line-clamp-1">
        {product.categorySlug?.replace('-', ' ')}
      </p>
      
      <div className="flex items-baseline gap-2">
        <p className="font-body-lg text-body-lg text-primary">₹{price}</p>
        {product.discountPrice && (
          <span className="font-body-md text-on-surface-variant line-through">
            ₹{product.price}
          </span>
        )}
      </div>
    </div>
  );
}
