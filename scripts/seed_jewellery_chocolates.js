const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORIES = [
  {
    id: "category-jewellery",
    name: "Jewellery",
    slug: "jewellery",
    description: "Handcrafted jewellery for men & women including earrings, bangles, necklace sets, rings, and kadas.",
    status: true,
    displayOrder: 8,
    imageUrl: "/products/jewellery/floral-choker-set.jpg",
  },
  {
    id: "category-chocolates",
    name: "Chocolates",
    slug: "chocolates",
    description: "Indulgent celebration chocolates featuring Ferrero Rocher, Cadbury Dairy Milk Silk, and Belgian luxury truffles.",
    status: true,
    displayOrder: 9,
    imageUrl: "/products/chocolates/cadbury-celebrations.jpg",
  },
];

const PRODUCTS = [
  // --- JEWELLERY PRODUCTS ---
  {
    id: "prod-jw-pearl-earrings",
    name: "Handcrafted Pearl & Daisy Drop Earrings",
    slug: "pearl-daisy-drop-earrings",
    sku: "JW-EAR-001",
    price: 349,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "18k Gold Plated, Milk Cotton & Freshwater Pearl",
    dimensions: "4.5 cm drop length",
    weight: "12g",
    inventory: { currentStock: 45, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/pearl-daisy-earrings.jpg", isPrimary: true, order: 0 }
    ],
    description: "Lightweight hypoallergenic 18k gold-plated hooks with miniature white crochet daisies and genuine freshwater teardrop pearls. Perfect for daily elegance or festive occasions.",
  },
  {
    id: "prod-jw-rose-studs",
    name: "Blush Rose Gold Floral Studs with Zircons",
    slug: "blush-rose-gold-floral-studs",
    sku: "JW-EAR-002",
    price: 299,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    material: "Rose Gold Finish & Cubic Zirconia",
    dimensions: "1.2 cm diameter",
    weight: "6g",
    inventory: { currentStock: 50, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/rose-gold-floral-studs.jpg", isPrimary: true, order: 0 }
    ],
    description: "Dainty micro-inlaid cubic zirconia floral petal studs designed for all-day comfort and sensitive ears.",
  },
  {
    id: "prod-jw-enamel-bangles",
    name: "Artisan Pastel Enamel Bangles (Set of 2)",
    slug: "pastel-enamel-bangles-set",
    sku: "JW-BAN-001",
    price: 449,
    discountPrice: 399,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Hand-painted Enamel & Brass Gold Finish",
    dimensions: "Standard Size 2.6 (fits 2.4 - 2.8)",
    weight: "35g",
    inventory: { currentStock: 30, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/pastel-enamel-bangles.jpg", isPrimary: true, order: 0 }
    ],
    description: "Hand-painted floral enamel cuffs with delicate gold foil accents and ultra-smooth inner finish for effortless styling.",
  },
  {
    id: "prod-jw-rosegold-kada",
    name: "Rose Gold Textured Filigree Kada Bangles",
    slug: "rosegold-textured-kada-bangles",
    sku: "JW-BAN-002",
    price: 499,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Rose Gold Electroplated Alloy",
    dimensions: "Adjustable Push Lock Clasp",
    weight: "28g",
    inventory: { currentStock: 25, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/rosegold-kada-bangles.jpg", isPrimary: true, order: 0 }
    ],
    description: "Pair of openable textured filigree kada bangles with secure precision push-lock clasp.",
  },
  {
    id: "prod-jw-floral-choker",
    name: "Handmade Floral Choker & Earrings Set",
    slug: "handmade-floral-choker-earrings-set",
    sku: "JW-NECK-001",
    price: 799,
    discountPrice: 699,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Woven Silk Yarn, Seed Beads & Gold Plating",
    dimensions: "Adjustable 14-18 inches choker",
    weight: "48g",
    inventory: { currentStock: 20, lowStockThreshold: 3 },
    images: [
      { url: "/products/jewellery/floral-choker-set.jpg", isPrimary: true, order: 0 }
    ],
    description: "Exquisite woven floral choker with matching drop earrings for birthdays, weddings, anniversaries, and festive celebrations.",
  },
  {
    id: "prod-jw-kundan-necklace",
    name: "Kundan & Crochet Blossom Festive Necklace Set",
    slug: "kundan-crochet-blossom-necklace-set",
    sku: "JW-NECK-002",
    price: 999,
    discountPrice: 899,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Traditional Kundan Stone, Micro Crochet & Pearls",
    dimensions: "Festive Grand Collar Set with Dori",
    weight: "65g",
    inventory: { currentStock: 15, lowStockThreshold: 3 },
    images: [
      { url: "/products/jewellery/floral-choker-set.jpg", isPrimary: true, order: 0 }
    ],
    description: "Heritage Kundan stone work beautifully paired with soft blush crochet petals; includes majestic necklace and matching jhumkas.",
  },
  {
    id: "prod-jw-rose-ring",
    name: "Delicate Solitaire Rose Flower Ring (Adjustable)",
    slug: "delicate-solitaire-rose-flower-ring",
    sku: "JW-RING-001",
    price: 279,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Sterling Silver Plated Band & Hand-sculpted Rose Petal",
    dimensions: "Free size (Adjustable fit)",
    weight: "5g",
    inventory: { currentStock: 60, lowStockThreshold: 10 },
    images: [
      { url: "/products/jewellery/rose-flower-ring.jpg", isPrimary: true, order: 0 }
    ],
    description: "Hand-sculpted rose petal setting with sparkling center crystal, adjustable band to comfortably fit any finger size.",
  },
  {
    id: "prod-jw-mens-silver-kada",
    name: "Solid Stainless Steel Matte Silver Kada (Men)",
    slug: "mens-matte-silver-steel-kada",
    sku: "JW-MKAD-001",
    price: 499,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "316L Surgical Stainless Steel",
    dimensions: "Inner Diameter 6.5 cm (Fits M/L wrists)",
    weight: "55g",
    inventory: { currentStock: 40, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/mens-silver-steel-kada.jpg", isPrimary: true, order: 0 }
    ],
    description: "Heavyweight, non-tarnish surgical grade steel kada with a sleek brushed satin finish and comfort inner bevel for men.",
  },
  {
    id: "prod-jw-mens-punjabi-kada",
    name: "Traditional Punjabi Brass Royal Kada (Men)",
    slug: "mens-punjabi-brass-royal-kada",
    sku: "JW-MKAD-002",
    price: 549,
    discountPrice: 499,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Solid Heavyweight Virgin Brass",
    dimensions: "Inner Diameter 6.8 cm (Traditional Fit)",
    weight: "75g",
    inventory: { currentStock: 35, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/mens-punjabi-brass-kada.jpg", isPrimary: true, order: 0 }
    ],
    description: "Authentic heavyweight solid brass kada with subtle Sikh royal geometric engraving and lasting gold luster.",
  },
  {
    id: "prod-jw-mens-black-ring",
    name: "Classic Brushed Black Titanium Band (Men)",
    slug: "mens-black-titanium-ring",
    sku: "JW-MRIN-001",
    price: 399,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Pure Titanium (Matte Black PVD Coating)",
    dimensions: "Width: 8mm, Comfort Fit Arc",
    weight: "8g",
    inventory: { currentStock: 50, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/mens-black-titanium-ring.jpg", isPrimary: true, order: 0 }
    ],
    description: "Scratch-resistant aerospace-grade matte black titanium ring with smooth polished beveled inner contour.",
  },

  // --- CHOCOLATES PRODUCTS ---
  {
    id: "prod-ch-ferrero-16",
    name: "Ferrero Rocher Diamond Gift Box (16 pcs)",
    slug: "ferrero-rocher-diamond-box-16",
    sku: "CH-FER-016",
    price: 649,
    discountPrice: 599,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Imported Hazelnut & Milk Cocoa Pralines",
    dimensions: "16 Individually Wrapped Pralines (200g)",
    weight: "200g",
    inventory: { currentStock: 80, lowStockThreshold: 10 },
    images: [
      { url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80", isPrimary: true, order: 0 }
    ],
    description: "The iconic whole hazelnut dipped in smooth cocoa cream, wrapped in crisp wafer shell, milk chocolate and roasted hazelnut pieces in luxury gold foil.",
  },
  {
    id: "prod-ch-ferrero-trio",
    name: "Ferrero Golden Hazelnut Trio (3 pcs)",
    slug: "ferrero-golden-trio-3",
    sku: "CH-FER-003",
    price: 199,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Milk Chocolate & Hazelnut",
    dimensions: "3 pcs pocket sleeve",
    weight: "37.5g",
    inventory: { currentStock: 120, lowStockThreshold: 20 },
    images: [
      { url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80", isPrimary: true, order: 0 }
    ],
    description: "Pocket luxury trio of crunchy hazelnut and milk chocolate pralines in golden protective sleeve. Ideal add-on for gifts.",
  },
  {
    id: "prod-ch-ferrero-heart",
    name: "Ferrero Rocher Celebration Heart Box (8 pcs)",
    slug: "ferrero-celebration-heart-box",
    sku: "CH-FER-008",
    price: 479,
    discountPrice: 449,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Hazelnut Pralines in Heart Tin",
    dimensions: "8 Pralines in Keepsake Heart Box",
    weight: "100g",
    inventory: { currentStock: 50, lowStockThreshold: 5 },
    images: [
      { url: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=600&q=80", isPrimary: true, order: 0 }
    ],
    description: "Romantic crimson & gold heart-shaped presentation box loaded with 8 crunchy hazelnut Rocher pralines.",
  },
  {
    id: "prod-ch-cadbury-almond",
    name: "Cadbury Dairy Milk Silk Roast Almond (143g)",
    slug: "cadbury-silk-roast-almond",
    sku: "CH-CAD-001",
    price: 199,
    discountPrice: 185,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Pure Milk Chocolate & Roasted California Almonds",
    dimensions: "143g Bar",
    weight: "143g",
    inventory: { currentStock: 100, lowStockThreshold: 10 },
    images: [
      { url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80", isPrimary: true, order: 0 }
    ],
    description: "Velvety smooth melt-in-mouth milk chocolate loaded with whole roasted crunchy California almonds.",
  },
  {
    id: "prod-ch-cadbury-heart-pop",
    name: "Cadbury Dairy Milk Silk Heart Pop Gift Edition (150g)",
    slug: "cadbury-silk-heart-pop",
    sku: "CH-CAD-002",
    price: 249,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Milk Chocolate with Heart Inset",
    dimensions: "150g Heart Pop Edition",
    weight: "150g",
    inventory: { currentStock: 65, lowStockThreshold: 8 },
    images: [
      { url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", isPrimary: true, order: 0 }
    ],
    description: "Special romantic edition bar featuring a pop-out blushing heart chocolate centerpiece and romantic outer sleeve.",
  },
  {
    id: "prod-ch-cadbury-celebrations",
    name: "Cadbury Celebrations Rich Dry Fruit Hamper Box",
    slug: "cadbury-celebrations-rich-dry-fruit",
    sku: "CH-CAD-003",
    price: 549,
    discountPrice: 499,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Almonds, Cashews & Raisins in Silk Chocolate",
    dimensions: "Assorted Gift Box (177g)",
    weight: "177g",
    inventory: { currentStock: 40, lowStockThreshold: 5 },
    images: [
      { url: "/products/chocolates/cadbury-celebrations.jpg", isPrimary: true, order: 0 }
    ],
    description: "Grand festive gift box filled with almonds, cashews, and raisins individually enrobed in Dairy Milk chocolate.",
  },
  {
    id: "prod-ch-lindt-dark",
    name: "Lindt Excellence 70% Smooth Dark Cocoa Bar (100g)",
    slug: "lindt-excellence-dark-70",
    sku: "CH-LND-001",
    price: 399,
    discountPrice: null,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Swiss Single Origin 70% Cocoa",
    dimensions: "100g Bar",
    weight: "100g",
    inventory: { currentStock: 30, lowStockThreshold: 5 },
    images: [
      { url: "/products/chocolates/lindt-dark-70.jpg", isPrimary: true, order: 0 }
    ],
    description: "World-renowned Swiss master chocolatier intense dark chocolate with balanced aromatic notes.",
  },
  {
    id: "prod-ch-belgian-truffles",
    name: "Belgian Assorted Ganache Truffles Gift Box (6 pcs)",
    slug: "belgian-assorted-truffles-box",
    sku: "CH-BLG-001",
    price: 399,
    discountPrice: 349,
    status: "ACTIVE",
    categoryId: "category-chocolates",
    categoryName: "Chocolates",
    categorySlug: "chocolates",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Dark Ganache, Salted Caramel & Raspberry Truffles",
    dimensions: "6 Handcrafted Truffles Box",
    weight: "90g",
    inventory: { currentStock: 35, lowStockThreshold: 5 },
    images: [
      { url: "/products/chocolates/belgian-truffles.jpg", isPrimary: true, order: 0 }
    ],
    description: "Melt-in-mouth dark espresso, salted caramel, and raspberry Belgian ganache truffles in an artisan keepsake box.",
  },
];

async function seed() {
  console.log("Updating Categories...");
  for (const cat of CATEGORIES) {
    const ref = doc(db, "categories", cat.id);
    await setDoc(ref, {
      ...cat,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Saved category: ${cat.name} (${cat.slug})`);
  }

  console.log("\nUpdating Products with correct jewellery & chocolate hover images...");
  for (const prod of PRODUCTS) {
    const ref = doc(db, "products", prod.id);
    await setDoc(ref, {
      ...prod,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Updated product: ${prod.name} -> images[1] hover image fixed!`);
  }

  console.log("\nAll Jewellery & Chocolates products updated successfully in Firestore!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
