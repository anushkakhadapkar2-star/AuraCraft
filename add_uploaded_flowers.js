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
  {
    name: "Crochet Sunflower Bouquet",
    slug: "crochet-sunflower-bouquet",
    sku: "UP-FLW-001",
    description: "A beautiful handmade crochet sunflower, perfect as a timeless gift or decoration. Wrappings included.",
    price: 499,
    discountPrice: 399,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "/products/crochet_sunflower.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 5 }
  },
  {
    name: "Potted Pink Crochet Lily",
    slug: "potted-pink-crochet-lily",
    sku: "UP-FLW-002",
    description: "A stunning handmade pink lily resting in a small, crocheted brown pot.",
    price: 699,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "/products/crochet_lily_pot.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 3 }
  },
  {
    name: "Enchanted Crochet Rose Lamp",
    slug: "enchanted-crochet-rose-lamp",
    sku: "UP-FLW-003",
    description: "A magical crochet red rose wrapped in delicate fairy lights, creating a warm, cozy glow in any room.",
    price: 1499,
    discountPrice: 1299,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, LED Lights",
    categorySlug: "crochet-flowers",
    images: [{ url: "/products/crochet_rose_lamp.jpg", isPrimary: true, order: 1 }],
    inventory: { currentStock: 8, lowStockThreshold: 2 }
  },
  {
    name: "Blooming Pink Lily Duo",
    slug: "blooming-pink-lily-duo",
    sku: "UP-FLW-004",
    description: "Two blooming pink and white lilies delicately potted together.",
    price: 899,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn",
    categorySlug: "crochet-flowers",
    images: [{ url: "/products/crochet_pink_lily.png", isPrimary: true, order: 1 }],
    inventory: { currentStock: 12, lowStockThreshold: 3 }
  }
];

async function addUploadedFlowers() {
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

  console.log("Successfully added user-uploaded crochet flowers!");
  process.exit(0);
}

addUploadedFlowers().catch(console.error);
