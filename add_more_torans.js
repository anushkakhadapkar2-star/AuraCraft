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
    name: "Golden Bells Toran",
    slug: "golden-bells-toran",
    sku: "TRN-006",
    description: "A traditional crochet toran featuring bright golden bell shapes, perfect for Diwali or weddings.",
    price: 1599,
    discountPrice: 1299,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Cotton Yarn, Golden Beads",
    categorySlug: "crochet-toran",
    images: [{ url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 10, lowStockThreshold: 2 }
  },
  {
    name: "Boho Fringe Door Hanging",
    slug: "boho-fringe-door-hanging",
    sku: "TRN-007",
    description: "A macrame-inspired crochet door hanging with long fringes, perfect for a bohemian vibe.",
    price: 1899,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Thick Cotton Cord",
    categorySlug: "crochet-toran",
    images: [{ url: "https://images.unsplash.com/photo-1520699049698-acd2fce18736?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 15, lowStockThreshold: 5 }
  },
  {
    name: "Mango Leaf Crochet Toran",
    slug: "mango-leaf-crochet-toran",
    sku: "TRN-008",
    description: "An auspicious green mango leaf design crocheted to last forever over your front door.",
    price: 1199,
    discountPrice: 999,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "Green Cotton Yarn",
    categorySlug: "crochet-toran",
    images: [{ url: "https://images.unsplash.com/photo-1596438459194-f215446f5f6c?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 30, lowStockThreshold: 10 }
  },
  {
    name: "Multicolor Rangoli Hanging",
    slug: "multicolor-rangoli-hanging",
    sku: "TRN-009",
    description: "A vibrant, multicolored circular hanging inspired by traditional rangoli patterns.",
    price: 899,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Acrylic Yarn",
    categorySlug: "crochet-toran",
    images: [{ url: "https://images.unsplash.com/photo-1579762715111-a6ce980ce0eb?q=80&w=600&auto=format&fit=crop", isPrimary: true, order: 1 }],
    inventory: { currentStock: 25, lowStockThreshold: 5 }
  }
];

async function addMoreTorans() {
  console.log("Fetching Crochet Toran category...");
  const catQuery = query(collection(db, 'categories'), where("slug", "==", "crochet-toran"));
  const catSnap = await getDocs(catQuery);
  
  if (catSnap.empty) {
    console.log("Category crochet-toran not found!");
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

  console.log("Successfully added more Crochet Torans!");
  process.exit(0);
}

addMoreTorans().catch(console.error);
