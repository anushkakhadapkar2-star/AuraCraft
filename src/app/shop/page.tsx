import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";

export const metadata = {
  title: "Shop - Aura Craft",
  description: "Browse our collection of handmade crafts and gifts.",
};

export default async function ShopPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const sortParam = typeof searchParams?.sort === 'string' ? searchParams.sort : undefined;
  const searchParam = typeof searchParams?.q === 'string' ? searchParams.q : undefined;

  let categories: any[] = [];
  let products: any[] = [];
  let shopContent: any = null;
  let errorMsg = null;

  try {
    // 1. Fetch categories
    const categoriesSnap = await getDocs(collection(serverDb, "categories"));
    categories = categoriesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(c => c.status === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // 2. Fetch products
    const productsSnap = await getDocs(
      query(collection(serverDb, "products"), where("status", "==", "ACTIVE"))
    );
    products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // 3. Fetch shop page settings
    const shopPageRef = doc(serverDb, "settings", "shoppage");
    const shopPageSnap = await getDoc(shopPageRef);
    if (shopPageSnap.exists()) {
      shopContent = shopPageSnap.data();
    }

    if (categoryParam) {
      products = products.filter(p => p.categorySlug === categoryParam);
    }

    // Sorting
    if (sortParam === 'price_asc') {
      products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortParam === 'price_desc') {
      products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortParam === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default sort (newest)
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Client-side filtering for full-text search
    if (searchParam) {
      const term = searchParam.toLowerCase();
      products = products.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term)
      );
    }
  } catch (err: any) {
    console.error("Firebase fetch error:", err);
    errorMsg = err.message || "Failed to load products.";
  }

  const bannerUrl = shopContent?.bannerUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuA9tvSnps6IHsJvimKcQ0dknXS8LRr4k0ymD7gMzAvuBgb5c61ttf5OgXAnABd1qmw_O20Dh8iiPY7UHU1B6BbkRaL581X5VdUZYEW_QRVSsqaG9MH9WWoAaXspWThN5M2UMzFAlwHksKrOILjkoLW5k4ICuF6s4dxNjcMHHOR8GZTcNnOTolE-YRl1G3sfom6zABts9tU6j_hHgKAkXzUiSfk1p7oEfrMODrxIxsXQhY9WEQ_CL1G28A";
  const headingText = shopContent?.headingText || "Spring Sale is Live!";
  const subText = shopContent?.subText || "Enjoy up to 40% off on selected collections.";
  const discountBadge = shopContent?.discountBadge || "UP TO 40% OFF";
  const buttonText = shopContent?.buttonText || "Explore Deals";
  const buttonLink = shopContent?.buttonLink || "/shop?sort=price_asc";

  return (
    <main className="flex-grow pt-8 pb-stack-xl max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop">
      {/* 1. Shop by Category (Circles) */}
      <section className="mb-12 md:mb-16 fade-in-up">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-display-md text-primary text-2xl">Shop by Category</h2>
          <Link href="/shop" className="text-primary font-headline-sm hover:underline flex items-center gap-1">
            Browse all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <Link href="/shop" className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] snap-start group">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center overflow-hidden transition-all relative ${!categoryParam && !searchParam ? 'ring-2 ring-primary ring-offset-4' : 'border border-outline-variant/30 group-hover:border-primary/50'}`}>
              <Image src="/uploads/all-products.png" alt="All Products" fill sizes="(max-width: 768px) 80px, 96px" className="object-cover" />
            </div>
            <div className="text-center">
              <span className={`block font-headline-sm text-sm md:text-base ${!categoryParam && !searchParam ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>All Products</span>
            </div>
          </Link>
          
          {categories.map(cat => {
            const isSelected = categoryParam === cat.slug;
            return (
              <Link href={`/shop?category=${cat.slug}`} key={cat.id} className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] snap-start group">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center overflow-hidden transition-all relative ${isSelected ? 'ring-2 ring-primary ring-offset-4' : 'border border-outline-variant/30 group-hover:border-primary/50'}`}>
                  {cat.imageUrl ? (
                    <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width: 768px) 80px, 96px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant/50">image</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className={`block font-headline-sm text-sm md:text-base ${isSelected ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>{cat.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Promotional Banner */}
      {!categoryParam && !searchParam && (
        <section className="mb-12 md:mb-16 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-full bg-[#1e3d36] rounded-3xl overflow-hidden flex flex-col md:flex-row relative min-h-[300px]">
            {/* Left Text Side */}
            <div className="flex-1 p-8 md:p-14 flex flex-col justify-center z-10">
              <div className="flex items-center gap-2 text-[#eabda0] font-label-caps tracking-wider text-xs md:text-sm mb-4">
                <span className="material-symbols-outlined text-sm">stars</span> LIMITED TIME OFFER
              </div>
              <h2 className="font-display-lg text-3xl md:text-5xl text-white mb-4 leading-tight">{headingText}</h2>
              <p className="text-white/80 font-body-md md:font-body-lg max-w-md mb-8">{subText}</p>
              <Link href={buttonLink} className="inline-flex items-center gap-2 bg-[#eabda0] text-[#6f4e37] px-6 py-3 rounded-full font-headline-sm hover:bg-[#eabda0]/90 transition-colors self-start">
                {buttonText} <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            {/* Circular Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex w-32 h-32 bg-[#dda796] rounded-full flex-col items-center justify-center text-white text-center shadow-lg transform -rotate-12 border-4 border-[#1e3d36]">
              <span className="text-sm font-label-caps leading-tight px-4">{discountBadge}</span>
            </div>
            
            {/* Right Image Side */}
            <div className="flex-1 relative min-h-[250px] md:min-h-full w-full">
              <Image 
                src={bannerUrl} 
                alt="Promo Banner" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover" 
              />
              {/* Gradient overlay to blend image nicely into the green background */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1e3d36] via-transparent to-transparent opacity-80 md:opacity-90"></div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Product Grid */}
      <section className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <h2 className="font-display-md text-primary text-2xl mb-1">
              {categoryParam ? categories.find(c => c.slug === categoryParam)?.name : searchParam ? `Results for "${searchParam}"` : 'New Arrivals'}
            </h2>
            <p className="font-body-sm text-on-surface-variant">Showing {products.length} products</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <SortSelect defaultValue={sortParam || "newest"} />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
            </div>
          </div>
        </header>

        {errorMsg ? (
          <div className="py-20 text-center bg-error-container text-on-error-container rounded-[24px] border border-error/30">
            <span className="material-symbols-outlined text-6xl mb-4 text-error">error</span>
            <h2 className="font-headline-sm mb-2">Error Loading Products</h2>
            <p className="mb-6">{errorMsg}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-low rounded-[24px] border border-outline-variant/30">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
            <h2 className="font-headline-sm text-primary mb-2">No products found</h2>
            <p className="text-on-surface-variant mb-6">We couldn't find any products for this selection.</p>
            <Link href="/shop" className="btn-radius bg-primary text-on-primary px-8 py-3 font-medium inline-block rounded-full">
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10" id="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
