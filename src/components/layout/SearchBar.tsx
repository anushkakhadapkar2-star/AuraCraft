"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all products for client-side search (suitable for small/medium catalogs)
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
    
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, products.length]);

  // Filter products based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = products.filter(p => 
      p.name?.toLowerCase().includes(lowerQuery) || 
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.category?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 results
    
    setFilteredProducts(results);
  }, [query, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for magic..."
          className="w-48 lg:w-64 bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-primary transition-all duration-300 font-body-md"
        />
        <button type="submit" className="absolute right-3 text-on-surface-variant hover:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Dropdown Recommendations */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-surface rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-outline-variant/20 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading && (
            <div className="flex items-center justify-center p-6 text-on-surface-variant">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
          
          {!isLoading && filteredProducts.length === 0 && (
            <div className="p-6 text-center text-sm text-on-surface-variant font-body-md">
              No products found for "{query}"
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-label-caps text-on-surface-variant/70 border-b border-outline-variant/20">
                Products
              </div>
              {filteredProducts.map(product => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-low transition-colors group"
                >
                  <div className="w-12 h-12 bg-surface-container rounded-md overflow-hidden relative flex-shrink-0">
                    <Image 
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=200&auto=format&fit=crop'} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-headline-sm text-primary truncate">{product.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-medium">₹{product.discountPrice || product.price}</p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-outline-variant/20">
                <Link 
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm text-center text-primary hover:bg-surface-container-low font-headline-sm transition-colors"
                >
                  View all results
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
