const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, query, where } = require('firebase/firestore');
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
    name: "I Love You Red Rose Bouquet",
    slug: "i-love-you-red-rose-bouquet",
    sku: "BQT-006",
    description: "Stunning red crochet roses paired with white daisies in sleek black wrapping. Includes an 'I Love You' gift tag.",
    price: 3299,
    discountPrice: 2899,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn, Black Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_red_roses_iloveyou.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 3 }
  },
  {
    name: "Purple Spring Tulip Bouquet",
    slug: "purple-spring-tulip-bouquet",
    sku: "BQT-007",
    description: "A gorgeous pastel bouquet featuring purple and white crochet tulips, delicately wrapped in lavender paper.",
    price: 2699,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, Wrapping Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_purple_tulips.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 5 }
  },
  {
    name: "Ocean Blue Lily Bouquet",
    slug: "ocean-blue-lily-bouquet",
    sku: "BQT-008",
    description: "A serene and unique bouquet of gradient blue crochet lilies surrounded by baby's breath, wrapped in sky blue paper.",
    price: 3499,
    discountPrice: 2999,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn, Wrapping Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_blue_lilies.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 8, lowStockThreshold: 2 }
  },
  {
    name: "Midnight Elegance Floral Bouquet",
    slug: "midnight-elegance-floral-bouquet",
    sku: "BQT-009",
    description: "A sophisticated arrangement of navy blue lilies and tulips mixed with classic white roses, wrapped in parchment.",
    price: 2999,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, Parchment Paper",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_navy_white_floral.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 4 }
  },
  {
    name: "Sweet Pink Lily & Rose Bouquet",
    slug: "sweet-pink-lily-rose-bouquet",
    sku: "BQT-010",
    description: "A soft and charming bouquet filled with pink lilies and soft white roses, tied with a golden ribbon.",
    price: 2799,
    discountPrice: 2499,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-bouquets",
    images: [{ url: "/products/bouquet_pink_lily_rose.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 20, lowStockThreshold: 5 }
  }
];

async function addMoreBouquets() {
  console.log("Fetching Crochet Bouquets category...");
  const catQuery = query(collection(db, 'categories'), where("slug", "==", "crochet-bouquets"));
  const catSnap = await getDocs(catQuery);
  
  if (catSnap.empty) {
    console.log("Category crochet-bouquets not found! Ensure the category exists before running.");
    process.exit(1);
  }

  const categoryDoc = catSnap.docs[0];
  const categoryId = categoryDoc.id;
  const categoryName = categoryDoc.data().name;

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

addMoreBouquets().catch(console.error);
