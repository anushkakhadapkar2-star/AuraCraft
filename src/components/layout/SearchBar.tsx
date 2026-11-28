"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Sparkles, ArrowRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const POPULAR_SEARCHES = [
  "Crochet Bouquets",
  "Festive Torans",
  "Rose Flower",
  "Sunflower",
  "Gift Hamper",
  "Botanical Candle",
];

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!query.trim()) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  // Lazy-load products on first interaction
  useEffect(() => {
    async function loadProducts() {
      if (products.length > 0) return;
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products for search", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isOpen || isExpanded) {
      loadProducts();
    }
  }, [isOpen, isExpanded, products.length]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }
    
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results = products.filter(p => 
        p.name?.toLowerCase().includes(lowerQuery) || 
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.categorySlug?.toLowerCase().includes(lowerQuery) ||
        p.categoryName?.toLowerCase().includes(lowerQuery)
      ).slice(0, 6);
      
      setFilteredProducts(results);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, products]);

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        if (!query.trim()) setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 60);
          }}
          className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
          title="Search handmade crafts"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      ) : (
        <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in zoom-in-95 duration-200">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search bouquets, torans, gifts..."
            className="w-56 sm:w-64 lg:w-80 bg-white border border-[#E6DDCF] text-[#292825] placeholder:text-[#8E8B85] text-xs font-medium rounded-full pl-4 pr-16 py-2.5 focus:outline-none focus:border-[#24483B] focus:ring-4 focus:ring-[#24483B]/10 transition-all font-sans shadow-2xs"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            {query.trim() && (
              <button 
                type="button" 
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="text-[#706E6B] hover:text-[#292825] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="submit" 
              className="text-[#24483B] hover:text-[#C9A45C] p-1 cursor-pointer"
              aria-label="Submit search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Dropdown Results / Popular Suggestions */}
      {isOpen && isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-84 md:w-96 bg-white rounded-[24px] shadow-[0_16px_40px_rgba(41,40,37,0.12)] border border-[#EDE3D5] overflow-hidden z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Query Empty: Show Popular Artisan Searches */}
          {!query.trim() && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#706E6B]">
                <Sparkles className="w-3 h-3 text-[#C9A45C]" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleChipClick(term)}
                    className="text-xs bg-[#FAF7F2] hover:bg-[#EDE3D5] text-[#24483B] font-semibold px-3 py-1.5 rounded-full border border-[#EDE3D5] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Active: Loading State */}
          {query.trim() !== "" && isLoading && (
            <div className="flex items-center justify-center p-6 text-[#706E6B]">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#24483B]" />
              <span className="text-xs font-semibold">Searching artisan creations...</span>
            </div>
          )}
          
          {/* Query Active: Empty State */}
          {query.trim() !== "" && !isLoading && filteredProducts.length === 0 && (
            <div className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-[#292825]">No creations found for "{query}"</p>
              <p className="text-[11px] text-[#706E6B]">Try searching for bouquets, candles, or torans</p>
            </div>
          )}

          {/* Query Active: Results */}
          {query.trim() !== "" && !isLoading && filteredProducts.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold text-[#706E6B] uppercase tracking-wider border-b border-[#EDE3D5]">
                Craft Creations ({filteredProducts.length})
              </div>
              {filteredProducts.map(product => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F2] transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#FAF7F2] border border-[#EDE3D5] rounded-xl overflow-hidden relative shrink-0 shadow-2xs">
                    <Image 
                      src={product.images?.[0]?.url || product.imageUrl || '/products/bouquet_pink_rose_wrap.jpg'} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#292825] truncate group-hover:text-[#24483B] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-[#24483B] mt-0.5 font-bold">
                      ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}

              <div className="border-t border-[#EDE3D5] p-2 bg-[#FAF7F2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full py-2 px-3 text-xs text-center text-[#24483B] hover:bg-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View all results for "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
