const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, addDoc } = require('firebase/firestore');
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

const newProducts = [
  // Crochet Flowers
  {
    name: "Knitted Tulip Stem",
    slug: "knitted-tulip-stem",
    sku: "FLW-003",
    description: "A beautiful handmade tulip that brings a touch of spring to your home year-round.",
    price: 349,
    discountPrice: 299,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Premium Acrylic Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 25, lowStockThreshold: 5 }
  },
  {
    name: "Daisy Chain Crochet",
    slug: "daisy-chain-crochet",
    sku: "FLW-004",
    description: "A delicate chain of crocheted daisies, perfect for decoration or gifting.",
    price: 499,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1560790671-b76ca4de55ef?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 18, lowStockThreshold: 4 }
  },
  
  // Crochet Bouquets
  {
    name: "Autumn Harvest Bouquet",
    slug: "autumn-harvest-bouquet",
    sku: "BQT-003",
    description: "A warm mix of orange, yellow, and red crochet flowers capturing the essence of fall.",
    price: 2499,
    discountPrice: 2199,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Mixed Yarns",
    categorySlug: "crochet-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1505934333218-8fe21ff8cefc?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 6, lowStockThreshold: 2 }
  },
  {
    name: "Miniature Daisy Bouquet",
    slug: "miniature-daisy-bouquet",
    sku: "BQT-004",
    description: "A cute, petite bouquet of white and yellow daisies wrapped in burlap.",
    price: 1299,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 3 }
  },

  // Home Decor
  {
    name: "Hand-poured Botanical Candle",
    slug: "hand-poured-botanical-candle",
    sku: "DEC-002",
    description: "A soothing soy wax candle infused with real dried petals and essential oils.",
    price: 899,
    discountPrice: 799,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Soy Wax, Essential Oils",
    categorySlug: "home-decor",
    images: [{ url: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 30, lowStockThreshold: 5 }
  },
  {
    name: "Minimalist Ceramic Vase",
    slug: "minimalist-ceramic-vase",
    sku: "DEC-003",
    description: "An elegant, matte-finished ceramic vase for your dried or crochet flowers.",
    price: 1199,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Ceramic",
    categorySlug: "home-decor",
    images: [{ url: "https://images.unsplash.com/photo-1580237936111-ce11b1574a4f?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 4 }
  },
  {
    name: "Woven Rattan Basket",
    slug: "woven-rattan-basket",
    sku: "DEC-004",
    description: "A versatile storage basket hand-woven from sustainable rattan.",
    price: 1599,
    discountPrice: 1399,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Rattan",
    categorySlug: "home-decor",
    images: [{ url: "https://images.unsplash.com/photo-1595514681559-6a5b4816c4f3?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 2 }
  },

  // Gift Hampers
  {
    name: "Cozy Winter Hamper",
    slug: "cozy-winter-hamper",
    sku: "HMP-003",
    description: "Everything you need for a cozy night in: hot cocoa mix, a hand-knit mug cozy, and a scented candle.",
    price: 2799,
    discountPrice: 2499,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Mixed",
    categorySlug: "gift-hampers",
    images: [{ url: "https://images.unsplash.com/photo-1512413914844-3114d5930b80?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 8, lowStockThreshold: 2 }
  },
  {
    name: "Newborn Baby Gift Set",
    slug: "newborn-baby-gift-set",
    sku: "HMP-004",
    description: "A delicate and soft hamper featuring a crochet rattle, organic cotton blanket, and gentle baby soap.",
    price: 3299,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Mixed",
    categorySlug: "gift-hampers",
    images: [{ url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 5, lowStockThreshold: 1 }
  }
];

async function addCategoryProducts() {
  console.log("Fetching categories...");
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  const categoriesMap = {};
  categoriesSnap.docs.forEach(doc => {
    const data = doc.data();
    categoriesMap[data.slug] = { id: doc.id, name: data.name, slug: data.slug };
  });

  for (const prod of newProducts) {
    const category = categoriesMap[prod.categorySlug];
    if (!category) {
      console.log(`Skipping ${prod.name}, category ${prod.categorySlug} not found.`);
      continue;
    }

    console.log(`Adding ${prod.name} to ${category.name}...`);
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, {
      ...prod,
      categoryId: category.id,
      categoryName: category.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log("Successfully added MORE categorized products!");
  process.exit(0);
}

addCategoryProducts().catch(console.error);
