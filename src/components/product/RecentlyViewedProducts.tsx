"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "./ProductCard";

interface SimpleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  images?: any[];
  categorySlug?: string;
  isNewArrival?: boolean;
}

export function RecentlyViewedProducts({ currentProduct }: { currentProduct: SimpleProduct }) {
  const [recentItems, setRecentItems] = useState<SimpleProduct[]>([]);

  useEffect(() => {
    if (!currentProduct?.id) return;

    try {
      const STORAGE_KEY = "aura-recently-viewed";
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: SimpleProduct[] = raw ? JSON.parse(raw) : [];

      // Filter out current product if already in list
      list = list.filter((p) => p.id !== currentProduct.id);

      // Set items to display (previous ones, not current)
      setRecentItems(list.slice(0, 4));

      // Append current product to the front and save up to 8
      const updated = [currentProduct, ...list].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save recently viewed item:", e);
    }
  }, [currentProduct]);

  if (recentItems.length === 0) return null;

  return (
    <section className="border-t border-outline-variant/30 pt-12 pb-6 fade-in-up">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display-sm text-2xl font-bold text-primary">
            Recently Viewed
          </h2>
          <p className="font-body-sm text-on-surface-variant text-sm mt-0.5">
            Pieces you browsed during this session.
          </p>
        </div>
        <Link href="/shop" className="text-primary text-xs font-semibold hover:underline">
          Browse All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {recentItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
}

