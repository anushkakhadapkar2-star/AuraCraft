"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Debounced filter products based on query
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
        p.category?.toLowerCase().includes(lowerQuery) ||
        p.categorySlug?.toLowerCase().includes(lowerQuery) ||
        p.categoryName?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5); // Limit to 5 results
      
      setFilteredProducts(results);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, products]);

  // Handle Escape key to close
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

  return (
    <div ref={wrapperRef} className="relative">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-10 h-10 rounded-full bg-white border border-[#E6DDCF] text-[#24483B] hover:text-[#C9A45C] hover:bg-[#FAF7F2] shadow-2xs transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
          title="Search products"
        >
          <Search className="w-4 h-4" />
        </button>
      ) : (
        <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in zoom-in-95 duration-200">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products..."
            className="w-56 lg:w-72 bg-white border border-[#E6DDCF] text-[#292825] placeholder:text-[#A8A49E] text-xs font-medium rounded-full pl-4 pr-16 py-2 focus:outline-none focus:border-[#24483B] focus:ring-4 focus:ring-[#24483B]/10 focus:bg-white transition-all duration-300 font-sans shadow-2xs"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query.trim() && (
              <button 
                type="button" 
                onClick={() => { setQuery(""); }}
                className="text-[#706E6B] hover:text-[#292825] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="submit" className="text-[#24483B] hover:text-[#C9A45C] p-1 cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Dropdown Recommendations */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-[24px] shadow-[0_16px_36px_rgba(41,40,37,0.1)] border border-[#E6DDCF] overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading && (
            <div className="flex items-center justify-center p-6 text-[#706E6B]">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#24483B]" />
              <span className="text-xs font-semibold">Searching catalog...</span>
            </div>
          )}
          
          {!isLoading && filteredProducts.length === 0 && (
            <div className="p-6 text-center text-xs font-semibold text-[#706E6B]">
              No products found for "{query}"
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold text-[#706E6B] uppercase tracking-wider border-b border-[#E6DDCF]">
                Products
              </div>
              {filteredProducts.map(product => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F8] transition-colors group"
                >
                  <div className="w-11 h-11 bg-[#FAF7F8] border border-[#F3E1E5] rounded-xl overflow-hidden relative flex-shrink-0 shadow-2xs">
                    <Image 
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=200&auto=format&fit=crop'} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#382025] truncate group-hover:text-[#D45B7A] transition-colors">{product.name}</h4>
                    <p className="text-[11px] text-[#D45B7A] mt-0.5 font-bold">₹{product.discountPrice || product.price}</p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-[#F3E1E5] p-1">
                <Link 
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-xs text-center text-[#D45B7A] hover:text-[#382025] hover:bg-[#FAF7F8] rounded-xl font-bold transition-colors"
                >
                  View all results →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
