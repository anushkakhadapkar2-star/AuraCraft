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

const newCategories = [
  {
    name: "Pipe Cleaner Flowers",
    slug: "pipe-cleaner-flowers",
    description: "Handcrafted flowers made from colorful pipe cleaners.",
    status: true,
    displayOrder: 2
  },
  {
    name: "Pipe Cleaner Bouquets",
    slug: "pipe-cleaner-bouquets",
    description: "Vibrant bouquets entirely crafted from pipe cleaners.",
    status: true,
    displayOrder: 3
  }
];

const newProducts = [
  // Pipe Cleaner Flowers
  {
    name: "Fuzzy Pink Peony",
    slug: "fuzzy-pink-peony",
    sku: "PCF-001",
    description: "A large, fluffy pink peony made completely out of high-quality pipe cleaners.",
    price: 199,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Chenille Stems (Pipe Cleaners)",
    categorySlug: "pipe-cleaner-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 30, lowStockThreshold: 10 }
  },
  {
    name: "Pipe Cleaner Bluebell",
    slug: "pipe-cleaner-bluebell",
    sku: "PCF-002",
    description: "Delicate and charming bluebells twisted from soft pipe cleaners.",
    price: 149,
    discountPrice: 99,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Chenille Stems (Pipe Cleaners)",
    categorySlug: "pipe-cleaner-flowers",
    images: [{ url: "https://images.unsplash.com/photo-1582216503928-86dce8f9c1db?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 25, lowStockThreshold: 5 }
  },
  // Pipe Cleaner Bouquets
  {
    name: "Rainbow Pipe Cleaner Bouquet",
    slug: "rainbow-pipe-cleaner-bouquet",
    sku: "PCB-001",
    description: "A spectacularly bright and colorful bouquet made of pipe cleaner roses and daisies.",
    price: 899,
    discountPrice: 799,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Chenille Stems (Pipe Cleaners)",
    categorySlug: "pipe-cleaner-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 3 }
  },
  {
    name: "Pastel Dream Pipe Cleaner Bouquet",
    slug: "pastel-dream-pipe-cleaner-bouquet",
    sku: "PCB-002",
    description: "Soft pastel-colored pipe cleaner flowers arranged into a sweet, long-lasting bouquet.",
    price: 999,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    material: "Chenille Stems (Pipe Cleaners)",
    categorySlug: "pipe-cleaner-bouquets",
    images: [{ url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 2 }
  }
];

async function addPipeCleanerStuff() {
  console.log("Adding new categories...");
  const categoriesMap = {};
  
  for (const cat of newCategories) {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...cat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    categoriesMap[cat.slug] = { id: docRef.id, name: cat.name, slug: cat.slug };
    console.log(`Added category: ${cat.name}`);
  }

  console.log("Adding new products...");
  for (const prod of newProducts) {
    const category = categoriesMap[prod.categorySlug];
    if (!category) continue;

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

  console.log("Successfully added new categories and products!");
  process.exit(0);
}

addPipeCleanerStuff().catch(console.error);
