"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select 
      name="sort"
      id="sort"
      value={defaultValue}
      onChange={handleSortChange}
      className="appearance-none bg-surface border border-outline-variant/30 rounded-full py-2 pl-4 pr-10 font-body-md text-body-md text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
    >
      <option value="featured">Relevance</option>
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
