"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Gift, 
  Sparkles, 
  Heart, 
  Check, 
  ShoppingBag, 
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Box, 
  ShieldCheck,
  Truck,
  MessageCircle,
  Gem,
  KeyRound,
  Candy,
  Flame,
  Search,
  CheckCircle2,
  Users
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

// Safe image component with error fallback
function SafeHamperImage({
  src,
  fallbackSrc = "/products/bouquet_pink_rose_wrap.jpg",
  alt,
  className = "object-cover group-hover:scale-105 transition-transform duration-300",
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setImgSrc("/products/bouquet_pink_rose_wrap.jpg");
        }
      }}
      unoptimized={imgSrc.startsWith("http")}
    />
  );
}

// 1. BOX TYPES
interface GiftBoxOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge: string;
}

const BOX_OPTIONS: GiftBoxOption[] = [
  {
    id: "box-rose-hatbox",
    name: "Luxury Soft Rose Keepsake Hatbox",
    description: "Premium matte blush cylinder box with gold foil lettering and silky ribbon handles.",
    price: 299,
    image: "/products/bouquet_pink_rose_wrap.jpg",
    badge: "Bestseller",
  },
  {
    id: "box-kraft-trunk",
    name: "Signature Eco Vintage Kraft Gift Box",
    description: "Sturdy artisan craft box filled with recycled wood excelsior and dried rose petals.",
    price: 199,
    image: "/products/crochet_mixed_bouquet_vase.png",
    badge: "Eco-Friendly",
  },
  {
    id: "box-acrylic-lights",
    name: "Crystal Clear Showcase Box with Fairy Lights",
    description: "High-clarity acrylic display keepsake box with included warm battery-powered micro fairy lights.",
    price: 399,
    image: "/products/crochet_rose_lamp.jpg",
    badge: "Showstopper",
  },
  {
    id: "box-wicker-hamper",
    name: "Rustic Handwoven Wicker Basket Hamper",
    description: "Traditional artisan wicker basket lined with organic cotton lace fabric.",
    price: 349,
    image: "/products/bouquet_sunflower_yellow.png",
    badge: "Country Chic",
  },
  {
    id: "box-royal-velvet",
    name: "Royal Rosewood Velvet Hamper Chest",
    description: "Plush velvet rigid box with golden latch and satin interior cushioning.",
    price: 449,
    image: "/products/bouquet_purple_tulips.png",
    badge: "Luxury VIP",
  },
];

// 2. ITEM CATALOG (Bouquets, Keychains, Jewellery, Chocolates, Candles)
interface HamperItem {
  id: string;
  category: "bouquet" | "keychain" | "jewellery" | "chocolate" | "candle";
  gender?: "women" | "men" | "unisex";
  subCategory?: 
    | "women-earrings" 
    | "women-bangles" 
    | "women-necklace" 
    | "women-rings" 
    | "men-kadas" 
    | "men-rings" 
    | "men-chains"
    | "ferrero"
    | "dairy-milk"
    | "luxury-chocolate"
    | "crochet-flower"
    | "cute-charm"
    | "scented-candle";
  brand?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  fallbackImage: string;
  tag?: string;
}

const BOUQUET_OPTIONS: HamperItem[] = [
  {
    id: "bq-english-rose",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Everlasting English Rose Bouquet (7 Stems)",
    description: "Velvety hand-knitted English roses with eucalyptus sprigs and baby's breath.",
    price: 1499,
    image: "/products/crochet_mixed_bouquet_vase.png",
    fallbackImage: "/products/crochet_mixed_bouquet_vase.png",
    tag: "Romantic Classic",
  },
  {
    id: "bq-sunflower",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Sunshine & Hope Sunflower Bloom",
    description: "Radiant golden sunflowers paired with chamomile daisies and green leaves.",
    price: 1299,
    image: "/products/bouquet_sunflower_yellow.png",
    fallbackImage: "/products/bouquet_sunflower_yellow.png",
    tag: "Bright & Cheerful",
  },
  {
    id: "bq-pink-rose-tulip",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Blushing Rose & Tulip Symphony",
    description: "Pastel pink roses combined with spring crochet tulips in artisan paper wrap.",
    price: 1399,
    image: "/products/bouquet_pink_rose_wrap.jpg",
    fallbackImage: "/products/bouquet_pink_rose_wrap.jpg",
    tag: "Sweet Delight",
  },
  {
    id: "bq-lavender-lilies",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Lavender Mist & White Lilies Bunch",
    description: "Soothing purple lavender stems with fragrant white lilies in soft milk cotton.",
    price: 1599,
    image: "/products/bouquet_purple_tulips.png",
    fallbackImage: "/products/bouquet_purple_tulips.png",
    tag: "Calming Elegance",
  },
  {
    id: "bq-single-red-rose",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Single Velvet Crimson Rose Stem",
    description: "A single long-stemmed everlasting crochet rose with green leaf accents.",
    price: 199,
    image: "/products/crochet_red_rose.png",
    fallbackImage: "/products/crochet_red_rose.png",
    tag: "Petite Token",
  },
  {
    id: "bq-mini-daisy-pot",
    category: "bouquet",
    subCategory: "crochet-flower",
    name: "Miniature Clay Blooming Flower Pot",
    description: "A sweet single-bloom crochet flower planted in a handcrafted clay desktop pot.",
    price: 799,
    image: "/products/crochet_lily_pot.png",
    fallbackImage: "/products/crochet_lily_pot.png",
    tag: "Desk Keepsake",
  },
];

const KEYCHAIN_OPTIONS: HamperItem[] = [
  {
    id: "kc-bunny-bear",
    category: "keychain",
    subCategory: "cute-charm",
    name: "Cozy Amigurumi Bear / Bunny Charm",
    description: "Adorably plush hand-knitted pocket friend with golden keyring and bell.",
    price: 199,
    image: "/uploads/1788500859287-403471157-teddygifthamper.png",
    fallbackImage: "/uploads/1788500859287-403471157-teddygifthamper.png",
    tag: "Super Cute",
  },
  {
    id: "kc-strawberry-daisy",
    category: "keychain",
    subCategory: "cute-charm",
    name: "Strawberry & Daisy Bag Charm",
    description: "Charming crochet strawberry paired with a smiling chamomile daisy.",
    price: 179,
    image: "/products/crochet_pink_lily.png",
    fallbackImage: "/products/crochet_pink_lily.png",
    tag: "Fruity Fun",
  },
  {
    id: "kc-mini-sunflower",
    category: "keychain",
    subCategory: "cute-charm",
    name: "Mini Sunflower Charm Keychain",
    description: "Pocket-sized crochet sunflower to bring sunshine wherever they go.",
    price: 149,
    image: "/products/crochet_sunflower.jpg",
    fallbackImage: "/products/crochet_sunflower.jpg",
    tag: "Daily Sunshine",
  },
  {
    id: "kc-pearl-heart",
    category: "keychain",
    subCategory: "cute-charm",
    name: "Velvet Love Heart with Pearl Charm",
    description: "Hand-stitched dusty rose heart charm with dangling freshwater pearl bead.",
    price: 129,
    image: "/products/crochet_pink_rose.png",
    fallbackImage: "/products/crochet_pink_rose.png",
    tag: "Sweet Romantic",
  },
];

// 3. JEWELLERY (Women & Men Sections with Earrings, Bangles, Necklace Sets, Rings, Kadas)
const JEWELLERY_OPTIONS: HamperItem[] = [
  // --- WOMEN'S JEWELLERY: EARRINGS ---
  {
    id: "jw-w-earring-pearl-drop",
    category: "jewellery",
    gender: "women",
    subCategory: "women-earrings",
    name: "Handcrafted Pearl & Daisy Drop Earrings",
    description: "Lightweight hypoallergenic 18k gold-plated hooks with miniature white crochet daisies and teardrop pearls.",
    price: 349,
    image: "/products/jewellery/pearl-daisy-earrings.jpg",
    fallbackImage: "/products/jewellery/pearl-daisy-earrings.jpg",
    tag: "Women • Earrings",
  },
  {
    id: "jw-w-earring-rose-stud",
    category: "jewellery",
    gender: "women",
    subCategory: "women-earrings",
    name: "Blush Rose Gold Floral Studs with Zircons",
    description: "Dainty micro-inlaid cubic zirconia floral petal studs designed for all-day comfort and sensitive ears.",
    price: 299,
    image: "/products/jewellery/rose-gold-floral-studs.jpg",
    fallbackImage: "/products/jewellery/rose-gold-floral-studs.jpg",
    tag: "Women • Earrings",
  },
  {
    id: "jw-w-earring-crochet-jhumka",
    category: "jewellery",
    gender: "women",
    subCategory: "women-earrings",
    name: "Artisan Silk Thread Pastel Jhumkas",
    description: "Festive lightweight festive jhumkas hand-wrapped in blush silk thread with golden bead fringe.",
    price: 399,
    image: "/products/jewellery/pearl-daisy-earrings.jpg",
    fallbackImage: "/products/jewellery/pearl-daisy-earrings.jpg",
    tag: "Women • Earrings",
  },
  {
    id: "jw-w-earring-crystal-huggie",
    category: "jewellery",
    gender: "women",
    subCategory: "women-earrings",
    name: "Dainty Botanical Crystal Huggie Hoops",
    description: "Sparkling crystal pavé huggie hoops adorned with a tiny handcrafted four-leaf clover charm.",
    price: 329,
    image: "/products/jewellery/rose-gold-floral-studs.jpg",
    fallbackImage: "/products/jewellery/rose-gold-floral-studs.jpg",
    tag: "Women • Earrings",
  },

  // --- WOMEN'S JEWELLERY: BANGLES ---
  {
    id: "jw-w-bangle-pastel-enamel",
    category: "jewellery",
    gender: "women",
    subCategory: "women-bangles",
    name: "Artisan Pastel Enamel Kada Bangles (Set of 2)",
    description: "Hand-painted floral enamel cuffs with delicate gold foil accents and ultra-smooth inner finish.",
    price: 449,
    image: "/products/jewellery/pastel-enamel-bangles.jpg",
    fallbackImage: "/products/jewellery/pastel-enamel-bangles.jpg",
    tag: "Women • Bangles",
  },
  {
    id: "jw-w-bangle-rosegold-kada",
    category: "jewellery",
    gender: "women",
    subCategory: "women-bangles",
    name: "Rose Gold Textured Filigree Kada Bangles",
    description: "Pair of openable textured filigree kada bangles with secure precision push-lock clasp.",
    price: 499,
    image: "/products/jewellery/rosegold-kada-bangles.jpg",
    fallbackImage: "/products/jewellery/rosegold-kada-bangles.jpg",
    tag: "Women • Bangles",
  },
  {
    id: "jw-w-bangle-velvet-chooda",
    category: "jewellery",
    gender: "women",
    subCategory: "women-bangles",
    name: "Velvet Thread Chooda Bangles (Set of 4)",
    description: "Soft crimson velvet bangles bordered with sparkling golden micro-pearl beads and silk thread.",
    price: 399,
    image: "/products/jewellery/pastel-enamel-bangles.jpg",
    fallbackImage: "/products/jewellery/pastel-enamel-bangles.jpg",
    tag: "Women • Bangles",
  },
  {
    id: "jw-w-bangle-pearl-cuff",
    category: "jewellery",
    gender: "women",
    subCategory: "women-bangles",
    name: "Lustrous Freshwater Pearl Open Cuff",
    description: "Flexible gold-finish open bangle capped with luminous twin pearls, fits all wrist sizes comfortably.",
    price: 379,
    image: "/products/jewellery/rosegold-kada-bangles.jpg",
    fallbackImage: "/products/jewellery/rosegold-kada-bangles.jpg",
    tag: "Women • Bangles",
  },

  // --- WOMEN'S JEWELLERY: NECKLACE SETS ---
  {
    id: "jw-w-neck-floral-choker",
    category: "jewellery",
    gender: "women",
    subCategory: "women-necklace",
    name: "Handmade Floral Choker & Earrings Set",
    description: "Exquisite woven floral choker with matching drop earrings for birthdays, weddings, and anniversaries.",
    price: 799,
    image: "/products/jewellery/floral-choker-set.jpg",
    fallbackImage: "/products/jewellery/floral-choker-set.jpg",
    tag: "Women • Necklace Set",
  },
  {
    id: "jw-w-neck-rose-quartz",
    category: "jewellery",
    gender: "women",
    subCategory: "women-necklace",
    name: "Layered Rose Quartz & Pearl Pendant Necklace",
    description: "Genuine natural healing rose quartz crystal wrapped in 14k gold-filled wire on a delicate double chain.",
    price: 599,
    image: "/products/jewellery/floral-choker-set.jpg",
    fallbackImage: "/products/jewellery/floral-choker-set.jpg",
    tag: "Women • Necklace Set",
  },
  {
    id: "jw-w-neck-kundan-blossom",
    category: "jewellery",
    gender: "women",
    subCategory: "women-necklace",
    name: "Kundan & Crochet Blossom Festive Necklace Set",
    description: "Heritage Kundan stone work beautifully paired with soft blush crochet petals; includes necklace & jhumkas.",
    price: 999,
    image: "/products/jewellery/floral-choker-set.jpg",
    fallbackImage: "/products/jewellery/floral-choker-set.jpg",
    tag: "Women • Necklace Set",
  },
  {
    id: "jw-w-neck-dainty-heart",
    category: "jewellery",
    gender: "women",
    subCategory: "women-necklace",
    name: "Dainty Gold Heart & Wildflower Charm Necklace",
    description: "Minimalist everyday golden chain with an engraved love heart and micro botanical blossom pendant.",
    price: 449,
    image: "/products/jewellery/floral-choker-set.jpg",
    fallbackImage: "/products/jewellery/floral-choker-set.jpg",
    tag: "Women • Necklace Set",
  },

  // --- WOMEN'S JEWELLERY: RINGS ---
  {
    id: "jw-w-ring-rose-solitaire",
    category: "jewellery",
    gender: "women",
    subCategory: "women-rings",
    name: "Delicate Solitaire Rose Flower Ring (Adjustable)",
    description: "Hand-sculpted rose petal setting with sparkling center crystal, adjustable band to comfortably fit any finger.",
    price: 279,
    image: "/products/jewellery/rose-flower-ring.jpg",
    fallbackImage: "/products/jewellery/rose-flower-ring.jpg",
    tag: "Women • Rings",
  },
  {
    id: "jw-w-ring-vintage-filigree",
    category: "jewellery",
    gender: "women",
    subCategory: "women-rings",
    name: "Vintage Floral Filigree Carved Ring",
    description: "Heirloom-style antique silver-plated band with detailed floral scrollwork and comfortable rounded rim.",
    price: 299,
    image: "/products/jewellery/vintage-filigree-ring.jpg",
    fallbackImage: "/products/jewellery/vintage-filigree-ring.jpg",
    tag: "Women • Rings",
  },
  {
    id: "jw-w-ring-daisy-zircon",
    category: "jewellery",
    gender: "women",
    subCategory: "women-rings",
    name: "Sparkling Daisy Petal Adjustable Zircon Ring",
    description: "Dainty sparkling 5-petal daisy ring in rose gold finish with baguette-cut zircons and open bypass shank.",
    price: 319,
    image: "/products/jewellery/rose-flower-ring.jpg",
    fallbackImage: "/products/jewellery/rose-flower-ring.jpg",
    tag: "Women • Rings",
  },

  // --- MEN'S JEWELLERY: KADAS ---
  {
    id: "jw-m-kada-silver-matte",
    category: "jewellery",
    gender: "men",
    subCategory: "men-kadas",
    name: "Solid Stainless Steel Matte Silver Kada",
    description: "Heavyweight, non-tarnish surgical grade steel kada with a sleek brushed satin finish and comfort inner bevel.",
    price: 499,
    image: "/products/jewellery/mens-silver-steel-kada.jpg",
    fallbackImage: "/products/jewellery/mens-silver-steel-kada.jpg",
    tag: "Men • Kadas",
  },
  {
    id: "jw-m-kada-punjabi-brass",
    category: "jewellery",
    gender: "men",
    subCategory: "men-kadas",
    name: "Traditional Punjabi Brass Royal Kada",
    description: "Authentic heavyweight solid brass kada with subtle Sikh / royal geometric engraving and rich gold luster.",
    price: 549,
    image: "/products/jewellery/mens-punjabi-brass-kada.jpg",
    fallbackImage: "/products/jewellery/mens-punjabi-brass-kada.jpg",
    tag: "Men • Kadas",
  },
  {
    id: "jw-m-kada-braided-leather",
    category: "jewellery",
    gender: "men",
    subCategory: "men-kadas",
    name: "Braided Genuine Leather & Steel Magnetic Kada",
    description: "Double-wound premium black braided leather cuff paired with a brushed stainless magnetic locking clasp.",
    price: 449,
    image: "/products/jewellery/mens-silver-steel-kada.jpg",
    fallbackImage: "/products/jewellery/mens-silver-steel-kada.jpg",
    tag: "Men • Kadas",
  },
  {
    id: "jw-m-kada-gunmetal",
    category: "jewellery",
    gender: "men",
    subCategory: "men-kadas",
    name: "Gunmetal Titanium Heavy Beveled Edge Kada",
    description: "Bold masculine kada in stealth matte gunmetal finish with beveled diamond-cut outer facets.",
    price: 599,
    image: "/products/jewellery/mens-silver-steel-kada.jpg",
    fallbackImage: "/products/jewellery/mens-silver-steel-kada.jpg",
    tag: "Men • Kadas",
  },

  // --- MEN'S JEWELLERY: RINGS ---
  {
    id: "jw-m-ring-black-titanium",
    category: "jewellery",
    gender: "men",
    subCategory: "men-rings",
    name: "Classic Brushed Black Titanium Band",
    description: "Scratch-resistant aerospace-grade matte black titanium ring with smooth polished beveled inner contour.",
    price: 399,
    image: "/products/jewellery/mens-black-titanium-ring.jpg",
    fallbackImage: "/products/jewellery/mens-black-titanium-ring.jpg",
    tag: "Men • Rings",
  },
  {
    id: "jw-m-ring-silver-signet",
    category: "jewellery",
    gender: "men",
    subCategory: "men-rings",
    name: "Sterling Silver Signet Crest Ring with Onyx",
    description: "Regal rectangular black onyx gemstone set in solid 925 sterling silver plated signet frame.",
    price: 499,
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_purple_lily_rose.jpg",
    tag: "Men • Rings",
  },
  {
    id: "jw-m-ring-steel-beveled",
    category: "jewellery",
    gender: "men",
    subCategory: "men-rings",
    name: "Matte Steel Dual-Tone Beveled Band",
    description: "Contemporary silver and carbon-accented masculine band, hypoallergenic, rust-proof and everyday durable.",
    price: 349,
    image: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/crochet_mixed_bouquet_vase.png",
    tag: "Men • Rings",
  },

  // --- MEN'S JEWELLERY: CHAINS & BRACELETS ---
  {
    id: "jw-m-chain-cuban-curb",
    category: "jewellery",
    gender: "men",
    subCategory: "men-chains",
    name: "Cuban Curb Link Chain in Silver Finish (22\")",
    description: "Solid 6mm Cuban link chain in mirror-polished stainless steel with strong lobster claw clasp.",
    price: 649,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_pink_rose_wrap.jpg",
    tag: "Men • Chains",
  },
  {
    id: "jw-m-bracelet-black-onyx",
    category: "jewellery",
    gender: "men",
    subCategory: "men-chains",
    name: "Natural Matte Black Onyx & Tiger Eye Bracelet",
    description: "Masculine 8mm gemstone beaded stretch bracelet for grounding, quiet confidence, and sharp everyday style.",
    price: 399,
    image: "https://images.unsplash.com/photo-1611591475817-ff9d6852bb30?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/crochet_roses_group.png",
    tag: "Men • Bracelets",
  },
];

// 4. CHOCOLATES (Ferrero, Cadbury Dairy Milk, Luxury Truffles)
const CHOCOLATE_OPTIONS: HamperItem[] = [
  // --- FERRERO ROCHER ---
  {
    id: "ch-ferrero-box-16",
    category: "chocolate",
    brand: "Ferrero Rocher",
    subCategory: "ferrero",
    name: "Ferrero Rocher Diamond Gift Box (16 pcs)",
    description: "The iconic whole hazelnut dipped in smooth cocoa cream, wrapped in crisp wafer shell and luxury gold foil.",
    price: 649,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_red_rose_brown.png",
    tag: "Ferrero Rocher",
  },
  {
    id: "ch-ferrero-trio-3",
    category: "chocolate",
    brand: "Ferrero Rocher",
    subCategory: "ferrero",
    name: "Ferrero Golden Hazelnut Trio (3 pcs)",
    description: "Pocket luxury trio of crunchy hazelnut and milk chocolate pralines in golden protective sleeve.",
    price: 199,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_red_rose_brown.png",
    tag: "Ferrero Rocher",
  },
  {
    id: "ch-ferrero-heart-8",
    category: "chocolate",
    brand: "Ferrero Rocher",
    subCategory: "ferrero",
    name: "Ferrero Rocher Celebration Heart Box (8 pcs)",
    description: "Romantic crimson & gold heart-shaped presentation box loaded with 8 crunchy hazelnut Rocher pralines.",
    price: 479,
    image: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_red_roses_iloveyou.png",
    tag: "Ferrero Rocher",
  },
  {
    id: "ch-ferrero-collection-12",
    category: "chocolate",
    brand: "Ferrero Rocher",
    subCategory: "ferrero",
    name: "Ferrero Collection Assorted Gift Box (12 pcs)",
    description: "Indulgent trio of Ferrero Rocher, Rondnoir dark cocoa hazelnut, and Raffaello almond coconut pralines.",
    price: 599,
    image: "https://images.unsplash.com/photo-1575377427643-087b9b73656b?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/crochet_mixed_bouquet_vase.png",
    tag: "Ferrero Rocher",
  },

  // --- CADBURY DAIRY MILK ---
  {
    id: "ch-cadbury-silk-roast-almond",
    category: "chocolate",
    brand: "Cadbury Dairy Milk",
    subCategory: "dairy-milk",
    name: "Cadbury Dairy Milk Silk Roast Almond (143g)",
    description: "Velvety smooth melt-in-mouth milk chocolate loaded with whole roasted crunchy California almonds.",
    price: 199,
    image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/crochet_roses_group.png",
    tag: "Cadbury Dairy Milk",
  },
  {
    id: "ch-cadbury-silk-heart-pop",
    category: "chocolate",
    brand: "Cadbury Dairy Milk",
    subCategory: "dairy-milk",
    name: "Cadbury Dairy Milk Silk Heart Pop Gift Edition (150g)",
    description: "Special edition bar featuring a pop-out blushing heart chocolate centerpiece and romantic outer sleeve.",
    price: 249,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_red_roses_iloveyou.png",
    tag: "Cadbury Dairy Milk",
  },
  {
    id: "ch-cadbury-silk-hazelnut-duo",
    category: "chocolate",
    brand: "Cadbury Dairy Milk",
    subCategory: "dairy-milk",
    name: "Cadbury Dairy Milk Silk Hazelnut Celebration Duo (2 x 143g)",
    description: "Double bar celebration pack bursting with whole imported hazelnuts and silky milk cocoa.",
    price: 379,
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/uploads/1788519515457-944916712-gifthamperteddy.jpg",
    tag: "Cadbury Dairy Milk",
  },
  {
    id: "ch-cadbury-celebrations-rich",
    category: "chocolate",
    brand: "Cadbury Dairy Milk",
    subCategory: "dairy-milk",
    name: "Cadbury Celebrations Rich Dry Fruit Hamper Box",
    description: "Grand festive gift box filled with almonds, cashews, and raisins individually enrobed in Dairy Milk chocolate.",
    price: 549,
    image: "/products/chocolates/cadbury-celebrations.jpg",
    fallbackImage: "/products/chocolates/cadbury-celebrations.jpg",
    tag: "Cadbury Dairy Milk",
  },
  {
    id: "ch-cadbury-silk-red-velvet",
    category: "chocolate",
    brand: "Cadbury Dairy Milk",
    subCategory: "dairy-milk",
    name: "Cadbury Dairy Milk Silk Oreo Red Velvet (130g)",
    description: "Creamy white vanilla swirl and crunchy red velvet Oreo cookie chunks drenched in smooth milk chocolate.",
    price: 219,
    image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/crochet_pink_rose.png",
    tag: "Cadbury Dairy Milk",
  },

  // --- LUXURY BELGIAN & LINDT ---
  {
    id: "ch-lindt-dark-70",
    category: "chocolate",
    brand: "Lindt & Luxury",
    subCategory: "luxury-chocolate",
    name: "Lindt Excellence 70% Smooth Dark Cocoa Bar (100g)",
    description: "World-renowned Swiss master chocolatier intense dark chocolate with balanced aromatic notes.",
    price: 399,
    image: "/products/chocolates/lindt-dark-70.jpg",
    fallbackImage: "/products/chocolates/lindt-dark-70.jpg",
    tag: "Luxury Belgian",
  },
  {
    id: "ch-belgian-truffles-box",
    category: "chocolate",
    brand: "Lindt & Luxury",
    subCategory: "luxury-chocolate",
    name: "Belgian Assorted Ganache Truffles Gift Box (6 pcs)",
    description: "Melt-in-mouth dark espresso, salted caramel, and raspberry Belgian ganache truffles in an artisan box.",
    price: 399,
    image: "/products/chocolates/belgian-truffles.jpg",
    fallbackImage: "/products/chocolates/belgian-truffles.jpg",
    tag: "Luxury Belgian",
  },
  {
    id: "ch-artisan-rose-dark",
    category: "chocolate",
    brand: "Lindt & Luxury",
    subCategory: "luxury-chocolate",
    name: "Artisan Rose Petal & Raspberry Dark Chocolate Slab (100g)",
    description: "Handcrafted bean-to-bar dark chocolate sprinkled with candied organic rose petals and freeze-dried raspberries.",
    price: 289,
    image: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/products/bouquet_red_roses_iloveyou.png",
    tag: "Artisan Craft",
  },
];

const CANDLE_OPTIONS: HamperItem[] = [
  {
    id: "cd-rose-vanilla",
    category: "candle",
    subCategory: "scented-candle",
    name: "Soy Wax Scented Candle: Rose & Vanilla (150g)",
    description: "Hand-poured pure soy candle infused with calming English rose and warm Madagascar vanilla.",
    price: 299,
    image: "/products/crochet_rose_lamp.jpg",
    fallbackImage: "/products/crochet_rose_lamp.jpg",
    tag: "Aromatherapy",
  },
  {
    id: "cd-lavender-bath",
    category: "candle",
    subCategory: "scented-candle",
    name: "French Lavender Relaxing Bath Salts Jar",
    description: "Mineral-rich Epsom crystals with natural lavender essential oil and dried aromatic buds.",
    price: 199,
    image: "/products/crochet_flower_appliques.jpg",
    fallbackImage: "/products/crochet_flower_appliques.jpg",
    tag: "Spa Night",
  },
  {
    id: "cd-rose-mist",
    category: "candle",
    subCategory: "scented-candle",
    name: "Damask Rose Blossom Room & Linen Mist",
    description: "Refreshing pure floral water to scent pillows, crochet flowers, and keepsake hampers.",
    price: 229,
    image: "/products/crochet_pink_lily.png",
    fallbackImage: "/products/crochet_pink_lily.png",
    tag: "Floral Glow",
  },
];

// OCCASIONS & WAX SEALS
const OCCASIONS = [
  "Birthday 🎂",
  "Anniversary 💍",
  "Love & Romance ❤️",
  "Thank You 🙏",
  "Just Because 🌸",
  "Congratulations 🎉",
  "Get Well Soon 💐",
];

const WAX_SEALS = [
  { id: "rose", name: "Blush Rose Petal", icon: "🌹" },
  { id: "heart", name: "Antique Heart", icon: "❤️" },
  { id: "crown", name: "Royal Crown", icon: "👑" },
  { id: "botanical", name: "Botanical Olive Sprig", icon: "🌿" },
];

const NOTE_SUGGESTIONS = [
  "You make every single day brighter and cozier. Happy Birthday my love!",
  "May our love continue to bloom forever, just like these everlasting flowers. Happy Anniversary!",
  "A little reminder of how truly special, cherished, and loved you are every day.",
  "Packed with love, chocolates, and flowers because you deserve the very best!",
];

export function CustomGiftsClient() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // 1. Box Selection
  const [selectedBox, setSelectedBox] = useState<GiftBoxOption>(BOX_OPTIONS[0]);

  // 2. Selected Items Map: { itemId: quantity }
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    "bq-english-rose": 1, // Default bouquet
    "jw-w-earring-pearl-drop": 1, // Default women's jewellery
    "ch-ferrero-trio-3": 1, // Default chocolate
  });

  // 3. Card Note State
  const [recipientName, setRecipientName] = useState("Anushka");
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [noteMessage, setNoteMessage] = useState(
    "Happy Birthday Anushka! Crafted this customized hamper just for you with everlasting flowers, artisan jewellery, and your favorite chocolates. Love you always!"
  );
  const [senderName, setSenderName] = useState("With all my love, Rahul");
  const [selectedWaxSeal, setSelectedWaxSeal] = useState(WAX_SEALS[0]);

  // Active Main Category Filter
  const [activeTab, setActiveTab] = useState<"all" | "bouquet" | "keychain" | "jewellery" | "chocolate" | "candle">("jewellery");

  // Secondary Filters for Jewellery
  const [jewelleryGender, setJewelleryGender] = useState<"all" | "women" | "men">("all");
  const [jewellerySubFilter, setJewellerySubFilter] = useState<string>("all");

  // Secondary Filters for Chocolates
  const [chocolateBrandFilter, setChocolateBrandFilter] = useState<string>("all");

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // All catalog items combined
  const allCatalogItems: HamperItem[] = useMemo(() => [
    ...BOUQUET_OPTIONS,
    ...KEYCHAIN_OPTIONS,
    ...JEWELLERY_OPTIONS,
    ...CHOCOLATE_OPTIONS,
    ...CANDLE_OPTIONS,
  ], []);

  // Helper to add/increase item in box
  const handleAddItem = (item: HamperItem) => {
    setSelectedItems((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  // Helper to decrease/remove item from box
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  // Clear specific item
  const handleDeleteItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  // Filtered items computation
  const displayedItems = useMemo(() => {
    return allCatalogItems.filter((item) => {
      // 1. Text Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tag && item.tag.toLowerCase().includes(q)) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Main Tab filter
      if (activeTab !== "all" && item.category !== activeTab) {
        return false;
      }

      // 3. Jewellery specific sub-filters
      if (activeTab === "jewellery") {
        if (jewelleryGender !== "all" && item.gender !== jewelleryGender) {
          return false;
        }
        if (jewellerySubFilter !== "all" && item.subCategory !== jewellerySubFilter) {
          return false;
        }
      }

      // 4. Chocolate specific sub-filters
      if (activeTab === "chocolate") {
        if (chocolateBrandFilter !== "all") {
          if (chocolateBrandFilter === "ferrero" && item.subCategory !== "ferrero") return false;
          if (chocolateBrandFilter === "dairy-milk" && item.subCategory !== "dairy-milk") return false;
          if (chocolateBrandFilter === "luxury" && item.subCategory !== "luxury-chocolate") return false;
        }
      }

      return true;
    });
  }, [allCatalogItems, activeTab, jewelleryGender, jewellerySubFilter, chocolateBrandFilter, searchQuery]);

  // Calculate items total
  const itemsTotal = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const found = allCatalogItems.find((i) => i.id === id);
    return sum + (found ? found.price * qty : 0);
  }, 0);

  const totalHamperPrice = selectedBox.price + itemsTotal;
  const totalItemCount = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  // Construct Custom Gift Object
  const createHamperObject = () => {
    const itemizedList = Object.entries(selectedItems).map(([id, qty]) => {
      const item = allCatalogItems.find((i) => i.id === id);
      return {
        id,
        name: item?.name || "Artisan Gift Item",
        category: item?.category,
        price: item?.price || 0,
        quantity: qty,
      };
    });

    return {
      id: `custom-box-${Date.now()}`,
      name: `Custom Gift Hamper for ${recipientName || "Loved One"}`,
      price: totalHamperPrice,
      discountPrice: null,
      images: [{ url: selectedBox.image }],
      imageUrl: selectedBox.image,
      customGift: {
        isHamper: true,
        box: selectedBox.name,
        boxPrice: selectedBox.price,
        recipientName: recipientName.trim() || "Loved One",
        senderName: senderName.trim() || "With Love",
        occasion: selectedOccasion,
        note: noteMessage.trim(),
        waxSeal: selectedWaxSeal.name,
        items: itemizedList,
      },
    };
  };

  // Action 1: Add to Cart (stay on site / view cart sheet)
  const handleAddToCart = () => {
    const hamper = createHamperObject();
    addItem(hamper, 1);
    
    // Open Cart Sheet
    const cartButton = document.querySelector('[aria-label="Open cart"]') as HTMLElement;
    if (cartButton) {
      cartButton.click();
    }
  };

  // Action 2: Direct Proceed to Checkout / Payment
  const handleProceedToPayment = () => {
    const hamper = createHamperObject();
    addItem(hamper, 1);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF2F5] border border-[#F3E1E5] text-[#D45B7A] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Gift Hamper Studio • Handcrafted with Love</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#382025] tracking-tight leading-tight">
          Customize Your Perfect Gift Box
        </h1>

        <p className="text-sm sm:text-base text-[#8B5E6B] leading-relaxed">
          Select a keepsake box, fill it with bouquets, cute keychains, artisan jewellery for men & women, and gourmet chocolates (Ferrero Rocher & Dairy Milk), add your heartfelt wax-sealed note, and place your order instantly.
        </p>

        {/* 3 Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-[#382025]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D45B7A]"></span>
            Men & Women Jewellery + Luxury Chocolates
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F2A4B7]"></span>
            Free Calligraphy Card & Wax Seal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D45B7A]"></span>
            Safe All-India Fragile Delivery
          </span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: BUILDER (LEFT) vs LIVE BOX & TOTAL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: STEP-BY-STEP BUILDER (8 COLS) ================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* STEP 1: CHOOSE BOX */}
          <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#F3E1E5] shadow-[0_4px_24px_rgba(212,91,122,0.05)] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FDF2F5] text-[#D45B7A] font-bold text-sm flex items-center justify-center border border-[#F3E1E5]">
                  1
                </span>
                <div>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-[#382025]">
                    Select Your Keepsake Gift Box
                  </h2>
                  <p className="text-xs text-[#8B5E6B]">
                    Choose the luxury box style to wrap your customized surprise.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#D45B7A] bg-[#FDF2F5] px-3 py-1 rounded-full border border-[#F3E1E5]">
                {selectedBox.name.split(" ")[0]} Box Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BOX_OPTIONS.map((box) => {
                const isSelected = selectedBox.id === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? "bg-[#FFF9FA] border-[#D45B7A] ring-2 ring-[#D45B7A]/20 shadow-[0_6px_20px_rgba(212,91,122,0.12)]"
                        : "bg-white border-[#F3E1E5] hover:border-[#F2A4B7] hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF2F5] text-[#D45B7A] border border-[#F3E1E5]">
                          {box.badge}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#D45B7A] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#FAF7F8] border border-[#F3E1E5] mb-2.5">
                        <SafeHamperImage src={box.image} fallbackSrc="/products/bouquet_pink_rose_wrap.jpg" alt={box.name} />
                      </div>

                      <h3 className="font-serif font-bold text-xs sm:text-sm text-[#382025] line-clamp-1">
                        {box.name}
                      </h3>
                      <p className="text-[11px] text-[#8B5E6B] line-clamp-2 mt-0.5 leading-tight">
                        {box.description}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#F3E1E5] flex justify-between items-center text-xs">
                      <span className="text-[#8B5E6B]">Box Price:</span>
                      <span className="font-bold text-[#D45B7A]">₹{box.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 2: FILL THE BOX WITH GIFTS */}
          <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#F3E1E5] shadow-[0_4px_24px_rgba(212,91,122,0.05)] space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FDF2F5] text-[#D45B7A] font-bold text-sm flex items-center justify-center border border-[#F3E1E5]">
                    2
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-lg sm:text-xl text-[#382025]">
                      Fill Your Box with Handpicked Gifts
                    </h2>
                    <p className="text-xs text-[#8B5E6B]">
                      Pick items across Bouquets, Keychains, Jewellery (Men & Women), and Chocolates.
                    </p>
                  </div>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-[#B08B95] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gifts..."
                    className="w-full h-8 pl-8 pr-3 rounded-full bg-[#FAF7F8] border border-[#F3E1E5] text-xs text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7] transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#B08B95] hover:text-[#382025]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Main Category Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-[#FAF7F8] p-1.5 rounded-2xl border border-[#F3E1E5] text-xs">
                {[
                  { id: "all", label: "All Items", icon: Sparkles, count: allCatalogItems.length },
                  { id: "jewellery", label: "Jewellery (Men & Women)", icon: Gem, count: JEWELLERY_OPTIONS.length },
                  { id: "chocolate", label: "Chocolates (Ferrero & Silk)", icon: Candy, count: CHOCOLATE_OPTIONS.length },
                  { id: "bouquet", label: "Bouquets", icon: Gift, count: BOUQUET_OPTIONS.length },
                  { id: "keychain", label: "Keychains", icon: KeyRound, count: KEYCHAIN_OPTIONS.length },
                  { id: "candle", label: "Candles & Wellness", icon: Flame, count: CANDLE_OPTIONS.length },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setJewellerySubFilter("all");
                        setChocolateBrandFilter("all");
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                        isActive
                          ? "bg-white text-[#D45B7A] shadow-xs border border-[#F3E1E5]"
                          : "text-[#8B5E6B] hover:text-[#382025]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-[#FDF2F5] text-[#D45B7A]" : "bg-black/5 text-[#8B5E6B]"}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* JEWELLERY SUB-CATEGORY NAVIGATION (Gender & Types) */}
              {activeTab === "jewellery" && (
                <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#F3E1E5] space-y-3 animate-in fade-in duration-200">
                  {/* Gender Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#382025] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D45B7A]" />
                      Jewellery Section:
                    </span>
                    <div className="flex gap-1.5">
                      {[
                        { id: "all", label: "All Jewellery" },
                        { id: "women", label: "👩 Women's Jewellery" },
                        { id: "men", label: "👨 Men's Jewellery" },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setJewelleryGender(g.id as any);
                            setJewellerySubFilter("all");
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            jewelleryGender === g.id
                              ? "bg-[#D45B7A] text-white shadow-2xs"
                              : "bg-white text-[#8B5E6B] hover:text-[#382025] border border-[#F3E1E5]"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-Category Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#F3E1E5]/60">
                    <span className="text-[10px] font-bold text-[#8B5E6B] self-center mr-1">Filter Type:</span>
                    
                    <button
                      type="button"
                      onClick={() => setJewellerySubFilter("all")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                        jewellerySubFilter === "all"
                          ? "bg-[#382025] text-white"
                          : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                      }`}
                    >
                      All Types
                    </button>

                    {(jewelleryGender === "all" || jewelleryGender === "women") && (
                      <>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("women-earrings")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "women-earrings"
                              ? "bg-[#D45B7A] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Earrings (4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("women-bangles")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "women-bangles"
                              ? "bg-[#D45B7A] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Bangles (4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("women-necklace")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "women-necklace"
                              ? "bg-[#D45B7A] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Necklace Sets (4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("women-rings")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "women-rings"
                              ? "bg-[#D45B7A] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Women&apos;s Rings (3)
                        </button>
                      </>
                    )}

                    {(jewelleryGender === "all" || jewelleryGender === "men") && (
                      <>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("men-kadas")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "men-kadas"
                              ? "bg-[#382025] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Men&apos;s Kadas (4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("men-rings")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "men-rings"
                              ? "bg-[#382025] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Men&apos;s Rings (3)
                        </button>
                        <button
                          type="button"
                          onClick={() => setJewellerySubFilter("men-chains")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            jewellerySubFilter === "men-chains"
                              ? "bg-[#382025] text-white"
                              : "bg-white text-[#8B5E6B] border border-[#F3E1E5] hover:border-[#F2A4B7]"
                          }`}
                        >
                          Chains & Bracelets (2)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* CHOCOLATES BRAND SUB-NAVIGATION */}
              {activeTab === "chocolate" && (
                <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#F3E1E5] flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-[#382025] uppercase tracking-wider mr-1">
                    Chocolate Brand:
                  </span>
                  {[
                    { id: "all", label: "All Chocolates (12)" },
                    { id: "ferrero", label: "✨ Ferrero Rocher (4)" },
                    { id: "dairy-milk", label: "💜 Cadbury Dairy Milk Silk (5)" },
                    { id: "luxury", label: "🍬 Belgian & Lindt Luxury (3)" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setChocolateBrandFilter(b.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        chocolateBrandFilter === b.id
                          ? "bg-[#D45B7A] text-white shadow-2xs"
                          : "bg-white text-[#8B5E6B] hover:text-[#382025] border border-[#F3E1E5]"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Grid */}
            {displayedItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8B5E6B] bg-[#FFF9FA] rounded-2xl border border-dashed border-[#F3E1E5] space-y-2">
                <p className="font-semibold text-sm text-[#382025]">No gifts match your current filters</p>
                <p>Try clearing your search query or choosing &quot;All Items&quot;.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                    setJewellerySubFilter("all");
                    setChocolateBrandFilter("all");
                  }}
                  className="mt-2 text-xs font-bold text-[#D45B7A] underline hover:text-[#382025] cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {displayedItems.map((item) => {
                  const qtyInBox = selectedItems[item.id] || 0;
                  const isInBox = qtyInBox > 0;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between group ${
                        isInBox
                          ? "bg-[#FFF9FA] border-[#D45B7A] shadow-[0_4px_16px_rgba(212,91,122,0.08)]"
                          : "bg-white border-[#F3E1E5] hover:border-[#F2A4B7]"
                      }`}
                    >
                      <div>
                        {/* Image with graceful error fallback */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF7F8] border border-[#F3E1E5] mb-2.5">
                          <SafeHamperImage src={item.image} fallbackSrc={item.fallbackImage} alt={item.name} />
                          
                          {item.tag && (
                            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[#382025] shadow-2xs border border-[#F3E1E5]/40">
                              {item.tag}
                            </span>
                          )}

                          {isInBox && (
                            <div className="absolute top-2 right-2 bg-[#D45B7A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {qtyInBox} in Box
                            </div>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#382025] line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#8B5E6B] line-clamp-2 mt-0.5 leading-tight">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#F3E1E5] flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#D45B7A]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>

                        {isInBox ? (
                          <div className="flex items-center bg-white border border-[#D45B7A] rounded-xl p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-6 h-6 rounded-lg bg-[#FAF7F8] hover:bg-[#FDF2F5] text-[#D45B7A] flex items-center justify-center font-bold cursor-pointer transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 text-[#382025]">
                              {qtyInBox}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddItem(item)}
                              className="w-6 h-6 rounded-lg bg-[#D45B7A] text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-[#FDF2F5] hover:bg-[#D45B7A] text-[#D45B7A] hover:text-white border border-[#F3E1E5] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Box</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* STEP 3: PERSONALIZED LOVE NOTE & WAX SEAL */}
          <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#F3E1E5] shadow-[0_4px_24px_rgba(212,91,122,0.05)] space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FDF2F5] text-[#D45B7A] font-bold text-sm flex items-center justify-center border border-[#F3E1E5]">
                3
              </span>
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#382025]">
                  Personalized Love Note & Wax Seal Stamp
                </h2>
                <p className="text-xs text-[#8B5E6B]">
                  Handwritten by our studio calligrapher on deckle-edge artisan cardstock.
                </p>
              </div>
            </div>

            {/* Occasion Selection */}
            <div>
              <label className="block text-xs font-bold text-[#382025] mb-2">
                Occasion for this Gift:
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setSelectedOccasion(occ)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedOccasion === occ
                        ? "bg-[#D45B7A] text-white shadow-xs"
                        : "bg-[#FAF7F8] hover:bg-[#FDF2F5] text-[#8B5E6B] border border-[#F3E1E5]"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient & Sender Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#382025] mb-1.5">
                  Who is this special gift for? (Recipient)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Anushka"
                  className="w-full h-11 px-4 rounded-xl bg-[#FAF7F8] border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382025] mb-1.5">
                  Sign-off / From (Sender):
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Forever Yours, Rahul"
                  className="w-full h-11 px-4 rounded-xl bg-[#FAF7F8] border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7]"
                />
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#382025]">
                  Your Personal Handwritten Note:
                </label>
                <span className="text-[11px] text-[#8B5E6B]">
                  {noteMessage.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder="Write your personal message to be tucked inside the box..."
                className="w-full p-4 rounded-2xl bg-[#FAF7F8] border border-[#F3E1E5] text-xs font-medium text-[#382025] placeholder-[#B08B95] focus:outline-hidden focus:border-[#F2A4B7] leading-relaxed resize-none"
              ></textarea>

              {/* Inspiration Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#8B5E6B] mr-1">Quick ideas:</span>
                {NOTE_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoteMessage(suggestion)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF7F8] hover:bg-[#FDF2F5] text-[#8B5E6B] hover:text-[#D45B7A] border border-[#F3E1E5] transition-colors cursor-pointer"
                  >
                    Preset #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Wax Seal Stamp Selection */}
            <div>
              <label className="block text-xs font-bold text-[#382025] mb-2">
                Choose Wax Seal Stamp Emblem:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WAX_SEALS.map((seal) => {
                  const isSelected = selectedWaxSeal.id === seal.id;
                  return (
                    <div
                      key={seal.id}
                      onClick={() => setSelectedWaxSeal(seal)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FFF9FA] border-[#D45B7A] ring-1 ring-[#D45B7A]/30 shadow-xs"
                          : "bg-white border-[#F3E1E5] hover:border-[#F2A4B7]"
                      }`}
                    >
                      <span className="text-xl block mb-1">{seal.icon}</span>
                      <span className="text-[11px] font-bold text-[#382025] block truncate">
                        {seal.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* ================= RIGHT COLUMN: LIVE BOX VISUALIZER & PAYMENT (4-5 COLS) ================= */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          <div className="bg-white rounded-[32px] border border-[#F3E1E5] p-6 shadow-[0_12px_36px_rgba(212,91,122,0.12)] space-y-5">
            
            {/* Header & Item Count Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E1E5]">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#D45B7A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#382025]">
                  {recipientName ? `${recipientName}'s Custom Box` : "Your Custom Box"}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDF2F5] text-[#D45B7A] border border-[#F3E1E5]">
                {totalItemCount} Items Inside
              </span>
            </div>

            {/* Box Header Snippet */}
            <div className="flex items-center gap-3 p-3 bg-[#FAF7F8] rounded-2xl border border-[#F3E1E5]">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#F3E1E5] shrink-0">
                <SafeHamperImage src={selectedBox.image} fallbackSrc="/products/bouquet_pink_rose_wrap.jpg" alt={selectedBox.name} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E6B] block">Box Style</span>
                <p className="font-serif font-bold text-xs text-[#382025] truncate">{selectedBox.name}</p>
                <span className="text-xs font-bold text-[#D45B7A]">₹{selectedBox.price}</span>
              </div>
            </div>

            {/* Box Contents Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E6B] block">
                Hamper Contents ({totalItemCount}):
              </span>

              {totalItemCount === 0 ? (
                <div className="py-6 text-center text-xs text-[#8B5E6B] bg-[#FFF9FA] rounded-2xl border border-dashed border-[#F3E1E5]">
                  Your box is currently empty! Pick bouquets, jewellery, or chocolates to fill your box.
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {Object.entries(selectedItems).map(([id, qty]) => {
                    const item = allCatalogItems.find((i) => i.id === id);
                    if (!item) return null;

                    return (
                      <div key={id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FFF9FA] border border-[#F3E1E5] text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#F3E1E5]">
                            <SafeHamperImage src={item.image} fallbackSrc={item.fallbackImage} alt={item.name} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[11px] text-[#382025] truncate">{item.name}</p>
                            <span className="text-[10px] text-[#8B5E6B]">₹{item.price} × {qty}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-xs text-[#382025]">
                            ₹{item.price * qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(id)}
                            className="text-[#B08B95] hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ARTISAN DECKLE-EDGE CARD MINI PREVIEW */}
            <div className="relative p-4 rounded-2xl bg-[#FFF9FA] border border-dashed border-[#F3E1E5] space-y-2 font-serif">
              <div className="absolute -top-3 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-[#D45B7A] to-[#A33854] text-white flex items-center justify-center text-sm shadow-md border-2 border-white select-none">
                {selectedWaxSeal.icon}
              </div>

              <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#D45B7A]">
                To: {recipientName || "Loved One"} • {selectedOccasion}
              </div>

              <p className="text-xs text-[#382025] italic leading-relaxed line-clamp-3">
                &ldquo;{noteMessage || "Your personal note..."}&rdquo;
              </p>

              <div className="text-right text-[11px] italic font-medium text-[#8B5E6B] pt-1">
                — {senderName || "With Love"}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3E1E5] text-xs text-[#8B5E6B]">
              <div className="flex justify-between">
                <span>Keepsake Box</span>
                <span className="font-medium text-[#382025]">₹{selectedBox.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Hamper Gifts ({totalItemCount} items)</span>
                <span className="font-medium text-[#382025]">₹{itemsTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#D45B7A]">
                <span>Calligraphy Card & Wax Seal</span>
                <span className="font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-[#2E7D32]">
                <span>Safe Delivery Packaging</span>
                <span className="font-bold">FREE</span>
              </div>

              <div className="pt-2.5 border-t border-[#F3E1E5] flex justify-between items-baseline font-bold text-sm text-[#382025]">
                <span>Total Hamper Value</span>
                <span className="font-serif text-2xl text-[#D45B7A]">
                  ₹{totalHamperPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* ACTION 1: PROCEED TO PAYMENT / CHECKOUT */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={totalItemCount === 0}
              className="w-full clay-btn py-4 rounded-2xl text-xs font-bold shadow-[0_8px_24px_rgba(212,91,122,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Payment & Order →</span>
            </button>

            {/* ACTION 2: ADD TO CART & VIEW CART */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={totalItemCount === 0}
              className="w-full clay-btn-secondary py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4 text-[#D45B7A]" />
              <span>Add to Cart & Continue Shopping</span>
            </button>

            {/* WhatsApp Concierge */}
            <div className="text-center pt-1">
              <a
                href={`https://wa.me/919324488603?text=Hi%20Aura%20Craft!%20I'm%20customizing%20a%20hamper%20for%20${encodeURIComponent(recipientName || "a special gift")}.%20Can%20you%20help%20with%20custom%20yarn%20shades?`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8B5E6B] hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Need custom yarn shades or advice? Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Guarantee Pill */}
          <div className="bg-[#FFF9FA] rounded-2xl p-4 border border-[#F3E1E5] flex items-center gap-3 text-xs text-[#8B5E6B]">
            <ShieldCheck className="w-5 h-5 text-[#D45B7A] shrink-0" />
            <p className="leading-tight">
              100% handmade guarantee. Delivered in shock-absorbent luxury box with moisture barrier.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
