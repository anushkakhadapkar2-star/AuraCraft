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
    name: "Single Sunflower Crochet",
    slug: "single-sunflower-crochet",
    sku: "FLW-001",
    description: "A bright, hand-crocheted sunflower that never wilts. Perfect for a desk or small vase.",
    price: 399,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 20, lowStockThreshold: 5 }
  },
  {
    name: "Lavender Sprig Crochet",
    slug: "lavender-sprig-crochet",
    sku: "FLW-002",
    description: "Delicate crochet lavender stems. A wonderful addition to any handmade bouquet.",
    price: 299,
    discountPrice: 249,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 3 }
  },
  // Crochet Bouquets
  {
    name: "Pastel Rose Crochet Bouquet",
    slug: "pastel-rose-crochet-bouquet",
    sku: "BQT-001",
    description: "A gorgeous bouquet of handcrafted pastel roses wrapped in rustic craft paper.",
    price: 1899,
    discountPrice: 1699,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 5, lowStockThreshold: 2 }
  },
  {
    name: "Spring Mix Crochet Bouquet",
    slug: "spring-mix-crochet-bouquet",
    sku: "BQT-002",
    description: "A vibrant mix of tulips, daisies, and lavender, carefully crocheted to perfection.",
    price: 2299,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1490750967868-88cb4eca52ea?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 8, lowStockThreshold: 2 }
  },
  // Home Decor
  {
    name: "Macrame Plant Hanger",
    slug: "macrame-plant-hanger",
    sku: "DEC-001",
    description: "Suspend your indoor plants beautifully with this durable macrame plant hanger.",
    price: 699,
    discountPrice: 549,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Natural Cotton Rope",
    categorySlug: "home-decor",
    images: [{ url: "https://images.unsplash.com/photo-1416879598555-220f8d9f4304?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 4 }
  },
  // Gift Hampers
  {
    name: "Anniversary Special Hamper",
    slug: "anniversary-special-hamper",
    sku: "HMP-001",
    description: "The perfect gift for your loved one. Includes a scented candle, a crochet rose, and gourmet chocolates.",
    price: 3499,
    discountPrice: 2999,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Mixed",
    categorySlug: "gift-hampers",
    images: [{ url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 4, lowStockThreshold: 1 }
  },
  {
    name: "Self-Care Wellness Hamper",
    slug: "self-care-wellness-hamper",
    sku: "HMP-002",
    description: "Treat yourself! Comes with organic soap, bath salts, and a cozy hand-knitted washcloth.",
    price: 1999,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Mixed",
    categorySlug: "gift-hampers",
    images: [{ url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 7, lowStockThreshold: 2 }
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

  console.log("Successfully added categorized products!");
  process.exit(0);
}

addCategoryProducts().catch(console.error);
