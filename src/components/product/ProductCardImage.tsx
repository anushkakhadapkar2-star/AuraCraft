"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductCardImage({
  primarySrc,
  hoverSrc,
  alt,
  disableHover = false,
  fallbackSrc = "/products/bouquet_pink_rose_wrap.jpg",
}: {
  primarySrc: string;
  hoverSrc?: string;
  alt: string;
  disableHover?: boolean;
  fallbackSrc?: string;
}) {
  const [src, setSrc] = useState(primarySrc);
  const [hoverImageSrc, setHoverImageSrc] = useState(hoverSrc);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={() => {
          if (src !== fallbackSrc) setSrc(fallbackSrc);
        }}
        unoptimized={src.startsWith("http")}
      />
      {hoverImageSrc && !disableHover && hoverImageSrc !== src && (
        <Image
          src={hoverImageSrc}
          alt={`${alt} alternate view`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          onError={() => setHoverImageSrc(undefined)}
          unoptimized={hoverImageSrc.startsWith("http")}
        />
      )}
    </>
  );
}
