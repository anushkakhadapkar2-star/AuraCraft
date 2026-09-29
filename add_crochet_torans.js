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

const newCategory = {
  name: "Crochet Toran",
  slug: "crochet-toran",
  description: "Beautiful handcrafted crochet torans and door hangings for your home.",
  status: true,
  displayOrder: 4
};

const newProducts = [
  {
    name: "Yellow Marigold & Pearl Toran",
    slug: "yellow-marigold-pearl-toran",
    sku: "TRN-001",
    description: "A festive yellow crochet toran with beautiful pearl drops, perfect for your front door or mandir.",
    price: 1299,
    discountPrice: 999,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn, Pearls",
    categorySlug: "crochet-toran",
    images: [{ url: "/products/crochet_toran_yellow_marigold.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 20, lowStockThreshold: 5 }
  },
  {
    name: "White Floral Vine Door Curtain",
    slug: "white-floral-vine-door-curtain",
    sku: "TRN-002",
    description: "Elegant white flowers cascading down a green crochet vine, adding a gentle touch to any entryway.",
    price: 1899,
    discountPrice: 1599,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-toran",
    images: [{ url: "/products/crochet_toran_white_floral.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 3 }
  },
  {
    name: "Pink Daisy & Rose Door Curtain",
    slug: "pink-daisy-rose-door-curtain",
    sku: "TRN-003",
    description: "A gorgeous, full-length crochet door hanging featuring pink daisies, roses, and green leaves.",
    price: 2499,
    discountPrice: 2199,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-toran",
    images: [{ url: "/products/crochet_toran_pink_floral.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 2 }
  },
  {
    name: "Pink Lotus & Pearl Toran",
    slug: "pink-lotus-pearl-toran",
    sku: "TRN-004",
    description: "An intricate pink crochet lotus design with delicate pearl hangings for a traditional look.",
    price: 1499,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, Pearls",
    categorySlug: "crochet-toran",
    images: [{ url: "/products/crochet_toran_pink_lotus.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 3 }
  },
  {
    name: "Pink Rose Garland Hanging",
    slug: "pink-rose-garland-hanging",
    sku: "TRN-005",
    description: "A simple and sweet garland of pink crochet roses alternating with white pearl beads.",
    price: 899,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn, Pearls",
    categorySlug: "crochet-toran",
    images: [{ url: "/products/crochet_toran_pink_rose_garland.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 25, lowStockThreshold: 5 }
  }
];

async function addTorans() {
  console.log("Adding Crochet Toran category...");
  const catRef = await addDoc(collection(db, 'categories'), {
    ...newCategory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const categoryId = catRef.id;
  console.log(`Added category: ${newCategory.name} (ID: ${categoryId})`);

  console.log("Adding new products...");
  for (const prod of newProducts) {
    console.log(`Adding ${prod.name}...`);
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, {
      ...prod,
      categoryId: categoryId,
      categoryName: newCategory.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log("Successfully added the Crochet Toran category and its products!");
  process.exit(0);
}

addTorans().catch(console.error);
