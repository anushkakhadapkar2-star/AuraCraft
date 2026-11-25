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
      <div className="w-full aspect-[4/5] rounded-3xl bg-surface-container-low flex items-center justify-center text-on-surface-variant border border-outline-variant/30">
        <span className="font-body-md text-sm">No image available</span>
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
                    ? "ring-2 ring-primary ring-offset-2 opacity-100 shadow-sm"
                    : "border border-outline-variant/40 opacity-60 hover:opacity-100"
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

      {/* Main Large Image */}
      <div className="w-full rounded-3xl overflow-hidden bg-surface-container-low relative flex-grow aspect-square md:aspect-[4/5] border border-outline-variant/30 shadow-xs">
        <Image
          src={activeImage.url}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover transition-all duration-300"
        />

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full shadow-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

