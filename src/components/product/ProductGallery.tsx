"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  url: string;
  isPrimary?: boolean;
  order?: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] rounded-[28px] bg-[#FAF7F2] flex items-center justify-center text-[#706E6B] border border-[#E6DDCF]">
        <span className="font-body-md text-sm">No photo available</span>
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnails (Horizontal on Mobile, Vertical on Desktop) */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[540px] pb-2 md:pb-0 scrollbar-thin shrink-0">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-18 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden relative transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#24483B] ring-offset-2 ring-offset-[#FAF7F2] opacity-100 shadow-xs"
                    : "border border-[#E6DDCF] opacity-65 hover:opacity-100"
                }`}
                aria-label={`View photo ${idx + 1} of ${productName}`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Large Image with Subtle Interactive Zoom on Hover */}
      <div className="w-full rounded-[28px] overflow-hidden bg-[#FAF7F2] relative flex-grow aspect-square md:aspect-[4/5] border border-[#E6DDCF] shadow-xs group">
        <Image
          src={activeImage.url}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-[#24483B]/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

