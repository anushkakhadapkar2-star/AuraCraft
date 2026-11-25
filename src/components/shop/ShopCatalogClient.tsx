"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  Package,
  RotateCcw,
  LayoutGrid,
  Grid3X3,
  Star,
  Gift,
  Users
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  itemCount?: number;
}

interface ShopCatalogClientProps {
  initialProducts: any[];
  categories: Category[];
  shopContent?: any;
}

// Helper to classify gifts for men vs women vs unisex
export function getProductGender(product: any): "men" | "women" | "unisex" {
  if (product.gender) {
    const g = String(product.gender).toLowerCase().trim();
    if (g === "men" || g === "male" || g === "him") return "men";
    if (g === "women" || g === "female" || g === "her") return "women";
    if (g === "unisex") return "unisex";
  }
  if (product.recipient) {
    const r = String(product.recipient).toLowerCase().trim();
    if (r === "men" || r === "male" || r === "him") return "men";
    if (r === "women" || r === "female" || r === "her") return "women";
    if (r === "unisex") return "unisex";
  }

  const text = `${product.name || ""} ${product.description || ""} ${product.categorySlug || ""} ${product.categoryName || ""}`.toLowerCase();
  
  // Specific men indicators
  const isMen = 
    text.includes("(men)") ||
    text.includes("men's") ||
    text.includes("mens ") ||
    text.includes("for men") ||
    text.includes("for him") ||
    text.includes("kada") ||
    text.includes("titanium band") ||
    text.includes("cuban") ||
    text.includes("signet") ||
    text.includes("punjabi brass");

  if (isMen) return "men";

  // Specific women indicators
  const isWomen =
    text.includes("(women)") ||
    text.includes("women's") ||
    text.includes("womens ") ||
    text.includes("for women") ||
    text.includes("for her") ||
    text.includes("earring") ||
    text.includes("bangle") ||
    text.includes("choker") ||
    text.includes("necklace") ||
    text.includes("jhumka") ||
    text.includes("solitaire rose flower") ||
    text.includes("filigree carved ring") ||
    text.includes("pastel enamel") ||
    text.includes("floral studs");

  if (isWomen) return "women";

  // Bouquets & Floral items
  if (
    product.categorySlug === "crochet-bouquets" ||
    product.categorySlug === "crochet-flowers" ||
    product.categorySlug === "pipe-cleaner-flowers" ||
    product.categorySlug === "pipe-cleaner-bouquets"
  ) {
    return "women";
  }

  return "unisex";
}

export function ShopCatalogClient({
  initialProducts,
  categories,
  shopContent,
}: ShopCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const currentCategorySlug = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentQuery = searchParams.get("q") || searchParams.get("search") || "";
  const currentGender = searchParams.get("gender") || searchParams.get("for") || searchParams.get("recipient") || "all";

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategorySlug);
  const [selectedGender, setSelectedGender] = useState<string>(currentGender);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>(currentSort);
  const [searchQuery, setSearchQuery] = useState<string>(currentQuery);
  const [minRating, setMinRating] = useState<number>(0);

  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Desktop Grid Density: 3 vs 4 columns
  const [gridColumns, setGridColumns] = useState<3 | 4>(3);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedSort(searchParams.get("sort") || "newest");
    setSearchQuery(searchParams.get("q") || searchParams.get("search") || "");
    setSelectedGender(searchParams.get("gender") || searchParams.get("for") || searchParams.get("recipient") || "all");
  }, [searchParams]);

  // Check if current category is specifically Jewellery
  const isJewelleryCategory = selectedCategory === "jewellery";

  // Update URL helper
  const updateUrl = (
    newCategory?: string, 
    newSort?: string, 
    newQuery?: string, 
    newGender?: string
  ) => {
    const params = new URLSearchParams();
    const cat = newCategory !== undefined ? newCategory : selectedCategory;
    const srt = newSort !== undefined ? newSort : selectedSort;
    const qry = newQuery !== undefined ? newQuery : searchQuery;
    // Gender / Recipient filter is EXCLUSIVELY for the Jewellery category
    const isCatJewellery = cat === "jewellery";
    const gnd = isCatJewellery 
      ? (newGender !== undefined ? newGender : selectedGender) 
      : "all";

    if (cat) params.set("category", cat);
    if (srt && srt !== "newest") params.set("sort", srt);
    if (qry) params.set("q", qry);
    if (isCatJewellery && gnd && gnd !== "all") params.set("for", gnd);

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop", { scroll: false });
  };

  // Compute item counts per category across all products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialProducts.length };
    initialProducts.forEach((p) => {
      const slug = p.categorySlug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Compute recipient / gender gift counts strictly for Jewellery category
  const jewelleryRecipientCounts = useMemo(() => {
    const jewelleryItems = initialProducts.filter(
      (p) => p.categorySlug === "jewellery"
    );
    let men = 0;
    let women = 0;
    jewelleryItems.forEach((p) => {
      const g = getProductGender(p);
      if (g === "men") men++;
      if (g === "women") women++;
    });
    return { all: jewelleryItems.length, men, women };
  }, [initialProducts]);

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // 1. Category Filter
        if (selectedCategory && product.categorySlug !== selectedCategory) {
          return false;
        }

        // 2. Recipient / Gender Filter (ONLY applies to Jewellery section)
        if (isJewelleryCategory) {
          if (selectedGender === "men") {
            const g = getProductGender(product);
            if (g !== "men") return false;
          } else if (selectedGender === "women") {
            const g = getProductGender(product);
            if (g !== "women") return false;
          }
        }

        // 3. Search Query Filter
        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase().trim();
          const nameMatch = product.name?.toLowerCase().includes(term);
          const descMatch = product.description?.toLowerCase().includes(term);
          const catMatch = product.categorySlug?.toLowerCase().includes(term);
          if (!nameMatch && !descMatch && !catMatch) return false;
        }

        // 4. Price Range Filter
        const price = Number(product.discountPrice || product.price || 0);
        if (selectedPriceRange === "under-500" && price >= 500) return false;
        if (selectedPriceRange === "500-1000" && (price < 500 || price > 1000)) return false;
        if (selectedPriceRange === "1000-2000" && (price < 1000 || price > 2000)) return false;
        if (selectedPriceRange === "above-2000" && price <= 2000) return false;

        // 5. In Stock Filter
        if (inStockOnly) {
          const stock = product.inventory?.currentStock ?? 1;
          if (stock <= 0) return false;
        }

        // 6. Rating Filter
        if (minRating > 0) {
          const rating = Number(product.averageRating || product.rating || 0);
          if (rating < minRating) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.discountPrice || a.price || 0);
        const priceB = Number(b.discountPrice || b.price || 0);

        if (selectedSort === "price_asc") return priceA - priceB;
        if (selectedSort === "price_desc") return priceB - priceA;
        if (selectedSort === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (selectedSort === "popular") {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
        return 0;
      });
  }, [
    initialProducts,
    selectedCategory,
    selectedGender,
    searchQuery,
    selectedPriceRange,
    inStockOnly,
    minRating,
    selectedSort,
  ]);

  // Active filters count
  const activeFiltersCount = [
    selectedCategory ? 1 : 0,
    (isJewelleryCategory && selectedGender !== "all") ? 1 : 0,
    selectedPriceRange !== "all" ? 1 : 0,
    inStockOnly ? 1 : 0,
    minRating > 0 ? 1 : 0,
    searchQuery.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategory("");
    setSelectedGender("all");
    setSelectedPriceRange("all");
    setInStockOnly(false);
    setMinRating(0);
    setSearchQuery("");
    setSelectedSort("newest");
    router.push("/shop", { scroll: false });
  };

  const currentCategoryName = categories.find((c) => c.slug === selectedCategory)?.name || "All Creations";

  return (
    <div className="w-full">
      {/* 1. TOP BREADCRUMB & INTRO */}
      <div className="mb-6">
        <nav className="text-xs text-[#8B5E6B] mb-2 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#382025] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#382025] transition-colors">Shop</Link>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="font-semibold text-[#382025]">{currentCategoryName}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F3E1E5] pb-5">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#382025] tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : currentCategoryName}
            </h1>
            <p className="text-[#8B5E6B] text-xs sm:text-sm mt-1.5 font-medium">
              Showing <strong className="text-[#382025]">{filteredProducts.length}</strong> handcrafted {filteredProducts.length === 1 ? "creation" : "creations"}
              {inStockOnly ? " (Ready to Ship)" : ""} • Hand-stitched with love
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8B5E6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in catalog..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateUrl(undefined, undefined, e.target.value);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-[#FFF9FA] border border-[#F3E1E5] text-[#382025] placeholder:text-[#A88C94] focus:outline-none focus:border-[#F2A4B7] focus:ring-4 focus:ring-[#F8CAD5]/20 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(212,91,122,0.05)]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  updateUrl(undefined, undefined, "");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B5E6B] hover:text-[#382025]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMPACT CATEGORY PILLS BAR (Layout 3 Minimalist Nav) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setSelectedCategory("");
              updateUrl("");
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              !selectedCategory
                ? "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                : "clay-btn-secondary"
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${!selectedCategory ? 'bg-white/25 text-white' : 'bg-[#FDF2F5] text-[#B03E5D]'}`}>
              {categoryCounts.all || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  updateUrl(cat.slug);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                    : "clay-btn-secondary"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-[#FDF2F5] text-[#B03E5D]'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.5 RECIPIENT / GIFTS FOR JEWELLERY SECTION ONLY */}
      {isJewelleryCategory && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => {
              setSelectedGender("all");
              updateUrl(undefined, undefined, undefined, "all");
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedGender === "all"
                ? "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                : "clay-btn-secondary"
            }`}
          >
            <span>✨ All Jewellery</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedGender === 'all' ? 'bg-white/25 text-white' : 'bg-[#FDF2F5] text-[#B03E5D]'}`}>
              {jewelleryRecipientCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedGender("men");
              updateUrl(undefined, undefined, undefined, "men");
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedGender === "men"
                ? "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                : "clay-btn-secondary"
            }`}
          >
            <span>👨 Gifts for Men</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedGender === 'men' ? 'bg-white/25 text-white' : 'bg-[#FDF2F5] text-[#B03E5D]'}`}>
              {jewelleryRecipientCounts.men}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedGender("women");
              updateUrl(undefined, undefined, undefined, "women");
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedGender === "women"
                ? "clay-btn shadow-[0_4px_12px_rgba(212,91,122,0.35)]"
                : "clay-btn-secondary"
            }`}
          >
            <span>👩 Gifts for Women</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedGender === 'women' ? 'bg-white/25 text-white' : 'bg-[#FDF2F5] text-[#B03E5D]'}`}>
              {jewelleryRecipientCounts.women}
            </span>
          </button>
        </div>
      )}

      {/* 3. MAIN SHOP LAYOUT: LEFT SIDEBAR + RIGHT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===================== DESKTOP STICKY FILTER SIDEBAR ===================== */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 clay-card p-5 rounded-[26px] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3E1E5]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D45B7A]" />
              <h2 className="font-serif font-bold text-sm text-[#382025]">Filters & Attributes</h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-[#D45B7A] hover:text-[#382025] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories Accordion */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
              Categories
            </h3>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  updateUrl("");
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                  !selectedCategory
                    ? "bg-[#FDF2F5] text-[#B03E5D] font-bold shadow-2xs"
                    : "text-[#8B5E6B] hover:text-[#382025] hover:bg-[#FAF7F8]"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] opacity-75">{categoryCounts.all || 0}</span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts[cat.slug] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      updateUrl(cat.slug);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#FDF2F5] text-[#B03E5D] font-bold shadow-2xs"
                        : "text-[#8B5E6B] hover:text-[#382025] hover:bg-[#FAF7F8]"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient / Gifts For Filter (Jewellery only) */}
          {isJewelleryCategory && (
            <div className="pt-4 border-t border-[#F3E1E5]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#D45B7A]" /> Jewellery For
              </h3>
              <div className="space-y-1 text-xs">
                {[
                  { id: "all", label: "All Jewellery", count: jewelleryRecipientCounts.all },
                  { id: "men", label: "👨 Gifts for Men", count: jewelleryRecipientCounts.men },
                  { id: "women", label: "👩 Gifts for Women", count: jewelleryRecipientCounts.women },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedGender(r.id);
                      updateUrl(undefined, undefined, undefined, r.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedGender === r.id
                        ? "bg-[#FDF2F5] text-[#B03E5D] font-bold shadow-2xs"
                        : "text-[#8B5E6B] hover:text-[#382025] hover:bg-[#FAF7F8]"
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[11px] opacity-75">{r.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-[#F3E1E5]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
              Price Range
            </h3>
            <div className="space-y-1.5 text-xs text-[#8B5E6B]">
              {[
                { id: "all", label: "All Prices" },
                { id: "under-500", label: "Under ₹500 (Pocket Blooms)" },
                { id: "500-1000", label: "₹500 – ₹1,000 (Popular Gifts)" },
                { id: "1000-2000", label: "₹1,000 – ₹2,000 (Bouquets)" },
                { id: "above-2000", label: "Above ₹2,000 (Luxury Sets)" },
              ].map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#382025] py-0.5"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === p.id}
                    onChange={() => setSelectedPriceRange(p.id)}
                    className="accent-[#D45B7A] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-4 border-t border-[#F3E1E5]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
              Availability
            </h3>
            <label className="flex items-center gap-2 text-xs text-[#8B5E6B] cursor-pointer hover:text-[#382025]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#D45B7A] w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span className="font-medium">In Stock Only (Ready to Ship)</span>
            </label>
          </div>

          {/* Minimum Rating */}
          <div className="pt-4 border-t border-[#F3E1E5]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
              Customer Rating
            </h3>
            <div className="space-y-1 text-xs text-[#8B5E6B]">
              {[0, 4, 3].map((stars) => (
                <label
                  key={stars}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#382025] py-0.5"
                >
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={minRating === stars}
                    onChange={() => setMinRating(stars)}
                    className="accent-[#D45B7A] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>
                    {stars === 0 ? (
                      "All Ratings"
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-[#382025]">
                        {stars}★ & above
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Value Proposition Badge */}
          <div className="pt-4 border-t border-[#F3E1E5] bg-[#FAF7F8] -mx-5 -mb-5 p-4 rounded-b-[26px]">
            <div className="flex items-center gap-2 text-[#D45B7A] font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" /> 100% Everlasting
            </div>
            <p className="text-[11px] text-[#8B5E6B] leading-relaxed">
              Every petal is individually hand-crocheted using premium cotton yarn that never fades or wilts.
            </p>
          </div>
        </aside>

        {/* ===================== RIGHT PRODUCT SHOWCASE ===================== */}
        <main className="lg:col-span-9 w-full">
          
          {/* Controls Bar: Mobile Filter Button + Sort + Grid Density */}
          <div className="flex items-center justify-between gap-3 mb-6 clay-card p-3 sm:p-4 rounded-2xl">
            
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF9FA] border border-[#F3E1E5] text-xs font-bold text-[#D45B7A] hover:bg-white transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#D45B7A] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Count Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#8B5E6B] font-medium">
              <span>Sort By:</span>
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateUrl(undefined, e.target.value);
                  }}
                  className="appearance-none bg-[#FFF9FA] border border-[#F3E1E5] rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-[#382025] focus:outline-none focus:border-[#F2A4B7] cursor-pointer shadow-[inset_0_1px_2px_rgba(212,91,122,0.05)]"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#D45B7A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Grid Density Buttons (Desktop only) */}
              <div className="hidden sm:flex items-center gap-1 bg-[#FFF9FA] p-1 rounded-xl border border-[#F3E1E5]">
                <button
                  type="button"
                  onClick={() => setGridColumns(3)}
                  aria-label="3 column grid"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridColumns === 3 ? "clay-btn px-2 py-1 shadow-xs" : "text-[#8B5E6B] hover:text-[#382025]"
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridColumns(4)}
                  aria-label="4 column grid"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridColumns === 4 ? "clay-btn px-2 py-1 shadow-xs" : "text-[#8B5E6B] hover:text-[#382025]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className="text-xs text-[#8B5E6B] font-bold">Active:</span>

              {selectedCategory && (
                <span className="clay-badge">
                  {currentCategoryName}
                  <button onClick={() => { setSelectedCategory(""); updateUrl(""); }} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {isJewelleryCategory && selectedGender !== "all" && (
                <span className="clay-badge">
                  {selectedGender === "men" ? "👨 Gifts for Men" : "👩 Gifts for Women"}
                  <button 
                    onClick={() => { 
                      setSelectedGender("all"); 
                      updateUrl(undefined, undefined, undefined, "all"); 
                    }} 
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPriceRange !== "all" && (
                <span className="clay-badge">
                  Price Filter
                  <button onClick={() => setSelectedPriceRange("all")} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="clay-badge">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="clay-badge">
                  {minRating}★ & above
                  <button onClick={() => setMinRating(0)} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="clay-badge">
                  "{searchQuery}"
                  <button onClick={() => { setSearchQuery(""); updateUrl(undefined, undefined, ""); }} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAll}
                className="text-xs text-[#D45B7A] hover:text-[#382025] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center clay-card p-8 rounded-[32px]">
              <div className="clay-icon-pod w-16 h-16 mx-auto mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#382025] mb-1.5">No creations found</h3>
              <p className="text-xs sm:text-sm text-[#8B5E6B] max-w-sm mx-auto mb-6">
                We couldn't find any handmade pieces matching your current filter combination.
              </p>
              <button
                onClick={handleClearAll}
                className="clay-btn px-6 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-[0_6px_16px_rgba(212,91,122,0.35)]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 ${
                gridColumns === 4
                  ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ===================== MOBILE SLIDE-UP FILTER DRAWER ===================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative bg-[#FAF7F8] w-full max-h-[85vh] rounded-t-[32px] border-t border-[#F3E1E5] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#F3E1E5] bg-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D45B7A]" />
                <h3 className="font-serif font-bold text-sm text-[#382025]">Filter & Refine</h3>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#8B5E6B] hover:text-[#382025] hover:bg-[#FAF7F8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Category selector */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      updateUrl("");
                    }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer ${
                      !selectedCategory
                        ? "clay-btn"
                        : "clay-btn-secondary"
                    }`}
                  >
                    All ({categoryCounts.all || 0})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        updateUrl(c.slug);
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer ${
                        selectedCategory === c.slug
                          ? "clay-btn"
                          : "clay-btn-secondary"
                      }`}
                    >
                      {c.name} ({categoryCounts[c.slug] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient selector (Jewellery only) */}
              {isJewelleryCategory && (
                <div className="pt-4 border-t border-[#F3E1E5]">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#D45B7A]" /> Jewellery For
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All Jewellery", count: jewelleryRecipientCounts.all },
                      { id: "men", label: "👨 Gifts for Men", count: jewelleryRecipientCounts.men },
                      { id: "women", label: "👩 Gifts for Women", count: jewelleryRecipientCounts.women },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedGender(r.id);
                          updateUrl(undefined, undefined, undefined, r.id);
                        }}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer ${
                          selectedGender === r.id
                            ? "clay-btn"
                            : "clay-btn-secondary"
                        }`}
                      >
                        {r.label} ({r.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price range */}
              <div className="pt-4 border-t border-[#F3E1E5]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8B5E6B] mb-2.5">
                  Price Range
                </h4>
                <div className="space-y-2">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-500", label: "Under ₹500" },
                    { id: "500-1000", label: "₹500 – ₹1,000" },
                    { id: "1000-2000", label: "₹1,000 – ₹2,000" },
                    { id: "above-2000", label: "Above ₹2,000" },
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-[#382025] font-medium">
                      <input
                        type="radio"
                        name="mobilePrice"
                        checked={selectedPriceRange === p.id}
                        onChange={() => setSelectedPriceRange(p.id)}
                        className="accent-[#D45B7A] w-4 h-4 cursor-pointer"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock status */}
              <div className="pt-4 border-t border-[#F3E1E5]">
                <label className="flex items-center gap-2 cursor-pointer text-[#382025] font-medium">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#D45B7A] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>In Stock Only (Ready to Ship)</span>
                </label>
              </div>

            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 border-t border-[#F3E1E5] bg-white flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="clay-btn-secondary flex-1 py-3 text-xs font-bold"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="clay-btn flex-2 py-3 text-xs font-bold shadow-[0_6px_16px_rgba(212,91,122,0.35)]"
              >
                Show {filteredProducts.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

