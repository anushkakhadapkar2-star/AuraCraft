const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, query, where, addDoc } = require('firebase/firestore');
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
  {
    name: "Purple Lily & Rose Bouquet",
    slug: "purple-lily-rose-bouquet",
    sku: "BQT-001",
    description: "A gorgeous arrangement of white lilies and deep purple roses, wrapped elegantly with a white lace ribbon.",
    price: 3499,
    discountPrice: 2999,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn, Lace Ribbon",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_purple_lily_rose.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 5, lowStockThreshold: 2 }
  },
  {
    name: "Crimson Lily & Daisy Bouquet",
    slug: "crimson-lily-daisy-bouquet",
    sku: "BQT-002",
    description: "A striking deep red lily accompanied by red roses and white daisies, presented in frosted wrapping.",
    price: 2899,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, Frosted Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_red_lily_daisy.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 8, lowStockThreshold: 3 }
  },
  {
    name: "Red Roses in Kraft Paper",
    slug: "red-roses-kraft-paper",
    sku: "BQT-003",
    description: "Two timeless red crochet roses accented with delicate white blossoms, hand-wrapped in rustic brown kraft paper.",
    price: 1899,
    discountPrice: 1599,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn, Kraft Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_red_rose_brown.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 4 }
  },
  {
    name: "Pink Rose Medley Bouquet",
    slug: "pink-rose-medley-bouquet",
    sku: "BQT-004",
    description: "A soft, romantic cluster of pink roses and white accent flowers wrapped beautifully in pink and white paper.",
    price: 2499,
    discountPrice: 2199,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_pink_rose_wrap.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 2 }
  },
  {
    name: "Sunshine Sunflower Bouquet",
    slug: "sunshine-sunflower-bouquet",
    sku: "BQT-005",
    description: "A bright and cheerful single sunflower with a white daisy, elegantly wrapped in pale yellow paper.",
    price: 1499,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_sunflower_yellow.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 3 }
  }
];

async function addBouquets() {
  console.log("Fetching Crochet Bouquets category...");
  const catQuery = query(collection(db, 'categories'), where("slug", "==", "crochet-bouquets"));
  const catSnap = await getDocs(catQuery);
  
  let categoryId = "";
  let categoryName = "Crochet Bouquets";

  if (catSnap.empty) {
    console.log("Category crochet-bouquets not found! Creating it...");
    const catRef = await addDoc(collection(db, 'categories'), {
      name: categoryName,
      slug: "crochet-bouquets",
      description: "Beautifully arranged handmade crochet flower bouquets.",
      status: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    categoryId = catRef.id;
  } else {
    categoryId = catSnap.docs[0].id;
    categoryName = catSnap.docs[0].data().name;
  }

  console.log("Adding new products...");
  for (const prod of newProducts) {
    console.log(`Adding ${prod.name}...`);
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, {
      ...prod,
      categoryId: categoryId,
      categoryName: categoryName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log("Successfully added the new crochet bouquets!");
  process.exit(0);
}

addBouquets().catch(console.error);
